#!/usr/bin/env python3
"""Fetch product photos from Bing Images, with local resume/checkpoint support."""
from __future__ import annotations

import html
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
CHECKPOINT = ROOT / "research/product-image-fetch-bing.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
MIN_BYTES = 1200
MAX_BYTES = 8 * 1024 * 1024

NEXORA = [
    ("Mouse optico vertical Yelandar jx-d5", "https://nexoratechperu.com/wp-content/uploads/2026/06/image-12-1.png"),
    ("Mouse Hoco GM13 confortable musiness wired mouse", "https://nexoratechperu.com/wp-content/uploads/2026/06/hoco-gm13-estem-business-wired-mouse-scroll.png"),
    ("Mouse Q6 yelandar inalambrico rgb gaming", "https://nexoratechperu.com/wp-content/uploads/2026/06/imageUrl_1-1.png"),
    ("Mouse Teros dual inalambrico TE-1237S", "https://nexoratechperu.com/wp-content/uploads/2026/06/TE-1237S-1.png"),
    ("Teclado Logitech inalambrico MK235 + Mouse", "https://nexoratechperu.com/wp-content/uploads/2026/06/TECLADO-Y-MOUSE-LOGITECH-MK235-WIRELESS-2-1.png"),
    ("AUDIFONO CON MICRÓFONO MICELL VQ-M808", "https://nexoratechperu.com/wp-content/uploads/2026/08/VQ-M808.webp"),
]
STOP = {"el", "la", "los", "las", "un", "una", "de", "del", "para", "con", "sin", "y", "en", "por", "tipo", "color", "varios", "unidad", "unidades", "pack", "kit", "caja"}
CATEGORY_TERMS = {
    "Cables": "cable tecnológico accessory product",
    "Cargadores": "charger tecnológico accessory product",
    "USB/Memorias": "USB flash drive storage product",
    "Audífonos": "headphones headset product",
    "Adaptadores": "adapter tecnológico product",
    "Extensiones": "power extension product",
    "Protectores": "screen protector phone product",
    "Redes": "router networking product",
    "Otros": "technology accessory product",
}
BAD_HOST_PARTS = ("youtube", "ytimg", "maps.google", "googleusercontent", "logo", "sprite", "favicon")
BAD_PATH_PARTS = ("/logo", "logo-", "favicon", "sprite")


def norm(value: str) -> str:
    text = unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def query_for(product: dict) -> str:
    words = [w for w in norm(product["name"]).split() if w not in STOP and len(w) > 1]
    query = " ".join(words[:16])
    category = CATEGORY_TERMS.get(product.get("category", ""), "technology accessory product")
    return f"{query} {category}".strip()


def fetch_text(url: str) -> str:
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "es-PE,es;q=0.9,en;q=0.8"})
    with urlopen(req, timeout=20) as response:
        if response.status < 200 or response.status >= 300:
            raise HTTPError(url, response.status, f"HTTP {response.status}", response.headers, None)
        return response.read().decode("utf-8", "replace")


def bing_images(query: str, limit: int = 16) -> list[str]:
    url = f"https://www.bing.com/images/search?q={quote(query)}&qft=+filterui:photo-photo"
    text = fetch_text(url)
    # Bing commonly emits HTML-escaped JSON: murl&quot;:&quot;https://...&quot;.
    text = html.unescape(text)
    urls = re.findall(r'"murl"\s*:\s*"(https?://[^"\\]+)', text, re.I)
    if not urls:
        urls = re.findall(r'murl(?:&quot;|\\?\")\s*:\s*(?:&quot;|\\?\")((?:https?://).*?)(?:&quot;|\\?\")', text, re.I)
    result: list[str] = []
    seen: set[str] = set()
    for image in urls:
        image = image.replace("\\/", "/").strip()
        parsed = urlparse(image)
        host, path = parsed.netloc.lower(), parsed.path.lower()
        if image in seen or parsed.scheme not in ("http", "https"):
            continue
        if any(part in host for part in BAD_HOST_PARTS) or any(part in path for part in BAD_PATH_PARTS):
            continue
        if re.search(r"\.(?:svg|gif|mp4|webm|mov|avi)(?:$|[?#])", path, re.I):
            continue
        seen.add(image)
        result.append(image)
        if len(result) >= limit:
            break
    return result


