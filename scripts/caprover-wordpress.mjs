import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const captain='https://captain.app.11mind.com.br';
const appName='mgsports-wordpress'; const dbName='mgsports-wordpress-db';
if(!process.env.CAPROVER_PASSWORD)throw new Error('CAPROVER_PASSWORD is required');
const login=await(await fetch(`${captain}/api/v2/login`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:process.env.CAPROVER_PASSWORD})})).json();
if(login.status!==100)throw new Error('CapRover login failed');
async function api(path,body){
  const response=await fetch(`${captain}/api/v2/user/${path}`,{method:body?'POST':'GET',headers:{'content-type':'application/json','x-captain-auth':login.data.token},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();if(![100,101].includes(data.status))throw new Error(`CapRover ${path}: ${data.status}`);return data.data;
}
const definitions=()=>api('apps/appDefinitions');
const getEnv=(app,key)=>app.envVars?.find(item=>item.key===key)?.value;
const mode=process.argv[2]||'status';
if(mode==='setup'){
  if(!process.env.WP_ADMIN_EMAIL)throw new Error('WP_ADMIN_EMAIL is required');
  let {appDefinitions:apps}=await definitions();
  for(const name of [dbName,appName])if(!apps.some(app=>app.appName===name))await api('apps/appDefinitions/register?detached=true',{appName:name,hasPersistentData:true});
  ({appDefinitions:apps}=await definitions());
  const db=apps.find(app=>app.appName===dbName);const web=apps.find(app=>app.appName===appName);
  const password=getEnv(db,'MARIADB_PASSWORD')||randomBytes(32).toString('hex');
  const rootPassword=getEnv(db,'MARIADB_ROOT_PASSWORD')||randomBytes(32).toString('hex');
  await api('apps/appDefinitions/update',{...db,instanceCount:1,containerHttpPort:3306,notExposeAsWebApp:true,ports:[],volumes:[{containerPath:'/var/lib/mysql',volumeName:'mgsports-wordpress-db-data'}],envVars:[{key:'MARIADB_DATABASE',value:'mg_wordpress'},{key:'MARIADB_USER',value:'mg_wordpress'},{key:'MARIADB_PASSWORD',value:password},{key:'MARIADB_ROOT_PASSWORD',value:rootPassword}]});
  if(!db.versions.some(version=>version.deployedImageName?.includes('mariadb:11.4')))await api(`apps/appData/${dbName}?detached=true`,{captainDefinitionContent:JSON.stringify({schemaVersion:2,imageName:'mariadb:11.4'})});
  const token=(await run('gh',['auth','token'])).stdout.trim();
  const configExtra="define('WP_HOME', getenv('MG_SITE_URL')); define('WP_SITEURL', getenv('MG_SITE_URL')); define('FORCE_SSL_ADMIN', true); define('DISALLOW_FILE_EDIT', true); define('WP_ENVIRONMENT_TYPE', 'production'); define('WP_AUTO_UPDATE_CORE', 'minor');";
  await api('apps/appDefinitions/update',{...web,instanceCount:1,containerHttpPort:80,notExposeAsWebApp:true,ports:[],volumes:[{containerPath:'/var/www/html',volumeName:'mgsports-wordpress-files'}],captainDefinitionRelativeFilePath:'./wordpress/captain-definition',envVars:[{key:'WORDPRESS_DB_HOST',value:`srv-captain--${dbName}`},{key:'WORDPRESS_DB_NAME',value:'mg_wordpress'},{key:'WORDPRESS_DB_USER',value:'mg_wordpress'},{key:'WORDPRESS_DB_PASSWORD',value:password},{key:'MG_SITE_URL',value:'https://mg.11run.com.br/conteudo'},{key:'WORDPRESS_CONFIG_EXTRA',value:configExtra},{key:'WP_ADMIN_USER',value:getEnv(web,'WP_ADMIN_USER')||'mg_admin'},{key:'WP_ADMIN_EMAIL',value:getEnv(web,'WP_ADMIN_EMAIL')||process.env.WP_ADMIN_EMAIL},{key:'WP_ADMIN_PASSWORD',value:getEnv(web,'WP_ADMIN_PASSWORD')||randomBytes(24).toString('base64url')}],appPushWebhook:{repoInfo:{repo:'github.com/SeitiKatsumi/mgsports',branch:'main',user:'SeitiKatsumi',password:token}}});
  const configured=(await definitions()).appDefinitions.find(app=>app.appName===appName);
  const webhook=`${captain}/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&appName=${appName}&token=${configured.appPushWebhook.pushWebhookToken}`;
  const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/vnd.github+json'};
  const hooks=await(await fetch('https://api.github.com/repos/SeitiKatsumi/mgsports/hooks',{headers})).json();
  if(!Array.isArray(hooks))throw new Error('Cannot inspect GitHub webhooks');
  const existing=hooks.find(hook=>hook.config.url?.includes(`appName=${appName}&`));
  const result=await fetch(`https://api.github.com/repos/SeitiKatsumi/mgsports/hooks${existing?`/${existing.id}`:''}`,{method:existing?'PATCH':'POST',headers,body:JSON.stringify({name:'web',active:true,events:['push'],config:{url:webhook,content_type:'json',insecure_ssl:'0'}})});
  if(!result.ok)throw new Error('Cannot configure WordPress webhook');
  console.log(JSON.stringify({wordpress:appName,database:dbName,admin:'mg_admin',credentials:'CapRover environment only',webhook:'push'}));
}else if(mode==='route'){
  const {appDefinitions:apps,defaultNginxConfig}=await definitions();
  const web=apps.find(app=>app.appName==='mgsports');
  if(!web.customDomain.some(domain=>domain.publicDomain==='mg.11run.com.br'&&domain.hasSsl))throw new Error('MG domain/HTTPS not found');
  const current=web.customNginxConfig||defaultNginxConfig;
  if(current.includes('srv-captain--mgsports-wordpress:80')){console.log('WordPress route already configured');process.exit(0)}
  const marker=/set \$upstream [^\n]+\n/;
  if(!marker.test(current))throw new Error('Unknown NGINX template; no changes made');
  const snippet=await readFile(new URL('../wordpress/nginx-conteudo-location.conf',import.meta.url),'utf8');
  await mkdir('.cache',{recursive:true});
  try{await access('.cache/mgsports-nginx-before-wordpress.ejs')}catch{await writeFile('.cache/mgsports-nginx-before-wordpress.ejs',current)}
  const customNginxConfig=current.replace(marker,match=>match+'\n'+snippet+'\n');
  await api('apps/appDefinitions/update',{...web,customNginxConfig});
  console.log('Route /conteudo/ configured; other MG routes preserved');
}else if(mode==='deploy'){
  const web=(await definitions()).appDefinitions.find(app=>app.appName===appName);
  const result=await(await fetch(`${captain}/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&appName=${appName}&token=${web.appPushWebhook.pushWebhookToken}`,{method:'POST'})).json();
  if(result.status!==100)throw new Error('WordPress build trigger failed');
  console.log('WordPress GitHub build triggered');
}else{
  const {appDefinitions:apps}=await definitions();
  for(const name of [dbName,appName]){
    const app=apps.find(app=>app.appName===name);if(!app){console.log(`${name}: not created`);continue}
    const build=await api(`apps/appData/${name}`);
    const clean=line=>String(line).replace(/https:\/\/[^\s@]+@/g,'https://[redacted]@').replace(/(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)/g,'[redacted]');
    console.log(JSON.stringify({name,version:app.deployedVersion,building:build.isAppBuilding,failed:build.isBuildFailed,logs:(build.logs?.lines||[]).slice(-10).map(clean)}));
  }
}
