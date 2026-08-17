import {afterEach,describe,expect,it,vi} from "vitest";
import {POST} from "./route";

function request(body:unknown){return new Request("http://localhost/api/profile-insights",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":`test-${Math.random()}`},body:JSON.stringify(body)})}

describe("profile insights API",()=>{
  afterEach(()=>vi.unstubAllEnvs());

  it("rejeita domínios que não são Strava ou Garmin",async()=>{
    const response=await POST(request({source:"strava",url:"https://example.com/athletes/42"}));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({error:"Use um link público válido do Strava."});
  });

  it("rejeita uma captura em formato não autorizado",async()=>{
    const response=await POST(request({source:"planilha",image:"data:image/svg+xml;base64,PHN2Zz4="}));
    expect(response.status).toBe(400);
  });

  it("informa claramente quando a chave da IA ainda não foi configurada",async()=>{
    vi.stubEnv("OPENAI_API_KEY","");
    const response=await POST(request({source:"garmin",url:"https://connect.garmin.com/modern/profile/atleta"}));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({configured:false});
  });
});