def image_extension(content_type: str, source_url: str, payload: bytes) -> str:
    ctype = (content_type or "").split(";", 1)[0].lower()
    by_type = {"image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif"}
    if ctype in by_type:
        return by_type[ctype]
    if payload[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if payload[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if payload[:4] == b"RIFF":
        return ".webp"
    suffix = Path(urlparse(source_url).path).suffix.lower()
    return suffix if suffix in {".jpg", ".jpeg", ".png", ".webp", ".avif"} else ".jpg"


def download(source_url: str, slug: str) -> str | None:
    try:
        req = Request(source_url, headers={"User-Agent": UA, "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8", "Referer": "https://www.bing.com/"})
        with urlopen(req, timeout=18) as response:
            payload = response.read(MAX_BYTES + 1)
            ctype = response.headers.get("Content-Type", "")
        if len(payload) < MIN_BYTES or len(payload) > MAX_BYTES:
            return None
        if not (ctype.lower().startswith("image/") or payload[:3] == b"\xff\xd8\xff" or payload[:8] == b"\x89PNG\r\n\x1a\n" or payload[:4] == b"RIFF"):
            return None
        ext = image_extension(ctype, source_url, payload)
        path = OUT / f"{slug}{ext}"
        path.write_bytes(payload)
        return f"/products/real/{path.name}"
    except (HTTPError, URLError, TimeoutError, OSError, ValueError):
        return None


def local_image(slug: str) -> str | None:
    matches = sorted(OUT.glob(f"{slug}.*"))
    for path in matches:
        if path.is_file() and path.stat().st_size >= MIN_BYTES:
            return f"/products/real/{path.name}"
    return None


def nexora_for(name: str) -> tuple[str, str] | None:
    key = norm(name)
    best: tuple[str, str] | None = None
    best_score = 0.0
    key_tokens = set(key.split())
    for seed_name, url in NEXORA:
        seed = norm(seed_name)
        score = SequenceMatcher(None, key, seed).ratio()
        seed_tokens = set(seed.split())
        overlap = len(key_tokens & seed_tokens) / max(1, len(seed_tokens))
        score = max(score, overlap * 0.92)
        if score > best_score:
            best, best_score = seed_name, score
    return (best, dict(NEXORA)[best]) if best and best_score >= 0.68 else None


def category_fallback(product: dict) -> str:
    # Preserve the catalog's existing category fallback rather than inventing a remote URL.
    return product.get("image") or "/products/otros-1.webp"


def save(products: list[dict], state: dict) -> None:
    DATA.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n")
    CHECKPOINT.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    products = json.loads(DATA.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    counts = {"total": len(products), "matched": 0, "downloaded": 0, "nexora": 0, "skipped": 0, "failed": 0, "blocked": 0}
    results: list[dict] = []
    blocked = False
    for index, product in enumerate(products):
        slug = product["slug"]
        image = local_image(slug)
        source = "existing"
        query = query_for(product)
        if image:
            product["image"] = image
            counts["skipped"] += 1
        else:
            seed = nexora_for(product["name"])
            if seed:
                image = download(seed[1], slug)
                if image:
                    product["image"] = image
                    counts["downloaded"] += 1
                    counts["nexora"] += 1
                    counts["matched"] += 1
                    source = "nexoratechperu"
            if not image and not blocked:
                try:
                    candidates = bing_images(query)
                    if candidates:
                        counts["matched"] += 1
                        source = "bing"
                    for candidate in candidates:
                        image = download(candidate, slug)
                        if image:
                            product["image"] = image
                            counts["downloaded"] += 1
                            break
                        time.sleep(0.12)
                except HTTPError as exc:
                    if exc.code in (401, 403, 429, 503):
                        blocked = True
                        counts["blocked"] += 1
                        print(f"Bing blocked at {index + 1}/{len(products)} with HTTP {exc.code}; stopping gracefully", flush=True)
                except (URLError, TimeoutError, OSError, ValueError) as exc:
                    print(f"Bing request failed at {index + 1}/{len(products)}: {exc}", flush=True)
            if not image:
                counts["failed"] += 1
                product["image"] = category_fallback(product)
                source = "fallback"
        results.append({"id": product["id"], "name": product["name"], "query": query, "image": product["image"], "source": source})
        if (index + 1) % 10 == 0 or index == len(products) - 1:
            save(products, {"processed": index + 1, "total": len(products), "counts": counts, "results": results})
            print(f"{index + 1}/{len(products)} matched={counts['matched']} downloaded={counts['downloaded']} failed={counts['failed']} skipped={counts['skipped']}", flush=True)
        if not blocked and index < len(products) - 1:
            time.sleep(0.55)
        if blocked:
            # Keep the remaining products on their existing category fallbacks and checkpoint all records.
            for rest in products[index + 1:]:
                counts["failed"] += 1
                rest["image"] = category_fallback(rest)
            save(products, {"processed": len(products), "total": len(products), "counts": counts, "results": results, "blocked": True})
            break
    else:
        save(products, {"processed": len(products), "total": len(products), "counts": counts, "results": results, "blocked": False})
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == "__main__":
    main()
