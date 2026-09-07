#!/usr/bin/env python3
"""Fetch product images with the Acopla DuckDuckGo Images technique."""
from __future__ import annotations

import json
import mimetypes
import re
import time
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "src/data/products.json"
OUT = ROOT / "public/products/real"
CHECKPOINT = ROOT / "research/product-image-fetch.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
FALLBACKS = [
    "https://nexoratechperu.com/wp-content/uploads/2026/06/image-12-1.png",
    "https://nexoratechperu.com/wp-content/uploads/2026/06/hoco-gm13-estem-business-wired-mouse-scroll.png",
    "https://nexoratechperu.com/wp-content/uploads/2026/06/imageUrl_1-1.png",
    "https://nexoratechperu.com/wp-content/uploads/2026/06/TE-1237S-1.png",
    "https://nexoratechperu.com/wp-content/uploads/2026/06/TECLADO-Y-MOUSE-LOGITECH-MK235-WIRELESS-2-1.png",
    "https://nexoratechperu.com/wp-content/uploads/2026/08/VQ-M808.webp",
]
SEEDS = {
    "mouse optico vertical yelandar jx d5": FALLBACKS[0],
    "mouse hoco gm13 confortable musiness wired mouse": FALLBACKS[1],
    "mouse q6 yelandar inalambrico rgb gaming": FALLBACKS[2],
    "mouse teros dual inalambrico te 1237s": FALLBACKS[3],
    "teclado logitech inalambrico mk235 mouse": FALLBACKS[4],
    "audifono con microfono micell vq m808": FALLBACKS[5],
}
STOP = {"el", "la", "los", "las", "un", "una", "de", "del", "para", "con", "sin", "y", "en", "por", "tipo", "color", "varios", "unidad", "unidades", "pack", "kit", "caja"}
CATEGORY_TERMS = {
    "Cables": "cable tecnológico accesorio",
    "Cargadores": "cargador tecnológico accesorio",
    "USB/Memorias": "memoria USB almacenamiento",
    "Audífonos": "audífonos headset",
    "Adaptadores": "adaptador tecnológico",
    "Extensiones": "extensión eléctrica",
    "Protectores": "protector pantalla celular",
    "Redes": "redes router networking",
    "Otros": "accesorio tecnológico",
}


