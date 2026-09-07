"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  FileCheck2,
  FileText,
  Fingerprint,
  IdCard,
  LaptopMinimalCheck,
  Menu,
  MessageCircle,
  PenLine,
  PhoneCall,
  MapPin,
  Store,
  Truck,
  Wrench,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const whatsappBase = "https://wa.me/51978050339";
const whatsappLink = (service?: string) =>
  `${whatsappBase}?text=${encodeURIComponent(service ? `Hola Cyber Byte Perú, quiero información sobre ${service}.` : "Hola Cyber Byte Perú, quiero información sobre sus trámites digitales.")}`;

const services = [
  { title: "Antecedentes penales", text: "Gestiona tu certificado de forma clara y acompañada.", icon: Fingerprint, tag: "Más solicitado", accent: "mint" },
  { title: "Duplicado de DNI", text: "Te orientamos paso a paso para volver a tener tu documento.", icon: IdCard, tag: "Sin vueltas", accent: "lime" },
  { title: "Contratos", text: "Redacción y revisión de contratos listos para usar.", icon: FileText, tag: "Seguro", accent: "blue" },
  { title: "Cartas poder", text: "Deja tu autorización preparada con la orientación correcta.", icon: PenLine, tag: "Acompañado", accent: "orange" },
  { title: "Pagos de servicios", text: "Resuelve tus pagos sin hacer colas ni perder tiempo.", icon: Banknote, tag: "Rápido", accent: "cyan" },
  { title: "Contratos de alquiler", text: "Formaliza tu alquiler con documentos pensados para ti.", icon: BriefcaseBusiness, tag: "Popular", accent: "violet" },
];

const steps = [
  { number: "01", title: "Selecciona", text: "Elige el trámite que necesitas y cuéntanos tu caso." },
  { number: "02", title: "Completa el formulario", text: "Te pedimos solo los datos indispensables, de manera segura." },
  { number: "03", title: "Cita virtual", text: "Conversamos contigo para revisar que todo esté en orden." },
  { number: "04", title: "Recibe tu documento", text: "Te entregamos el resultado digitalmente, estés donde estés." },
];

