import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Meu Olympikus — seu treino, seu Corre",description:"Recomendação inteligente de tênis Olympikus para cada treino.",manifest:"/manifest.webmanifest",icons:{icon:"/icon.svg"}};
export const viewport:Viewport={themeColor:"#f4f4f1",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
