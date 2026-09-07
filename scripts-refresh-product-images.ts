import { mkdir, readdir, unlink } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const DATA = join(ROOT, "src/data/products.json");
const OUT = join(ROOT, "public/products/real");
const CHECKPOINT = join(ROOT, "research/product-image-refresh.json");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/128 Safari/537.36";
const MIN_BYTES = 1200;
const MAX_BYTES = 8 * 1024 * 1024;
const STOP = new Set(["el","la","los","las","un","una","de","del","para","con","sin","y","en","por","tipo","color","varios","unidad","unidades","pack","kit","caja","pcs","pzs","pza","c","the","and","for","producto","product","nuevo","nueva"]);
const GENERIC = new Set(["audifono","audifonos","auricular","auriculares","cable","adaptador","adaptadores","cargador","cargadores","mouse","teclado","memoria","usb","protector","pantalla","bateria","pilas","lampara","luz","funda","soporte","otros","wireless","inalambrico","inalambrica","bluetooth","negro","negra","azul","rojo","roja","verde","blanco","blanca","rosa","celeste","gris","multicolor"]);
const PREFERRED = ["amazon", "walmart", "aliexpress", "mercadolibre", "mercadolivre", "shopify", "cdn", "falabella", "ripley", "sodimac", "promart", "plazavea", "linio", "oficial", "hoco", "kingston", "logitech", "motorola", "philips", "baseus", "steren", "anker", "xiaomi", "samsung", "artesco"];
const BAD_HOST = ["youtube", "ytimg", "maps.google", "wikipedia"];
const BAD_PATH = ["/logo", "logo-", "favicon", "sprite", "mapa"];
const NEXORA: [string, string][] = [
  ["Mouse optico vertical Yelandar jx-d5", "https://nexoratechperu.com/wp-content/uploads/2026/06/image-12-1.png"],
  ["Mouse Hoco GM13 confortable musiness wired mouse", "https://nexoratechperu.com/wp-content/uploads/2026/06/hoco-gm13-estem-business-wired-mouse-scroll.png"],
  ["Mouse Q6 yelandar inalambrico rgb gaming", "https://nexoratechperu.com/wp-content/uploads/2026/06/imageUrl_1-1.png"],
  ["Mouse Teros dual inalambrico TE-1237S", "https://nexoratechperu.com/wp-content/uploads/2026/06/TE-1237S-1.png"],
  ["Teclado Logitech inalambrico MK235 + Mouse", "https://nexoratechperu.com/wp-content/uploads/2026/06/TECLADO-Y-MOUSE-LOGITECH-MK235-WIRELESS-2-1.png"],
  ["AUDIFONO CON MICRÓFONO MICELL VQ-M808", "https://nexoratechperu.com/wp-content/uploads/2026/08/VQ-M808.webp"],
];

type Candidate = { url: string; title: string; score: number; rank: number };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function norm(s: string) { return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function tokens(name: string) { return norm(name).split(/\s+/).filter((x) => x.length > 1 && !STOP.has(x)); }
function productTokens(name: string) { return tokens(name).filter((x) => !GENERIC.has(x)); }
function englishKeywords(name: string) {
  const map: Record<string, string> = { audifono: "headphones", audifonos: "headphones", auricular: "earphones", auriculares: "earphones", cable: "cable", adaptador: "adapter", cargador: "charger", mouse: "mouse", teclado: "keyboard", memoria: "flash drive", usb: "usb", protector: "screen protector", pantalla: "screen", bateria: "battery", pilas: "batteries", lampara: "lamp", luz: "light", funda: "case", soporte: "phone holder", parlante: "speaker", altavoz: "speaker", impresora: "printer", tinta: "ink", mochila: "backpack", bolso: "bag", reloj: "watch", camara: "camera", microfono: "microphone", ventilador: "fan", tripode: "tripod", proyector: "projector", juguete: "toy", lapiz: "pencil", lapices: "pencils", cuaderno: "notebook", carpeta: "folder", tijera: "scissors" };
  return [...new Set(tokens(name).map((x) => map[x]).filter(Boolean))].join(" ");
}
function queriesFor(p: any) {
  const name = p.name.replaceAll("kingtson", "kingston").replaceAll("huavi", "huawei").trim();
  const english = englishKeywords(name);
  return [`${name} producto`, english ? `${english} ${name}` : `${name} product`];
}
function similarity(a: string, b: string) {
  const aa = new Set(tokens(a)); const bb = tokens(b);
  return bb.filter((x) => aa.has(x)).length / Math.max(1, bb.length);
}
function nexoraFor(name: string) {
  const key = norm(name); let best: [string, string] | null = null; let bestScore = 0;
  for (const seed of NEXORA) {
    const score = Math.max(similarity(key, seed[0]) * 0.92, key === norm(seed[0]) ? 1 : 0);
    if (score > bestScore) { bestScore = score; best = seed; }
  }
  return bestScore >= 0.68 ? best : null;
}
async function fetchText(url: string) {
  const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "es-PE,es;q=0.9,en;q=0.8" }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}
