import {randomBytes} from "node:crypto";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
const run=promisify(execFile);
const captain="https://captain.app.11mind.com.br";
const appName="mgsports";const dbName="mgsports-postgres";const domain="mg.11run.com.br";
if(!process.env.CAPROVER_PASSWORD)throw new Error("CAPROVER_PASSWORD is required");
const login=await (await fetch(`${captain}/api/v2/login`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({password:process.env.CAPROVER_PASSWORD})})).json();
if(login.status!==100)throw new Error("CapRover login failed");
async function api(path,body){
  const response=await fetch(`${captain}/api/v2/user/${path}`,{method:body?"POST":"GET",headers:{"content-type":"application/json","x-captain-auth":login.data.token},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();if(![100,101].includes(data.status))throw new Error(`CapRover ${path}: ${data.description||data.status}`);return data.data;
}
async function definitions(){return (await api("apps/appDefinitions")).appDefinitions;}
const mode=process.argv[2]||"status";
if(mode==="setup"){
  let apps=await definitions();
  for(const [name,persistent] of [[dbName,true],[appName,false]]){
    if(!apps.some(app=>app.appName===name)){await api("apps/appDefinitions/register?detached=true",{appName:name,hasPersistentData:persistent});console.log(`Aplicação criada: ${name}`)}
  }
  apps=await definitions();
  const database=apps.find(app=>app.appName===dbName);const web=apps.find(app=>app.appName===appName);const previous=apps.find(app=>app.appName==="meuolympikus");
  const password=database.envVars.find(item=>item.key==="POSTGRES_PASSWORD")?.value||randomBytes(32).toString("hex");
  await api("apps/appDefinitions/update",{...database,instanceCount:1,notExposeAsWebApp:true,containerHttpPort:5432,volumes:[{containerPath:"/var/lib/postgresql/data",volumeName:"mgsports-postgres-data"}],ports:[],envVars:[{key:"POSTGRES_DB",value:"mgsports"},{key:"POSTGRES_USER",value:"mgsports"},{key:"POSTGRES_PASSWORD",value:password}]});
  if(!database.versions.some(version=>version.deployedImageName?.includes("postgres:16")))await api(`apps/appData/${dbName}?detached=true`,{captainDefinitionContent:JSON.stringify({schemaVersion:2,imageName:"postgres:16-alpine"})});
  const ghToken=(await run("gh",["auth","token"])).stdout.trim();
  const preserved=web.envVars.filter(item=>!["DATABASE_URL","NEXT_PUBLIC_APP_URL","OPENAI_API_KEY","OPENAI_MODEL","GOOGLE_MAPS_API_KEY"].includes(item.key));
  const shared=["OPENAI_API_KEY","OPENAI_MODEL","GOOGLE_MAPS_API_KEY"].map(key=>({key,value:web.envVars.find(item=>item.key===key)?.value||previous?.envVars.find(item=>item.key===key)?.value||process.env[key]||""}));
  await api("apps/appDefinitions/update",{...web,instanceCount:1,containerHttpPort:3000,notExposeAsWebApp:false,captainDefinitionRelativeFilePath:"./captain-definition",envVars:[...preserved,{key:"DATABASE_URL",value:`postgresql://mgsports:${password}@srv-captain--${dbName}:5432/mgsports`},{key:"NEXT_PUBLIC_APP_URL",value:`https://${domain}`},...shared],appPushWebhook:{repoInfo:{repo:"github.com/SeitiKatsumi/mgsports",branch:"main",user:"SeitiKatsumi",password:ghToken}}});
  apps=await definitions();const configured=apps.find(app=>app.appName===appName);
  if(!configured.customDomain.some(item=>item.publicDomain===domain))await api("apps/appDefinitions/customdomain",{appName,customDomain:domain});
  const webhook=`${captain}/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&appName=${appName}&token=${configured.appPushWebhook.pushWebhookToken}`;
  const headers={Authorization:`Bearer ${ghToken}`,"Content-Type":"application/json",Accept:"application/vnd.github+json"};
  const hookList=await (await fetch("https://api.github.com/repos/SeitiKatsumi/mgsports/hooks",{headers})).json();
  if(!Array.isArray(hookList))throw new Error("Cannot inspect GitHub webhooks");
  const existing=hookList.find(hook=>hook.config.url?.includes(`appName=${appName}&`));
  const result=await fetch(`https://api.github.com/repos/SeitiKatsumi/mgsports/hooks${existing?`/${existing.id}`:""}`,{method:existing?"PATCH":"POST",headers,body:JSON.stringify({name:"web",active:true,events:["push"],config:{url:webhook,content_type:"json",insecure_ssl:"0"}})});
  if(!result.ok)throw new Error(`GitHub webhook configuration failed: ${result.status}`);
  console.log(JSON.stringify({app:appName,database:dbName,domain,webhook:"push configurado",aiConfigured:shared.some(item=>item.key==="OPENAI_API_KEY"&&!!item.value)}));
}else if(mode==="ssl"){
  await api("apps/appDefinitions/enablecustomdomainssl",{appName,customDomain:domain});
  const web=(await definitions()).find(app=>app.appName===appName);await api("apps/appDefinitions/update",{...web,forceSsl:true});
  console.log("HTTPS habilitado e redirecionamento forçado.");
}else if(mode==="deploy"){
  const web=(await definitions()).find(app=>app.appName===appName);
  const webhook=`${captain}/api/v2/user/apps/webhooks/triggerbuild?namespace=captain&appName=${appName}&token=${web.appPushWebhook.pushWebhookToken}`;
  const result=await (await fetch(webhook,{method:"POST"})).json();if(result.status!==100)throw new Error("Build trigger failed");console.log("Build do GitHub acionado.");
}else{
  const apps=await definitions();for(const name of [dbName,appName]){const app=apps.find(item=>item.appName===name);if(!app){console.log(`${name}: ainda não criado`);continue}console.log(JSON.stringify({name,building:app.isAppBuilding,version:app.deployedVersion,domains:app.customDomain,latestVersion:app.versions.at(-1)?.version,latestCommit:app.versions.at(-1)?.gitHash}));}
  const build=await api(`apps/appData/${appName}`);console.log(JSON.stringify(build));
}
