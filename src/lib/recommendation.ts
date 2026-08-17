export const ALGORITHM_VERSION = "shoe-recommender-1.0.0";
export type EngineShoe = { id:string; model:string; compatibility:number; mileage:number; daysSinceUse:number; condition:string; favorite?:boolean };
export type EngineInput = { workoutType:string; distanceKm:number; intensity:string; surface:string; profileCompleteness:number; shoes:EngineShoe[]; weights?:Record<string,number> };
const messages: Record<string,string> = {
  WORKOUT_MATCH: "Este modelo combina com a natureza do treino.",
  ROTATION: "O par teve tempo adequado de recuperação.",
  CONDITION: "A condição atual do par favorece um uso seguro e consistente.",
  DISTANCE: "A construção atende bem à distância planejada.",
  PROFILE: "A escolha considera seu perfil e sua rotina recente."
};
export function recommend(input: EngineInput) {
  const w = { workout:30, intensity:20, distance:15, surface:10, profile:10, rotation:10, condition:5, ...input.weights };
  const ranked = input.shoes.map(shoe => {
    const workout = shoe.compatibility / 5;
    const intensity = input.intensity === "alta" ? Math.min(1, workout * 1.08) : Math.min(1, 0.72 + workout * .28);
    const distance = input.distanceKm >= 18 ? Math.min(1, .55 + workout * .45) : .82 + workout * .18;
    const surface = ["asfalto","pista","esteira"].includes(input.surface) ? 1 : .55;
    const profile = .72 + input.profileCompleteness * .28;
    const rotation = Math.min(1, .55 + shoe.daysSinceUse * .1);
    const condition = shoe.condition === "VERY_WORN" ? .2 : shoe.condition === "WORN" ? .55 : 1;
    const score = Math.round(workout*w.workout + intensity*w.intensity + distance*w.distance + surface*w.surface + profile*w.profile + rotation*w.rotation + condition*w.condition);
    return { ...shoe, score:Math.max(0,Math.min(100,score)), confidence:input.profileCompleteness>.74?"Alta":"Moderada", factors:[
      {type:"WORKOUT_MATCH",impact:workout,messageKey:"workout_match",message:messages.WORKOUT_MATCH},
      {type:"ROTATION",impact:rotation,messageKey:"shoe_rest_good",message:messages.ROTATION},
      {type:"CONDITION",impact:condition,messageKey:"shoe_condition_good",message:messages.CONDITION}
    ] };
  }).sort((a,b)=>b.score-a.score);
  return { primaryRecommendation:ranked[0], alternatives:ranked.slice(1,3), algorithmVersion:ALGORITHM_VERSION };
}
