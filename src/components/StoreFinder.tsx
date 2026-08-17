"use client";

import {useState} from "react";
import {Check,ExternalLink,LocateFixed,MapPin,MessageCircle,Navigation,Store} from "lucide-react";
import "./store-finder.css";

type NearbyStore={id?:string;name:string;address:string;phone:string|null;openNow:boolean|null;distanceKm:number;directionsUrl:string};
type SearchResult={configured:boolean;stores:NearbyStore[];mapsSearch:string;officialWhatsApp:string;warning?:string};

export default function StoreFinder({shoeName="Olympikus Corre"}:{shoeName?:string}){
  const [status,setStatus]=useState<"idle"|"locating"|"ready"|"error">("idle");const [result,setResult]=useState<SearchResult|null>(null);
  const whatsapp=`https://wa.me/${result?.officialWhatsApp||"5511944504459"}?text=${encodeURIComponent(`Olá! Gostaria de saber onde encontro o ${shoeName}.`)}`;
  function locate(){
    if(!navigator.geolocation){setStatus("error");return}
    setStatus("locating");navigator.geolocation.getCurrentPosition(async position=>{try{const response=await fetch(`/api/stores?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,{cache:"no-store"});if(!response.ok)throw new Error("location");setResult(await response.json());setStatus("ready")}catch{setStatus("error")}},()=>setStatus("error"),{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }
  return <section className="store-finder">
    <div className="store-hero"><div className="map-orb"><MapPin/><i/><i/><i/></div><div><span>LOCALIZADOR ÓLY</span><h2>Encontre o {shoeName} perto de você.</h2><p>Sua posição é usada apenas nesta busca. A rota abre diretamente no Google Maps.</p></div></div>
    {status==="idle"&&<button className="locate-button" onClick={locate}><LocateFixed/> Usar minha localização</button>}
    {status==="locating"&&<div className="store-loading"><span/><p>Buscando lojas próximas…</p></div>}
    {status==="error"&&<div className="store-note"><Navigation/><div><b>Não foi possível acessar sua localização.</b><span>Você ainda pode abrir a busca de lojas ou falar com o atendimento oficial.</span></div></div>}
    {status==="ready"&&result&&<>
      {result.stores.length>0?<div className="store-results"><header><Check/><span><b>{result.stores.length} resultados próximos</b><small>Confirme estoque e atendimento antes de sair.</small></span></header>{result.stores.map(store=><article key={store.id||store.name+store.address}><span className="store-icon"><Store/></span><div><h3>{store.name}</h3><p>{store.address}</p><small>{store.distanceKm} km · {store.openNow===true?"aberta agora":store.openNow===false?"fechada agora":"horário não informado"}</small></div><a href={store.directionsUrl} target="_blank" rel="noreferrer" aria-label={`Como chegar a ${store.name}`}><Navigation/> Como chegar</a></article>)}</div>:<div className="store-note"><MapPin/><div><b>Abra as lojas próximas no mapa.</b><span>{result.configured?"Nenhum resultado foi encontrado neste raio.":"A consulta direta requer GOOGLE_MAPS_API_KEY; a busca no Google Maps continua disponível."}</span></div></div>}
    </>}
    <div className="store-actions"><a href={result?.mapsSearch||"https://www.google.com/maps/search/loja+Olympikus"} target="_blank" rel="noreferrer"><MapPin/> Abrir lojas no mapa <ExternalLink/></a><a className="whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle/> WhatsApp oficial Olympikus <ExternalLink/></a></div>
    <small className="store-disclaimer">Resultados de proximidade vêm do Google Places quando configurado. O WhatsApp é o canal oficial da loja online Olympikus, não de uma filial específica.</small>
  </section>
}
