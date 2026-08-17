import {describe,expect,it} from "vitest";
import {getShoeBySlug,shoes} from "./shoes";

describe("catálogo técnico Olympikus Corre",()=>{
  it("mantém uma ficha completa e uma URL oficial por modelo",()=>{
    expect(shoes).toHaveLength(5);
    expect(new Set(shoes.map(shoe=>shoe.slug)).size).toBe(shoes.length);
    expect(shoes.every(shoe=>shoe.officialUrl.startsWith("https://www.olympikus.com.br/"))).toBe(true);
  });

  it("descreve corretamente a placa do Supra 2",()=>{
    const supra=getShoeBySlug("corre-supra-2");
    expect(supra?.plateName.toLowerCase()).toContain("fibra de carbono");
    expect(supra?.plateDetail.toLowerCase()).toContain("revestidas com grafeno");
    expect(`${supra?.plateName} ${supra?.plateDetail}`.toLowerCase()).not.toContain("placa de grafeno");
  });

  it("não atribui placa aos modelos de rodagem sem placa",()=>{
    expect(getShoeBySlug("corre-4")?.plate).toBe(false);
    expect(getShoeBySlug("corre-max")?.plate).toBe(false);
  });
});
