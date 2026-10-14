import {afterEach,describe,expect,it,vi} from "vitest";
import {GET} from "./route";
describe("unidades oficiais MG Sports",()=>{
  afterEach(()=>vi.unstubAllEnvs());
  it("retorna a rede oficial sem inventar distâncias quando não há geocodificação",async()=>{
    vi.stubEnv("GOOGLE_MAPS_API_KEY","");
    const response=await GET(new Request("http://localhost/api/stores?lat=-23&lng=-46"));
    const data=await response.json();
    expect(data.stores).toHaveLength(3);
    expect(data.stores.every((store:{distanceKm:number|null;whatsapp:string;directionsUrl:string})=>store.distanceKm===null&&store.whatsapp.startsWith("5516")&&store.directionsUrl.includes("origin=-23%2C-46"))).toBe(true);
  });
  it("rejeita uma localização incompleta",async()=>{
    expect((await GET(new Request("http://localhost/api/stores?lat=-23"))).status).toBe(400);
  });
});
