import {describe,expect,it} from "vitest";
import {formatPrice,identifyPlate,shoes} from "./shoes";
import {categories} from "./categories";

describe("catálogo MG Sports / TM Runners",()=>{
  it("usa apenas produtos da loja, sem roupas nem o catálogo legado",()=>{
    expect(shoes.length).toBeGreaterThan(10);
    expect(new Set(shoes.map(shoe=>shoe.slug)).size).toBe(shoes.length);
    expect(shoes.every(shoe=>shoe.id.startsWith("tm-")&&shoe.officialUrl.startsWith("https://www.lojatmrunners.com.br/produto/"))).toBe(true);
    expect(new Set(shoes.map(shoe=>shoe.brand)).size).toBeGreaterThan(3);
    expect(shoes.every(shoe=>shoe.priceCents!==null&&Number.isSafeInteger(shoe.priceCents)&&shoe.priceCents>0)).toBe(true);
  });
  it("formata o preço em reais sem inventar um valor ausente",()=>{
    expect(formatPrice(111992).replace(/\s/g," ")).toBe("R$ 1.119,92");
    expect(formatPrice(null)).toBe("Preço a consultar");
  });
  it("mantém exatamente as sete categorias solicitadas",()=>{
    expect(categories.map(item=>item.label)).toEqual(["Caminhada","Meia maratona","Placa de carbono","Prova","Treino diário","Velocidade","Trilha"]);
    for(const category of categories)expect(shoes.some(shoe=>shoe.categories.includes(category.id))).toBe(true);
  });
  it("distingue fibra de vidro e carbono, e não presume uma placa ausente",()=>{
    expect(identifyPlate("A placa Mizuno Wave com fibra de vidro oferece estabilidade.").material).toBe("fiberglass");
    expect(identifyPlate("Placa de fibra de carbono em toda a extensão.").material).toBe("carbon");
    expect(identifyPlate("Tênis com cabedal em mesh e espuma macia.").plate).toBeNull();
    expect(identifyPlate("Construção sem placa para rodagens.").plate).toBe(false);
    expect(shoes.filter(shoe=>shoe.categories.includes("carbono")).every(shoe=>shoe.plateMaterial==="carbon")).toBe(true);
  });
});
