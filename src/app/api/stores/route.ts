import {NextResponse} from "next/server";

type Place={id?:string;displayName?:{text?:string};formattedAddress?:string;location?:{latitude?:number;longitude?:number};googleMapsUri?:string;nationalPhoneNumber?:string;currentOpeningHours?:{openNow?:boolean}};
const officialWhatsApp="5511944504459";
function distanceKm(aLat:number,aLng:number,bLat:number,bLng:number){const rad=(value:number)=>value*Math.PI/180;const earth=6371;const dLat=rad(bLat-aLat);const dLng=rad(bLng-aLng);const h=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;return earth*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))}

export async function GET(request:Request){
  const {searchParams}=new URL(request.url);const lat=Number(searchParams.get("lat"));const lng=Number(searchParams.get("lng"));
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return NextResponse.json({error:"Localização inválida."},{status:400});
  const mapsSearch=`https://www.google.com/maps/search/loja+Olympikus/@${lat},${lng},13z`;
  if(!process.env.GOOGLE_MAPS_API_KEY)return NextResponse.json({configured:false,stores:[],mapsSearch,officialWhatsApp});
  try{
    const response=await fetch("https://places.googleapis.com/v1/places:searchText",{method:"POST",headers:{"content-type":"application/json","X-Goog-Api-Key":process.env.GOOGLE_MAPS_API_KEY,"X-Goog-FieldMask":"places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.nationalPhoneNumber,places.currentOpeningHours.openNow"},body:JSON.stringify({textQuery:"loja Olympikus",languageCode:"pt-BR",maxResultCount:10,locationBias:{circle:{center:{latitude:lat,longitude:lng},radius:50000}}}),cache:"no-store"});
    if(!response.ok)throw new Error(`Google Places ${response.status}`);
    const data=await response.json() as {places?:Place[]};
    const stores=(data.places||[]).filter(place=>place.location?.latitude!=null&&place.location?.longitude!=null).map(place=>({id:place.id,name:place.displayName?.text||"Loja Olympikus",address:place.formattedAddress||"Endereço não informado",phone:place.nationalPhoneNumber||null,openNow:place.currentOpeningHours?.openNow??null,distanceKm:Number(distanceKm(lat,lng,place.location!.latitude!,place.location!.longitude!).toFixed(1)),directionsUrl:place.googleMapsUri||`https://www.google.com/maps/dir/?api=1&destination=${place.location!.latitude},${place.location!.longitude}`})).sort((a,b)=>a.distanceKm-b.distanceKm);
    return NextResponse.json({configured:true,stores,mapsSearch,officialWhatsApp},{headers:{"Cache-Control":"private, no-store"}});
  }catch(error){console.error("Store finder error",error);return NextResponse.json({configured:false,stores:[],mapsSearch,officialWhatsApp,warning:"Não foi possível consultar as lojas agora."});}
}
