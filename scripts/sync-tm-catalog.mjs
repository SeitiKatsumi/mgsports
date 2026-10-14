import {mkdir,readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {setTimeout as wait} from "node:timers/promises";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {createRequire} from "node:module";
const run=promisify(execFile);
const require=createRequire(import.meta.url);
const sharp=require(require.resolve("sharp",{paths:[require.resolve("next")]}));
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const base="https://www.lojatmrunners.com.br";
const categories={caminhada:"caminhada",meiaMaratona:"meia-maratona",carbono:"placa-de-carbono",prova:"prova",treinoDiario:"treino-diario",velocidade:"velocidade",trilha:"trilha"};
const products=new Map();
const cache=`${root}.cache/tm-catalog/${new Date().toISOString().slice(0,10)}/`;
await mkdir(cache,{recursive:true});
let nextRequestAt=0;

async function read(url){
  const file=cache+createHash("sha256").update(url).digest("hex")+".html";
  try{return await readFile(file,"utf8")}catch{}
  const delay=Math.max(0,nextRequestAt-Date.now());nextRequestAt=Math.max(Date.now(),nextRequestAt)+800;
  await wait(delay);
  for(let attempt=0;attempt<3;attempt++){
    try{const {stdout:html}=await run("curl",["--fail","--silent","--show-error","--location","--max-time","30",url],{maxBuffer:4_000_000});await writeFile(file,html);return html}catch(error){if(attempt===2)throw error;await wait(3000)}
  }
}
function productLists(html){return [...html.matchAll(/push\.apply\(window\.Shoppub\.currentProductList, ([\s\S]*?)\);/g)].flatMap(match=>JSON.parse(match[1]));}
function plain(html){return html.replace(/<br\s*\/?>|<\/p>/gi,"\n").replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\n\s*\n/g,"\n").trim();}

for(const [category,path] of Object.entries(categories)){
  let page=1;const seen=new Set();
  while(true){
    if(page>100)throw new Error(`Paginação excessiva: ${category}`);
    const url=`${base}/categoria/tenis-de-corrida-${path}/${page===1?"":`?page=${page}`}`;
    let html;try{html=await read(url)}catch(error){console.warn(`Página indisponível: ${url}. Mantendo produtos já identificados.`);break}const listing=productLists(html);
    const fresh=listing.filter(product=>!seen.has(product.id));
    if(!fresh.length)break;
    for(const product of fresh){
      seen.add(product.id);
      if(!/^t[eê]nis\b/i.test(product.name))continue;
      const current=products.get(product.id)||{...product,sourceCategories:[]};
      if(!current.sourceCategories.includes(category))current.sourceCategories.push(category);
      products.set(product.id,current);
    }
    if(!new RegExp(`[?&]page=${page+1}(?:["&])`).test(html))break;
    page++;
  }
  console.log(`${category}: ${seen.size} itens consultados em ${page} página(s)`);
}

for(const product of productLists(await read(base))){
  if(/^t[eê]nis\b/i.test(product.name)&&!products.has(product.id))products.set(product.id,{...product,sourceCategories:[]});
}
const categoryNames={"caminhada":"caminhada","meia/maratona":"meiaMaratona","meia maratona":"meiaMaratona","placa de carbono":"carbono","prova":"prova","treino diario":"treinoDiario","velocidade":"velocidade","trilha":"trilha"};
const normalize=text=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();

const records=[...products.values()];let cursor=0;let done=0;
async function worker(){
  while(cursor<records.length){
    const index=cursor++;const product=records[index];
    let html;try{html=await read(product.url)}catch(error){console.warn(`Ficha não acessível, produto não importado: ${product.url}`);records[index]=null;continue}
    const details=plain(html.match(/<div class="description__content">([\s\S]*?)<\/div>/)?.[1]||"");
    if(!details)throw new Error(`Ficha ausente: ${product.url}`);
    const ld=[...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1])).find(item=>item["@type"]==="Product");
    const info=productLists(html).find(item=>item.id===product.id)||product;
    const offer=Array.isArray(ld?.offers)?ld.offers[0]:ld?.offers;
    const price=Number(offer?.price??info.price);
    const priceCents=Number.isFinite(price)&&price>0&&(!offer?.priceCurrency||offer.priceCurrency==="BRL")?Math.round(price*100):null;
    const slug=new URL(product.url).pathname.split("/").filter(Boolean).at(-1);
    const imageSource=ld?.image||info.images?.[0];
    if(!imageSource)throw new Error(`Imagem ausente: ${product.url}`);
    const imageUrl=imageSource.replace("w=1000,h=1000,q=80,f=auto","w=640,h=640,q=80,f=webp");
    const imagePath=`/shoes/tm-${product.id}.webp`;
    await run("curl",["--fail","--silent","--show-error","--location","--max-time","30",imageUrl,"--output",`${root}public${imagePath}`]);
    const imageBuffer=await readFile(`${root}public${imagePath}`);
    await sharp(imageBuffer).resize({width:640,height:640,fit:"inside",withoutEnlargement:true}).webp({quality:82}).toFile(`${root}public${imagePath}`);
    const assigned=[...new Set([...product.sourceCategories,...(info.categories_names||[]).map(name=>categoryNames[normalize(name)]).filter(Boolean)])];
    records[index]={id:`tm-${product.id}`,slug,name:ld?.name||info.name,brand:info.brand||ld?.brand?.name||"Não informada",img:imagePath,sourceImage:imageSource,officialUrl:product.url,priceCents,description:details,categories:assigned,sourceCategoryNames:info.categories_names||[],available:info.available===true,checkedAt:new Date().toISOString().slice(0,10)};
    done++;if(done%25===0)console.log(`${done}/${records.length} fichas e fotos importadas`);
  }
}
await mkdir(`${root}public/shoes`,{recursive:true});
await Promise.all([worker(),worker(),worker()]);
const imported=records.filter(product=>product?.categories?.length);
await writeFile(`${root}src/data/tm-catalog.json`,JSON.stringify(imported,null,2)+"\n");
console.log(JSON.stringify({total:imported.length,brands:[...new Set(imported.map(item=>item.brand))],categories:Object.fromEntries(Object.keys(categories).map(category=>[category,imported.filter(product=>product.categories.includes(category)).length]))}));
