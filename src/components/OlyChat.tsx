"use client";

import {FormEvent,useEffect,useRef,useState} from "react";
import {ArrowUp,MessageCircle,Sparkles,X} from "lucide-react";
import "./oly-chat.css";

type Message={role:"user"|"assistant";content:string};
const welcome:Message={role:"assistant",content:"Oi, eu sou a MG AI. Posso comparar tênis de várias marcas do catálogo TM Runners, entender seu treino e explicar placa, carga, pisada e rotação. O que você quer descobrir?"};
const prompts=["Qual tênis usar hoje?","Quero um tênis para trilha","Usei placa duas vezes","Quero montar uma rotação"];

export default function OlyChat(){
  const [open,setOpen]=useState(false);const [messages,setMessages]=useState<Message[]>([welcome]);const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const endRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages,loading]);
  async function send(text:string){const content=text.trim();if(!content||loading)return;const next=[...messages,{role:"user" as const,content}];setMessages(next);setInput("");setLoading(true);try{const context=localStorage.getItem("mg_running_profile")||localStorage.getItem("mg_training_context")||undefined;const response=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({messages:next.slice(-20),context})});const data=await response.json();setMessages(current=>[...current,{role:"assistant",content:data.reply||data.error||"Não consegui responder agora."}])}catch{setMessages(current=>[...current,{role:"assistant",content:"Fiquei sem conexão por um instante. Tente novamente."}])}finally{setLoading(false)}}
  function submit(event:FormEvent){event.preventDefault();void send(input)}
  return <div className={`oly-chat ${open?"open":""}`}>
    {open&&<section className="oly-panel" aria-label="Conversa com MG AI">
      <header><div className="oly-mini-orb"><img src="/mg-sports-logo.webp" alt="MG Sports"/></div><div><b>MG AI</b><span><i/> ESPECIALISTA MULTIMARCAS</span></div><button onClick={()=>setOpen(false)} aria-label="Fechar conversa"><X/></button></header>
      <div className="oly-messages">{messages.map((message,index)=><article className={message.role} key={`${message.role}-${index}`}><span>{message.role==="assistant"?"MG AI":"Você"}</span><p>{message.content}</p></article>)}{loading&&<article className="assistant typing"><span>MG AI</span><p><i/><i/><i/></p></article>}<div ref={endRef}/></div>
      {messages.length===1&&<div className="oly-prompts">{prompts.map(prompt=><button key={prompt} onClick={()=>void send(prompt)}>{prompt}</button>)}</div>}
      <form onSubmit={submit}><label><span className="sr-only">Mensagem para a MG AI</span><textarea rows={1} maxLength={2400} placeholder="Pergunte sobre seu treino ou tênis…" value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();void send(input)}}}/></label><button disabled={!input.trim()||loading} aria-label="Enviar"><ArrowUp/></button></form>
      <small>Orientação esportiva, não diagnóstico clínico. Respostas podem conter imprecisões.</small>
    </section>}
    <button className="oly-launcher" onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-label={open?"Fechar MG AI":"Conversar com MG AI"}><span><Sparkles/></span><div><b>FALE COM A MG AI</b><small>AGENTE CONVERSACIONAL</small></div>{open?<X/>:<MessageCircle/>}</button>
  </div>
}
