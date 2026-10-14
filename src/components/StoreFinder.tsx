"use client";
import {useEffect,useState} from "react";
import {ExternalLink,LocateFixed,MapPin,MessageCircle,Navigation,ShoppingBag,Store} from "lucide-react";
import {stores,officialWhatsApp,storeSource} from "@/data/stores";
import "./store-finder.css";

type NearbyStore={id:string;name:string;address:string;phone:string;whatsapp:string;distanceKm:number|null;directionsUrl:string};
type SearchResult={configured:boolean;stores:NearbyStore[]};
const initialStores:NearbyStore[]=stores.map(store=>({...store,distanceKm:null,directionsUrl:`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`}));

export default function StoreFinder({shoeName="seu próximo tênis",productUrl}:{shoeName?:string;productUrl?:string}){
  const [status,setStatus]=useState<"idle"|"locating"|"ready"|"error">("idle");const [result,setResult]=useState<SearchResult>({configured:false,stores:initialStores});
  const message=`Olá, MG Sports! Quero saber sobre o ${shoeName}.${productUrl?` Link: ${productUrl}`:""}`;
  const whatsapp=(phone:string)=>`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  useEffect(()=>{void fetch("/api/stores").then(response=>response.ok?response.json():null).then(data=>{if(data)setResult(data)}).catch(()=>{})},[]);
  function locate(){
    if(!navigator.geolocation){setStatus("error");return}
    setStatus("locating");navigator.geolocation.getCurrentPosition(async position=>{try{const response=await fetch(`/api/stores?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,{cache:"no-store"});if(!response.ok)throw new Error("location");setResult(await response.json());setStatus("ready")}catch{setStatus("error")}},()=>setStatus("error"),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  return <section className="store-finder"><div className="store-hero"><div className="map-orb"><MapPin/><i/><i/><i/></div><div><span>REDE MG SPORTS</span><h2>Encontre uma loja ou compre online.</h2><p>Unidades da rede em Franca, SP. Consulte disponibilidade com cada loja.</p></div></div><button className="locate-button" disabled={status==="locating"} onClick={locate}><LocateFixed/>{status==="locating"?"Buscando proximidade…":"Usar minha localização"}</button>{status==="error"&&<div className="store-note"><Navigation/><div><b>Não foi possível acessar sua localização.</b><span>As rotas e os contatos das unidades continuam disponíveis.</span></div></div>}{status==="ready"&&!result.configured&&<p className="catalog-note">Sua posição foi adicionada às rotas. O Google Maps mostrará distância e trajeto para cada unidade.</p>}<div className="store-results"><header><Store/><span><b>{result.configured?"Lojas ordenadas pela sua proximidade":"Unidades oficiais MG Sports"}</b><small>Endereços e WhatsApp publicados pela rede.</small></span></header>{result.stores.map((store,index)=><article key={store.id}><span className="store-icon"><Store/></span><div><h3>{store.name}</h3><p>{store.address}</p><small>{store.distanceKm!==null?`${store.distanceKm} km em linha reta${index===0?" · mais próxima":""}`:"Consulte horário e estoque antes de sair."}</small></div><div className="store-unit-actions"><a href={store.directionsUrl} target="_blank" rel="noreferrer"><Navigation/> Como chegar</a><a href={whatsapp(store.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle/> WhatsApp da unidade</a></div></article>)}</div><div className="store-actions"><a href={productUrl||"https://www.lojatmrunners.com.br/"} target="_blank" rel="noreferrer"><ShoppingBag/>{productUrl?"Abrir este tênis na TM Runners":"Loja online TM Runners"}<ExternalLink/></a><a className="whatsapp" href={whatsapp(officialWhatsApp)} target="_blank" rel="noreferrer"><MessageCircle/> Atendimento MG Sports <ExternalLink/></a></div><small className="store-disclaimer"><a href={storeSource} target="_blank" rel="noreferrer">Conhecer a rede MG Sports</a> · Preço, numeração, estoque e atendimento são confirmados pela loja.</small></section>;
}
