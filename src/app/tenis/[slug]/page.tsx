import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {ArrowLeft,Check,ExternalLink,Footprints,MapPin,Ruler,ShieldAlert,ShoppingBag,Sparkles,Weight,Zap} from "lucide-react";
import {getShoeBySlug,shoes} from "@/data/shoes";
import "./product.css";

export function generateStaticParams(){return shoes.map(shoe=>({slug:shoe.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const shoe=getShoeBySlug(slug);return shoe?{title:`${shoe.name} — ficha completa | MG Sports`,description:shoe.desc}:{} }

export default async function ShoePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const shoe=getShoeBySlug(slug);if(!shoe)notFound();
  const specs=[{icon:Weight,label:"PESO",value:shoe.weight!==null?`${shoe.weight} g`:"Não informado",note:"Conforme a descrição do produto; peso de embalagem excluído"},{icon:Ruler,label:"DROP",value:shoe.drop!==null?`${shoe.drop} mm`:"Não informado",note:"Diferença entre calcanhar e antepé"},{icon:Zap,label:"NATUREZA",value:shoe.nature,note:shoe.brand},{icon:Footprints,label:"PISADA",value:shoe.gaitSupport,note:"Classificação comercial da loja"},{icon:Sparkles,label:"PLACA",value:shoe.plateName,note:"Material da ficha, não do filtro da categoria"},{icon:Sparkles,label:"ENTRESSOLA",value:shoe.midsole,note:"Informação declarada na loja"}];
  return <main className="product-page"><header className="product-top"><a href="/" className="product-back"><ArrowLeft/> Voltar à MG AI</a><a href="/" className="product-brand"><img src="/mg-sports-logo.webp" alt="MG Sports"/></a><span>FICHA TÉCNICA · TM RUNNERS</span></header>
    <section className="product-hero"><div className="product-image"><span>{shoe.brand.toUpperCase()}</span><img src={shoe.img} alt={shoe.name}/><small>{shoe.plateName}</small></div><div className="product-intro"><span>{shoe.nature}</span><h1>{shoe.name}</h1><p>{shoe.desc}</p><div className="plate-callout"><Sparkles/><div><b>{shoe.plateName}</b><span>{shoe.plateDetail}</span></div></div><div className="product-actions"><a href={shoe.officialUrl} target="_blank" rel="noreferrer"><ShoppingBag/> Comprar este tênis na TM Runners <ExternalLink/></a><a href={`/lojas?tenis=${shoe.slug}`}>Encontrar uma loja MG <MapPin/></a></div></div></section>
    <section className="product-specs"><header><span>RADAR TÉCNICO</span><h2>As especificações deste modelo.</h2></header><div>{specs.map(({icon:Icon,label,value,note})=><article key={label}><Icon/><span>{label}</span><b>{value}</b><small>{note}</small></article>)}</div></section>
    <section className="product-grid"><article><span>CONSTRUÇÃO</span><h2>Do cabedal ao solado.</h2><dl>{[["Placa",shoe.plateDetail],["Entressola",shoe.midsole],["Solado",shoe.outsole],["Cabedal",shoe.upper],["Palmilha",shoe.insole]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></article><article><span>CATEGORIAS DA LOJA</span><h2>Onde encontrar este tênis.</h2><div className="use-columns"><div><b><Check/> INDICAÇÕES DO CATÁLOGO</b>{shoe.idealUses.map(item=><p key={item}>{item}</p>)}</div><div><b><ShieldAlert/> CONTEXTO DE USO</b>{shoe.limits.map(item=><p key={item}>{item}</p>)}</div></div></article></section>
    <section className="source-card"><div><span>DESCRIÇÃO DA TM RUNNERS</span><h2>A ficha publicada pela loja.</h2><div className="source-description">{shoe.description}</div></div></section>
    <section className="source-card"><div><span>FONTE E TRANSPARÊNCIA</span><h2>Dados consultados na TM Runners.</h2><p>Consulta do catálogo em {shoe.checkedAt.split("-").reverse().join("/")}. Valores ausentes não foram estimados. Confira preço, numeração e disponibilidade atuais na loja. Esta ficha não diagnostica biomecânica nem substitui teste de ajuste.</p></div><a href={shoe.officialUrl} target="_blank" rel="noreferrer">Ver este produto na loja <ExternalLink/></a></section>
    <footer><span>© 2026 MG SPORTS</span><a href="/privacidade">PRIVACIDADE</a><a href="/">NOVA ANÁLISE</a></footer>
  </main>;
}
