import catalog from "./tm-catalog.json";
import {categories,type Workout} from "./categories";

export function identifyPlate(description:string){
  if(/sem placa|n[aã]o (?:possui|cont[eé]m|tem) placa/i.test(description))return {plate:false as boolean|null,material:"none",name:"Sem placa",detail:"A descrição do produto informa construção sem placa."};
  const sentences=description.split(/\n|(?<=[.!?])\s+/);
  const detail=sentences.find(line=>/placa|speedplate/i.test(line));
  if(detail){
    const material=/fibra de vidro/i.test(detail)?"fiberglass":/nylon|n[aá]ilon/i.test(detail)?"nylon":/carbono|carbon/i.test(detail)?"carbon":"other";
    const name=material==="carbon"?"Placa de carbono":material==="fiberglass"?"Placa de fibra de vidro":material==="nylon"?"Placa de nylon":"Placa · material não informado";
    return {plate:true as boolean|null,material,name,detail};
  }
  return {plate:null as boolean|null,material:"unknown",name:"Placa não informada",detail:"O material e a presença de placa não foram informados na ficha consultada."};
}

function spec(description:string,label:string){return description.match(new RegExp(`(?:^|\\n)${label}\\s*:\\s*([^\\n]+)`,"i"))?.[1].trim()||"Não informado na ficha da loja";}
function numberSpec(description:string,label:string){const text=spec(description,label);const value=text.match(/(\d+(?:[.,]\d+)?)\s*(?:g\b|gramas|mm\b)/i);return value?Number(value[1].replace(",",".")):null;}

export const shoes=catalog.map(product=>{
  const construction=identifyPlate(product.description);
  const assigned=product.categories.filter(category=>category!=="carbono"||construction.material==="carbon") as Workout[];
  const categoryLabels=assigned.map(id=>categories.find(category=>category.id===id)!.label);
  const trail=assigned.includes("trilha");
  const nature=trail?"Corrida em trilha":construction.material==="carbon"?"Corrida com placa de carbono":assigned.includes("treinoDiario")?"Treino diário e rotação":assigned.includes("velocidade")?"Treinos de velocidade":"Corrida e caminhada";
  const match=Object.fromEntries(categories.map(category=>[category.id,assigned.includes(category.id)?5:0])) as Record<Workout,number>;
  return {...product,categories:assigned,sourceCategories:product.categories,name:product.name.replace(/^Tênis\s+/i,""),cat:categoryLabels.join(" · "),nature,desc:product.description.split("\n")[0],plate:construction.plate,plateMaterial:construction.material,plateName:construction.name,plateDetail:construction.detail,weight:numberSpec(product.description,"Peso(?: aproximado)?"),drop:numberSpec(product.description,"Drop"),midsole:spec(product.description,"Entressola"),outsole:spec(product.description,"Solado"),upper:spec(product.description,"Cabedal"),insole:spec(product.description,"Palmilha"),landing:"Ponto de aterrissagem não informado na ficha",gaitSupport:spec(product.description,"Pisada"),rocker:spec(product.description,"Rocker"),idealUses:categoryLabels,avoidUses:trail?["Corrida rápida em asfalto como uso principal"]:["Trilha técnica sem solado específico"],strengths:[nature,spec(product.description,"Tecnologias")].filter(item=>!item.startsWith("Não informado")),limits:["A classificação da loja não substitui teste de ajuste e conforto.",...(construction.plate===null?["A ficha consultada não confirma presença nem ausência de placa."]:[])],match};
});
export type Shoe=typeof shoes[number];
export const getShoeBySlug=(slug:string)=>shoes.find(shoe=>shoe.slug===slug);
