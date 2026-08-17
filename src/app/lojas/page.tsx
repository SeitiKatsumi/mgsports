import {ArrowLeft} from "lucide-react";
import StoreFinder from "@/components/StoreFinder";

export const metadata={title:"Lojas próximas | Meu Olympikus",description:"Encontre lojas Olympikus perto de você e abra a rota no mapa."};
export default function StoresPage(){return <main className="legal"><header><a href="/"><ArrowLeft/> Voltar</a><img src="/olympikus-logo.svg" alt="Olympikus"/></header><section style={{maxWidth:820,margin:"60px auto"}}><StoreFinder/></section></main>}