const testimonials = [
  { quote: "Me ayudaron con mi antecedente penal en tiempo récord. Todo fue muy fácil y siempre me respondieron.", name: "María Fernanda R.", detail: "Cliente de Huancayo" },
  { quote: "No sabía por dónde empezar con mi contrato de alquiler. Me explicaron todo con paciencia y quedó perfecto.", name: "Carlos A.", detail: "Cliente verificado" },
  { quote: "Excelente atención. Pude hacer el trámite desde el trabajo y recibí mi documento sin moverme.", name: "Rosa M.", detail: "Cliente de Lima" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <div className="bg-[#06121d] text-white text-xs sm:text-sm">
        <div className="container-wide flex min-h-9 items-center justify-between gap-3">
          <p className="font-medium tracking-wide"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#d6f55a] align-middle" />Atención personalizada, de lunes a sábado</p>
          <a href={whatsappLink()} className="hidden items-center gap-1 font-bold text-[#20d5c3] sm:flex">¿Tienes dudas? Escríbenos <ArrowRight size={14} /></a>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/60 bg-[#f5f8f6]/90 backdrop-blur-xl">
        <div className="container-wide flex h-[76px] items-center justify-between">
          <a href="#inicio" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#07131f] text-[#d6f55a] shadow-[5px_5px_0_#20d5c3]"><Zap size={21} fill="currentColor" strokeWidth={2.5} /></span>
            <span className="leading-none"><span className="block text-[15px] font-black tracking-tight">CYBER BYTE</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.26em] text-[#5c6b78]">Perú</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-[#42525d] lg:flex" aria-label="Navegación principal">
            <a className="transition hover:text-[#07131f]" href="#tienda">Tienda</a><a className="transition hover:text-[#07131f]" href="#servicios">Trámites</a><a className="transition hover:text-[#07131f]" href="/productos">Productos</a>
            <a className="transition hover:text-[#07131f]" href="#como-funciona">Cómo funciona</a>
            <a className="transition hover:text-[#07131f]" href="#testimonios">Testimonios</a>
            <a className="transition hover:text-[#07131f]" href="#contacto">Contacto</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="hidden text-right text-[11px] leading-tight text-[#5c6b78] xl:block">Respuesta rápida<br /><strong className="text-[#07131f]">por WhatsApp</strong></span>
            <a href={whatsappLink()} className="group flex items-center gap-2 rounded-full bg-[#20d5c3] px-4 py-2.5 text-sm font-black text-[#07131f] transition hover:bg-[#d6f55a]"> <MessageCircle size={17} fill="currentColor" /> Escríbenos <ArrowRight className="transition group-hover:translate-x-0.5" size={15} /></a>
          </div>
          <button className="rounded-xl p-2 text-[#07131f] sm:hidden" aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="container-wide border-t border-[#dfe9e8] py-4 sm:hidden"><nav className="flex flex-col gap-1 text-base font-bold" aria-label="Menú móvil">{[["Servicios", "#servicios"], ["Productos", "/productos"], ["Cómo funciona", "#como-funciona"], ["Testimonios", "#testimonios"], ["Contacto", "#contacto"]].map(([label, href]) => <a key={href} className="rounded-xl px-3 py-3 hover:bg-white" href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<a href={whatsappLink()} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#20d5c3] px-4 py-3 font-black"><MessageCircle size={18} /> Escríbenos por WhatsApp</a></nav></div>}
      </header>

      <section id="inicio" className="overflow-hidden bg-[#07131f] text-white">
        <div className="glow-grid relative">
          <div className="container-wide relative grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-[1.06fr_.94fr] lg:py-20">
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#20d5c3]/35 bg-[#20d5c3]/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#20d5c3]"><Sparkles size={14} /> Tecnología y trámites en Huancayo</div>
              <h1 className="display max-w-3xl text-[clamp(3.35rem,7vw,6.3rem)] leading-[.9] text-white">Tu tecnología.<br /><span className="text-[#d6f55a]">Tus trámites.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[#b4c5cb] sm:text-lg">Compra accesorios, arma tu PC o resuelve tus trámites digitales con <strong className="text-white">atención cercana y sin vueltas</strong>.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><a href="#tienda" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#d6f55a] px-6 py-3.5 font-black text-[#07131f] transition hover:bg-[#20d5c3]">Ver tienda <ArrowRight className="transition group-hover:translate-x-1" size={18} /></a><a href={whatsappLink()} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 font-black transition hover:border-[#20d5c3] hover:bg-white/10"><MessageCircle size={18} /> Hablar con un asesor</a></div>
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-xs font-bold text-[#9bb1b8]"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#20d5c3]" /> Datos protegidos</span><span className="flex items-center gap-2"><Clock3 size={17} className="text-[#20d5c3]" /> Atención en horario extendido</span></div>
            </div>
            <div className="relative mx-auto w-full max-w-[470px] lg:mr-0">
              <div className="hero-orb absolute -left-6 top-12 h-52 w-52 rounded-full bg-[#20d5c3]/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-[#112532] p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#8aa1a9]">Tu panel de trámites</p><p className="mt-1 text-xl font-black">Todo bajo control.</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d6f55a] text-[#07131f]"><LaptopMinimalCheck size={21} /></span></div>
                <div className="mt-5 space-y-3"><div className="flex items-center gap-3 rounded-2xl bg-white/[.07] p-3.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#20d5c3]/15 text-[#20d5c3]"><Fingerprint size={20} /></span><div className="flex-1"><p className="text-sm font-bold">Antecedentes penales</p><p className="mt-1 text-[11px] text-[#8aa1a9]">En revisión</p></div><span className="h-2 w-2 rounded-full bg-[#d6f55a]" /></div><div className="flex items-center gap-3 rounded-2xl bg-white/[.07] p-3.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d6f55a]/15 text-[#d6f55a]"><FileCheck2 size={20} /></span><div className="flex-1"><p className="text-sm font-bold">Contrato de alquiler</p><p className="mt-1 text-[11px] text-[#8aa1a9]">Listo para entregar</p></div><Check size={18} className="text-[#d6f55a]" /></div><div className="flex items-center gap-3 rounded-2xl bg-white/[.07] p-3.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffb75e]/15 text-[#ffb75e]"><IdCard size={20} /></span><div className="flex-1"><p className="text-sm font-bold">Duplicado de DNI</p><p className="mt-1 text-[11px] text-[#8aa1a9]">Cita confirmada</p></div><span className="text-[10px] font-black uppercase tracking-widest text-[#20d5c3]">Hoy</span></div></div>
                <a href={whatsappLink()} className="mt-5 flex items-center justify-between rounded-2xl bg-[#20d5c3] px-4 py-3 text-sm font-black text-[#07131f] transition hover:bg-[#d6f55a]"><span className="flex items-center gap-2"><MessageCircle size={17} /> Iniciar un trámite</span><ArrowRight size={17} /></a>
              </div>
              <div className="float absolute -bottom-7 -left-5 rounded-2xl border border-[#07131f]/10 bg-white p-3.5 text-[#07131f] shadow-xl sm:-left-10"><div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#d6f55a]"><BadgeCheck size={20} /></span><p className="text-xs font-black leading-tight">+5,000<br /><span className="font-normal text-[#5c6b78]">clientes felices</span></p></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[#dfe9e8] bg-white"><div className="container-wide grid grid-cols-2 divide-x divide-[#dfe9e8] sm:grid-cols-4"><div className="flex items-center gap-3 px-3 py-5 sm:px-5"><span className="text-2xl font-black text-[#07131f]">5,000<span className="text-[#20d5c3]">+</span></span><span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[#5c6b78]">clientes<br />atendidos</span></div><div className="flex items-center gap-3 px-3 py-5 sm:px-5"><span className="text-2xl font-black text-[#07131f]">100<span className="text-[#20d5c3]">%</span></span><span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[#5c6b78]">digital<br />y seguro</span></div><div className="flex items-center gap-3 px-3 py-5 sm:px-5"><span className="text-2xl font-black text-[#07131f]">24<span className="text-[#20d5c3]">h</span></span><span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[#5c6b78]">respuesta<br />ágil</span></div><div className="flex items-center gap-3 px-3 py-5 sm:px-5"><span className="text-2xl font-black text-[#07131f]">1:1</span><span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-[#5c6b78]">asesoría<br />cercana</span></div></div></div>

      <section id="tienda" className="scroll-mt-24 bg-[#f1f6f3] py-20 sm:py-28">
        <div className="container-wide">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-[#20a99d]">También somos tu tienda tecnológica</p><h2 className="display max-w-2xl text-5xl leading-[.94] sm:text-6xl">Equipa tu mundo.<br /><span className="text-[#20a99d]">Te ayudamos a elegir.</span></h2></div><p className="max-w-sm text-sm leading-6 text-[#5c6b78]">Accesorios, periféricos gaming, conectividad y soluciones para tu PC, con delivery y servicio técnico en Huancayo.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[{ icon: Store, title: "Catálogo y accesorios", text: "Audífonos, cables, cargadores, memorias, redes y periféricos para tu día a día." }, { icon: Wrench, title: "PC y servicio técnico", text: "Armado de PC a medida, mantenimiento y orientación para que tu equipo rinda más." }, { icon: Truck, title: "Delivery local", text: "Consulta disponibilidad, precio y entrega directamente por WhatsApp." }].map(({ icon: Icon, title, text: cardText }) => <article key={title} className="card-lift rounded-[24px] border border-[#dfe9e8] bg-white p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d6f55a] text-[#07131f]"><Icon size={23} /></span><h3 className="mt-8 text-xl font-black tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5c6b78]">{cardText}</p><a href={title === "Catálogo y accesorios" ? "/productos" : whatsappLink(title)} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0e9e92]">{title === "Catálogo y accesorios" ? "Explorar productos" : "Consultar por WhatsApp"} <ArrowRight size={16} /></a></article>)}
          </div>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#dfe9e8] bg-white p-5 text-sm text-[#5c6b78] sm:flex-row sm:items-center sm:justify-between"><span className="flex items-center gap-2"><MapPin size={17} className="text-[#0e9e92]" /> Av. 9 de Diciembre 653, Chilca - Huancayo</span><span className="font-bold text-[#07131f]">★ 4.6/5 · buena atención</span></div>
        </div>
      </section>

      <section id="servicios" className="container-wide scroll-mt-24 py-20 sm:py-28"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-[#20a99d]">Lo que podemos hacer por ti</p><h2 className="display max-w-2xl text-5xl leading-[.94] sm:text-6xl">Elige tu trámite.<br /><span className="text-[#20a99d]">Nosotros te guiamos.</span></h2></div><p className="max-w-xs text-sm leading-6 text-[#5c6b78]">Soluciones digitales pensadas para tu día a día. Claras, rápidas y sin letras pequeñas.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{services.map(({ title, text, icon: Icon, tag, accent }) => <article key={title} className="card-lift group relative overflow-hidden rounded-[24px] border border-[#dfe9e8] bg-white p-5 sm:p-6"><div className={`mb-9 flex items-start justify-between`}><span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent === "lime" ? "bg-[#d6f55a]" : accent === "orange" ? "bg-[#ffb75e]/25 text-[#b76600]" : accent === "violet" ? "bg-[#c7b9ff]/30 text-[#6850bb]" : "bg-[#20d5c3]/15 text-[#0e9e92]"}`}><Icon size={23} strokeWidth={2.1} /></span><span className="rounded-full bg-[#f2f6f5] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#5c6b78]">{tag}</span></div><h3 className="text-xl font-black tracking-tight">{title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#5c6b78]">{text}</p><a href={whatsappLink(title)} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#0e9e92] transition group-hover:gap-3">Consultar por WhatsApp <ArrowRight size={16} /></a><div className="pointer-events-none absolute -bottom-12 -right-10 h-28 w-28 rounded-full bg-[#20d5c3]/10 blur-2xl" /></article>)}</div></section>

      <section id="como-funciona" className="scroll-mt-24 bg-[#e8f1ee] py-20 sm:py-28"><div className="container-wide"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-[#20a99d]">Así de simple</p><h2 className="display text-5xl leading-[.94] sm:text-6xl">De pendiente<br />a <span className="text-[#0e9e92]">resuelto.</span></h2><p className="mt-6 max-w-sm text-sm leading-6 text-[#5c6b78]">Te acompañamos en cada paso para que nunca tengas que adivinar qué sigue.</p></div><div className="grid gap-3 sm:grid-cols-2">{steps.map((step, index) => <div key={step.number} className="relative rounded-2xl border border-white/80 bg-white/75 p-5"><span className="text-xs font-black tracking-widest text-[#20a99d]">{step.number}</span><h3 className="mt-9 text-lg font-black">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#5c6b78]">{step.text}</p>{index < steps.length - 1 && <ChevronDown size={16} className="absolute -bottom-6 left-1/2 z-10 text-[#20a99d] sm:hidden" />}</div>)}</div></div></div></section>

      <section id="testimonios" className="container-wide scroll-mt-24 py-20 sm:py-28"><div className="text-center"><p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-[#20a99d]">Lo dicen nuestros clientes</p><h2 className="display text-5xl leading-[.94] sm:text-6xl">Personas reales,<br /><span className="text-[#0e9e92]">trámites resueltos.</span></h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{testimonials.map((testimonial) => <figure key={testimonial.name} className="rounded-[24px] border border-[#dfe9e8] bg-white p-6"><div className="flex gap-1 text-[#ffb75e]" aria-label="5 estrellas">{[1, 2, 3, 4, 5].map((star) => <span key={star}>★</span>)}</div><blockquote className="mt-5 text-[17px] font-bold leading-7 tracking-tight">“{testimonial.quote}”</blockquote><figcaption className="mt-7 flex items-center gap-3 border-t border-[#edf1ef] pt-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#07131f] text-sm font-black text-[#d6f55a]">{testimonial.name[0]}</span><span><strong className="block text-sm">{testimonial.name}</strong><span className="text-xs text-[#5c6b78]">{testimonial.detail}</span></span><BadgeCheck size={16} className="ml-auto text-[#20a99d]" /></figcaption></figure>)}</div></section>

      <section id="contacto" className="scroll-mt-24 px-3 pb-3 sm:px-5 sm:pb-5"><div className="container-wide relative overflow-hidden rounded-[30px] bg-[#07131f] px-6 py-14 text-white sm:px-14 sm:py-16"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#20d5c3]/20 blur-3xl" /><div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><p className="mb-3 text-xs font-black uppercase tracking-[.18em] text-[#20d5c3]">¿Listo para avanzar?</p><h2 className="display max-w-xl text-5xl leading-[.95] sm:text-6xl">Tu tiempo vale.<br /><span className="text-[#d6f55a]">Úsalo mejor.</span></h2><p className="mt-5 max-w-md text-sm leading-6 text-[#b4c5cb]">Cuéntanos qué necesitas y te responderemos con el siguiente paso.</p></div><a href={whatsappLink()} className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#d6f55a] px-6 py-4 font-black text-[#07131f] transition hover:bg-[#20d5c3]"> <MessageCircle size={20} fill="currentColor" /> Hablar por WhatsApp <ArrowRight className="transition group-hover:translate-x-1" size={18} /></a></div></div></section>

      <footer className="bg-[#07131f] py-12 text-white"><div className="container-wide"><div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.2fr_.8fr_.8fr]"><div><a href="#inicio" className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#d6f55a] text-[#07131f]"><Zap size={21} fill="currentColor" /></span><span className="leading-none"><span className="block text-[15px] font-black">CYBER BYTE</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[.26em] text-[#8aa1a9]">Perú</span></span></a><p className="mt-5 max-w-xs text-sm leading-6 text-[#8aa1a9]">Tienda tecnológica, servicio técnico y trámites digitales, con asesoría humana y cercana en Huancayo.</p></div><div><h3 className="text-xs font-black uppercase tracking-[.16em] text-[#20d5c3]">Contacto</h3><div className="mt-4 space-y-3 text-sm text-[#d7e1e3]"><a className="flex items-center gap-2 transition hover:text-[#d6f55a]" href="tel:+51978050339"><PhoneCall size={15} /> +51 978 050 339</a><a className="flex items-center gap-2 transition hover:text-[#d6f55a]" href="mailto:ventas@cyberbyteperu.com"><FileText size={15} /> ventas@cyberbyteperu.com</a><a className="flex items-center gap-2 transition hover:text-[#d6f55a]" href="https://cyberbyteperu.com">cyberbyteperu.com</a></div></div><div><h3 className="text-xs font-black uppercase tracking-[.16em] text-[#20d5c3]">Estamos para ayudarte</h3><p className="mt-4 text-sm leading-6 text-[#d7e1e3]">Tienda: Lun–Vie<br /><strong>8:00 AM – 9:00 PM</strong><br /><span className="text-[#8aa1a9]">Sáb–Dom 8:00 AM – 8:00 PM</span></p><p className="mt-3 text-sm leading-6 text-[#8aa1a9]">Trámites: Lun–Sáb 8:00 AM – 8:00 PM<br />Av. 9 de Diciembre 653,<br />Chilca - Huancayo, Perú</p></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#718890] sm:flex-row"><p>© 2026 Cyber Byte Perú. Todos los derechos reservados.</p><p className="flex flex-wrap items-center gap-3">
        <a className="font-bold text-[#d7e1e3] transition hover:text-[#d6f55a]" href="https://www.facebook.com/p/CYBER-BYTE-100064145738348/" target="_blank" rel="noopener noreferrer">Facebook</a>
        <span aria-hidden>·</span>
        <a className="font-bold text-[#d7e1e3] transition hover:text-[#d6f55a]" href="https://www.instagram.com/cyberbyteperu/" target="_blank" rel="noopener noreferrer">Instagram</a>
        <span aria-hidden>·</span>
        <a className="font-bold text-[#d7e1e3] transition hover:text-[#d6f55a]" href="https://wa.me/51978050339" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </p></div></div></footer>
    </main>
  );
}
