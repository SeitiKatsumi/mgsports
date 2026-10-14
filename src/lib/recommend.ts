import {shoes,type Shoe} from "../data/shoes";
import {categories,type Workout} from "../data/categories";

export type RunningProfile={workout:Workout;race:string;weight:string;plateLoad:"none"|"one"|"high";legs:"fresh"|"normal"|"heavy";discomfort:"none"|"calf"|"joint";gait:"neutral"|"pronated"|"supinated"|"unknown"};
export type RankedShoe=Shoe&{score:number;reasons:string[]};

export function rankShoes(profile:RunningProfile,items:Shoe[]=shoes):RankedShoe[]{
  return items.filter(shoe=>shoe.available&&shoe.categories.includes(profile.workout)).map(shoe=>{
    const label=categories.find(category=>category.id===profile.workout)!.label;
    let score=83;const reasons=[`Classificado em ${label.toLowerCase()} no catálogo TM Runners.`];
    const race=profile.workout==="prova"||profile.workout==="meiaMaratona";
    if(profile.plateLoad==="high"&&shoe.plate===true){score-=race?3:16;reasons.push("Uso recente de placa pede avaliar adaptação e alternância de carga.")}
    if(profile.plateLoad!=="none"&&shoe.plate===false){score+=7;reasons.push("Construção sem placa confirmada ajuda a variar a rotação.")}
    if(profile.legs==="heavy"&&shoe.plate===true&&!race)score-=6;
    if(profile.legs==="heavy"&&/amortecimento|conforto|maciez/i.test(shoe.description)){score+=4;reasons.push("A ficha destaca amortecimento ou conforto para o contexto informado.")}
    if(profile.discomfort!=="none"){score-=8;reasons.push("O sinal corporal informado exige cautela com intensidade e ajuste.")}
    if(profile.gait!=="unknown"){
      const gait=profile.gait==="neutral"?"neutra":profile.gait==="pronated"?"pronada":"supinada";
      if(shoe.gaitSupport.toLowerCase().includes(gait)){score+=3;reasons.push(`A loja declara pisada ${gait}; ajuste e conforto continuam essenciais.`)}
    }
    if(shoe.plate===null)reasons.push("A loja não confirma a presença de placa; não assumo uma construção sem placa.");
    return {...shoe,score:Math.max(40,Math.min(96,score)),reasons:reasons.slice(0,3)};
  }).sort((a,b)=>(b.priceCents??-1)-(a.priceCents??-1)||b.score-a.score);
}
