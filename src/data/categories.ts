export const categories=[
  {id:"caminhada",label:"Caminhada",path:"caminhada"},
  {id:"meiaMaratona",label:"Meia maratona",path:"meia-maratona"},
  {id:"carbono",label:"Placa de carbono",path:"placa-de-carbono"},
  {id:"prova",label:"Prova",path:"prova"},
  {id:"treinoDiario",label:"Treino diário",path:"treino-diario"},
  {id:"velocidade",label:"Velocidade",path:"velocidade"},
  {id:"trilha",label:"Trilha",path:"trilha"}
] as const;
export type Workout=typeof categories[number]["id"];
export const categoryUrl=(category:Workout)=>`https://www.lojatmrunners.com.br/categoria/tenis-de-corrida-${categories.find(item=>item.id===category)!.path}/`;
