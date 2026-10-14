"use client";
import {useState} from "react";
import {Check,Search} from "lucide-react";
import {shoes} from "@/data/shoes";
import {categories,type Workout} from "@/data/categories";

const brands=[...new Set(shoes.map(shoe=>shoe.brand))].sort();
const normalize=(text:string)=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export default function ShoeSelector({owned,setOwned}:{owned:string[];setOwned:(items:string[])=>void}){
  const [search,setSearch]=useState("");const [brand,setBrand]=useState("");const [category,setCategory]=useState<Workout|"">("");const [limit,setLimit]=useState(12);
  const filtered=shoes.filter(shoe=>(!brand||shoe.brand===brand)&&(!category||shoe.categories.includes(category))&&normalize(shoe.name).includes(normalize(search)));
  return <div className="shoe-picker"><div className="catalog-search"><label><Search/><input aria-label="Buscar tênis por modelo" placeholder="Busque por marca ou modelo…" value={search} onChange={event=>{setSearch(event.target.value);setLimit(12)}}/></label><select aria-label="Filtrar marca" value={brand} onChange={event=>{setBrand(event.target.value);setLimit(12)}}><option value="">Todas as marcas</option>{brands.map(item=><option key={item}>{item}</option>)}</select><select aria-label="Filtrar categoria" value={category} onChange={event=>{setCategory(event.target.value as Workout|"");setLimit(12)}}><option value="">Todas as categorias</option>{categories.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></div><p className="catalog-count">{filtered.length} tênis no catálogo · {owned.length} selecionados</p><div className="shoe-select">{filtered.slice(0,limit).map(shoe=><button type="button" key={shoe.id} aria-pressed={owned.includes(shoe.id)} className={owned.includes(shoe.id)?"selected":""} onClick={()=>setOwned(owned.includes(shoe.id)?owned.filter(id=>id!==shoe.id):[...owned,shoe.id])}><span className="check"><Check/></span><img src={shoe.img} alt={shoe.name} loading="lazy"/><span><small>{shoe.brand}</small><b>{shoe.name}</b></span><em>{shoe.plateName}</em></button>)}</div>{!filtered.length&&<p className="catalog-count">Nenhum modelo encontrado. Tente outro nome ou marca.</p>}{filtered.length>limit&&<button className="show-more" type="button" onClick={()=>setLimit(limit+12)}>Mostrar mais tênis</button>}</div>;
}
