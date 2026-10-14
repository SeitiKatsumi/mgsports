import {ArrowLeft} from "lucide-react";
import StoreFinder from "@/components/StoreFinder";
import {getShoeBySlug} from "@/data/shoes";

export const metadata={title:"Rede de lojas | MG Sports",description:"Encontre as unidades MG Sports, abra a rota e fale com o WhatsApp de cada loja."};
export default async function StoresPage({searchParams}:{searchParams:Promise<{tenis?:string}>}){const params=await searchParams;const shoe=params.tenis?getShoeBySlug(params.tenis):undefined;return <main className="legal"><header><a href="/"><ArrowLeft/> Voltar</a><img src="/mg-sports-logo.webp" alt="MG Sports"/></header><section style={{maxWidth:820,margin:"60px auto"}}><StoreFinder shoeName={shoe?.name} productUrl={shoe?.officialUrl}/></section></main>}