function htmlDecode(s: string) { return s.replaceAll("&quot;", '"').replaceAll("&#34;", '"').replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("\\/", "/"); }
function candidateScore(url: string, title: string, name: string, rank: number) {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return -100; }
  const host = parsed.hostname.toLowerCase();
  const hay = norm(`${parsed.hostname} ${parsed.pathname} ${parsed.search} ${title}`);
  if (parsed.protocol !== "https:" || BAD_HOST.some((x) => host.includes(x)) || BAD_PATH.some((x) => parsed.pathname.toLowerCase().includes(x))) return -100;
  if (/\.(svg|gif|mp4|webm|mov|avi)(\?|$)/i.test(parsed.pathname)) return -100;
  const important = productTokens(name);
  const overlap = important.filter((x) => hay.includes(x)).length;
  let score = Math.max(0, 10 - rank * 0.15) + overlap * 0.15;
  if (PREFERRED.some((x) => host.includes(x) || hay.includes(x))) score += 3;
  return score;
}
async function bingImages(query: string, name: string, limit = 40): Promise<Candidate[]> {
  const text = htmlDecode(await fetchText(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qft=+filterui:photo-photo`));
  const items = [...text.matchAll(/"murl"\s*:\s*"(https?:\/\/[^"\\]+)"[\s\S]{0,250}?"t"\s*:\s*"([^"\\]*)"/gi)].map((m) => ({ url: m[1], title: m[2] }));
  const seen = new Set<string>(); const out: Candidate[] = [];
  for (const [rank, item] of items.entries()) {
    if (seen.has(item.url)) continue; seen.add(item.url);
    const score = candidateScore(item.url, item.title, name, rank);
    if (score <= -50) continue;
    out.push({ url: item.url, title: item.title, score, rank });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
function imageExt(type: string, url: string, b: Uint8Array) {
  const t = type.split(";", 1)[0].toLowerCase();
  if (t === "image/jpeg" || t === "image/jpg") return ".jpg";
  if (t === "image/png") return ".png";
  if (t === "image/webp") return ".webp";
  if (t === "image/avif") return ".avif";
  if (b[0] === 0xff && b[1] === 0xd8) return ".jpg";
  if (b[0] === 0x89 && b[1] === 0x50) return ".png";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) return ".webp";
  try { const e = new URL(url).pathname.match(/\.(jpg|jpeg|png|webp|avif)$/i)?.[0].toLowerCase(); return e === ".jpeg" ? ".jpg" : e || ".jpg"; } catch { return ".jpg"; }
}
function isImage(type: string, b: Uint8Array) {
  return type.toLowerCase().startsWith("image/") || (b[0] === 0xff && b[1] === 0xd8) || (b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46);
}
async function download(url: string, slug: string) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8", referer: "https://www.bing.com/" }, signal: AbortSignal.timeout(18000) });
    if (!r.ok) return null;
    const b = new Uint8Array(await r.arrayBuffer()); const type = r.headers.get("content-type") ?? "";
    if (b.length < MIN_BYTES || b.length > MAX_BYTES || !isImage(type, b)) return null;
    const path = join(OUT, slug + imageExt(type, url, b));
    await Bun.write(path, b);
    for (const file of await readdir(OUT)) if (file.startsWith(slug + ".") && file !== path.split("/").pop()) await unlink(join(OUT, file)).catch(() => {});
    return `/products/real/${path.split("/").pop()}`;
  } catch { return null; }
}
async function save(products: any[], state: any) {
  await Bun.write(DATA, JSON.stringify(products, null, 2) + "\n");
  await Bun.write(CHECKPOINT, JSON.stringify(state, null, 2) + "\n");
}

const products: any[] = JSON.parse(await Bun.file(DATA).text());
await mkdir(OUT, { recursive: true });
const counts = { total: products.length, matched: 0, downloaded: 0, nexora: 0, bing: 0, failed: 0, blocked: 0 };
const results: any[] = [];
for (let i = 0; i < products.length; i++) {
  const p = products[i]; const queries = queriesFor(p); let image: string | null = null; let source = "failed"; let sourceUrl = ""; let topScore = 0;
  const seed = nexoraFor(p.name);
  if (seed) { image = await download(seed[1], p.slug); if (image) { source = "nexoratechperu"; sourceUrl = seed[1]; topScore = 100; counts.nexora++; } }
  if (!image) {
    try {
      let candidates: Candidate[] = [];
      for (const query of queries) { candidates = await bingImages(query, p.name); if (candidates.length) break; }
      topScore = candidates[0]?.score ?? 0;
      for (const candidate of candidates) {
        image = await download(candidate.url, p.slug);
        if (image) { source = "bing"; sourceUrl = candidate.url; break; }
        await sleep(75);
      }
      if (candidates.length) counts.matched++;
    } catch (e: any) {
      if (String(e?.message ?? e).includes("HTTP 401") || String(e?.message ?? e).includes("HTTP 403") || String(e?.message ?? e).includes("HTTP 429")) counts.blocked++;
    }
  }
  if (image) { p.image = image; counts.downloaded++; if (source === "bing") counts.bing++; counts.matched++; }
  else { counts.failed++; source = "existing-retained"; }
  results.push({ id: p.id, name: p.name, query: queries, image: p.image, source, sourceUrl, score: Math.round(topScore * 100) / 100 });
  if ((i + 1) % 10 === 0 || i === products.length - 1) { await save(products, { processed: i + 1, total: products.length, counts, results }); console.log(`${i + 1}/${products.length} downloaded=${counts.downloaded} bing=${counts.bing} nexora=${counts.nexora} failed=${counts.failed}`); }
  if (i < products.length - 1) await sleep(350);
}
console.log(JSON.stringify(counts));
