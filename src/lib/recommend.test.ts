import {describe,expect,it} from "vitest";
import {rankShoes,type RunningProfile} from "./recommend";
import {shoes} from "../data/shoes";
import {categories} from "../data/categories";
const profile:RunningProfile={workout:"trilha",race:"5K",weight:"65",plateLoad:"none",legs:"normal",discomfort:"none",gait:"unknown"};
describe("recomendações multimarcas",()=>{
  it("não indica um tênis de asfalto para trilha",()=>{
    const ranked=rankShoes(profile);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.every(shoe=>shoe.categories.includes("trilha"))).toBe(true);
  });
  it("não recomenda produtos indisponíveis",()=>{
    expect(rankShoes(profile,shoes.map(shoe=>({...shoe,available:false})))).toEqual([]);
  });
  it("filtra primeiro a categoria e ordena preços decrescentes nas sete categorias",()=>{
    for(const category of categories){
      const ranked=rankShoes({...profile,workout:category.id});
      expect(ranked.length).toBeGreaterThan(0);
      expect(ranked.every(shoe=>shoe.available&&shoe.categories.includes(category.id))).toBe(true);
      for(let index=1;index<ranked.length;index++)expect(ranked[index-1].priceCents??-1).toBeGreaterThanOrEqual(ranked[index].priceCents??-1);
    }
  });
  it("reduz a afinidade de placa com carga alta fora de prova",()=>{
    const carbon=shoes.find(shoe=>shoe.plateMaterial==="carbon"&&shoe.available);
    expect(carbon).toBeDefined();
    const base=rankShoes({...profile,workout:"carbono"},carbon?[carbon]:[])[0];
    const loaded=rankShoes({...profile,workout:"carbono",plateLoad:"high"},carbon?[carbon]:[])[0];
    expect(loaded.score).toBeLessThan(base.score);
  });
  it("prioriza o maior preço dentro da categoria, mesmo com afinidade menor",()=>{
    const base=shoes.find(shoe=>shoe.categories.includes("trilha")&&shoe.available)!;
    const ranked=rankShoes({...profile,plateLoad:"high"},[
      {...base,id:"barato",priceCents:20000,plate:false},
      {...base,id:"caro",priceCents:90000,plate:true},
      {...base,id:"outra-categoria",priceCents:150000,categories:["prova"]}
    ]);
    expect(ranked.map(shoe=>shoe.id)).toEqual(["caro","barato"]);
    expect(ranked[0].score).toBeLessThan(ranked[1].score);
  });
  it("coloca preços desconhecidos no fim e desempata preços iguais pela afinidade",()=>{
    const base=shoes.find(shoe=>shoe.categories.includes("trilha")&&shoe.available)!;
    const ranked=rankShoes({...profile,plateLoad:"high"},[
      {...base,id:"desconhecido",priceCents:null,plate:false},
      {...base,id:"mesmo-preco-menor-afinidade",priceCents:50000,plate:true},
      {...base,id:"mesmo-preco-maior-afinidade",priceCents:50000,plate:false}
    ]);
    expect(ranked.map(shoe=>shoe.id)).toEqual(["mesmo-preco-maior-afinidade","mesmo-preco-menor-afinidade","desconhecido"]);
  });
});
