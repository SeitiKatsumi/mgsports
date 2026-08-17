export function cleanModelText(text:string){
  return text
    .replace(/\s*\(\[[^\]]+\]\(https?:\/\/[^)]+\)\)/g,"")
    .replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g,"$1")
    .replace(/^#{1,6}\s+/gm,"")
    .replace(/\*\*([^*]+)\*\*/g,"$1")
    .replace(/`([^`]+)`/g,"$1")
    .trim();
}
