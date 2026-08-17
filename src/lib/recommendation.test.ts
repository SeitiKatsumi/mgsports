import { describe,expect,it } from "vitest";
import { recommend } from "./recommendation";
describe("recommendation engine",()=>{
  it("prioritizes the workout matrix and returns an auditable version",()=>{
    const result=recommend({workoutType:"Intervalado",distanceKm:8,intensity:"alta",surface:"asfalto",profileCompleteness:1,shoes:[
      {id:"max",model:"Corre Max",compatibility:0,mileage:80,daysSinceUse:5,condition:"NORMAL"},
      {id:"grafeno",model:"Corre Grafeno 3",compatibility:5,mileage:180,daysSinceUse:4,condition:"NORMAL"}
    ]});
    expect(result.primaryRecommendation.id).toBe("grafeno");
    expect(result.algorithmVersion).toBe("shoe-recommender-1.0.0");
    expect(result.primaryRecommendation.factors.length).toBeGreaterThan(0);
  });
});
