import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft,Check,ExternalLink,Footprints,Gauge,MapPin,Ruler,ShieldAlert,Sparkles,Weight,Zap} from "lucide-react";
import {getShoeBySlug,shoes} from "@/data/shoes";
import "./product.css";

export function generateStaticParams(){return shoes.map(shoe=>({slug:shoe.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const shoe=getShoeBySlug(slug);return shoe?{title:`${shoe.name} — ficha completa | Meu Olympikus`,description:shoe.desc}:{} }

export default async function ShoePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const shoe=getShoeBySlug(slug);if(!shoe)notFound();
  const specs=[{icon:Weight,label:"PESO",value:`${shoe.weight} g`,note:"tamanho 40"},{icon:Ruler,label:"DROP",value:`${shoe.drop} mm`,note:"calcanhar–antepé"},{icon:Zap,label:"NATUREZA",value:shoe.nature,note:shoe.cat},{icon:Footprints,label:"PISADA",value:shoe.gaitSupport,note:shoe.landing},{icon:Gauge,label:"ROCKER",value:shoe.rocker,note:"geometria declarada"},{icon:Sparkles,label:"ENTRESSOLA",value:shoe.midsole,note:"tecnologia principal"}];
  return <main className="product-page">
    <header className="product-top"><a href="/" className="product-back"><ArrowLeft/> Voltar ao Óly</a><a href="/" className="product-brand"><img src="/olympikus-logo.svg" alt="Olympikus"/></a><span>FICHA TÉCNICA · FONTE OFICIAL</span></header>
    <section className="product-hero"><div className="product-image"><span>{shoe.cat}</span><img src={shoe.img} alt={shoe.name}/><small>{shoe.weight} G · DROP {shoe.drop} MM</small></div><div className="product-intro"><span>{shoe.nature}</span><h1>{shoe.name}</h1><p>{shoe.desc}</p><div className="plate-callout"><Sparkles/><div><b>{shoe.plateName}</b><span>{shoe.plateDetail}</span></div></div><div className="product-actions"><a href="/#analise">Analisar com o Óly <Zap/></a><a href={`/lojas?tenis=${shoe.slug}`}>Encontrar perto de mim <MapPin/></a></div></div></section>
    <section className="product-specs"><header><span>RADAR TÉCNICO</span><h2>Todas as especificações em um só lugar.</h2></header><div>{specs.map(({icon:Icon,label,value,note})=><article key={label}><Icon/><span>{label}</span><b>{value}</b><small>{note}</small></article>)}</div></section>
    <section className="product-grid"><article><span>CONSTRUÇÃO</span><h2>Do cabedal ao solado.</h2><dl><div><dt>Placa</dt><dd>{shoe.plateDetail}</dd></div><div><dt>Entressola</dt><dd>{shoe.midsole}</dd></div><div><dt>Solado</dt><dd>{shoe.outsole}</dd></div><div><dt>Cabedal</dt><dd>{shoe.upper}</dd></div><div><dt>Palmilha</dt><dd>{shoe.insole}</dd></div></dl></article><article><span>FUNÇÃO</span><h2>Onde ele rende melhor.</h2><div className="use-columns"><div><b><Check/> IDEAL PARA</b>{shoe.idealUses.map(item=><p key={item}>{item}</p>)}</div><div><b><ShieldAlert/> NÃO É A PRIMEIRA ESCOLHA</b>{shoe.avoidUses.map(item=><p key={item}>{item}</p>)}</div></div></article></section>
    <section className="product-balance"><div><span>PONTOS FORTES</span>{shoe.strengths.map(item=><p key={item}><Check/>{item}</p>)}</div><div><span>LIMITES E CONTEXTO</span>{shoe.limits.map(item=><p key={item}><ShieldAlert/>{item}</p>)}</div></section>
    <section className="source-card"><div><span>FONTE E TRANSPARÊNCIA</span><h2>Especificações verificadas no site oficial Olympikus.</h2><p>A ficha descreve o produto; ela não diagnostica biomecânica nem substitui teste de ajuste. Pisada e ponto de aterrissagem são informações diferentes.</p></div><a href={shoe.officialUrl} target="_blank" rel="noreferrer">Abrir página oficial <ExternalLink/></a></section>
    <footer><span>© 2026 OLYMPIKUS</span><a href="/privacidade">PRIVACIDADE</a><a href="/">NOVA ANÁLISE</a></footer>
  </main>
}
