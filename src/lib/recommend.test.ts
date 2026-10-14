import {describe,expect,it} from "vitest";
import {rankShoes,type RunningProfile} from "./recommend";
import {shoes} from "../data/shoes";
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
  it("reduz a prioridade de placa com carga alta fora de prova",()=>{
    const carbon=shoes.find(shoe=>shoe.plateMaterial==="carbon"&&shoe.available);
    expect(carbon).toBeDefined();
    const base=rankShoes({...profile,workout:"carbono"},carbon?[carbon]:[])[0];
    const loaded=rankShoes({...profile,workout:"carbono",plateLoad:"high"},carbon?[carbon]:[])[0];
    expect(loaded.score).toBeLessThan(base.score);
  });
});