def norm(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def query_for(product: dict) -> str:
    words = [w for w in norm(product["name"]).split() if w not in STOP and len(w) > 1]
    query = " ".join(words[:14])
    category = CATEGORY_TERMS.get(product.get("category", ""), "accesorio tecnológico")
    return f"{query} {category} producto".strip()


def fetch_text(url: str, headers: dict[str, str] | None = None) -> str:
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/json;q=0.9,*/*;q=0.8", **(headers or {})})
    with urlopen(req, timeout=14) as response:
        if response.status < 200 or response.status >= 300:
            raise RuntimeError(f"HTTP {response.status}")
        return response.read().decode("utf-8", "replace")


def ddg_images(query: str, limit: int = 12) -> list[dict]:
    html = fetch_text(f"https://duckduckgo.com/?q={quote(query)}&iax=images&ia=images")
    match = re.search(r"vqd=[\"']([^\"']+)[\"']", html)
    if not match:
        match = re.search(r"vqd[=:][\"']?([0-9-]+)", html)
    if not match:
        return []
    time.sleep(0.12)
    raw = fetch_text(
        f"https://duckduckgo.com/i.js?l=us-en&o=json&q={quote(query)}&vqd={quote(match.group(1))}&f=,,,,,&p=1",
        {"Referer": "https://duckduckgo.com/"},
    )
    data = json.loads(raw)
    candidates = []
    seen = set()
    for result in data.get("results", []):
        image = str(result.get("image") or "").strip().replace("http://", "https://", 1)
        if not image.startswith("https://") or image in seen:
            continue
        if re.search(r"\.(?:svg|gif|mp4|webm|mov|avi)(?:$|[?#])", image, re.I):
            continue
        width, height = int(result.get("width") or 0), int(result.get("height") or 0)
        if width and height and (width < 180 or height < 180):
            continue
        seen.add(image)
        title = str(result.get("title") or "")
        source = urlparse(image).netloc.lower()
        score = 0
        if any(ext in image.lower() for ext in (".jpg", ".jpeg", ".png", ".webp")):
            score += 2
        if any(term in (title + " " + image).lower() for term in norm(query).split()[:4]):
            score += 1
        if any(bad in source for bad in ("pinterest", "facebook", "instagram")):
            score -= 2
        candidates.append({"url": image, "title": title[:160], "width": width, "height": height, "score": score})
    candidates.sort(key=lambda item: item["score"], reverse=True)
    return candidates[:limit]


def download(url: str, slug: str) -> str | None:
    try:
        req = Request(url, headers={"User-Agent": UA, "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"})
        with urlopen(req, timeout=16) as response:
            payload = response.read(8 * 1024 * 1024 + 1)
            content_type = response.headers.get_content_type()
        if len(payload) < 1200 or len(payload) > 8 * 1024 * 1024:
            return None
        if not (content_type.startswith("image/") or payload[:3] == b"\xff\xd8\xff" or payload[:8] == b"\x89PNG\r\n\x1a\n" or payload[:4] == b"RIFF"):
            return None
        ext = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif"}.get(content_type)
        if not ext:
            suffix = Path(urlparse(url).path).suffix.lower()
            ext = suffix if suffix in {".jpg", ".jpeg", ".png", ".webp", ".avif"} else ".jpg"
        path = OUT / f"{slug}{ext}"
        path.write_bytes(payload)
        return "/products/real/" + path.name
    except (HTTPError, URLError, TimeoutError, OSError, ValueError):
        return None


def seed_for(name: str) -> str | None:
    key = norm(name)
    if key in SEEDS:
        return SEEDS[key]
    best, score = None, 0.0
    for seed_name, url in SEEDS.items():
        value = SequenceMatcher(None, key, seed_name).ratio()
        if value > score:
            best, score = url, value
    return best if score >= 0.78 else None


def fallback_for(product: dict, index: int) -> str:
    seed = seed_for(product["name"])
    if seed:
        return seed
    category = norm(product.get("category", "otros"))
    local = sorted((ROOT / "public/products").glob(f"{category.replace(' ', '-')}-*"))
    if local:
        return "/products/" + local[index % len(local)].name
    return "/products/otros-" + str(index % 3 + 1) + ".webp"


def main() -> None:
    products = json.loads(DATA.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    counts = {"ddg": 0, "fallback": 0, "downloaded": 0, "remote": 0, "errors": 0}
    results = []
    for index, product in enumerate(products):
        slug = product["slug"]
        query = query_for(product)
        image = None
        source_url = None
        try:
            candidates = ddg_images(query)
            for candidate in candidates:
                source_url = candidate["url"]
                image = download(source_url, slug)
                if image:
                    break
            if image:
                counts["ddg"] += 1
                counts["downloaded"] += 1
            elif source_url:
                image = source_url
                counts["ddg"] += 1
                counts["remote"] += 1
            else:
                counts["errors"] += 1
        except Exception:
            counts["errors"] += 1
        if not image:
            image = fallback_for(product, index)
            counts["fallback"] += 1
        product["image"] = image
        # Keep every catalog record useful even when its source description was generic.
        product["description"] = f"{product['name'].strip().capitalize()}. Tecnología y accesorios con atención cercana en Cyber Byte Perú."
        results.append({"id": product["id"], "name": product["name"], "query": query, "image": image, "source": "ddg" if source_url else "fallback"})
        if (index + 1) % 10 == 0 or index == len(products) - 1:
            DATA.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n")
            CHECKPOINT.write_text(json.dumps({"processed": index + 1, "total": len(products), "counts": counts, "results": results}, ensure_ascii=False, indent=2) + "\n")
            print(f"{index + 1}/{len(products)} ddg={counts['ddg']} fallbacks={counts['fallback']} downloaded={counts['downloaded']}", flush=True)
        time.sleep(0.32)
    DATA.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n")
    CHECKPOINT.write_text(json.dumps({"processed": len(products), "total": len(products), "counts": counts, "results": results}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(counts))


if __name__ == "__main__":
    main()
