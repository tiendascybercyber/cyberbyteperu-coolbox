"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Menu, MessageCircle, Search, X, Zap } from "lucide-react";
import products from "@/data/products.json";

type Product = (typeof products)[number];
const whatsappBase = "https://wa.me/51978050339";
const whatsappLink = (name?: string) => `${whatsappBase}?text=${encodeURIComponent(name ? `Hola Cyber Byte Perú, quiero el precio de: ${name}` : "Hola Cyber Byte Perú, quiero información sobre sus productos.")}`;
const categories = ["Todos", "Cables", "Cargadores", "USB/Memorias", "Audífonos", "Adaptadores", "Extensiones", "Protectores", "Redes", "Otros"];
const PAGE_SIZE = 24;

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (value: boolean) => void }) {
  const mobileLinks = [["Inicio", "/"], ["Servicios", "/#servicios"], ["Productos", "/productos"], ["Cómo funciona", "/#como-funciona"], ["Contacto", "/#contacto"]];
  return <>
    <div className="bg-[#06121d] text-white text-xs sm:text-sm"><div className="container-wide flex min-h-9 items-center justify-between gap-3"><p className="font-medium tracking-wide"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#d6f55a] align-middle" />Atención personalizada, de lunes a sábado</p><a href={whatsappLink()} className="hidden items-center gap-1 font-bold text-[#20d5c3] sm:flex">¿Tienes dudas? Escríbenos <ArrowRight size={14} /></a></div></div>
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f5f8f6]/90 backdrop-blur-xl"><div className="container-wide flex h-[76px] items-center justify-between">
      <a href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#07131f] text-[#d6f55a] shadow-[5px_5px_0_#20d5c3]"><Zap size={21} fill="currentColor" strokeWidth={2.5} /></span><span className="leading-none"><span className="block text-[15px] font-black tracking-tight">CYBER BYTE</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.26em] text-[#5c6b78]">Perú</span></span></a>
      <nav className="hidden items-center gap-8 text-sm font-bold text-[#42525d] lg:flex" aria-label="Navegación principal"><a className="transition hover:text-[#07131f]" href="/#servicios">Servicios</a><a className="text-[#0e9e92] transition hover:text-[#07131f]" href="/productos">Productos</a><a className="transition hover:text-[#07131f]" href="/#como-funciona">Cómo funciona</a><a className="transition hover:text-[#07131f]" href="/#testimonios">Testimonios</a><a className="transition hover:text-[#07131f]" href="/#contacto">Contacto</a></nav>
      <div className="hidden items-center gap-3 sm:flex"><span className="hidden text-right text-[11px] leading-tight text-[#5c6b78] xl:block">Respuesta rápida<br /><strong className="text-[#07131f]">por WhatsApp</strong></span><a href={whatsappLink()} className="group flex items-center gap-2 rounded-full bg-[#20d5c3] px-4 py-2.5 text-sm font-black text-[#07131f] transition hover:bg-[#d6f55a]"><MessageCircle size={17} fill="currentColor" /> Escríbenos <ArrowRight className="transition group-hover:translate-x-0.5" size={15} /></a></div>
      <button className="rounded-xl p-2 text-[#07131f] sm:hidden" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </div>{menuOpen && <div className="container-wide border-t border-[#dfe9e8] py-4 sm:hidden"><nav className="flex flex-col gap-1 text-base font-bold" aria-label="Menú móvil">{mobileLinks.map(([label, href]) => <a key={href} className="rounded-xl px-3 py-3 hover:bg-white" href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<a href={whatsappLink()} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#20d5c3] px-4 py-3 font-black"><MessageCircle size={18} /> Escríbenos por WhatsApp</a></nav></div>}</header>
  </>;
}

function ProductCard({ product }: { product: Product }) {
  return <article className="card-lift group flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#dfe9e8] bg-white">
    <div className="relative aspect-[1.16] overflow-hidden bg-[#eef5f3]"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-[#07131f]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#d6f55a]">{product.category}</span></div>
    <div className="flex flex-1 flex-col p-4 sm:p-5"><h2 className="line-clamp-2 min-h-[3.5rem] text-[15px] font-black leading-6 tracking-tight text-[#07131f]">{product.name}</h2><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-5 text-[#5c6b78]">{product.description}</p><a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#20d5c3] px-4 py-3 text-sm font-black text-[#07131f] transition hover:bg-[#d6f55a]">Consultar precio <MessageCircle size={16} fill="currentColor" /></a></div>
  </article>;
}

export default function ProductsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [page, setPage] = useState(1);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const normalizedQuery = query.trim().toLowerCase();
    return matchesCategory && (!normalizedQuery || `${product.name} ${product.description}`.toLowerCase().includes(normalizedQuery));
  }), [query, selectedCategory]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeCategory = (category: string) => { setSelectedCategory(category); setPage(1); };
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };

  return <main><Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
    <section className="overflow-hidden bg-[#07131f] text-white"><div className="glow-grid"><div className="container-wide py-14 sm:py-20"><a href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[#20d5c3] transition hover:text-[#d6f55a]"><ArrowLeft size={16} /> Volver a Cyber Byte Perú</a><p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-[#20d5c3]">Catálogo Cyber Byte</p><h1 className="display max-w-3xl text-5xl leading-[.94] sm:text-7xl">Tecnología para<br /><span className="text-[#d6f55a]">tu día a día.</span></h1><p className="mt-6 max-w-xl text-base leading-7 text-[#b4c5cb] sm:text-lg">Explora nuestro catálogo y escríbenos por WhatsApp para consultar disponibilidad y precio de tu producto favorito.</p></div></div></section>
    <section className="container-wide py-10 sm:py-14"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#20a99d]">Compra fácil, atención cercana</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Encuentra lo que necesitas</h2></div><label className="relative block w-full lg:max-w-sm"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c6b78]" size={19} /><input aria-label="Buscar productos" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="Buscar por nombre..." className="w-full rounded-full border border-[#dfe9e8] bg-white py-3.5 pl-11 pr-5 text-sm font-bold outline-none transition placeholder:font-normal focus:border-[#20d5c3] focus:ring-4 focus:ring-[#20d5c3]/10" /></label></div>
      <div className="mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrar por categoría">{categories.map((category) => <button key={category} onClick={() => changeCategory(category)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black transition ${selectedCategory === category ? "border-[#07131f] bg-[#07131f] text-[#d6f55a]" : "border-[#dfe9e8] bg-white text-[#5c6b78] hover:border-[#20d5c3] hover:text-[#07131f]"}`}>{category}</button>)}</div>
      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#5c6b78]"><p><strong className="text-[#07131f]">{filteredProducts.length}</strong> productos encontrados</p><p className="hidden sm:block">Página {page} de {pageCount}</p></div>
      {visibleProducts.length > 0 ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-5 rounded-[24px] border border-dashed border-[#b7cfca] bg-white p-10 text-center"><p className="font-black">No encontramos productos con esa búsqueda.</p><button className="mt-4 rounded-full bg-[#20d5c3] px-5 py-2.5 text-sm font-black" onClick={() => { setQuery(""); changeCategory("Todos"); }}>Ver todo el catálogo</button></div>}
      <div className="mt-10 flex items-center justify-center gap-2"><button aria-label="Página anterior" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[#dfe9e8] bg-white transition hover:border-[#20d5c3] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={16} /></button>{Array.from({ length: Math.min(pageCount, 5) }, (_, index) => { const start = Math.max(1, Math.min(page - 2, pageCount - 4)); const pageNumber = start + index; return <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black transition ${page === pageNumber ? "bg-[#07131f] text-[#d6f55a]" : "border border-[#dfe9e8] bg-white hover:border-[#20d5c3]"}`}>{pageNumber}</button>; })}<button aria-label="Página siguiente" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[#dfe9e8] bg-white transition hover:border-[#20d5c3] disabled:cursor-not-allowed disabled:opacity-40"><ArrowRight size={16} /></button></div>
    </section>
    <footer className="bg-[#07131f] py-12 text-white"><div className="container-wide flex flex-col justify-between gap-6 sm:flex-row sm:items-center"><div><p className="font-black">CYBER BYTE <span className="text-[#d6f55a]">PERÚ</span></p><p className="mt-2 text-sm text-[#8aa1a9]">Tienda tecnológica, servicio técnico y trámites digitales.</p><p className="mt-2 text-xs text-[#718890]">Av. 9 de Diciembre 653, Chilca - Huancayo · Lun–Vie 8–21, Sáb–Dom 8–20</p>
        <p className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
          <a className="text-[#d7e1e3] hover:text-[#d6f55a]" href="https://www.facebook.com/p/CYBER-BYTE-100064145738348/" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a className="text-[#d7e1e3] hover:text-[#d6f55a]" href="https://www.instagram.com/cyberbyteperu/" target="_blank" rel="noopener noreferrer">Instagram</a>
        </p></div><a href={whatsappLink()} className="inline-flex items-center gap-2 rounded-full bg-[#20d5c3] px-5 py-3 text-sm font-black text-[#07131f] transition hover:bg-[#d6f55a]"><MessageCircle size={17} fill="currentColor" /> Consultar por WhatsApp</a></div></footer>
  </main>;
}
