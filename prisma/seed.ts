import {Prisma,PrismaClient} from "@prisma/client";
import {shoes} from "../src/data/shoes";

const db=new PrismaClient();
async function main(){
  for(const shoe of shoes){
    const data={id:shoe.id,name:shoe.name,slug:shoe.slug,category:shoe.cat,description:shoe.desc,weightGrams:shoe.weight,dropMm:shoe.drop,imagePath:shoe.img,officialUrl:shoe.officialUrl,compatibility:JSON.parse(JSON.stringify(shoe.match)) as Prisma.InputJsonValue,technicalProfile:JSON.parse(JSON.stringify({brand:shoe.brand,categories:shoe.categories,priceCents:shoe.priceCents,source:shoe.officialUrl,checkedAt:shoe.checkedAt,nature:shoe.nature,plate:shoe.plate,plateName:shoe.plateName,plateDetail:shoe.plateDetail,midsole:shoe.midsole,outsole:shoe.outsole,upper:shoe.upper,insole:shoe.insole,landing:shoe.landing,gaitSupport:shoe.gaitSupport,rocker:shoe.rocker,idealUses:shoe.idealUses,avoidUses:shoe.avoidUses,strengths:shoe.strengths,limits:shoe.limits})) as Prisma.InputJsonValue};
    await db.shoeModel.upsert({where:{id:shoe.id},update:data,create:data});
  }
}
main().finally(()=>db.$disconnect());
