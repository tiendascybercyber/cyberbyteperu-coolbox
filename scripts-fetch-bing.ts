import { mkdir, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const DATA = join(ROOT, "src/data/products.json");
const OUT = join(ROOT, "public/products/real");
const CHECKPOINT = join(ROOT, "research/product-image-fetch-bing.json");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36";
const MIN_BYTES = 1200;
const MAX_BYTES = 8 * 1024 * 1024;
const STOP = new Set(["el","la","los","las","un","una","de","del","para","con","sin","y","en","por","tipo","color","varios","unidad","unidades","pack","kit","caja"]);
const CATEGORY_TERMS: Record<string,string> = { "Cables":"cable technology accessory product", "Cargadores":"charger technology accessory product", "USB/Memorias":"USB flash drive storage product", "Audífonos":"headphones headset product", "Adaptadores":"technology adapter product", "Extensiones":"power extension product", "Protectores":"phone screen protector product", "Redes":"router networking product", "Otros":"technology accessory product" };
const NEXORA: [string,string][] = [
  ["Mouse optico vertical Yelandar jx-d5", "https://nexoratechperu.com/wp-content/uploads/2026/06/image-12-1.png"],
  ["Mouse Hoco GM13 confortable musiness wired mouse", "https://nexoratechperu.com/wp-content/uploads/2026/06/hoco-gm13-estem-business-wired-mouse-scroll.png"],
  ["Mouse Q6 yelandar inalambrico rgb gaming", "https://nexoratechperu.com/wp-content/uploads/2026/06/imageUrl_1-1.png"],
  ["Mouse Teros dual inalambrico TE-1237S", "https://nexoratechperu.com/wp-content/uploads/2026/06/TE-1237S-1.png"],
  ["Teclado Logitech inalambrico MK235 + Mouse", "https://nexoratechperu.com/wp-content/uploads/2026/06/TECLADO-Y-MOUSE-LOGITECH-MK235-WIRELESS-2-1.png"],
  ["AUDIFONO CON MICRÓFONO MICELL VQ-M808", "https://nexoratechperu.com/wp-content/uploads/2026/08/VQ-M808.webp"],
];
const BAD = ["youtube", "ytimg", "maps.google", "logo", "sprite", "favicon"];
const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));
function norm(s:string) { return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g," ").trim(); }
function queryFor(p:any) { const words = norm(p.name).split(/\s+/).filter((w:string)=>!STOP.has(w)&&w.length>1).slice(0,16); return `${words.join(" ")} ${CATEGORY_TERMS[p.category] ?? "technology accessory product"}`.trim(); }
function similarity(a:string,b:string) { const aa=a.split(/\s+/), bb=b.split(/\s+/), common=aa.filter(x=>bb.includes(x)).length; return common/Math.max(1,bb.length); }
function nexoraFor(name:string) { const key=norm(name); let best:null|[string,string]=null, score=0; for (const seed of NEXORA) { const s=Math.max(similarity(key,norm(seed[0]))*.92, key===norm(seed[0])?1:0); if(s>score){score=s;best=seed;} } return score>=.68?best:null; }
async function fetchText(url:string) { const r=await fetch(url,{headers:{"user-agent":UA,"accept":"text/html,application/xhtml+xml","accept-language":"es-PE,es;q=0.9,en;q=0.8"}}); if(!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`),{status:r.status}); return await r.text(); }
async function bingImages(q:string) { const url=`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&qft=+filterui:photo-photo`; const text=await fetchText(url); let decoded=htmlDecode(text); let urls=[...decoded.matchAll(/"murl"\s*:\s*"(https?:\/\/[^"\\]+)/gi)].map(m=>m[1]); if(!urls.length) urls=[...text.matchAll(/murl(?:&quot;|\\?\")\s*:\s*(?:&quot;|\\?\")((?:https?:\/\/).*?)(?:&quot;|\\?\")/gi)].map(m=>m[1]); const out:string[]=[]; const seen=new Set<string>(); for(let u of urls){u=u.replaceAll("\\/","/").trim(); try{const x=new URL(u); const hay=(x.hostname+x.pathname).toLowerCase(); if(seen.has(u)||!/^https?:$/.test(x.protocol)||BAD.some(b=>hay.includes(b))||/\.(svg|gif|mp4|webm|mov|avi)(\?|$)/i.test(x.pathname)) continue; seen.add(u);out.push(u);if(out.length>=16)break;}catch{}} return out; }
function htmlDecode(s:string){return s.replaceAll("&quot;",'"').replaceAll("&#34;",'"').replaceAll("&amp;", "&").replaceAll("&#39;", "'");}
function ext(type:string,url:string,b:Uint8Array){ const t=type.split(";")[0].toLowerCase(); if(t==="image/jpeg"||t==="image/jpg")return ".jpg"; if(t==="image/png")return ".png"; if(t==="image/webp")return ".webp"; if(t==="image/avif")return ".avif"; if(b[0]===0xff&&b[1]===0xd8)return ".jpg"; if(b[0]===0x89&&b[1]===0x50)return ".png"; if(b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[3]===0x46)return ".webp"; const e=extname(new URL(url).pathname).toLowerCase(); return [".jpg",".jpeg",".png",".webp",".avif"].includes(e)?e:".jpg"; }
async function download(url:string,slug:string){ try { const r=await fetch(url,{headers:{"user-agent":UA,"accept":"image/avif,image/webp,image/apng,image/*,*/*;q=0.8","referer":"https://www.bing.com/"}}); if(!r.ok)return null; const b=new Uint8Array(await r.arrayBuffer()); const type=r.headers.get("content-type")??""; if(b.length<MIN_BYTES||b.length>MAX_BYTES||(!type.toLowerCase().startsWith("image/")&&!(b[0]===0xff&&b[1]===0xd8)&&!(b[0]===0x89&&b[1]===0x50)&&!(b[0]===0x52&&b[1]===0x49)))return null; const path=join(OUT,slug+ext(type,url,b)); await Bun.write(path,b); return "/products/real/"+path.split("/").pop(); } catch { return null; } }
async function localImage(slug:string){ for(const n of await readdir(OUT).catch(()=>[])){if(n.startsWith(slug+".")&&!n.endsWith(".json"))return "/products/real/"+n;} return null; }
async function save(products:any[],state:any){await Bun.write(DATA,JSON.stringify(products,null,2)+"\n");await Bun.write(CHECKPOINT,JSON.stringify(state,null,2)+"\n");}
const products:any[]=JSON.parse(await Bun.file(DATA).text()); await mkdir(OUT,{recursive:true});
const counts={total:products.length,matched:0,downloaded:0,nexora:0,skipped:0,failed:0,blocked:0}; const results:any[]=[]; let blocked=false;
for(let i=0;i<products.length;i++){const p=products[i], slug=p.slug, query=queryFor(p); let image=await localImage(slug), source="existing"; if(image){p.image=image;counts.skipped++;} else {const seed=nexoraFor(p.name); if(seed){image=await download(seed[1],slug);if(image){p.image=image;counts.downloaded++;counts.nexora++;counts.matched++;source="nexoratechperu";}} if(!image&&!blocked){try{const candidates=await bingImages(query);if(candidates.length){counts.matched++;source="bing";}for(const c of candidates){image=await download(c,slug);if(image){p.image=image;counts.downloaded++;break;}await sleep(120);}}catch(e:any){if([401,403,429,503].includes(e.status)){blocked=true;counts.blocked++;console.log(`Bing blocked at ${i+1}/${products.length} HTTP ${e.status}; stopping gracefully`);}}} if(!image){counts.failed++;source="fallback";}} results.push({id:p.id,name:p.name,query,image:p.image,source}); if((i+1)%10===0||i===products.length-1){await save(products,{processed:i+1,total:products.length,counts,results,blocked});console.log(`${i+1}/${products.length} matched=${counts.matched} downloaded=${counts.downloaded} failed=${counts.failed} skipped=${counts.skipped}`);} if(blocked){for(const r of products.slice(i+1)){counts.failed++;r.image=r.image;}await save(products,{processed:products.length,total:products.length,counts,results,blocked:true});break;} if(i<products.length-1)await sleep(550); }
console.log(JSON.stringify(counts));
