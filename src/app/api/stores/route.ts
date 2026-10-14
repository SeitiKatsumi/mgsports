import {NextResponse} from "next/server";
import {officialWhatsApp,stores,storeSource} from "../../../data/stores";

function distanceKm(aLat:number,aLng:number,bLat:number,bLng:number){const rad=(value:number)=>value*Math.PI/180;const dLat=rad(bLat-aLat);const dLng=rad(bLng-aLng);const h=Math.sin(dLat/2)**2+Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));}

export async function GET(request:Request){
  const {searchParams}=new URL(request.url);const rawLat=searchParams.get("lat");const rawLng=searchParams.get("lng");
  const located=rawLat!==null&&rawLng!==null;const lat=Number(rawLat);const lng=Number(rawLng);
  if((rawLat!==null||rawLng!==null)&&(!located||!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180))return NextResponse.json({error:"Localização inválida."},{status:400});
  const mapped=await Promise.all(stores.map(async store=>{
    let distance:number|null=null;
    if(located&&process.env.GOOGLE_MAPS_API_KEY){
      try{
        const query=new URLSearchParams({address:store.address,key:process.env.GOOGLE_MAPS_API_KEY});
        const response=await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}`,{signal:AbortSignal.timeout(5000),cache:"no-store"});
        const data=await response.json();const position=data.results?.[0]?.geometry?.location;
        if(response.ok&&position&&typeof position.lat==="number"&&typeof position.lng==="number")distance=Number(distanceKm(lat,lng,position.lat,position.lng).toFixed(1));
      }catch{}
    }
    const directions=new URLSearchParams({api:"1",destination:store.address});if(located)directions.set("origin",`${lat},${lng}`);
    return {...store,distanceKm:distance,directionsUrl:`https://www.google.com/maps/dir/?${directions}`};
  }));
  mapped.sort((a,b)=>(a.distanceKm??Infinity)-(b.distanceKm??Infinity));
  return NextResponse.json({configured:mapped.some(store=>store.distanceKm!==null),stores:mapped,officialWhatsApp,source:storeSource},{headers:{"Cache-Control":"private, no-store"}});
}
