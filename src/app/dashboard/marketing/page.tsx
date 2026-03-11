"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─────────────────────────────────────────────
   CardDateFilter — custom calendar, BR format
   ───────────────────────────────────────────── */
const MONTHS_BR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const WEEKDAYS_BR = ["D", "S", "T", "Q", "Q", "S", "S"];
const fmtBR = (iso: string) => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };

function CardDateFilter({ mode, setMode, single, setSingle, from, setFrom, to, setTo }: {
  mode: "single" | "range"; setMode: (m: "single" | "range") => void;
  single: string; setSingle: (v: string) => void;
  from: string; setFrom: (v: string) => void;
  to: string; setTo: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [pickingStart, setPickingStart] = useState(true);
  const [showYearGrid, setShowYearGrid] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Update dropdown position when open
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && dropRef.current && !dropRef.current.contains(target)) {
        setOpen(false); setShowYearGrid(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const days: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const toISO = (d: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isSelected = (d: number) => {
    const iso = toISO(d);
    if (mode === "single") return iso === single;
    return iso === from || iso === to;
  };
  const isInRange = (d: number) => {
    if (mode !== "range" || !from || !to) return false;
    const iso = toISO(d);
    return iso > from && iso < to;
  };
  const isToday = (d: number) => toISO(d) === new Date().toISOString().slice(0, 10);

  const handleDayClick = (d: number) => {
    const iso = toISO(d);
    if (mode === "single") {
      setSingle(iso);
    } else {
      if (pickingStart) {
        setFrom(iso);
        setTo("");
        setPickingStart(false);
      } else {
        if (iso < from) { setFrom(iso); setTo(from); } else { setTo(iso); }
        setPickingStart(true);
      }
    }
  };

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const yearRange = Array.from({ length: 12 }, (_, i) => viewYear - 5 + i);

  const displayText = mode === "single"
    ? (single ? fmtBR(single) : "Selecionar")
    : (from && to ? `${fmtBR(from)} — ${fmtBR(to)}` : from ? `${fmtBR(from)} — ...` : "Selecionar");

  return (
    <div className="relative ml-auto z-30" ref={ref}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.03] border border-white/5">
          <button onClick={() => { setMode("single"); setPickingStart(true); }} className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${mode === "single" ? "bg-white/[0.08] text-slate-200 border border-white/10" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Data</button>
          <button onClick={() => { setMode("range"); setPickingStart(true); }} className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${mode === "range" ? "bg-white/[0.08] text-slate-200 border border-white/10" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Intervalo</button>
        </div>
        <button
          ref={btnRef}
          onClick={() => { setOpen(o => !o); setShowYearGrid(false); }}
          className="flex items-center gap-1.5 text-[10px] bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 hover:border-white/20 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {displayText}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {open && mounted && createPortal(
        <div
          ref={dropRef}
          className="fixed rounded-xl border border-white/10 p-3 select-none"
          style={{ top: dropPos.top, right: dropPos.right, background: "rgba(8,10,18,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", minWidth: 260, zIndex: 99999 }}
        >
          {/* Header: month/year nav */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="p-1 rounded-md hover:bg-white/[0.06] text-slate-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => setShowYearGrid(g => !g)} className="text-xs font-bold text-slate-200 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/[0.06] transition-colors">
              {MONTHS_BR[viewMonth]} {viewYear}
            </button>
            <button onClick={nextMonth} className="p-1 rounded-md hover:bg-white/[0.06] text-slate-400 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {showYearGrid ? (
            <>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {MONTHS_BR.map((m, i) => (
                  <button key={m} onClick={() => { setViewMonth(i); setShowYearGrid(false); }} className={`text-[10px] py-1.5 rounded-md transition-all ${i === viewMonth ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"}`}>{m}</button>
                ))}
              </div>
              <div className="border-t border-white/5 pt-2 grid grid-cols-4 gap-1">
                <button onClick={() => setViewYear(y => y - 12)} className="col-span-4 text-[10px] text-slate-500 hover:text-slate-300 py-0.5 transition-colors">&larr; anos anteriores</button>
                {yearRange.map(y => (
                  <button key={y} onClick={() => { setViewYear(y); }} className={`text-[10px] py-1.5 rounded-md transition-all ${y === viewYear ? "bg-amber-500/20 text-amber-400 font-bold" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"}`}>{y}</button>
                ))}
                <button onClick={() => setViewYear(y => y + 12)} className="col-span-4 text-[10px] text-slate-500 hover:text-slate-300 py-0.5 transition-colors">anos seguintes &rarr;</button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS_BR.map((wd, i) => (
                  <span key={i} className="text-[9px] font-bold text-slate-500 text-center py-0.5">{wd}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {days.map((d, i) => d === null ? (
                  <span key={`e${i}`} />
                ) : (
                  <button
                    key={d}
                    onClick={() => handleDayClick(d)}
                    className={`text-[10px] h-7 rounded-md transition-all relative
                      ${isSelected(d) ? "bg-amber-500/25 text-amber-300 font-bold ring-1 ring-amber-500/40" : ""}
                      ${isInRange(d) ? "bg-amber-500/10 text-amber-200/80" : ""}
                      ${!isSelected(d) && !isInRange(d) ? "text-slate-300 hover:bg-white/[0.06]" : ""}
                      ${isToday(d) && !isSelected(d) ? "ring-1 ring-white/20" : ""}
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {mode === "range" && (
                <div className="mt-2 pt-2 border-t border-white/5 text-center">
                  <p className="text-[9px] text-slate-500">
                    {!from ? "Selecione a data inicial" : !to || !pickingStart ? "Selecione a data final" : `${fmtBR(from)} — ${fmtBR(to)}`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATA  (extracted from instruções mkt.html)
   ───────────────────────────────────────────── */

const kpis = [
  { label: "Investimento", value: "R$ 12.450", delta: "+12.5%", up: true, icon: "payments" },
  { label: "ROAS Médio", value: "4.2x", delta: "+5.2%", up: true, icon: "chart" },
  { label: "Conversões", value: "1.240", delta: "-2.1%", up: false, icon: "cart" },
  { label: "CPA Médio", value: "R$ 10,04", delta: "+3.4%", up: true, icon: "price" },
];

const campaigns = [
  { name: "Black Friday 2024", returned: "R$ 45.200", spent: "R$ 15.000", roas: "3.0x", investPct: 35, returnPct: 65 },
  { name: "Remarketing Dinâmico", returned: "R$ 28.150", spent: "R$ 5.500", roas: "5.1x", investPct: 20, returnPct: 80 },
  { name: "Prospecção Topo de Funil", returned: "R$ 12.000", spent: "R$ 7.200", roas: "1.6x", investPct: 60, returnPct: 40 },
];

const channels = [
  { name: "Mobile App", pct: 70, value: "840", color: "bg-amber-400" },
  { name: "Desktop Web", pct: 25, value: "300", color: "bg-emerald-400" },
  { name: "Outros", pct: 5, value: "60", color: "bg-slate-500" },
];

const engagement = [
  { label: "Lookalike", value: "3.2% CTR", pct: 64, impressoes: "18.400", cliques: "589", conversoes: "142", color: "rgba(251,191,36,0.85)" },
  { label: "Interesses", value: "1.8% CTR", pct: 36, impressoes: "10.200", cliques: "184", conversoes: "56", color: "rgba(147,197,253,0.7)" },
];

const ads = [
  { name: "Black_Friday_Vid_01", type: "Video • 15s", status: "ATIVO", cpm: "R$ 15,40", cpc: "R$ 0,85", roas: "6.2x", roasGood: true,
    views: "124.500", likes: "8.230", comments: "1.045", reach: "312.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "Black Friday 2024 – 15s",
    cover: "/reels 1.jpg" },
  { name: "Carousel_Lifestyle_Main", type: "Carousel • 5 cards", status: "ATIVO", cpm: "R$ 12,10", cpc: "R$ 1,05", roas: "4.8x", roasGood: true,
    views: "98.200", likes: "5.610", comments: "743", reach: "245.800", previewColor: "from-emerald-700 to-emerald-500", previewLabel: "Lifestyle Collection – 5 Cards",
    cover: "/reels 2.jpg" },
  { name: "Banner_Retargeting_Static", type: "Static • 1080x1350", status: "PAUSADO", cpm: "R$ 18,90", cpc: "R$ 2,15", roas: "1.2x", roasGood: false,
    views: "42.100", likes: "1.890", comments: "312", reach: "105.400", previewColor: "from-slate-700 to-slate-500", previewLabel: "Retargeting Banner – 1080×1350",
    cover: "/reels 3.jpg" },
  { name: "Promo_Verao_Reels", type: "Video • 30s", status: "ATIVO", cpm: "R$ 11,20", cpc: "R$ 0,72", roas: "5.8x", roasGood: true,
    views: "156.300", likes: "12.450", comments: "2.180", reach: "398.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "Promoção Verão – 30s",
    cover: "/reels 4.jpg" },
  { name: "Depoimento_Cliente_Real", type: "Video • 45s", status: "ATIVO", cpm: "R$ 9,80", cpc: "R$ 0,65", roas: "7.1x", roasGood: true,
    views: "89.700", likes: "7.340", comments: "1.520", reach: "214.500", previewColor: "from-emerald-700 to-emerald-500", previewLabel: "Depoimento Cliente – 45s",
    cover: "/reels 5.jpg" },
  { name: "Lancamento_Colecao_Nova", type: "Carousel • 8 cards", status: "ATIVO", cpm: "R$ 13,50", cpc: "R$ 0,95", roas: "4.3x", roasGood: true,
    views: "72.800", likes: "4.920", comments: "687", reach: "185.200", previewColor: "from-amber-700 to-amber-500", previewLabel: "Nova Coleção – 8 Cards",
    cover: "/reels 6.jpg" },
  { name: "Oferta_Relampago_Stories", type: "Video • 10s", status: "PAUSADO", cpm: "R$ 20,10", cpc: "R$ 2,40", roas: "1.5x", roasGood: false,
    views: "34.500", likes: "1.230", comments: "198", reach: "87.600", previewColor: "from-slate-700 to-slate-500", previewLabel: "Oferta Relâmpago – 10s",
    cover: "/reels 7.jpg" },
];

const evolutionData = [
  { date: "01 Jan", impressoes: 12400, cliques: 620, cpc: "R$ 0,92", ctr: "5.0%" },
  { date: "07 Jan", impressoes: 18200, cliques: 910, cpc: "R$ 0,85", ctr: "5.0%" },
  { date: "14 Jan", impressoes: 15600, cliques: 780, cpc: "R$ 0,98", ctr: "5.0%" },
  { date: "21 Jan", impressoes: 22800, cliques: 1140, cpc: "R$ 0,78", ctr: "5.0%" },
  { date: "30 Jan", impressoes: 24500, cliques: 1225, cpc: "R$ 0,72", ctr: "5.0%" },
];

/* ─────────────────────────────────────────────
   DATA — ORGANIC TRAFFIC TAB
   ───────────────────────────────────────────── */

const organicKpis = [
  { label: "Sessões Orgânicas", value: "18.420", delta: "+8.3%", up: true, icon: "chart", tooltip: "Sessões Orgânicas — Total de visitas originadas de busca orgânica (não paga) no período. Cálculo: soma de sessões com source/medium = google/organic, bing/organic etc. Fonte: Google Analytics. Crescimento indica maturidade do SEO e redução de dependência de ads." },
  { label: "Posição Média", value: "12.4", delta: "-2.1 pos", up: true, icon: "price", tooltip: "Posição Média — Ranking médio das páginas nos resultados de busca do Google. Cálculo: média ponderada das posições de todas as queries no Google Search Console. Quanto menor, melhor. Abaixo de 10 = primeira página. Fonte: Google Search Console." },
  { label: "CTR Orgânico", value: "3.8%", delta: "+0.6%", up: true, icon: "cart", tooltip: "CTR Orgânico — Taxa de cliques nos resultados orgânicos do Google. Cálculo: Cliques ÷ Impressões × 100. Indica qualidade dos títulos e meta descriptions nos SERPs. CTR > 3% é bom para posições médias. Fonte: Google Search Console." },
  { label: "Impressões GSC", value: "485.200", delta: "+15.2%", up: true, icon: "payments", tooltip: "Impressões GSC — Número de vezes que páginas do site apareceram nos resultados do Google, sem custo. Cálculo: contagem total de exibições no Search Console. Complementa o tráfego pago e demonstra o valor real do SEO. Fonte: Google Search Console." },
];

const topKeywords = [
  { keyword: "plano de saúde empresarial", posicao: 2, volume: "12.400", cliques: "1.840", ctr: "14.8%" },
  { keyword: "benefícios corporativos", posicao: 5, volume: "8.900", cliques: "890", ctr: "10.0%" },
  { keyword: "gestão de RH online", posicao: 3, volume: "6.200", cliques: "1.116", ctr: "18.0%" },
  { keyword: "folha de pagamento digital", posicao: 8, volume: "5.100", cliques: "357", ctr: "7.0%" },
  { keyword: "controle de ponto eletrônico", posicao: 1, volume: "9.800", cliques: "2.058", ctr: "21.0%" },
  { keyword: "software departamento pessoal", posicao: 12, volume: "4.300", cliques: "215", ctr: "5.0%" },
  { keyword: "terceirização de RH", posicao: 6, volume: "3.800", cliques: "342", ctr: "9.0%" },
  { keyword: "consultoria trabalhista", posicao: 15, volume: "2.900", cliques: "116", ctr: "4.0%" },
];

const sessionsByChannel = [
  { month: "Set", pago: 4200, organico: 2800, direto: 1200, social: 800, email: 400 },
  { month: "Out", pago: 4500, organico: 3200, direto: 1300, social: 900, email: 450 },
  { month: "Nov", pago: 5100, organico: 3800, direto: 1400, social: 1100, email: 500 },
  { month: "Dez", pago: 5800, organico: 4500, direto: 1500, social: 1200, email: 550 },
  { month: "Jan", pago: 5200, organico: 5100, direto: 1600, social: 1300, email: 600 },
  { month: "Fev", pago: 5400, organico: 5800, direto: 1700, social: 1400, email: 650 },
];

const organicEvolution = [
  { month: "Set", impressoes: 320000, cliques: 9600 },
  { month: "Out", impressoes: 345000, cliques: 11040 },
  { month: "Nov", impressoes: 390000, cliques: 13260 },
  { month: "Dez", impressoes: 420000, cliques: 15120 },
  { month: "Jan", impressoes: 455000, cliques: 16380 },
  { month: "Fev", impressoes: 485200, cliques: 18420 },
];

const newUsersByChannel = [
  { name: "Orgânico", pct: 45, value: "8.289", color: "bg-emerald-400" },
  { name: "Pago", pct: 35, value: "6.447", color: "bg-amber-400" },
  { name: "Direto", pct: 12, value: "2.210", color: "bg-blue-400" },
  { name: "Social", pct: 8, value: "1.474", color: "bg-purple-400" },
];

/* ─────────────────────────────────────────────
   DATA — INSTAGRAM MODULES (organic tab)
   ───────────────────────────────────────────── */

const igKpis = [
  { label: "Share Rate", value: "1.4%", delta: "+0.3%", up: true },
  { label: "Save Rate", value: "2.8%", delta: "+0.4%", up: true },
  { label: "Hook Score 3s", value: "57%", delta: "-3%", up: false },
  { label: "Replay Rate", value: "1.6x", delta: "+0.2x", up: true },
  { label: "Virality Score", value: "8.4", delta: "+1.1", up: true },
];

const videoRetention = [
  { sec: 0, pct: 100 }, { sec: 1, pct: 92 }, { sec: 2, pct: 78 }, { sec: 3, pct: 58 },
  { sec: 5, pct: 52 }, { sec: 7, pct: 48 }, { sec: 10, pct: 44 }, { sec: 15, pct: 40 },
  { sec: 20, pct: 37 }, { sec: 25, pct: 34 }, { sec: 30, pct: 30 },
];

const shareRateByContent = [
  { name: "Reel Tutorial", rate: 3.2, shares: 840 },
  { name: "Carrossel Dica", rate: 2.1, shares: 520 },
  { name: "Reel Bastidor", rate: 1.8, shares: 390 },
  { name: "Post Estático", rate: 0.9, shares: 180 },
  { name: "Reel Promo", rate: 0.7, shares: 140 },
  { name: "Story Link", rate: 0.4, shares: 85 },
];

const storiesFunnel = [
  { label: "Story 1", pct: 100, color: { from: "rgb(244,114,182)", to: "rgb(236,72,153)" } },
  { label: "Story 2", pct: 74, color: { from: "rgb(139,92,246)", to: "rgb(167,139,250)" } },
  { label: "Story 3", pct: 58, color: { from: "rgb(6,182,212)", to: "rgb(34,211,238)" } },
  { label: "Story 4", pct: 41, color: { from: "rgb(245,158,11)", to: "rgb(251,191,36)" } },
  { label: "Story 5 (link)", pct: 28, color: { from: "rgb(190,60,80)", to: "rgb(251,113,133)" } },
];

const reachOrigin = [
  { name: "Feed Seguidores", pct: 36, color: "bg-pink-400" },
  { name: "Explorar", pct: 28, color: "bg-amber-400" },
  { name: "Hashtags", pct: 18, color: "bg-violet-400" },
  { name: "Perfil + Stories", pct: 12, color: "bg-cyan-400" },
  { name: "Outros", pct: 6, color: "bg-slate-500" },
];

const followerGrowth = [
  { week: "Sem 1", novos: 420, unfollows: 85 },
  { week: "Sem 2", novos: 380, unfollows: 120 },
  { week: "Sem 3", novos: 510, unfollows: 65 },
  { week: "Sem 4", novos: 340, unfollows: 145 },
];

const sentimentData = [
  { label: "Positivo", pct: 56, color: "bg-emerald-400" },
  { label: "Neutro/Dúvida", pct: 24, color: "bg-amber-400" },
  { label: "Negativo", pct: 20, color: "bg-rose-400" },
];

const ageRangeData = [
  { label: "18-24", pct: 28, color: "bg-cyan-400" },
  { label: "25-34", pct: 35, color: "bg-amber-400" },
  { label: "35-44", pct: 20, color: "bg-pink-400" },
  { label: "45-54", pct: 11, color: "bg-violet-400" },
  { label: "55+", pct: 6, color: "bg-slate-400" },
];

const genderData = [
  { label: "Feminino", pct: 58, color: "bg-pink-400" },
  { label: "Masculino", pct: 38, color: "bg-cyan-400" },
  { label: "Outros", pct: 4, color: "bg-amber-400" },
];

const liveStories = [
  {
    seq: 1, type: "Video • 15s", time: "Há 12min", cover: "/reels 1.jpg",
    views: "3.240", likes: "412", reactions: "89", shares: "34", interaction: null,
  },
  {
    seq: 2, type: "Enquete", time: "Há 28min", cover: "/reels 2.jpg",
    views: "2.870", likes: "298", reactions: "156", shares: "21",
    interaction: { type: "poll" as const, question: "Qual horário preferem?", options: [
      { label: "Sábado 8h–12h", votes: 847, pct: 62 },
      { label: "Sábado 14h–18h", votes: 521, pct: 38 },
    ]},
  },
  {
    seq: 3, type: "Video • 20s", time: "Há 45min", cover: "/reels 3.jpg",
    views: "4.510", likes: "623", reactions: "201", shares: "87", interaction: null,
  },
  {
    seq: 4, type: "Quiz", time: "Há 1h", cover: "/reels 4.jpg",
    views: "2.130", likes: "187", reactions: "312", shares: "15",
    interaction: { type: "quiz" as const, question: "Quantas vezes hidratar a barba?", options: [
      { label: "1x por semana", votes: 234, pct: 18, correct: false },
      { label: "2-3x por semana", votes: 812, pct: 62, correct: true },
      { label: "Todo dia", votes: 267, pct: 20, correct: false },
    ]},
  },
  {
    seq: 5, type: "Slider", time: "Há 1h30", cover: "/reels 5.jpg",
    views: "1.980", likes: "156", reactions: "98", shares: "12",
    interaction: { type: "slider" as const, question: "Nota para o novo corte?", avg: 87, total: 643 },
  },
  {
    seq: 6, type: "Countdown", time: "Há 3h", cover: "/reels 6.jpg",
    views: "5.120", likes: "834", reactions: "267", shares: "143",
    interaction: { type: "countdown" as const, label: "Black Friday Barbearia", reminders: 1247 },
  },
];

const paidVsOrganicConversions = [
  { month: "Nov", pago: 320, organico: 180 },
  { month: "Dez", pago: 380, organico: 240 },
  { month: "Jan", pago: 350, organico: 290 },
  { month: "Fev", pago: 370, organico: 340 },
];

/* ─────────────────────────────────────────────
   DATA — ORGANIC NETWORK VARIANTS
   ───────────────────────────────────────────── */

const organicNetworkData: Record<"tiktok" | "youtube" | "facebook", {
  kpis: { label: string; value: string; delta: string; up: boolean; icon: string; tooltip: string }[];
  topContent: { columns: string[]; rows: Record<string, string>[] };
  evolution: { month: string; series1: number; series2: number }[];
  evolutionLabels: [string, string];
  donut: { name: string; pct: number; color: string }[];
  donutTitle: string;
  analyticsTitle: string;
  retention: { sec: number; pct: number }[];
  retentionMaxSec: number;
  shareRate: { name: string; rate: number; shares: number }[];
  shareRateTitle: string;
  reachOrigin: { name: string; pct: number; color: string }[];
  reachOriginTitle: string;
  followerGrowth: { week: string; novos: number; unfollows: number }[];
  bottomSection: {
    type: "duet" | "audience" | "demographics";
    title: string;
    data: { label: string; pct: number; color: string }[];
    extra?: { label: string; value: string }[];
  };
  profileConversion: { left: { label: string; value: string }; right: { label: string; value: string }; rate: string };
}> = {
  tiktok: {
    kpis: [
      { label: "Visualizações Orgânicas", value: "245K", delta: "+12.4%", up: true, icon: "chart", tooltip: "Visualizações orgânicas totais no TikTok no período. Inclui views do FYP, busca e perfil. Fonte: TikTok Analytics." },
      { label: "Seguidores", value: "18.2K", delta: "+3.1%", up: true, icon: "payments", tooltip: "Total de seguidores da conta TikTok. Crescimento orgânico via conteúdo viral e FYP. Fonte: TikTok Analytics." },
      { label: "Taxa de Engajamento", value: "6.8%", delta: "+1.2%", up: true, icon: "cart", tooltip: "Taxa de engajamento médio dos vídeos. Cálculo: (Likes + Comentários + Shares) ÷ Views × 100. Fonte: TikTok Analytics." },
      { label: "FYP Rate", value: "72%", delta: "+5.8%", up: true, icon: "price", tooltip: "Percentual de views originados da página For You (FYP). Indica potencial de viralização do conteúdo. Fonte: TikTok Analytics." },
    ],
    topContent: {
      columns: ["Conteúdo", "Views", "Likes", "Shares", "Completion Rate"],
      rows: [
        { "Conteúdo": "Tutorial Maquiagem", "Views": "89K", "Likes": "12K", "Shares": "3.2K", "Completion Rate": "68%" },
        { "Conteúdo": "Bastidores Equipe", "Views": "67K", "Likes": "8.9K", "Shares": "5.1K", "Completion Rate": "45%" },
        { "Conteúdo": "Trend Dance", "Views": "156K", "Likes": "24K", "Shares": "8.7K", "Completion Rate": "72%" },
        { "Conteúdo": "Dica Rápida", "Views": "42K", "Likes": "5.6K", "Shares": "1.8K", "Completion Rate": "58%" },
        { "Conteúdo": "Unboxing Produto", "Views": "95K", "Likes": "15K", "Shares": "4.3K", "Completion Rate": "52%" },
      ],
    },
    evolution: [
      { month: "Set", series1: 120000, series2: 14200 },
      { month: "Out", series1: 145000, series2: 15100 },
      { month: "Nov", series1: 168000, series2: 15800 },
      { month: "Dez", series1: 195000, series2: 16500 },
      { month: "Jan", series1: 220000, series2: 17400 },
      { month: "Fev", series1: 245000, series2: 18200 },
    ],
    evolutionLabels: ["Visualizações", "Seguidores"],
    donut: [
      { name: "Vídeo Curto", pct: 45, color: "bg-pink-400" },
      { name: "Trend/Challenge", pct: 25, color: "bg-amber-400" },
      { name: "Tutorial", pct: 18, color: "bg-violet-400" },
      { name: "Behind Scenes", pct: 12, color: "bg-cyan-400" },
    ],
    donutTitle: "Tipo de Conteúdo",
    analyticsTitle: "TikTok Analytics",
    retention: [
      { sec: 0, pct: 100 }, { sec: 1, pct: 95 }, { sec: 3, pct: 78 }, { sec: 5, pct: 65 },
      { sec: 10, pct: 52 }, { sec: 15, pct: 44 }, { sec: 20, pct: 38 }, { sec: 25, pct: 34 }, { sec: 30, pct: 30 },
    ],
    retentionMaxSec: 30,
    shareRate: [
      { name: "Trend Dance", rate: 5.6, shares: 8700 },
      { name: "Tutorial", rate: 3.8, shares: 3200 },
      { name: "Bastidores", rate: 2.9, shares: 5100 },
      { name: "Dica Rápida", rate: 1.4, shares: 1800 },
      { name: "Unboxing", rate: 1.1, shares: 4300 },
      { name: "Promo", rate: 0.6, shares: 520 },
    ],
    shareRateTitle: "Share Rate por Conteúdo",
    reachOrigin: [
      { name: "FYP/For You", pct: 62, color: "bg-pink-400" },
      { name: "Seguidores", pct: 18, color: "bg-amber-400" },
      { name: "Busca", pct: 10, color: "bg-violet-400" },
      { name: "Hashtags", pct: 7, color: "bg-cyan-400" },
      { name: "Sons", pct: 3, color: "bg-slate-500" },
    ],
    reachOriginTitle: "FYP Delivery Rate",
    followerGrowth: [
      { week: "Sem 1", novos: 420, unfollows: 85 },
      { week: "Sem 2", novos: 380, unfollows: 92 },
      { week: "Sem 3", novos: 510, unfollows: 78 },
      { week: "Sem 4", novos: 450, unfollows: 95 },
    ],
    bottomSection: {
      type: "duet",
      title: "Duet & Stitch Rate",
      data: [
        { label: "Duet Rate", pct: 2.1, color: "bg-pink-400" },
        { label: "Stitch Rate", pct: 1.8, color: "bg-amber-400" },
        { label: "Sem Interação", pct: 96.1, color: "bg-slate-600" },
      ],
      extra: [
        { label: "Duet Rate", value: "2.1%" },
        { label: "Stitch Rate", value: "1.8%" },
      ],
    },
    profileConversion: { left: { label: "Visitas", value: "28.4K" }, right: { label: "Follows", value: "1.2K" }, rate: "4.2%" },
  },
  youtube: {
    kpis: [
      { label: "Watch Time", value: "12.4K horas", delta: "+8.2%", up: true, icon: "chart", tooltip: "Total de horas assistidas no canal YouTube. Métrica principal para monetização e algoritmo de recomendação. Fonte: YouTube Studio." },
      { label: "Inscritos", value: "8.9K", delta: "+2.8%", up: true, icon: "payments", tooltip: "Total de inscritos no canal YouTube. Crescimento orgânico via conteúdo de qualidade e SEO. Fonte: YouTube Studio." },
      { label: "CTR Thumbnails", value: "6.2%", delta: "+0.9%", up: true, icon: "cart", tooltip: "Taxa de cliques nas thumbnails. Cálculo: Cliques ÷ Impressões × 100. Acima de 5% é considerado bom. Fonte: YouTube Studio." },
      { label: "Impressões", value: "1.2M", delta: "+11.5%", up: true, icon: "price", tooltip: "Número de vezes que thumbnails foram exibidas no YouTube. Fonte: YouTube Studio — Alcance." },
    ],
    topContent: {
      columns: ["Vídeo", "Views", "Watch Time", "CTR", "Retenção"],
      rows: [
        { "Vídeo": "Tutorial Completo", "Views": "45K", "Watch Time": "2.1Kh", "CTR": "8.2%", "Retenção": "52%" },
        { "Vídeo": "Review Produto", "Views": "32K", "Watch Time": "1.4Kh", "CTR": "5.8%", "Retenção": "48%" },
        { "Vídeo": "Vlog Bastidores", "Views": "28K", "Watch Time": "1.8Kh", "CTR": "7.1%", "Retenção": "55%" },
        { "Vídeo": "Shorts Dica", "Views": "89K", "Watch Time": "0.8Kh", "CTR": "4.2%", "Retenção": "35%" },
        { "Vídeo": "Live Q&A", "Views": "15K", "Watch Time": "3.2Kh", "CTR": "3.8%", "Retenção": "62%" },
      ],
    },
    evolution: [
      { month: "Set", series1: 8200, series2: 7400 },
      { month: "Out", series1: 9100, series2: 7800 },
      { month: "Nov", series1: 10400, series2: 8100 },
      { month: "Dez", series1: 11200, series2: 8400 },
      { month: "Jan", series1: 11800, series2: 8600 },
      { month: "Fev", series1: 12400, series2: 8900 },
    ],
    evolutionLabels: ["Watch Time (h)", "Inscritos"],
    donut: [
      { name: "Busca YouTube", pct: 35, color: "bg-red-400" },
      { name: "Sugeridos", pct: 28, color: "bg-amber-400" },
      { name: "Browse/Home", pct: 20, color: "bg-violet-400" },
      { name: "Externos", pct: 10, color: "bg-cyan-400" },
      { name: "Playlists", pct: 7, color: "bg-slate-500" },
    ],
    donutTitle: "Fonte de Tráfego",
    analyticsTitle: "YouTube Analytics",
    retention: [
      { sec: 0, pct: 100 }, { sec: 5, pct: 88 }, { sec: 10, pct: 72 }, { sec: 30, pct: 58 },
      { sec: 60, pct: 48 }, { sec: 120, pct: 40 }, { sec: 180, pct: 35 }, { sec: 240, pct: 32 }, { sec: 300, pct: 30 },
    ],
    retentionMaxSec: 300,
    shareRate: [
      { name: "Tutorial Completo", rate: 8.2, shares: 0 },
      { name: "Vlog Bastidores", rate: 7.1, shares: 0 },
      { name: "Review Produto", rate: 5.8, shares: 0 },
      { name: "Shorts Dica", rate: 4.2, shares: 0 },
      { name: "Live Q&A", rate: 3.8, shares: 0 },
    ],
    shareRateTitle: "CTR por Thumbnail",
    reachOrigin: [
      { name: "Busca YouTube", pct: 35, color: "bg-red-400" },
      { name: "Sugeridos", pct: 28, color: "bg-amber-400" },
      { name: "Browse/Home", pct: 20, color: "bg-violet-400" },
      { name: "Externos", pct: 10, color: "bg-cyan-400" },
      { name: "Playlists", pct: 7, color: "bg-slate-500" },
    ],
    reachOriginTitle: "Fonte de Tráfego",
    followerGrowth: [
      { week: "Sem 1", novos: 280, unfollows: 45 },
      { week: "Sem 2", novos: 320, unfollows: 52 },
      { week: "Sem 3", novos: 410, unfollows: 38 },
      { week: "Sem 4", novos: 350, unfollows: 48 },
    ],
    bottomSection: {
      type: "audience",
      title: "Retenção de Audiência",
      data: [
        { label: "Returning", pct: 62, color: "bg-red-400" },
        { label: "New", pct: 38, color: "bg-amber-400" },
      ],
    },
    profileConversion: { left: { label: "Impressões", value: "1.2M" }, right: { label: "Inscritos", value: "2.4K" }, rate: "2.7%" },
  },
  facebook: {
    kpis: [
      { label: "Alcance Orgânico", value: "42.8K", delta: "+5.1%", up: true, icon: "chart", tooltip: "Alcance orgânico total das publicações da página no Facebook. Sem impulsionamento. Fonte: Meta Business Suite." },
      { label: "Page Likes", value: "12.4K", delta: "+1.8%", up: true, icon: "payments", tooltip: "Total de curtidas na página do Facebook. Crescimento orgânico via conteúdo relevante. Fonte: Meta Business Suite." },
      { label: "Engajamento Posts", value: "3.2%", delta: "+0.4%", up: true, icon: "cart", tooltip: "Taxa média de engajamento dos posts orgânicos. Cálculo: (Reações + Comentários + Shares) ÷ Alcance × 100. Fonte: Meta Business Suite." },
      { label: "Post Reach", value: "68K", delta: "+9.2%", up: true, icon: "price", tooltip: "Alcance total dos posts orgânicos no período. Soma do alcance individual de cada publicação. Fonte: Meta Business Suite." },
    ],
    topContent: {
      columns: ["Post", "Alcance", "Reações", "Comentários", "Shares"],
      rows: [
        { "Post": "Carrossel Dicas", "Alcance": "8.2K", "Reações": "420", "Comentários": "89", "Shares": "156" },
        { "Post": "Video Tutorial", "Alcance": "12.4K", "Reações": "680", "Comentários": "124", "Shares": "245" },
        { "Post": "Enquete Stories", "Alcance": "6.8K", "Reações": "320", "Comentários": "210", "Shares": "45" },
        { "Post": "Link Blog", "Alcance": "4.2K", "Reações": "180", "Comentários": "42", "Shares": "89" },
        { "Post": "Imagem Motivacional", "Alcance": "15.6K", "Reações": "890", "Comentários": "156", "Shares": "312" },
      ],
    },
    evolution: [
      { month: "Set", series1: 28000, series2: 2.4 },
      { month: "Out", series1: 31000, series2: 2.6 },
      { month: "Nov", series1: 35000, series2: 2.8 },
      { month: "Dez", series1: 38000, series2: 2.9 },
      { month: "Jan", series1: 40000, series2: 3.0 },
      { month: "Fev", series1: 42800, series2: 3.2 },
    ],
    evolutionLabels: ["Alcance", "Engajamento %"],
    donut: [
      { name: "Vídeo", pct: 32, color: "bg-blue-400" },
      { name: "Carrossel", pct: 28, color: "bg-amber-400" },
      { name: "Imagem", pct: 22, color: "bg-violet-400" },
      { name: "Link", pct: 12, color: "bg-cyan-400" },
      { name: "Texto", pct: 6, color: "bg-slate-500" },
    ],
    donutTitle: "Tipo de Conteúdo",
    analyticsTitle: "Facebook Analytics",
    retention: [
      { sec: 0, pct: 100 }, { sec: 1, pct: 92 }, { sec: 3, pct: 74 }, { sec: 5, pct: 62 },
      { sec: 10, pct: 48 }, { sec: 15, pct: 38 }, { sec: 20, pct: 32 }, { sec: 25, pct: 28 }, { sec: 30, pct: 24 },
    ],
    retentionMaxSec: 30,
    shareRate: [
      { name: "Video", rate: 4.2, shares: 245 },
      { name: "Carrossel", rate: 3.8, shares: 156 },
      { name: "Imagem", rate: 2.1, shares: 312 },
      { name: "Link", rate: 1.2, shares: 89 },
    ],
    shareRateTitle: "Engajamento por Tipo",
    reachOrigin: [
      { name: "Feed Orgânico", pct: 42, color: "bg-blue-400" },
      { name: "Grupos", pct: 22, color: "bg-amber-400" },
      { name: "Shares", pct: 18, color: "bg-violet-400" },
      { name: "Busca", pct: 12, color: "bg-cyan-400" },
      { name: "Outros", pct: 6, color: "bg-slate-500" },
    ],
    reachOriginTitle: "Origem do Alcance",
    followerGrowth: [
      { week: "Sem 1", novos: 180, unfollows: 42 },
      { week: "Sem 2", novos: 210, unfollows: 55 },
      { week: "Sem 3", novos: 260, unfollows: 38 },
      { week: "Sem 4", novos: 190, unfollows: 48 },
    ],
    bottomSection: {
      type: "demographics",
      title: "Demografia da Audiência",
      data: [
        { label: "18-24", pct: 18, color: "bg-blue-400" },
        { label: "25-34", pct: 35, color: "bg-amber-400" },
        { label: "35-44", pct: 28, color: "bg-violet-400" },
        { label: "45-54", pct: 12, color: "bg-cyan-400" },
        { label: "55+", pct: 7, color: "bg-slate-500" },
      ],
    },
    profileConversion: { left: { label: "Visitantes Página", value: "18.2K" }, right: { label: "Likes", value: "680" }, rate: "3.7%" },
  },
};

/* ─────────────────────────────────────────────
   DATA — PAID TRAFFIC ADDITIONS
   ───────────────────────────────────────────── */

const healthScore = [
  { label: "Freq. Anúncio", value: "1.8x", status: "good" as const, tooltip: "Frequência do Anúncio — Média de vezes que o mesmo usuário viu seu anúncio. Cálculo: Impressões ÷ Alcance. Acima de 3.5x indica fadiga criativa (CPC sobe, CTR cai). Fonte: Meta Ads Manager. Zona verde ≤ 2.5, amarela 2.5–3.5, vermelha > 3.5." },
  { label: "Quality Score", value: "8.2", status: "good" as const, tooltip: "Quality Score — Nota de 1 a 10 atribuída pelo Google Ads com base na relevância do anúncio, CTR esperado e experiência na landing page. Cálculo: média ponderada de Ad Relevance + Expected CTR + Landing Page Experience. Acima de 7 = saudável." },
  { label: "Budget Pace", value: "74%", status: "warn" as const, tooltip: "Budget Pace — Percentual do orçamento consumido em relação ao planejado para o período. Cálculo: Gasto Real ÷ Budget Planejado × 100. Detecta campanhas em overspend (> 100%) ou underspend (< 60%). Fonte: Soma dos gastos por campanha ativa." },
  { label: "Bounce Rate", value: "68%", status: "bad" as const, tooltip: "Taxa de Rejeição — Percentual de visitantes que saem sem interagir após o clique no anúncio. Cálculo: Sessões de página única ÷ Total de sessões × 100. Acima de 60% no tráfego pago indica landing page fora de sintonia com o criativo. Fonte: Google Analytics." },
];

const budgetPace = [
  { name: "Black Friday", used: 82, amount: "R$12.3K / R$15K", status: "ok" as const },
  { name: "Remarketing", used: 104, amount: "104% · OVERSPEND", status: "over" as const },
  { name: "Topo de Funil", used: 31, amount: "31% · Underspend", status: "under" as const },
];

const heatmapData = (() => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const data: { day: string; hours: number[] }[] = [];
  days.forEach((day, di) => {
    const hours: number[] = [];
    for (let h = 0; h < 24; h++) {
      const isWeekend = di >= 5;
      const isBusinessHour = h >= 8 && h <= 19;
      const isPeak = h >= 10 && h <= 14;
      let base = isWeekend ? 0.1 : 0.15;
      if (isBusinessHour) base += isWeekend ? 0.15 : 0.35;
      if (isPeak) base += isWeekend ? 0.1 : 0.3;
      if (h >= 20 && h <= 22) base += 0.15;
      hours.push(Math.min(1, base + Math.random() * 0.15));
    }
    data.push({ day, hours });
  });
  return data;
})();

/* ─────────────────────────────────────────────
   DATA — SOCIAL NETWORK VARIANTS (Paid Tab)
   ───────────────────────────────────────────── */

type SocialNetwork = "instagram" | "tiktok" | "youtube" | "facebook";

const networkData: Record<SocialNetwork, {
  healthScore: typeof healthScore;
  kpis: typeof kpis;
  campaigns: typeof campaigns;
  engagement: typeof engagement;
  ads: typeof ads;
  evolutionData: typeof evolutionData;
  budgetPace: typeof budgetPace;
  funnelStages: { label: string; count: string; delta: string; up: boolean; w: number; highlight?: boolean }[];
  funnelBetween: { left: { k: string; v: string; d: string; up: boolean }; right: { k: string; v: string; d: string; up: boolean } }[];
}> = {
  instagram: {
    healthScore,
    kpis,
    campaigns,
    engagement,
    ads,
    evolutionData,
    budgetPace,
    funnelStages: [
      { label: "Impressões", count: "245.800", delta: "+18.3%", up: true, w: 72 },
      { label: "Cliques", count: "11.800", delta: "+12.1%", up: true, w: 60 },
      { label: "PageViews", count: "10.170", delta: "-3.8%", up: false, w: 50 },
      { label: "Checkout", count: "775", delta: "+7.2%", up: true, w: 42 },
      { label: "Compras", count: "249", delta: "+5.6%", up: true, w: 34, highlight: true },
    ],
    funnelBetween: [
      { left: { k: "CPC", v: "R$ 0,82", d: "+5.1%", up: true }, right: { k: "CTR", v: "4,8%", d: "+12.4%", up: true } },
      { left: { k: "C/PAGEVIEW", v: "R$ 1,05", d: "+3.7%", up: true }, right: { k: "CONNECT RATE", v: "86,2%", d: "-2.4%", up: false } },
      { left: { k: "C/CHECKOUT", v: "R$ 3,20", d: "+6.8%", up: true }, right: { k: "%CHECKOUT", v: "7,6%", d: "+14.2%", up: true } },
      { left: { k: "C/COMPRA", v: "R$ 10,04", d: "-5.1%", up: false }, right: { k: "%COMPRA", v: "32,1%", d: "+8.9%", up: true } },
    ],
  },
  tiktok: {
    healthScore: [
      { label: "Freq. Anúncio", value: "2.1x", status: "good" as const, tooltip: "Frequência do Anúncio — Média de vezes que o mesmo usuário viu seu anúncio no TikTok. Cálculo: Impressões ÷ Alcance. Acima de 3.5x indica fadiga criativa. Fonte: TikTok Ads Manager." },
      { label: "Hook Rate 3s", value: "72%", status: "good" as const, tooltip: "Hook Rate 3s — Percentual de espectadores que assistiram pelo menos 3 segundos do vídeo. Acima de 65% é considerado bom no TikTok. Indica capacidade do criativo de capturar atenção. Fonte: TikTok Ads Manager." },
      { label: "Budget Pace", value: "68%", status: "warn" as const, tooltip: "Budget Pace — Percentual do orçamento consumido em relação ao planejado para o período. Cálculo: Gasto Real ÷ Budget Planejado × 100. Fonte: TikTok Ads Manager." },
      { label: "Video Completion", value: "34%", status: "warn" as const, tooltip: "Video Completion Rate — Percentual de usuários que assistiram o vídeo até o fim. Abaixo de 40% indica necessidade de otimizar duração ou conteúdo do criativo. Fonte: TikTok Ads Manager." },
    ],
    kpis: [
      { label: "Investimento", value: "R$ 8.200", delta: "+18.2%", up: true, icon: "payments" },
      { label: "ROAS Médio", value: "3.8x", delta: "+8.1%", up: true, icon: "chart" },
      { label: "Conversões", value: "890", delta: "+22.4%", up: true, icon: "cart" },
      { label: "CPA Médio", value: "R$ 9,21", delta: "-4.2%", up: false, icon: "price" },
    ],
    campaigns: [
      { name: "FYP Verão 2024", returned: "R$ 22.800", spent: "R$ 4.200", roas: "5.4x", investPct: 25, returnPct: 75 },
      { name: "Spark Bastidores", returned: "R$ 14.500", spent: "R$ 2.800", roas: "5.2x", investPct: 22, returnPct: 78 },
      { name: "TopView Lançamento", returned: "R$ 8.100", spent: "R$ 5.400", roas: "1.5x", investPct: 55, returnPct: 45 },
    ],
    engagement: [
      { label: "Interest & Behavior", value: "4.1% CTR", pct: 42, impressoes: "21.600", cliques: "886", conversoes: "198", color: "rgba(251,191,36,0.85)" },
      { label: "Custom Audience", value: "3.2% CTR", pct: 28, impressoes: "14.400", cliques: "461", conversoes: "124", color: "rgba(147,197,253,0.7)" },
      { label: "Lookalike TT", value: "2.4% CTR", pct: 18, impressoes: "9.200", cliques: "221", conversoes: "68", color: "rgba(52,211,153,0.7)" },
      { label: "Broad", value: "1.1% CTR", pct: 12, impressoes: "6.100", cliques: "67", conversoes: "18", color: "rgba(148,163,184,0.5)" },
    ],
    ads: [
      { name: "FYP_Verao_Trend", type: "In-Feed · 15s", status: "ATIVO", cpm: "R$ 8,40", cpc: "R$ 0,52", roas: "7.1x", roasGood: true,
        views: "342.000", likes: "28.400", comments: "4.120", reach: "520.000", previewColor: "from-pink-700 to-pink-500", previewLabel: "FYP Verão Trend – 15s",
        cover: "/reels 1.jpg" },
      { name: "Spark_Bastidores_30", type: "Spark Ad · 30s", status: "ATIVO", cpm: "R$ 6,20", cpc: "R$ 0,38", roas: "6.8x", roasGood: true,
        views: "198.500", likes: "15.200", comments: "2.340", reach: "385.000", previewColor: "from-emerald-700 to-emerald-500", previewLabel: "Spark Bastidores – 30s",
        cover: "/reels 2.jpg" },
      { name: "TopView_Lancamento", type: "TopView · 10s", status: "ATIVO", cpm: "R$ 22,10", cpc: "R$ 1,85", roas: "2.1x", roasGood: true,
        views: "890.000", likes: "42.100", comments: "6.800", reach: "1.200.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "TopView Lançamento – 10s",
        cover: "/reels 3.jpg" },
      { name: "Duet_Challenge_Main", type: "In-Feed · 20s", status: "ATIVO", cpm: "R$ 7,80", cpc: "R$ 0,45", roas: "5.2x", roasGood: true,
        views: "256.300", likes: "19.800", comments: "3.450", reach: "412.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "Duet Challenge – 20s",
        cover: "/reels 4.jpg" },
      { name: "UGC_Depoimento_Real", type: "Spark Ad · 45s", status: "PAUSADO", cpm: "R$ 11,40", cpc: "R$ 1,20", roas: "1.4x", roasGood: false,
        views: "62.800", likes: "3.200", comments: "580", reach: "98.500", previewColor: "from-slate-700 to-slate-500", previewLabel: "UGC Depoimento – 45s",
        cover: "/reels 5.jpg" },
    ],
    evolutionData: [
      { date: "01 Jan", impressoes: 18400, cliques: 820, cpc: "R$ 0,52", ctr: "4.5%" },
      { date: "07 Jan", impressoes: 24200, cliques: 1180, cpc: "R$ 0,48", ctr: "4.9%" },
      { date: "14 Jan", impressoes: 21600, cliques: 1020, cpc: "R$ 0,55", ctr: "4.7%" },
      { date: "21 Jan", impressoes: 32800, cliques: 1640, cpc: "R$ 0,42", ctr: "5.0%" },
      { date: "30 Jan", impressoes: 38500, cliques: 1925, cpc: "R$ 0,38", ctr: "5.0%" },
    ],
    budgetPace: [
      { name: "FYP Verão 2024", used: 78, amount: "R$3.3K / R$4.2K", status: "ok" as const },
      { name: "Spark Bastidores", used: 92, amount: "R$2.6K / R$2.8K", status: "ok" as const },
      { name: "TopView Lançamento", used: 108, amount: "108% · OVERSPEND", status: "over" as const },
    ],
    funnelStages: [
      { label: "Impressões", count: "180.000", delta: "+24.1%", up: true, w: 72 },
      { label: "Video Views", count: "95.000", delta: "+31.2%", up: true, w: 62 },
      { label: "Cliques", count: "8.200", delta: "+18.5%", up: true, w: 50 },
      { label: "Checkout", count: "520", delta: "+12.3%", up: true, w: 40 },
      { label: "Compras", count: "178", delta: "+8.7%", up: true, w: 32, highlight: true },
    ],
    funnelBetween: [
      { left: { k: "CPV", v: "R$ 0,03", d: "-8.2%", up: false }, right: { k: "VIEW RATE", v: "52,8%", d: "+6.1%", up: true } },
      { left: { k: "CPC", v: "R$ 0,52", d: "+3.4%", up: true }, right: { k: "CLICK RATE", v: "8,6%", d: "+14.8%", up: true } },
      { left: { k: "C/CHECKOUT", v: "R$ 2,80", d: "+5.1%", up: true }, right: { k: "%CHECKOUT", v: "6,3%", d: "+9.2%", up: true } },
      { left: { k: "C/COMPRA", v: "R$ 9,21", d: "-4.2%", up: false }, right: { k: "%COMPRA", v: "34,2%", d: "+11.3%", up: true } },
    ],
  },
  youtube: {
    healthScore: [
      { label: "Quality Score", value: "7.8", status: "good" as const, tooltip: "Quality Score — Nota de 1 a 10 atribuída pelo Google Ads com base na relevância do anúncio, CTR esperado e experiência na landing page. Acima de 7 = saudável. Fonte: Google Ads." },
      { label: "View Rate (VTR)", value: "38%", status: "good" as const, tooltip: "View Rate (VTR) — Percentual de espectadores que assistiram 30 segundos ou o vídeo completo (o que for menor). Acima de 30% é considerado bom no YouTube Ads. Fonte: Google Ads — YouTube." },
      { label: "Budget Pace", value: "82%", status: "good" as const, tooltip: "Budget Pace — Percentual do orçamento consumido em relação ao planejado para o período. Cálculo: Gasto Real ÷ Budget Planejado × 100. Fonte: Google Ads." },
      { label: "Bounce Rate", value: "52%", status: "warn" as const, tooltip: "Taxa de Rejeição — Percentual de visitantes que saem sem interagir após o clique no anúncio do YouTube. Abaixo de 50% é ideal. Fonte: Google Analytics." },
    ],
    kpis: [
      { label: "Investimento", value: "R$ 15.800", delta: "+8.4%", up: true, icon: "payments" },
      { label: "ROAS Médio", value: "3.2x", delta: "+2.1%", up: true, icon: "chart" },
      { label: "Conversões", value: "680", delta: "+5.8%", up: true, icon: "cart" },
      { label: "CPA Médio", value: "R$ 23,24", delta: "+1.8%", up: true, icon: "price" },
    ],
    campaigns: [
      { name: "Pre-Roll Institucional", returned: "R$ 32.400", spent: "R$ 8.200", roas: "4.0x", investPct: 30, returnPct: 70 },
      { name: "Bumper Awareness", returned: "R$ 12.800", spent: "R$ 4.600", roas: "2.8x", investPct: 40, returnPct: 60 },
      { name: "Discovery Tutorial", returned: "R$ 9.200", spent: "R$ 3.000", roas: "3.1x", investPct: 35, returnPct: 65 },
    ],
    engagement: [
      { label: "In-Market", value: "2.8% CTR", pct: 35, impressoes: "28.000", cliques: "784", conversoes: "168", color: "rgba(251,191,36,0.85)" },
      { label: "Custom Intent", value: "2.2% CTR", pct: 25, impressoes: "20.000", cliques: "440", conversoes: "92", color: "rgba(147,197,253,0.7)" },
      { label: "Affinity", value: "1.6% CTR", pct: 22, impressoes: "17.600", cliques: "282", conversoes: "54", color: "rgba(52,211,153,0.7)" },
      { label: "Customer Match", value: "3.4% CTR", pct: 18, impressoes: "14.400", cliques: "490", conversoes: "112", color: "rgba(244,114,182,0.7)" },
    ],
    ads: [
      { name: "PreRoll_Institucional_15", type: "In-Stream Skippable · 15s", status: "ATIVO", cpm: "R$ 18,40", cpc: "R$ 1,85", roas: "4.2x", roasGood: true,
        views: "245.000", likes: "8.400", comments: "1.120", reach: "480.000", previewColor: "from-red-700 to-red-500", previewLabel: "Pre-Roll Institucional – 15s",
        cover: "/reels 1.jpg" },
      { name: "Bumper_Awareness_6s", type: "Bumper · 6s", status: "ATIVO", cpm: "R$ 8,20", cpc: "R$ 0,42", roas: "3.1x", roasGood: true,
        views: "520.000", likes: "2.100", comments: "340", reach: "890.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "Bumper Awareness – 6s",
        cover: "/reels 2.jpg" },
      { name: "Discovery_Tutorial_How", type: "Discovery", status: "ATIVO", cpm: "R$ 12,60", cpc: "R$ 1,20", roas: "5.8x", roasGood: true,
        views: "89.200", likes: "12.400", comments: "2.800", reach: "142.000", previewColor: "from-emerald-700 to-emerald-500", previewLabel: "Discovery Tutorial – How To",
        cover: "/reels 3.jpg" },
      { name: "NonSkip_Product_15s", type: "Non-Skip · 15s", status: "PAUSADO", cpm: "R$ 24,80", cpc: "R$ 2,60", roas: "1.8x", roasGood: false,
        views: "68.400", likes: "1.800", comments: "420", reach: "68.400", previewColor: "from-slate-700 to-slate-500", previewLabel: "Non-Skippable Product – 15s",
        cover: "/reels 4.jpg" },
    ],
    evolutionData: [
      { date: "01 Jan", impressoes: 32000, cliques: 1120, cpc: "R$ 1,85", ctr: "3.5%" },
      { date: "07 Jan", impressoes: 38400, cliques: 1380, cpc: "R$ 1,72", ctr: "3.6%" },
      { date: "14 Jan", impressoes: 35200, cliques: 1260, cpc: "R$ 1,90", ctr: "3.6%" },
      { date: "21 Jan", impressoes: 42800, cliques: 1580, cpc: "R$ 1,65", ctr: "3.7%" },
      { date: "30 Jan", impressoes: 48500, cliques: 1845, cpc: "R$ 1,58", ctr: "3.8%" },
    ],
    budgetPace: [
      { name: "Pre-Roll Institucional", used: 85, amount: "R$7.0K / R$8.2K", status: "ok" as const },
      { name: "Bumper Awareness", used: 72, amount: "R$3.3K / R$4.6K", status: "ok" as const },
      { name: "Discovery Tutorial", used: 44, amount: "44% · Underspend", status: "under" as const },
    ],
    funnelStages: [
      { label: "Impressões", count: "320.000", delta: "+12.4%", up: true, w: 72 },
      { label: "Views 30s+", count: "112.000", delta: "+8.6%", up: true, w: 60 },
      { label: "Cliques CTA", count: "14.500", delta: "+15.2%", up: true, w: 48 },
      { label: "Checkout", count: "890", delta: "+6.8%", up: true, w: 38 },
      { label: "Compras", count: "245", delta: "+4.2%", up: true, w: 30, highlight: true },
    ],
    funnelBetween: [
      { left: { k: "CPV", v: "R$ 0,08", d: "-3.4%", up: false }, right: { k: "VTR", v: "35,0%", d: "+4.2%", up: true } },
      { left: { k: "CPC", v: "R$ 1,85", d: "+2.1%", up: true }, right: { k: "CLICK RATE", v: "12,9%", d: "+8.4%", up: true } },
      { left: { k: "C/CHECKOUT", v: "R$ 8,40", d: "+4.6%", up: true }, right: { k: "%CHECKOUT", v: "6,1%", d: "+5.8%", up: true } },
      { left: { k: "C/COMPRA", v: "R$ 23,24", d: "+1.8%", up: true }, right: { k: "%COMPRA", v: "27,5%", d: "+3.2%", up: true } },
    ],
  },
  facebook: {
    healthScore: [
      { label: "Ad Relevance", value: "Above Avg", status: "good" as const, tooltip: "Ad Relevance — Indicador do Facebook que mede a qualidade e relevância do anúncio para o público-alvo. Valores: Above Average, Average, Below Average. Above Average reduz custos de entrega. Fonte: Meta Ads Manager." },
      { label: "Freq. Anúncio", value: "2.4x", status: "good" as const, tooltip: "Frequência do Anúncio — Média de vezes que o mesmo usuário viu seu anúncio no Facebook. Cálculo: Impressões ÷ Alcance. Acima de 3.5x indica fadiga criativa. Fonte: Meta Ads Manager." },
      { label: "Budget Pace", value: "88%", status: "good" as const, tooltip: "Budget Pace — Percentual do orçamento consumido em relação ao planejado para o período. Cálculo: Gasto Real ÷ Budget Planejado × 100. Fonte: Meta Ads Manager." },
      { label: "Bounce Rate", value: "54%", status: "warn" as const, tooltip: "Taxa de Rejeição — Percentual de visitantes que saem sem interagir após o clique no anúncio do Facebook. Abaixo de 50% é ideal para tráfego pago. Fonte: Google Analytics." },
    ],
    kpis: [
      { label: "Investimento", value: "R$ 18.600", delta: "+6.8%", up: true, icon: "payments" },
      { label: "ROAS Médio", value: "4.5x", delta: "+12.4%", up: true, icon: "chart" },
      { label: "Conversões", value: "1.580", delta: "+9.2%", up: true, icon: "cart" },
      { label: "CPA Médio", value: "R$ 11,77", delta: "-2.8%", up: false, icon: "price" },
    ],
    campaigns: [
      { name: "Black Friday Feed", returned: "R$ 52.400", spent: "R$ 10.200", roas: "5.1x", investPct: 25, returnPct: 75 },
      { name: "Remarketing Carousel", returned: "R$ 28.800", spent: "R$ 5.400", roas: "5.3x", investPct: 22, returnPct: 78 },
      { name: "Reels Promo", returned: "R$ 14.200", spent: "R$ 6.800", roas: "2.1x", investPct: 48, returnPct: 52 },
    ],
    engagement: [
      { label: "Lookalike", value: "3.8% CTR", pct: 38, impressoes: "24.800", cliques: "942", conversoes: "228", color: "rgba(251,191,36,0.85)" },
      { label: "Interesses", value: "2.4% CTR", pct: 26, impressoes: "17.000", cliques: "408", conversoes: "98", color: "rgba(147,197,253,0.7)" },
      { label: "Custom Audience", value: "4.2% CTR", pct: 20, impressoes: "13.000", cliques: "546", conversoes: "168", color: "rgba(52,211,153,0.7)" },
      { label: "Advantage+", value: "1.6% CTR", pct: 16, impressoes: "10.400", cliques: "166", conversoes: "42", color: "rgba(244,114,182,0.7)" },
    ],
    ads: [
      { name: "BF_Feed_Image_Hero", type: "Feed · Image", status: "ATIVO", cpm: "R$ 14,20", cpc: "R$ 0,92", roas: "5.8x", roasGood: true,
        views: "185.000", likes: "12.400", comments: "2.180", reach: "340.000", previewColor: "from-blue-700 to-blue-500", previewLabel: "Black Friday Feed – Image",
        cover: "/reels 1.jpg" },
      { name: "Reels_Promo_30s", type: "Reels · 30s", status: "ATIVO", cpm: "R$ 10,80", cpc: "R$ 0,68", roas: "4.2x", roasGood: true,
        views: "142.500", likes: "9.800", comments: "1.540", reach: "278.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "Reels Promo – 30s",
        cover: "/reels 2.jpg" },
      { name: "Stories_Flash_15s", type: "Stories · 15s", status: "ATIVO", cpm: "R$ 8,40", cpc: "R$ 0,55", roas: "6.4x", roasGood: true,
        views: "98.200", likes: "4.600", comments: "720", reach: "195.000", previewColor: "from-emerald-700 to-emerald-500", previewLabel: "Stories Flash – 15s",
        cover: "/reels 3.jpg" },
      { name: "Marketplace_Carousel", type: "Marketplace · Carousel", status: "ATIVO", cpm: "R$ 16,50", cpc: "R$ 1,15", roas: "3.8x", roasGood: true,
        views: "68.400", likes: "3.200", comments: "480", reach: "124.000", previewColor: "from-amber-700 to-amber-500", previewLabel: "Marketplace Carousel – Multi",
        cover: "/reels 4.jpg" },
      { name: "Remarketing_DPA_Auto", type: "Feed · Carousel", status: "PAUSADO", cpm: "R$ 22,80", cpc: "R$ 2,40", roas: "1.6x", roasGood: false,
        views: "34.200", likes: "1.100", comments: "180", reach: "62.400", previewColor: "from-slate-700 to-slate-500", previewLabel: "Remarketing DPA – Auto",
        cover: "/reels 5.jpg" },
    ],
    evolutionData: [
      { date: "01 Jan", impressoes: 42000, cliques: 1890, cpc: "R$ 0,92", ctr: "4.5%" },
      { date: "07 Jan", impressoes: 48200, cliques: 2170, cpc: "R$ 0,88", ctr: "4.5%" },
      { date: "14 Jan", impressoes: 44600, cliques: 2010, cpc: "R$ 0,95", ctr: "4.5%" },
      { date: "21 Jan", impressoes: 52800, cliques: 2640, cpc: "R$ 0,82", ctr: "5.0%" },
      { date: "30 Jan", impressoes: 58500, cliques: 2925, cpc: "R$ 0,78", ctr: "5.0%" },
    ],
    budgetPace: [
      { name: "Black Friday Feed", used: 90, amount: "R$9.2K / R$10.2K", status: "ok" as const },
      { name: "Remarketing Carousel", used: 96, amount: "R$5.2K / R$5.4K", status: "ok" as const },
      { name: "Reels Promo", used: 62, amount: "R$4.2K / R$6.8K", status: "ok" as const },
    ],
    funnelStages: [
      { label: "Impressões", count: "410.000", delta: "+14.2%", up: true, w: 72 },
      { label: "Cliques", count: "19.200", delta: "+10.8%", up: true, w: 60 },
      { label: "PageViews", count: "16.800", delta: "+6.4%", up: true, w: 50 },
      { label: "Checkout", count: "1.200", delta: "+8.2%", up: true, w: 40 },
      { label: "Compras", count: "385", delta: "+5.1%", up: true, w: 32, highlight: true },
    ],
    funnelBetween: [
      { left: { k: "CPC", v: "R$ 0,92", d: "+3.2%", up: true }, right: { k: "CTR", v: "4,7%", d: "+8.6%", up: true } },
      { left: { k: "C/PAGEVIEW", v: "R$ 1,12", d: "+2.4%", up: true }, right: { k: "CONNECT RATE", v: "87,5%", d: "+1.8%", up: true } },
      { left: { k: "C/CHECKOUT", v: "R$ 4,20", d: "+5.6%", up: true }, right: { k: "%CHECKOUT", v: "7,1%", d: "+6.4%", up: true } },
      { left: { k: "C/COMPRA", v: "R$ 11,77", d: "-2.8%", up: false }, right: { k: "%COMPRA", v: "32,1%", d: "+4.8%", up: true } },
    ],
  },
};

/* SVG icons for social networks */
const socialNetworkIcons: Record<SocialNetwork, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49V8.74a8.26 8.26 0 004.84 1.55V6.84a4.84 4.84 0 01-1.12-.15z"/>
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
};

const socialNetworkColors: Record<SocialNetwork, string> = {
  instagram: "#e1306c",
  tiktok: "#ff2d55",
  youtube: "#ff0000",
  facebook: "#1877f2",
};

const socialNetworkLabels: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
};

/* ─────────────────────────────────────────────
   SMALL COMPONENTS
   ───────────────────────────────────────────── */

const kpiIcons: Record<string, React.ReactNode> = {
  payments: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/>
    </svg>
  ),
  cart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  ),
  price: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
    </svg>
  ),
};

function ArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" /><path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SHARED GLASS STYLE (same as header)
   ───────────────────────────────────────────── */

const glassStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
  backdropFilter: "blur(6px) saturate(140%)",
  WebkitBackdropFilter: "blur(6px) saturate(140%)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  overflow: "visible",
};

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
   ───────────────────────────────────────────── */

export default function MarketingPage() {
  const router = useRouter();
  const [selectedAd, setSelectedAd] = useState<typeof ads[number] | null>(null);
  const [channelTab, setChannelTab] = useState<"canal" | "metricas">("metricas");
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [hoveredEvolution, setHoveredEvolution] = useState<number | null>(null);
  const [hoveredEngagement, setHoveredEngagement] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<"pago" | "organico">("pago");
  const [socialNetwork, setSocialNetwork] = useState<SocialNetwork>("instagram");
  const [hoveredNewUsers, setHoveredNewUsers] = useState<string | null>(null);
  const [hoveredHeat, setHoveredHeat] = useState<{ day: string; hour: number; val: number; x: number; y: number } | null>(null);
  const [hoveredReach, setHoveredReach] = useState<string | null>(null);
  const [hoveredSentiment, setHoveredSentiment] = useState<string | null>(null);
  const [hoveredAge, setHoveredAge] = useState<string | null>(null);
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<typeof liveStories[number] | null>(null);
  const [hoveredRetention, setHoveredRetention] = useState<number | null>(null);
  const [hoveredOrgEvo, setHoveredOrgEvo] = useState<number | null>(null);
  // Filter dropdowns
  const estrategias = ["Distribuição", "Mensagens", "Leads", "Tráfego Direto", "eCommerce"] as const;
  const [estrategia, setEstrategia] = useState<string>("Tráfego Direto");
  const [showEstrategia, setShowEstrategia] = useState(false);
  const estrategiaRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (estrategiaRef.current && !estrategiaRef.current.contains(e.target as Node)) setShowEstrategia(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Date filters for cards
  const [storiesDateMode, setStoriesDateMode] = useState<"single" | "range">("single");
  const [storiesDate, setStoriesDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [storiesDateFrom, setStoriesDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); });
  const [storiesDateTo, setStoriesDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [sentimentDateMode, setSentimentDateMode] = useState<"single" | "range">("single");
  const [sentimentDate, setSentimentDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sentimentDateFrom, setSentimentDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); });
  const [sentimentDateTo, setSentimentDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [convDateMode, setConvDateMode] = useState<"single" | "range">("single");
  const [convDate, setConvDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [convDateFrom, setConvDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); });
  const [convDateTo, setConvDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Organic non-Instagram chart hover states (must be at top level for hooks rules)
  const [hovDonut, setHovDonut] = useState<string | null>(null);
  const [hovEvo, setHovEvo] = useState<number | null>(null);
  const [hovRet, setHovRet] = useState<number | null>(null);
  const [hovRO, setHovRO] = useState<string | null>(null);
  const [hovBS, setHovBS] = useState<string | null>(null);

  // Gauge needle animation — resting at value 0 (angle PI, pointing left)
  const gaugeRestAngle = Math.PI - 0.05; // tiny offset so needle is visually distinct from arc edge
  const [gaugeAngle, setGaugeAngle] = useState(gaugeRestAngle);
  const gaugeRafRef = useRef<number>(0);
  const gaugeCurrentRef = useRef<number>(gaugeRestAngle); // tracks real-time angle for interrupts

  const animateGauge = useCallback((targetAngle: number) => {
    if (gaugeRafRef.current) cancelAnimationFrame(gaugeRafRef.current);
    const fromAngle = gaugeCurrentRef.current;
    const toAngle = targetAngle;
    const duration = 1400;
    let startTime = 0;

    const easeOutElastic = (t: number) => {
      if (t === 0 || t === 1) return t;
      const p = 0.4;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    };

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutElastic(progress);
      const current = fromAngle + (toAngle - fromAngle) * eased;
      gaugeCurrentRef.current = current;
      setGaugeAngle(current);
      if (progress < 1) {
        gaugeRafRef.current = requestAnimationFrame(step);
      }
    };
    gaugeRafRef.current = requestAnimationFrame(step);
  }, []);

  /* ── Card Info Tooltips ── */
  const cardTooltips: Record<string, string> = {
    "Score de Saúde da Conta": "Visão instantânea do estado geral da conta de anúncios. Cada indicador recebe um semáforo (verde/amarelo/vermelho) baseado em thresholds do mercado. Fonte: Meta Ads + Google Ads + Analytics.",
    "Funil de Conversão": "Funil trapezoidal proporcional que mostra o volume real em cada etapa: Impressões → Cliques → PageViews → Checkout → Compras. O drop-off entre etapas fica visualmente óbvio. Fonte: Meta Ads + Google Analytics.",
    "Melhores Anúncios": "Ranking dos criativos com melhor performance. Métricas: CPM, CPC, ROAS, Views, Likes, Comentários e Alcance. Permite identificar top performers e pausar anúncios com baixo retorno. Fonte: Meta Ads Manager.",
    "Engajamento por Público": "Distribuição de engajamento entre segmentos de audiência (Lookalike, Interesses, Remarketing). Cálculo: Impressões e CTR por segmento. Hover mostra detalhes de cada público. Fonte: Meta Ads — Audience Insights.",
    "Evolução Temporal": "Evolução de Impressões, Cliques, CPC e CTR ao longo do tempo. Usa eixo Y duplo para evitar distorção entre volume absoluto e percentuais. Fonte: Meta Ads + Google Ads — relatórios diários/semanais.",
    "Investimento vs Retorno por Campanha": "Comparação visual entre investimento e retorno de cada campanha. Barras horizontais com gradiente indicam a proporção gasto vs receita. ROAS calculado como Receita ÷ Investimento. Fonte: Meta Ads + Google Ads.",
    "Budget Pace por Campanha": "Percentual do orçamento consumido vs planejado por campanha. Detecta overspend (>100%, vermelho) e underspend (<60%, azul). Cálculo: Gasto Real ÷ Budget Planejado × 100. Fonte: plataformas de ads.",
    "Comportamento On-site": "Métricas pós-clique: Taxa de Rejeição, Tempo Médio na Sessão, Abandono de Checkout e Scroll Depth. Indicam qualidade da landing page e sintonia com o criativo do anúncio. Fonte: Google Analytics.",
    "Frequência do Anúncio": "Gauge que mostra a frequência média com que o mesmo usuário vê o anúncio. Cálculo: Impressões ÷ Alcance. Zona verde ≤ 2.5, amarela 2.5–3.5, vermelha > 3.5 (fadiga criativa). Fonte: Meta Ads Manager.",
    "Mapa de Calor — Conversões por Hora × Dia": "Grid 7 dias × 24 horas mostrando concentração de conversões. Revela horários e dias com maior performance para decisões de dayparting e bid scheduling. Fonte: Google Ads + Meta Ads — breakdown por hora.",
    "Sessões por Canal — Mensal": "Comparação mensal de sessões por canal: Pago, Orgânico, Direto, Social e Email. Barras agrupadas permitem visualizar a evolução de cada canal individualmente. Fonte: Google Analytics — Aquisição.",
    "Top Keywords Orgânicas": "Ranking das palavras-chave orgânicas com melhor performance. Métricas: Posição no Google, Volume de busca, Cliques e CTR. Identifica oportunidades de SEO e gaps a cobrir com ads. Fonte: Google Search Console.",
    "Conversões: Pago vs Orgânico": "Comparação mensal de conversões entre tráfego pago e orgânico. Quando orgânico supera o pago, indica maturidade do SEO e possibilidade de reduzir ad spend. Fonte: Google Analytics — Conversões por canal.",
    "Evolução Impressões Orgânicas": "Evolução mensal de impressões e cliques orgânicos no Google. A área preenchida mostra o volume de impressões e a linha tracejada os cliques. Fonte: Google Search Console — Performance.",
    "Novos Usuários por Canal": "Distribuição de novos usuários por canal de aquisição (Orgânico, Pago, Direto, Social, Email, Referral). Hover mostra o valor absoluto de cada canal. Fonte: Google Analytics — Novos usuários.",
    "Curva de Retenção de Vídeo": "Curva que mostra o percentual de espectadores retidos a cada segundo do vídeo. O marcador de 3s indica o Hook Score (retenção nos primeiros 3 segundos). Gradiente verde→amarelo→vermelho indica zonas de perda. Fonte: Instagram Insights — Retenção de Reels.",
    "Share Rate por Conteúdo": "Taxa de compartilhamento por tipo de conteúdo. Cálculo: Shares ÷ Alcance × 100. A linha META 1% indica o benchmark ideal. Conteúdos acima da meta têm potencial viral. Fonte: Instagram Insights — Compartilhamentos.",
    "Funil de Stories — Sequência": "Funil de retenção da sequência de Stories. Mostra quantos usuários assistiram cada story e o drop-off entre eles. Métricas de interação: Avançar, Voltar, Saídas e Cliques no Link. Fonte: Instagram Insights — Stories.",
    "Origem do Alcance": "Distribuição do alcance por origem: Feed Seguidores, Explorar, Hashtags, Perfil + Stories e Outros. Hover mostra o valor de cada fonte. Indica quais canais de descoberta são mais eficazes. Fonte: Instagram Insights — Alcance.",
    "Crescimento Líquido de Seguidores": "Novos seguidores vs perdas (unfollows) por semana. Cálculo do crescimento líquido: Novos − Perdas. Barras verdes = ganho, vermelhas = perda. Fonte: Instagram Insights — Seguidores.",
    "Análise de Sentimento": "Classificação dos comentários e menções em Positivo, Neutro/Dúvida e Negativo. Inclui Taxa de Resposta e Tempo Médio de Resposta da equipe. Fonte: Análise de NLP sobre comentários do Instagram.",
    "Conversão Perfil → Follow": "Funil de conversão do perfil: Visitas ao Perfil → Novos Seguidores. Cálculo: Follows ÷ Visitas × 100. Taxa acima de 10% indica bio e conteúdo alinhados com o público-alvo. Fonte: Instagram Insights — Perfil.",
    "Faixa Etária": "Distribuição demográfica por faixa etária do público que interage com o perfil. Dados extraídos do Instagram Insights — Público.",
    "Sexo": "Distribuição por gênero do público que interage com o perfil. Dados extraídos do Instagram Insights — Público.",
    "Stories em Tempo Real": "Monitoramento dos Stories ativos com métricas de visualizações, curtidas, reações e compartilhamentos. Inclui resultados de interações (enquetes, quizzes, sliders, countdowns). Fonte: Instagram Stories API — Tempo Real.",
  };

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => { setPortalRoot(document.body); }, []);

  const InfoTip = ({ title }: { title: string }) => {
    const tip = cardTooltips[title];
    const [show, setShow] = useState(false);
    const iconRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    if (!tip) return null;

    const handleEnter = () => {
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        let left = rect.left;
        if (left + 288 > window.innerWidth) left = window.innerWidth - 300;
        if (left < 12) left = 12;
        setPos({ top: rect.top - 10, left });
      }
      setShow(true);
    };

    return (
      <div
        ref={iconRef}
        className="cursor-help inline-flex ml-2 align-middle"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${show ? "text-slate-300" : "text-slate-500/40"}`}>
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
        </svg>
        {show && portalRoot && createPortal(
          <div
            className="fixed w-72 p-3 rounded-lg border border-white/10 text-left"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translateY(-100%)",
              background: "rgba(8,10,18,0.97)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
              zIndex: 99999,
              pointerEvents: "none",
            }}
          >
            <p className="text-[11px] text-slate-300/90 leading-[1.6] font-normal normal-case tracking-normal">{tip}</p>
            <div className="absolute -bottom-[5px] left-3 w-2.5 h-2.5 rotate-45 border-r border-b border-white/10" style={{ background: "rgba(8,10,18,0.97)" }} />
          </div>,
          portalRoot
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      {/* Background layers – fixed */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <div className="h-[120vh] w-[120vh] rounded-full"
          style={{ background: "rgba(255, 177, 23, 0.15)", filter: "blur(120px)", animation: "orbPulse 5s ease-in-out infinite" }} />
      </div>
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <Image
          src="/seu_elias_logo_upscaled 1.png"
          alt=""
          fill
          className="opacity-[0.04] select-none object-contain p-8"
          draggable={false}
        />
      </div>

      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 fixed top-0 left-0 right-0"
        style={{
          ...glassStyle,
          zIndex: 30,
          animation: "animationIn 0.8s ease-out 0.1s both",
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/escolha")}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Dashboard Marketing</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Resumo de Anúncios Multicanal</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Filter dropdowns */}
          <div className="flex items-center gap-0 bg-black border border-white/5 rounded-lg overflow-visible">
            {/* Estratégia */}
            <div ref={estrategiaRef} className="relative">
              <button
                onClick={() => setShowEstrategia(!showEstrategia)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                <span>Estratégia: <span className="text-white font-semibold">{estrategia.length > 12 ? estrategia.slice(0, 12) + "..." : estrategia}</span></span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showEstrategia && (
                <div className="absolute top-full left-0 mt-2 w-52 rounded-lg border border-white/10 py-2 z-[9999]" style={{ background: "rgba(8,10,18,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                  <p className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estratégia ({estrategias.indexOf(estrategia as typeof estrategias[number]) + 1})</p>
                  {estrategias.map((e) => (
                    <button
                      key={e}
                      onClick={() => { setEstrategia(e); setShowEstrategia(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${estrategia === e ? "text-white" : "text-slate-400"}`}
                    >
                      {estrategia === e ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-400"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : <span className="w-[14px]" />}
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5">
            <button
              onClick={() => setMainTab("pago")}
              className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-md transition-all ${
                mainTab === "pago"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "text-slate-500 hover:text-slate-400 border border-transparent"
              }`}
            >
              Tráfego Pago
            </button>
            <button
              onClick={() => setMainTab("organico")}
              className={`text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-md transition-all ${
                mainTab === "organico"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "text-slate-500 hover:text-slate-400 border border-transparent"
              }`}
            >
              Tráfego Orgânico
            </button>
          </div>
          <div className="flex items-center gap-2 bg-black border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
            <span>{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 bg-black border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative px-6 pt-40 pb-28 space-y-6 text-slate-100">

        {/* ════════════════ TRÁFEGO PAGO ════════════════ */}
        {mainTab === "pago" && (<>

        {(() => {
          const net = networkData[socialNetwork];
          return (<>

        {/* ── Health Score ── */}
        <div
          className="glass-panel rounded-2xl p-6"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.1s both", overflow: "visible" }}
        >
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span className="text-amber-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Score de Saúde da Conta<InfoTip title="Score de Saúde da Conta" /></h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10" style={{ overflow: "visible" }}>
            {net.healthScore.map((h, hi) => {
              const color = h.status === "good" ? "emerald" : h.status === "warn" ? "amber" : "rose";
              const isLeft = hi <= 1;
              const isRight = hi >= 3;
              return (
                <div
                  key={h.label}
                  className={`text-center p-4 rounded-xl border transition-all hover:scale-[1.02] hover:z-50 relative group/health`}
                  style={{
                    background: `rgba(${color === "emerald" ? "45,230,160" : color === "amber" ? "245,166,35" : "255,92,122"},0.06)`,
                    borderColor: `rgba(${color === "emerald" ? "45,230,160" : color === "amber" ? "245,166,35" : "255,92,122"},0.15)`,
                  }}
                >
                  {/* Info icon */}
                  <div className="absolute bottom-2.5 right-2.5 cursor-help group/tip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500/40 group-hover/tip:text-slate-300 transition-colors">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                    </svg>
                    {/* Tooltip */}
                    <div
                      className={`absolute bottom-full mb-3 w-64 p-3 rounded-lg border border-white/10 text-left opacity-0 scale-95 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:pointer-events-auto transition-all duration-200 origin-bottom z-[100] ${isRight ? "right-0" : isLeft ? "left-0" : "left-1/2 -translate-x-1/2"}`}
                      style={{ background: "rgba(8,10,18,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}
                    >
                      <p className="text-[11px] text-slate-300/90 leading-[1.6] font-normal normal-case tracking-normal">{h.tooltip}</p>
                      <div className={`absolute -bottom-[5px] w-2.5 h-2.5 rotate-45 border-r border-b border-white/10 ${isRight ? "right-2" : isLeft ? "left-2" : "left-1/2 -translate-x-1/2"}`} style={{ background: "rgba(8,10,18,0.97)" }} />
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${color === "emerald" ? "text-emerald-400" : color === "amber" ? "text-amber-400" : "text-rose-400"}`}>{h.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{h.label}</p>
                  <div className={`size-2 rounded-full mx-auto mt-2 ${color === "emerald" ? "bg-emerald-400" : color === "amber" ? "bg-amber-400" : "bg-rose-400"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {net.kpis.map((kpi, idx) => (
            <div
              key={kpi.label}
              className="glass-panel p-5 rounded-2xl cursor-default"
              style={{ ...glassStyle, animation: `animationIn 0.8s ease-out ${0.2 + idx * 0.05}s both` }}
            >
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-500/0 group-hover:bg-amber-500/5 rounded-full blur-[40px] pointer-events-none transition-all duration-500" />
              <div className="flex items-center justify-between mb-1 relative z-10">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                <div className="text-amber-400/60">{kpiIcons[kpi.icon]}</div>
              </div>
              <p className="text-2xl font-bold text-amber-400 relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{kpi.value}</p>
              <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold relative z-10 ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                {kpi.up ? <ArrowUp /> : <ArrowDown />}
                {kpi.delta} vs mês ant.
              </div>
            </div>
          ))}
        </div>

        {/* ── Funil + Melhores Anúncios Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Funil de Conversão (col-span-5) */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.25s both" }}
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Funil de Conversão<InfoTip title="Funil de Conversão" /></h3>
            </div>

            {/* Funnel stages – centered with side metrics between bars */}
            <div className="relative z-10">
              {(() => {
                const stages = net.funnelStages;
                const betweenMetrics = net.funnelBetween;

                const renderMetric = (m: { k: string; v: string; d: string; up: boolean }, align: "left" | "right") => (
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{m.k}</p>
                    <p className="text-sm font-bold text-white leading-tight">{m.v}</p>
                    <p className={`text-[9px] font-bold flex items-center ${align === "right" ? "justify-end" : ""} gap-0.5 ${m.up ? "text-emerald-400" : "text-rose-400"}`}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        {m.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                      </svg>
                      {m.d}
                    </p>
                  </div>
                );

                const renderBar = (stage: typeof stages[number]) => (
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-default py-1.5 ${stage.highlight ? "border border-amber-400/30" : "border border-white/[0.06]"}`}
                      style={{
                        width: `${stage.w}%`,
                        background: stage.highlight
                          ? "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = stage.highlight
                          ? "linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.10) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)";
                        if (stage.highlight) e.currentTarget.style.boxShadow = "0 0 20px rgba(251,191,36,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = stage.highlight
                          ? "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.05) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span className={`text-[10px] font-medium ${stage.highlight ? "text-amber-400" : "text-slate-400"}`}>{stage.label}</span>
                      <span className="text-2xl font-bold text-white leading-tight">{stage.count}</span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${stage.up ? "text-emerald-400" : "text-rose-400"}`}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          {stage.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                        </svg>
                        {stage.delta}
                      </span>
                    </div>
                  </div>
                );

                return stages.map((stage, i) => (
                  <div key={stage.label}>
                    {renderBar(stage)}

                    {/* Between-bars zone: dotted connector + side metrics */}
                    {i < stages.length - 1 && (
                      <div className="flex items-center -my-2">
                        {/* Left metric */}
                        <div className="flex-1 min-w-0 pr-10 text-right">
                          {renderMetric(betweenMetrics[i].left, "right")}
                        </div>
                        {/* Dotted connector */}
                        <div className="flex-shrink-0 flex justify-center" style={{ width: `${(stage.w + stages[i + 1].w) / 2}%` }}>
                          <div className="w-px h-1.5 border-l border-dashed border-white/10" />
                        </div>
                        {/* Right metric */}
                        <div className="flex-1 min-w-0 pl-10">
                          {renderMetric(betweenMetrics[i].right, "left")}
                        </div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* ── Melhores Anúncios – Horizontal Reels Carousel (col-span-7) ── */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl p-6 flex flex-col"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.3s both" }}
          >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span className="text-amber-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Melhores Anúncios<InfoTip title="Melhores Anúncios" /></h3>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 custom-scrollbar relative z-10 snap-x snap-mandatory flex-1 min-h-0">
            {net.ads.map((ad) => (
              <div
                key={ad.name}
                className="flex-shrink-0 w-64 rounded-xl border border-white/5 overflow-hidden cursor-pointer hover:border-amber-500/20 transition-all duration-300 group/reel snap-start flex flex-col"
                style={{ background: "rgba(255,255,255,0.02)" }}
                onClick={() => setSelectedAd(ad)}
              >
                {/* Cover image */}
                <div className="relative flex-1 min-h-[200px] overflow-hidden">
                  <Image
                    src={ad.cover}
                    alt={ad.name}
                    fill
                    className="object-cover group-hover/reel:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-sm ${
                      ad.status === "ATIVO"
                        ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                        : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                  {ad.type.includes("Video") && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover/reel:bg-white/20 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-bold text-white truncate mb-1.5">{ad.name}</p>
                    <p className="text-[10px] text-slate-400">{ad.type}</p>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                      <span className="text-[10px] font-bold text-white">{ad.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-400/60" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      <span className="text-[10px] font-bold text-white">{ad.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                      <span className="text-[10px] font-bold text-white">{ad.comments}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                      <span className="text-[10px] font-bold text-white">{ad.reach}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className={`text-xs font-bold ${ad.roasGood ? "text-emerald-400" : "text-slate-500"}`}>ROAS {ad.roas}</span>
                    <span className="text-[10px] text-slate-500">CPC {ad.cpc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>

        {/* ── Engajamento + Evolution Chart Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Engajamento por Público */}
          <div
            className="lg:col-span-4 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.3s both" }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Engajamento por Público<InfoTip title="Engajamento por Público" /></h3>
            </div>
            <div className="relative flex justify-center items-center py-4 z-10" onMouseLeave={() => setHoveredEngagement(null)}>
              <svg className="size-40" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="engAmber" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="engEmerald" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0.6" />
                  </linearGradient>
                  <filter id="engGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                {(() => {
                  const r = 70;
                  const circ = 2 * Math.PI * r;
                  const gap = 8;
                  const usable = circ - gap * net.engagement.length;
                  let off = -circ / 4;
                  return net.engagement.map((e, idx) => {
                    const len = (e.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gap;
                    const isHov = hoveredEngagement === e.label;
                    const isDim = hoveredEngagement && !isHov;
                    const segColor = e.color;
                    return (
                      <g key={e.label}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={segColor} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="round" opacity="0.2" filter="url(#engGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={segColor} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="round" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredEngagement(e.label)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              {hoveredEngagement && (() => {
                const e = net.engagement.find((x) => x.label === hoveredEngagement)!;
                return (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                    <div className="rounded-xl border border-white/10 px-4 py-3 whitespace-nowrap" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                      <p className="text-xs font-bold text-white mb-2">{e.label}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-[10px] text-slate-400">CTR</span>
                          <span className="text-xs font-bold text-amber-400">{e.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-[10px] text-slate-400">Impressões</span>
                          <span className="text-xs font-bold text-white">{e.impressoes}</span>
                        </div>
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-[10px] text-slate-400">Cliques</span>
                          <span className="text-xs font-bold text-slate-300">{e.cliques}</span>
                        </div>
                        <div className="flex items-center justify-between gap-5">
                          <span className="text-[10px] text-slate-400">Conversões</span>
                          <span className="text-xs font-bold text-emerald-400">{e.conversoes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 relative z-10">
              {net.engagement.map((e) => (
                <div key={e.label} className="text-center cursor-default" onMouseEnter={() => setHoveredEngagement(e.label)} onMouseLeave={() => setHoveredEngagement(null)}>
                  <p className="text-xs text-slate-400 mb-1">{e.label}</p>
                  <p className="font-bold text-amber-400 text-base">{e.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evolution Chart */}
          <div
            className="lg:col-span-8 glass-panel rounded-2xl p-6 pb-10"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.35s both" }}
          >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Evolução Temporal<InfoTip title="Evolução Temporal" /></h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-semibold text-slate-300">Impressões</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold text-slate-300">Cliques</span>
              </div>
            </div>
          </div>
          <div className="relative h-48 w-full z-10" onMouseLeave={() => setHoveredEvolution(null)}>
            {(() => {
              const maxImp = Math.max(...net.evolutionData.map((d) => d.impressoes));
              const maxClk = Math.max(...net.evolutionData.map((d) => d.cliques));
              const pad = 20;
              const w = 1000;
              const h = 200;
              const impPts = net.evolutionData.map((d, i) => ({
                x: pad + (i / (net.evolutionData.length - 1)) * (w - pad * 2),
                y: h - pad - ((d.impressoes / maxImp) * (h - pad * 2)),
              }));
              const clkPts = net.evolutionData.map((d, i) => ({
                x: pad + (i / (net.evolutionData.length - 1)) * (w - pad * 2),
                y: h - pad - ((d.cliques / maxClk) * (h - pad * 2 - 40) + 40),
              }));
              // Smooth bezier curve helper
              const smoothLine = (pts: {x:number;y:number}[]) => {
                if (pts.length < 2) return "";
                let d = `M${pts[0].x},${pts[0].y}`;
                for (let i = 0; i < pts.length - 1; i++) {
                  const p0 = pts[Math.max(i - 1, 0)];
                  const p1 = pts[i];
                  const p2 = pts[i + 1];
                  const p3 = pts[Math.min(i + 2, pts.length - 1)];
                  const tension = 0.35;
                  const cp1x = p1.x + (p2.x - p0.x) * tension;
                  const cp1y = p1.y + (p2.y - p0.y) * tension;
                  const cp2x = p2.x - (p3.x - p1.x) * tension;
                  const cp2y = p2.y - (p3.y - p1.y) * tension;
                  d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                }
                return d;
              };
              const impLine = smoothLine(impPts);
              const impArea = `${impLine} L${impPts[impPts.length - 1].x},${h} L${impPts[0].x},${h} Z`;
              const clkLine = smoothLine(clkPts);
              const colW = (w - pad * 2) / net.evolutionData.length;
              return (
                <>
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${w} ${h}`}>
                    <defs>
                      <linearGradient id="impAreaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(251,191,36,1)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="rgba(251,191,36,1)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="impLineGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="rgba(251,191,36,0.6)" />
                        <stop offset="50%" stopColor="rgba(251,191,36,1)" />
                        <stop offset="100%" stopColor="rgba(245,158,11,0.8)" />
                      </linearGradient>
                      <clipPath id="chartReveal">
                        <rect x="0" y="0" width={w} height={h}>
                          <animate attributeName="width" from="0" to={w} dur="1.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" begin="0.5s" />
                        </rect>
                      </clipPath>
                    </defs>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                      <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    ))}
                    {/* Animated chart group */}
                    <g clipPath="url(#chartReveal)">
                      {/* Impressões area + line */}
                      <path d={impArea} fill="url(#impAreaGrad)" />
                      <path d={impLine} fill="none" stroke="url(#impLineGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                      {/* Cliques line */}
                      <path d={clkLine} fill="none" stroke="rgba(148,163,184,0.4)" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      {/* Dots */}
                      {net.evolutionData.map((_, i) => (
                        <g key={`dots-${i}`}>
                          {hoveredEvolution === i && (
                            <circle cx={impPts[i].x} cy={impPts[i].y} r="12" fill="rgba(251,191,36,0.15)" />
                          )}
                          <circle cx={impPts[i].x} cy={impPts[i].y} r={hoveredEvolution === i ? 5 : 3} fill={hoveredEvolution === i ? "#fbbf24" : "rgba(251,191,36,0.8)"} stroke={hoveredEvolution === i ? "rgba(0,0,0,0.4)" : "none"} strokeWidth="2" style={{ transition: "all 0.2s ease" }} />
                          <circle cx={clkPts[i].x} cy={clkPts[i].y} r={hoveredEvolution === i ? 4 : 2.5} fill={hoveredEvolution === i ? "rgba(148,163,184,0.8)" : "rgba(148,163,184,0.4)"} stroke={hoveredEvolution === i ? "rgba(0,0,0,0.3)" : "none"} strokeWidth="1.5" style={{ transition: "all 0.2s ease" }} />
                        </g>
                      ))}
                    </g>
                    {/* Hover columns (outside clip so they work during animation) */}
                    {net.evolutionData.map((_, i) => (
                      <g key={`hover-${i}`}>
                        <rect x={impPts[i].x - colW / 2} y={0} width={colW} height={h} fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredEvolution(i)} />
                        {hoveredEvolution === i && (
                          <line x1={impPts[i].x} x2={impPts[i].x} y1={pad} y2={h - pad} stroke="rgba(251,191,36,0.3)" strokeWidth="1" strokeDasharray="4,4" />
                        )}
                      </g>
                    ))}
                  </svg>
                  {/* Tooltip */}
                  {hoveredEvolution !== null && (() => {
                    const d = net.evolutionData[hoveredEvolution];
                    const xPct = (impPts[hoveredEvolution].x / w) * 100;
                    return (
                      <div className="absolute top-0 pointer-events-none z-30" style={{ left: `${xPct}%`, transform: "translateX(-50%)" }}>
                        <div className="rounded-xl border border-white/10 px-4 py-3 whitespace-nowrap" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                          <p className="text-xs font-bold text-white mb-2">{d.date}</p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-5">
                              <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-full bg-amber-400" />
                                <span className="text-[10px] text-slate-400">Impressões</span>
                              </div>
                              <span className="text-xs font-bold text-amber-400">{d.impressoes.toLocaleString("pt-BR")}</span>
                            </div>
                            <div className="flex items-center justify-between gap-5">
                              <div className="flex items-center gap-1.5">
                                <div className="size-2 rounded-full bg-slate-400" />
                                <span className="text-[10px] text-slate-400">Cliques</span>
                              </div>
                              <span className="text-xs font-bold text-slate-300">{d.cliques.toLocaleString("pt-BR")}</span>
                            </div>
                            <div className="border-t border-white/5 pt-1.5 mt-1.5 flex items-center justify-between gap-5">
                              <span className="text-[10px] text-slate-500">CPC</span>
                              <span className="text-xs font-bold text-white">{d.cpc}</span>
                            </div>
                            <div className="flex items-center justify-between gap-5">
                              <span className="text-[10px] text-slate-500">CTR</span>
                              <span className="text-xs font-bold text-emerald-400">{d.ctr}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
            <div className="flex justify-between mt-3 mb-4 px-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              {net.evolutionData.map((d) => <span key={d.date}>{d.date}</span>)}
            </div>
          </div>
        </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Investimento vs Retorno por Campanha */}
          <div
            className="lg:col-span-8 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.4s both" }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Investimento vs Retorno por Campanha<InfoTip title="Investimento vs Retorno por Campanha" /></h3>
            </div>
            <div className="space-y-6 relative z-10">
              {net.campaigns.map((c, i) => (
                <div key={c.name} className="space-y-2 group/bar cursor-pointer">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-emerald-400">{c.returned} retornado</span>
                  </div>
                  <div className="relative h-3.5 rounded-full overflow-hidden bg-white/[0.04] ring-1 ring-white/5">
                    {/* Invest bar */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 group-hover/bar:brightness-110 overflow-hidden animate-bar-enter"
                      style={{
                        width: `${c.investPct}%`,
                        background: "linear-gradient(90deg, rgb(180,120,0), rgb(251,191,36))",
                        boxShadow: "0 0 15px rgba(251,191,36,0.2)",
                        transformOrigin: "left",
                        animationDelay: `${i * 120}ms`,
                      }}
                    >
                      <div className="particles-wrapper-h">
                        <i className="particle" /><i className="particle" /><i className="particle" />
                      </div>
                    </div>
                    {/* Return bar */}
                    <div
                      className="absolute top-0 h-full rounded-r-full transition-all duration-500 overflow-hidden"
                      style={{
                        left: `${c.investPct}%`,
                        width: `${c.returnPct}%`,
                        background: "linear-gradient(90deg, rgba(52,211,153,0.5), rgba(5,150,105,0.7))",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Gasto: <span className="text-rose-400 font-semibold">{c.spent}</span></span>
                    <span className="text-slate-400">ROAS: <span className="text-white font-semibold">{c.roas}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canal / Dispositivo + Métricas de Página */}
          <div
            className="lg:col-span-4 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.45s both" }}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5 mb-5 relative z-10">
              <button
                onClick={() => setChannelTab("metricas")}
                className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all ${
                  channelTab === "metricas"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-slate-500 hover:text-slate-400 border border-transparent"
                }`}
              >
                Métricas de Página
              </button>
              <button
                onClick={() => setChannelTab("canal")}
                className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all ${
                  channelTab === "canal"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-slate-500 hover:text-slate-400 border border-transparent"
                }`}
              >
                Canal / Dispositivo
              </button>
            </div>

            {/* Canal / Dispositivo content */}
            {channelTab === "canal" && (
              <>
                <div className="relative flex justify-center items-center py-6 z-10" onMouseLeave={() => setHoveredChannel(null)}>
                  {/* Donut via arc paths with gaps */}
                  <svg className="size-48" viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="donutAmber" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="rgb(217,119,6)" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="donutEmerald" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0.6" />
                      </linearGradient>
                      <linearGradient id="donutSlate" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgb(148,163,184)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="rgb(100,116,139)" stopOpacity="0.4" />
                      </linearGradient>
                      <filter id="donutGlow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                    {/* Background track */}
                    <circle cx="100" cy="100" r="75" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                    {(() => {
                      const r = 75;
                      const circ = 2 * Math.PI * r;
                      const gap = 8;
                      const gradIds = ["url(#donutAmber)", "url(#donutEmerald)", "url(#donutSlate)"];
                      const segs = [
                        { name: "Mobile App", pct: 70, color: gradIds[0] },
                        { name: "Desktop Web", pct: 25, color: gradIds[1] },
                        { name: "Outros", pct: 5, color: gradIds[2] },
                      ];
                      const totalGap = gap * segs.length;
                      const usable = circ - totalGap;
                      let offset = -circ / 4;
                      return segs.map((s) => {
                        const len = (s.pct / 100) * usable;
                        const dash = `${len} ${circ - len}`;
                        const thisOffset = offset;
                        offset += len + gap;
                        const isHovered = hoveredChannel === s.name;
                        const isDimmed = hoveredChannel && !isHovered;
                        return (
                          <g key={s.name}>
                            {/* Glow layer */}
                            {isHovered && (
                              <circle
                                cx="100" cy="100" r={r} fill="transparent"
                                stroke={s.color} strokeWidth={24}
                                strokeDasharray={dash} strokeDashoffset={-thisOffset}
                                strokeLinecap="round" opacity="0.2"
                                filter="url(#donutGlow)"
                              />
                            )}
                            {/* Visible arc */}
                            <circle
                              cx="100" cy="100" r={r} fill="transparent"
                              stroke={s.color} strokeWidth={isHovered ? 22 : 16}
                              strokeDasharray={dash} strokeDashoffset={-thisOffset}
                              strokeLinecap="round"
                              style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDimmed ? 0.2 : 1 }}
                            />
                            {/* Hit area */}
                            <circle
                              cx="100" cy="100" r={r} fill="transparent"
                              stroke="transparent" strokeWidth="30"
                              strokeDasharray={dash} strokeDashoffset={-thisOffset}
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredChannel(s.name)}
                            />
                          </g>
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute text-center pointer-events-none">
                    <p className="text-2xl font-bold text-white">1.2k</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Total</p>
                  </div>
                  {/* Tooltip over donut */}
                  {hoveredChannel && (() => {
                    const ch = channels.find((c) => c.name === hoveredChannel)!;
                    return (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                        <div className="rounded-xl border border-white/10 px-4 py-3 whitespace-nowrap" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                          <p className="text-xs font-bold text-white">{ch.name}</p>
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="text-sm font-bold text-amber-400">{ch.value} conversões</span>
                            <span className="text-xs text-slate-400">({ch.pct}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="mt-4 space-y-3 relative z-10">
                  {channels.map((ch) => (
                    <div key={ch.name} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHoveredChannel(ch.name)} onMouseLeave={() => setHoveredChannel(null)}>
                      <div className="flex items-center gap-2">
                        <div className={`size-2.5 rounded-full ${ch.color}`} />
                        <span className="text-slate-400 text-xs">{ch.name}</span>
                      </div>
                      <span className="font-bold text-white text-xs">{ch.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Métricas de Página content */}
            {channelTab === "metricas" && (() => {
              const pageMetrics = [
                { label: "PageViews", value: 48520, pct: 100 },
                { label: "Checkout", value: 3890, pct: 8.0 },
                { label: "Compras", value: 1240, pct: 2.6 },
              ];
              const maxVal = pageMetrics[0].value;
              const tooltips: Record<string, { lines: { label: string; value: string; color: string }[] }> = {
                PageViews: { lines: [
                  { label: "→ Checkout", value: "8.0%", color: "text-amber-400" },
                  { label: "→ Compras", value: "2.6%", color: "text-white" },
                ]},
                Checkout: { lines: [
                  { label: "de PageViews →", value: "8.0%", color: "text-amber-400" },
                  { label: "→ Compras", value: "31.9%", color: "text-emerald-400" },
                ]},
                Compras: { lines: [
                  { label: "de PageViews →", value: "2.6%", color: "text-white" },
                  { label: "de Checkout →", value: "31.9%", color: "text-emerald-400" },
                ]},
              };
              return (
                <div className="relative z-10">
                  {/* Bars */}
                  <div className="flex items-end justify-center gap-3">
                    {pageMetrics.map((m, i) => {
                      const barH = Math.max(Math.round((m.value / maxVal) * 200), 28);
                      return (
                        <div key={m.label} className="flex flex-col items-center flex-1 group relative">
                          {/* Value above bar */}
                          <p className="text-sm font-bold text-white mb-2">{m.value.toLocaleString("pt-BR")}</p>
                          {/* Bar */}
                          <div
                            className="w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 relative overflow-hidden animate-bar-enter"
                            style={{ height: `${barH}px`, animationDelay: `${i * 0.15}s` }}
                          >
                            <div className="particles-wrapper">
                              {[0, 1, 2, 3, 4].map((p) => (
                                <div key={p} className="particle" style={{ animationDelay: `${i * 0.6 + p * 0.4}s` }} />
                              ))}
                            </div>
                          </div>
                          {/* Label */}
                          <p className="text-[10px] text-slate-400 font-medium mt-2">{m.label}</p>

                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-30">
                            <div className="rounded-xl border border-white/10 px-5 py-4 whitespace-nowrap" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                              <p className="text-sm font-bold text-white mb-3">{m.label}</p>
                              <div className="space-y-2">
                                {tooltips[m.label].lines.map((l) => (
                                  <div key={l.label} className="flex items-center justify-between gap-6">
                                    <span className="text-xs text-slate-400">{l.label}</span>
                                    <span className={`text-sm font-bold ${l.color}`}>{l.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Budget Pace ── */}
        <div
          className="glass-panel rounded-2xl p-6"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.5s both" }}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <span className="text-amber-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Budget Pace por Campanha<InfoTip title="Budget Pace por Campanha" /></h3>
          </div>
          <div className="space-y-5 relative z-10">
            {net.budgetPace.map((b, i) => {
              const gradients = {
                ok: "linear-gradient(90deg, rgb(6,120,80), rgb(52,211,153))",
                over: "linear-gradient(90deg, rgb(180,40,60), rgb(251,113,133))",
                under: "linear-gradient(90deg, rgb(30,80,180), rgb(96,165,250))",
              };
              const shadows = {
                ok: "0 0 15px rgba(52,211,153,0.2)",
                over: "0 0 15px rgba(251,113,133,0.2)",
                under: "0 0 15px rgba(96,165,250,0.2)",
              };
              return (
                <div key={b.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">{b.name}</span>
                    <span className={`text-xs font-bold ${b.status === "ok" ? "text-emerald-400" : b.status === "over" ? "text-rose-400" : "text-blue-400"}`}>{b.amount}</span>
                  </div>
                  <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5 relative">
                    <div
                      className="h-full rounded-full relative overflow-hidden animate-bar-enter"
                      style={{
                        width: `${Math.min(b.used, 100)}%`,
                        background: gradients[b.status],
                        boxShadow: shadows[b.status],
                        transformOrigin: "left",
                        animationDelay: `${i * 100}ms`,
                      }}
                    >
                      <div className="particles-wrapper-h">
                        <i className="particle" /><i className="particle" /><i className="particle" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── On-site Behavior ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div
            className="lg:col-span-6 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.55s both" }}
          >
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Comportamento On-site<InfoTip title="Comportamento On-site" /></h3>
            </div>
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="rounded-xl p-4 border border-white/5 ring-1 ring-white/[0.03]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Bounce Rate</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1.5"><span className="text-slate-300 font-medium">Pago</span><span className="text-rose-400 font-bold">68%</span></div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
                      <div className="h-full rounded-full relative overflow-hidden" style={{ width: "68%", background: "linear-gradient(90deg, rgb(180,40,60), rgb(251,113,133))", boxShadow: "0 0 12px rgba(251,113,133,0.2)" }}>
                        <div className="particles-wrapper-h"><i className="particle" /><i className="particle" /><i className="particle" /></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1.5"><span className="text-slate-300 font-medium">Orgânico</span><span className="text-emerald-400 font-bold">42%</span></div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
                      <div className="h-full rounded-full relative overflow-hidden" style={{ width: "42%", background: "linear-gradient(90deg, rgb(6,120,80), rgb(52,211,153))", boxShadow: "0 0 12px rgba(52,211,153,0.2)" }}>
                        <div className="particles-wrapper-h"><i className="particle" /><i className="particle" /><i className="particle" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-4 border border-white/5 ring-1 ring-white/[0.03]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Tempo Médio</p>
                <p className="text-2xl font-bold text-amber-400">2m 34s</p>
                <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-0.5"><ArrowUp /> +12.3% vs mês ant.</p>
              </div>
              <div className="rounded-xl p-4 border border-white/5 ring-1 ring-white/[0.03]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Abandono Checkout</p>
                <p className="text-2xl font-bold text-rose-400">67.8%</p>
                <p className="text-[10px] text-rose-400 font-bold mt-1 flex items-center gap-0.5"><ArrowDown /> +3.2% vs mês ant.</p>
              </div>
              <div className="rounded-xl p-4 border border-white/5 ring-1 ring-white/[0.03]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">Scroll Depth</p>
                <p className="text-lg font-bold text-white mb-2">64%</p>
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
                  <div className="h-full rounded-full relative overflow-hidden" style={{ width: "64%", background: "linear-gradient(90deg, rgb(180,120,0), rgb(251,191,36))", boxShadow: "0 0 12px rgba(251,191,36,0.2)" }}>
                    <div className="particles-wrapper-h"><i className="particle" /><i className="particle" /><i className="particle" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Ad Frequency Gauge ── */}
          {(() => {
            const cx = 140, cy = 130, r = 100, sw = 14;
            const startAngle = Math.PI;
            const gapRad = (4 * Math.PI) / 180;
            const zones = [
              { frac: 0.50, color: "rgba(52,211,153,0.7)" },
              { frac: 0.20, color: "rgba(251,191,36,0.7)" },
              { frac: 0.30, color: "rgba(255,92,122,0.6)" },
            ];
            const totalArc = Math.PI;
            const usableArc = totalArc - gapRad * (zones.length - 1);
            const arcPoint = (angle: number) => ({ x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) });

            const realValue = 2.1;
            const maxValue = 5.0;
            const needleLen = r - 18;
            const realAngle = startAngle - (realValue / maxValue) * totalArc;

            // Current needle position from animated state
            const tipX = cx + needleLen * Math.cos(gaugeAngle);
            const tipY = cy - needleLen * Math.sin(gaugeAngle);
            const tailX = cx - 8 * Math.cos(gaugeAngle);
            const tailY = cy + 8 * Math.sin(gaugeAngle);

            let cur = startAngle;
            const arcs = zones.map((z, i) => {
              const sweep = z.frac * usableArc;
              const a1 = cur;
              const a2 = a1 - sweep;
              cur = a2 - (i < zones.length - 1 ? gapRad : 0);
              const p1 = arcPoint(a1);
              const p2 = arcPoint(a2);
              return { d: `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`, color: z.color };
            });

            const labels = [
              { text: "0", angle: startAngle, color: "rgb(52,211,153)" },
              { text: "2.5", angle: startAngle - zones[0].frac * usableArc, color: "rgb(251,191,36)" },
              { text: "3.5", angle: startAngle - (zones[0].frac + zones[1].frac) * usableArc - gapRad, color: "rgb(255,92,122)" },
              { text: "5+", angle: 0, color: "rgb(255,92,122)" },
            ];

            const ticks = Array.from({ length: 21 }, (_, i) => {
              const frac = i / 20;
              const angle = startAngle - frac * totalArc;
              const isMajor = i % 5 === 0;
              const inner = r - sw / 2 - (isMajor ? 7 : 3);
              const outer = r - sw / 2 - 1;
              return {
                x1: cx + inner * Math.cos(angle), y1: cy - inner * Math.sin(angle),
                x2: cx + outer * Math.cos(angle), y2: cy - outer * Math.sin(angle),
                major: isMajor,
              };
            });

            return (
            <div
              className="lg:col-span-6 glass-panel rounded-2xl p-6 cursor-pointer"
              style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.55s both" }}
              onMouseEnter={() => animateGauge(realAngle)}
              onMouseLeave={() => animateGauge(gaugeRestAngle)}
            >
              <div className="flex items-center gap-2 mb-5 relative z-10">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Frequência do Anúncio<InfoTip title="Frequência do Anúncio" /></h3>
              </div>
              <div className="flex items-center justify-center py-6 relative z-10">
                <svg width="280" height="165" viewBox="0 0 280 165" style={{ overflow: "visible" }}>
                  <defs>
                    <filter id="ndlGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>
                  {/* Background track */}
                  <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
                  {/* Ticks */}
                  {ticks.map((t, i) => (
                    <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.major ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"} strokeWidth={t.major ? 1.5 : 0.75} />
                  ))}
                  {/* Zone arcs */}
                  {arcs.map((a, i) => (
                    <path key={i} d={a.d} fill="none" stroke={a.color} strokeWidth={sw} strokeLinecap="butt" />
                  ))}
                  {/* Value text */}
                  <text x={cx} y={cy - 36} textAnchor="middle" fill="white" fontSize="34" fontWeight="800" fontFamily="system-ui">{realValue}x</text>
                  <text x={cx} y={cy - 18} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="monospace" fontWeight="700" letterSpacing="2">FREQUÊNCIA</text>
                  {/* Labels */}
                  {labels.map((l) => {
                    const d = r + 20;
                    const p = { x: cx + d * Math.cos(l.angle), y: cy - d * Math.sin(l.angle) };
                    return <text key={l.text} x={p.x} y={p.y + 4} textAnchor="middle" fill={l.color} fontSize="12" fontFamily="monospace" fontWeight="800">{l.text}</text>;
                  })}
                  {/* Center cap (drawn before needle so needle is on top) */}
                  <circle cx={cx} cy={cy} r="8" fill="white" />
                  <circle cx={cx} cy={cy} r="3" fill="#111" />
                  {/* Needle – animated via requestAnimationFrame, drawn last */}
                  <line
                    x1={tailX} y1={tailY}
                    x2={tipX} y2={tipY}
                    stroke="white" strokeWidth="3.5" strokeLinecap="round"
                    filter="url(#ndlGlow)"
                  />
                </svg>
              </div>
              <div className="flex justify-center gap-6 relative z-10">
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">Saudável</span></div>
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-amber-400" /><span className="text-xs font-semibold text-slate-300">Atenção</span></div>
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-rose-400" /><span className="text-xs font-semibold text-slate-300">Fadiga</span></div>
              </div>
            </div>
            );
          })()}
        </div>

        {/* ── Heatmap Hora × Dia ── */}
        <div
          className="glass-panel rounded-2xl p-6"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.6s both", overflow: "visible" }}
        >
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span className="text-amber-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Mapa de Calor — Conversões por Hora × Dia<InfoTip title="Mapa de Calor — Conversões por Hora × Dia" /></h3>
          </div>
          <div className="relative z-10 overflow-x-auto overflow-y-visible" style={{ overflow: "visible" }} onMouseLeave={() => setHoveredHeat(null)}>
            <div className="min-w-[700px]">
              {/* Hours header */}
              <div className="flex mb-2">
                <div className="w-12 shrink-0" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center text-[9px] text-slate-400 font-mono font-bold">{String(i).padStart(2, "0")}h</div>
                ))}
              </div>
              {/* Rows */}
              {heatmapData.map((row) => (
                <div key={row.day} className="flex items-center mb-1">
                  <div className="w-12 shrink-0 text-[11px] text-slate-400 font-bold">{row.day}</div>
                  {row.hours.map((val, h) => (
                    <div
                      key={h}
                      className="flex-1 h-6 rounded-[3px] mx-[1px] cursor-pointer transition-all duration-150 hover:scale-y-125 hover:brightness-125"
                      style={{
                        background: `rgba(251,191,36,${val.toFixed(2)})`,
                        outline: hoveredHeat?.day === row.day && hoveredHeat?.hour === h ? "2px solid rgba(251,191,36,0.8)" : "none",
                        outlineOffset: "1px",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget.closest(".overflow-x-auto")!.getBoundingClientRect();
                        setHoveredHeat({ day: row.day, hour: h, val, x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top });
                      }}
                    />
                  ))}
                </div>
              ))}
              {/* Tooltip */}
              {hoveredHeat && (() => {
                const isTopRows = heatmapData.findIndex((r) => r.day === hoveredHeat.day) < 2;
                return (
                <div
                  className="absolute pointer-events-none z-40"
                  style={{
                    left: hoveredHeat.x,
                    top: isTopRows ? hoveredHeat.y + 32 : hoveredHeat.y - 8,
                    transform: isTopRows ? "translate(-50%, 0)" : "translate(-50%, -100%)",
                  }}
                >
                  <div className="rounded-xl border border-white/10 px-4 py-3 whitespace-nowrap" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                    <p className="text-xs font-bold text-white mb-1">{hoveredHeat.day} · {String(hoveredHeat.hour).padStart(2, "0")}:00h</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="size-2 rounded-full" style={{ background: `rgba(251,191,36,${hoveredHeat.val.toFixed(2)})` }} />
                        <span className="text-[10px] text-slate-400">Intensidade</span>
                      </div>
                      <span className="text-sm font-bold text-amber-400">{Math.round(hoveredHeat.val * 100)}%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">~{Math.round(hoveredHeat.val * 47)} conversões</p>
                  </div>
                </div>
                );
              })()}
              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">baixo</span>
                <div className="w-32 h-3 rounded-full border border-white/10" style={{ background: "linear-gradient(90deg, rgba(251,191,36,0.05), rgba(251,191,36,0.3), rgba(251,191,36,0.6), rgba(251,191,36,1))" }} />
                <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">alto</span>
              </div>
            </div>
          </div>
        </div>

        </>);
        })()}

        </>)}

        {/* ════════════════ TRÁFEGO ORGÂNICO ════════════════ */}
        {mainTab === "organico" && (<>

        {/* ── Social Network Selector (Organic) ── */}
        <div className="flex items-center gap-2" style={{ animation: "animationIn 0.8s ease-out 0.05s both" }}>
          {(["instagram", "tiktok", "youtube", "facebook"] as SocialNetwork[]).map((sn) => {
            const isActive = socialNetwork === sn;
            const color = socialNetworkColors[sn];
            return (
              <button
                key={sn}
                onClick={() => setSocialNetwork(sn)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
                style={{
                  background: isActive ? `${color}15` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isActive ? `${color}40` : "rgba(255,255,255,0.05)"}`,
                  color: isActive ? color : "rgb(100,116,139)",
                }}
              >
                <span style={{ color: isActive ? color : "rgb(100,116,139)" }}>{socialNetworkIcons[sn]}</span>
                {socialNetworkLabels[sn]}
              </button>
            );
          })}
        </div>

        {/* ═══ Instagram Organic ═══ */}
        {socialNetwork === "instagram" && (<>

        {/* ── Organic KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {organicKpis.map((kpi, idx) => {
            const isRight = idx >= 2;
            return (
            <div
              key={kpi.label}
              className="glass-panel p-5 rounded-2xl cursor-default relative hover:z-50"
              style={{ ...glassStyle, animation: `animationIn 0.8s ease-out ${0.2 + idx * 0.05}s both`, overflow: "visible" }}
            >
              {/* Info icon */}
              <div className="absolute bottom-3 right-3 cursor-help group/tip z-20">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500/40 group-hover/tip:text-slate-300 transition-colors">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <div
                  className={`absolute bottom-full mb-3 w-64 p-3 rounded-lg border border-white/10 text-left opacity-0 scale-95 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:pointer-events-auto transition-all duration-200 origin-bottom z-[200] ${isRight ? "right-0" : "left-0"}`}
                  style={{ background: "rgba(8,10,18,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}
                >
                  <p className="text-[11px] text-slate-300/90 leading-[1.6] font-normal normal-case tracking-normal">{kpi.tooltip}</p>
                  <div className={`absolute -bottom-[5px] w-2.5 h-2.5 rotate-45 border-r border-b border-white/10 ${isRight ? "right-2" : "left-2"}`} style={{ background: "rgba(8,10,18,0.97)" }} />
                </div>
              </div>
              <div className="flex items-center justify-between mb-1 relative z-10">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                <div className="text-amber-400/60">{kpiIcons[kpi.icon]}</div>
              </div>
              <p className="text-2xl font-bold text-amber-400 relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{kpi.value}</p>
              <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold relative z-10 ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                {kpi.up ? <ArrowUp /> : <ArrowDown />}
                {kpi.delta} vs mês ant.
              </div>
            </div>
            );
          })}
        </div>

        {/* ── Sessions by Channel (Stacked Bar) ── */}
        <div
          className="glass-panel rounded-2xl p-6 group"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.3s both" }}
        >
          {/* Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Sessões por Canal — Mensal<InfoTip title="Sessões por Canal — Mensal" /></h3>
            </div>
            <div className="flex items-center gap-4">
              {[
                { label: "Pago", color: "bg-amber-400" },
                { label: "Orgânico", color: "bg-emerald-400" },
                { label: "Direto", color: "bg-blue-400" },
                { label: "Social", color: "bg-purple-400" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`size-2.5 rounded-full ${l.color}`} />
                  <span className="text-xs font-semibold text-slate-300">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bars — grouped per month */}
          {(() => {
            const channels = [
              { key: "pago" as const, from: "rgb(180,120,0)", to: "rgb(251,191,36)", shadow: "rgba(251,191,36,0.15)" },
              { key: "organico" as const, from: "rgb(6,120,80)", to: "rgb(52,211,153)", shadow: "rgba(52,211,153,0.15)" },
              { key: "direto" as const, from: "rgb(30,80,180)", to: "rgb(96,165,250)", shadow: "rgba(96,165,250,0.12)" },
              { key: "social" as const, from: "rgb(100,40,180)", to: "rgb(168,85,247)", shadow: "rgba(168,85,247,0.12)" },
            ];
            const maxVal = Math.max(...sessionsByChannel.flatMap((d) => channels.map((c) => d[c.key])));
            return (
              <div className="h-64 flex items-end justify-between gap-10 relative mt-1 z-10">
                {/* Grid lines */}
                <div className="absolute top-0 left-0 right-0 h-px border-t border-dashed border-white/10 w-full z-0" />
                <div className="absolute top-1/4 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />
                <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />
                <div className="absolute top-3/4 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />

                {sessionsByChannel.map((d, mi) => (
                  <div key={d.month} className="flex flex-col items-center gap-2 w-full h-full z-10">
                    {/* Grouped bars for this month */}
                    <div className="flex items-end gap-1.5 w-full flex-1">
                      {channels.map((ch, ci) => {
                        const val = d[ch.key];
                        const pct = (val / maxVal) * 100;
                        const color = ch.to;
                        return (
                          <div key={ch.key} className="relative w-1/4 h-full flex flex-col items-center justify-end group/bar cursor-pointer">
                            <span className="text-[11px] font-extrabold mb-1 whitespace-nowrap drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]" style={{ color }}>{(val / 1000).toFixed(1)}k</span>
                            <div className="relative w-full rounded-t-md overflow-hidden bg-white/[0.02] ring-1 ring-white/5" style={{ height: `${pct}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-md transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                                style={{
                                  background: `linear-gradient(to top, ${ch.from}, ${ch.to})`,
                                  boxShadow: `0 0 12px ${ch.shadow}`,
                                  animationDelay: `${mi * 100 + ci * 50}ms`,
                                }}
                              >
                                <div className="particles-wrapper" style={{ animationDelay: `${mi * 0.4 + ci * 0.2}s` }}>
                                  {[0, 1, 2].map((p) => (
                                    <i key={p} className="particle" style={{ animationDelay: `${mi * 0.4 + p * 0.5}s` }} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs text-neutral-500 transition-colors">{d.month}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Top Keywords + Paid vs Organic Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Top Keywords Table */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.35s both" }}
          >
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Top Keywords Orgânicas<InfoTip title="Top Keywords Orgânicas" /></h3>
            </div>
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pb-3 pr-4">Keyword</th>
                    <th className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pb-3 pr-4 text-center">Pos.</th>
                    <th className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pb-3 pr-4 text-right">Volume</th>
                    <th className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pb-3 pr-4 text-right">Cliques</th>
                    <th className="text-[10px] text-slate-500 uppercase tracking-wider font-bold pb-3 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {topKeywords.map((kw) => (
                    <tr key={kw.keyword} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-xs font-medium text-slate-300">{kw.keyword}</td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`inline-flex items-center justify-center size-6 rounded-md text-[10px] font-bold ${
                          kw.posicao <= 3 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                          kw.posicao <= 10 ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                          "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                        }`}>{kw.posicao}</span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-400 text-right font-mono">{kw.volume}</td>
                      <td className="py-3 pr-4 text-xs text-white font-bold text-right font-mono">{kw.cliques}</td>
                      <td className="py-3 text-xs text-emerald-400 font-bold text-right font-mono">{kw.ctr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paid vs Organic Conversions */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl pt-5 px-6 pb-0 group overflow-hidden flex flex-col min-h-[340px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.4s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Conversões: Pago vs Orgânico<InfoTip title="Conversões: Pago vs Orgânico" /></h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-amber-400" /><span className="text-xs font-semibold text-slate-300">Pago</span></div>
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">Orgânico</span></div>
              </div>
            </div>
            {(() => {
              const maxVal = Math.max(...paidVsOrganicConversions.flatMap((d) => [d.pago, d.organico]));
              return (
                <div className="flex flex-col relative z-10 flex-1">
                  {/* Bars area — grows to fill */}
                  <div className="flex-1 flex items-end justify-between gap-6 relative">
                    {paidVsOrganicConversions.map((d, i) => {
                      const hPago = (d.pago / maxVal) * 100;
                      const hOrg = (d.organico / maxVal) * 100;
                      return (
                        <div key={d.month} className="flex items-end gap-2 w-full h-full">
                          {/* Pago bar */}
                          <div className="relative w-1/2 h-full flex flex-col justify-end group/bar cursor-pointer">
                            <div className="text-[11px] font-extrabold text-amber-400 text-center mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">{d.pago}</div>
                            <div className="relative w-full rounded-t-lg overflow-hidden bg-white/[0.02]" style={{ height: `${hPago}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-110 shadow-[0_0_15px_rgba(251,191,36,0.15)] animate-bar-enter overflow-hidden"
                                style={{ background: "linear-gradient(to top, rgb(180,120,0), rgb(251,191,36))", animationDelay: `${i * 100}ms` }}
                              >
                                <div className="particles-wrapper">
                                  {[0, 1, 2].map((p) => (
                                    <i key={p} className="particle" style={{ animationDelay: `${i * 0.6 + p * 0.5}s` }} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Orgânico bar */}
                          <div className="relative w-1/2 h-full flex flex-col justify-end group/bar cursor-pointer">
                            <div className="text-[11px] font-extrabold text-emerald-400 text-center mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">{d.organico}</div>
                            <div className="relative w-full rounded-t-lg overflow-hidden bg-white/[0.02]" style={{ height: `${hOrg}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-110 shadow-[0_0_15px_rgba(52,211,153,0.15)] animate-bar-enter overflow-hidden"
                                style={{ background: "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))", animationDelay: `${i * 100 + 50}ms` }}
                              >
                                <div className="particles-wrapper">
                                  {[0, 1, 2].map((p) => (
                                    <i key={p} className="particle" style={{ animationDelay: `${i * 0.6 + p * 0.5}s` }} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Month labels — pinned at bottom */}
                  <div className="flex justify-between gap-6 -mx-6 px-6 py-2 border-t border-white/5">
                    {paidVsOrganicConversions.map((d) => (
                      <span key={d.month} className="text-xs text-neutral-500 text-center w-full">{d.month}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Organic Evolution + New Users Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Organic Impressions Evolution */}
          <div
            className="lg:col-span-8 glass-panel rounded-2xl pt-5 px-6 pb-0 flex flex-col overflow-visible min-h-[320px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.45s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Evolução Impressões Orgânicas<InfoTip title="Evolução Impressões Orgânicas" /></h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">Impressões</span></div>
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-slate-400" /><span className="text-xs font-semibold text-slate-300">Cliques</span></div>
              </div>
            </div>
            <div className="relative z-10 flex-1">
              {(() => {
                const maxImp = Math.max(...organicEvolution.map((d) => d.impressoes));
                const maxClk = Math.max(...organicEvolution.map((d) => d.cliques));
                const w = 800, h = 240, padX = 10, padTop = 20, padBot = 10;
                const impPts = organicEvolution.map((d, i) => ({
                  x: padX + (i / (organicEvolution.length - 1)) * (w - padX * 2),
                  y: padTop + (1 - d.impressoes / maxImp) * (h - padTop - padBot),
                }));
                const clkPts = organicEvolution.map((d, i) => ({
                  x: padX + (i / (organicEvolution.length - 1)) * (w - padX * 2),
                  y: padTop + (1 - d.cliques / maxClk) * (h - padTop - padBot) * 0.85 + (h - padTop - padBot) * 0.05,
                }));
                const smoothLine = (pts: {x:number;y:number}[]) => {
                  if (pts.length < 2) return "";
                  let d = `M${pts[0].x},${pts[0].y}`;
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = pts[Math.max(i - 1, 0)];
                    const p1 = pts[i];
                    const p2 = pts[i + 1];
                    const p3 = pts[Math.min(i + 2, pts.length - 1)];
                    const tension = 0.35;
                    const cp1x = p1.x + (p2.x - p0.x) * tension;
                    const cp1y = p1.y + (p2.y - p0.y) * tension;
                    const cp2x = p2.x - (p3.x - p1.x) * tension;
                    const cp2y = p2.y - (p3.y - p1.y) * tension;
                    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
                  }
                  return d;
                };
                const impLine = smoothLine(impPts);
                const impArea = `${impLine} L${impPts[impPts.length - 1].x},${h} L${impPts[0].x},${h} Z`;
                const clkLine = smoothLine(clkPts);
                return (<>
                  <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="orgAreaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(52,211,153,1)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="rgba(52,211,153,1)" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="orgLineGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="rgba(52,211,153,0.6)" />
                        <stop offset="50%" stopColor="rgba(52,211,153,1)" />
                        <stop offset="100%" stopColor="rgba(16,185,129,0.8)" />
                      </linearGradient>
                      <clipPath id="orgChartReveal">
                        <rect x="0" y="0" width={w} height={h}>
                          <animate attributeName="width" from="0" to={w} dur="1.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" begin="0.5s" />
                        </rect>
                      </clipPath>
                    </defs>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                      <line key={f} x1={0} x2={w} y1={padTop + f * (h - padTop - padBot)} y2={padTop + f * (h - padTop - padBot)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    ))}
                    <g clipPath="url(#orgChartReveal)">
                      <path d={impArea} fill="url(#orgAreaGrad)" />
                      <path d={impLine} fill="none" stroke="url(#orgLineGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                      <path d={clkLine} fill="none" stroke="rgba(148,163,184,0.4)" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                      {impPts.map((p, i) => {
                        const isHov = hoveredOrgEvo === i;
                        return (
                          <g key={`imp-${i}`}>
                            {isHov && <line x1={p.x} y1={padTop} x2={p.x} y2={h - padBot} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 3" />}
                            {isHov && <circle cx={p.x} cy={p.y} r="10" fill="rgba(52,211,153,0.12)" />}
                            <circle cx={p.x} cy={p.y} r={isHov ? 6 : 4} fill="rgba(52,211,153,0.8)" stroke={isHov ? "rgba(52,211,153,0.6)" : "rgba(0,0,0,0.3)"} strokeWidth="1.5" />
                          </g>
                        );
                      })}
                      {clkPts.map((p, i) => {
                        const isHov = hoveredOrgEvo === i;
                        return (
                          <g key={`clk-${i}`}>
                            {isHov && <circle cx={p.x} cy={p.y} r="8" fill="rgba(148,163,184,0.1)" />}
                            <circle cx={p.x} cy={p.y} r={isHov ? 5 : 3} fill="rgba(148,163,184,0.4)" stroke={isHov ? "rgba(148,163,184,0.5)" : "rgba(0,0,0,0.2)"} strokeWidth="1" />
                          </g>
                        );
                      })}
                      {/* Invisible hover areas per data point */}
                      {impPts.map((p, i) => (
                        <rect key={`hit-${i}`} x={i === 0 ? 0 : (impPts[i - 1].x + p.x) / 2} y={0} width={i === impPts.length - 1 ? w - (impPts[i - 1].x + p.x) / 2 : (i === 0 ? (p.x + impPts[1].x) / 2 : ((impPts[i + 1].x - impPts[i - 1].x) / 2))} height={h} fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredOrgEvo(i)} onMouseLeave={() => setHoveredOrgEvo(null)} />
                      ))}
                    </g>
                  </svg>
                  {/* Tooltip */}
                  {hoveredOrgEvo !== null && (() => {
                    const i = hoveredOrgEvo;
                    const d = organicEvolution[i];
                    const p = impPts[i];
                    const leftPct = (p.x / w) * 100;
                    const topPct = (p.y / h) * 100;
                    // Adjust horizontal alignment near edges
                    const isNearRight = leftPct > 80;
                    const isNearLeft = leftPct < 20;
                    const tx = isNearRight ? "-85%" : isNearLeft ? "-15%" : "-50%";
                    return (
                      <div className="absolute pointer-events-none z-40" style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: `translate(${tx}, -100%) translateY(-14px)` }}>
                        <div style={{ background: "rgba(0,0,0,0.92)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "8px", padding: "8px 14px", textAlign: "center", backdropFilter: "blur(8px)", boxShadow: "0 0 12px rgba(52,211,153,0.15)", whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "4px", fontWeight: 600 }}>{d.month}</div>
                          <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center" }}>
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: 700, color: "#34d399" }}>{(d.impressoes / 1000).toFixed(0)}k</div>
                              <div style={{ fontSize: "9px", color: "#64748b" }}>Impressões</div>
                            </div>
                            <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{(d.cliques / 1000).toFixed(1)}k</div>
                              <div style={{ fontSize: "9px", color: "#64748b" }}>Cliques</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>);
              })()}
            </div>
            <div className="flex justify-between -mx-6 px-6 py-2 border-t border-white/5 text-[10px] text-slate-400 font-bold tracking-widest uppercase relative z-10">
              {organicEvolution.map((d) => <span key={d.month}>{d.month}</span>)}
            </div>
          </div>

          {/* New Users by Channel */}
          <div
            className="lg:col-span-4 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.5s both" }}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Novos Usuários por Canal<InfoTip title="Novos Usuários por Canal" /></h3>
            </div>
            <div className="relative flex justify-center items-center py-4 z-10" onMouseLeave={() => setHoveredNewUsers(null)}>
              <svg className="size-44" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="nuEmerald" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="nuAmber" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="nuBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(96,165,250)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0.6"/></linearGradient>
                  <linearGradient id="nuPurple" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(168,85,247)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0.6"/></linearGradient>
                  <filter id="nuGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                {(() => {
                  const r = 70, circ = 2 * Math.PI * r;
                  const gapAngle = 4; // degrees
                  const gapLen = (gapAngle / 360) * circ;
                  const totalGap = gapLen * newUsersByChannel.length;
                  const usable = circ - totalGap;
                  const gradIds = ["url(#nuEmerald)", "url(#nuAmber)", "url(#nuBlue)", "url(#nuPurple)"];
                  let off = -circ / 4;
                  return newUsersByChannel.map((ch, idx) => {
                    const len = (ch.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gapLen;
                    const isHov = hoveredNewUsers === ch.name;
                    const isDim = hoveredNewUsers && !isHov;
                    return (
                      <g key={ch.name}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#nuGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredNewUsers(ch.name)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center pointer-events-none">
                {hoveredNewUsers ? (() => {
                  const ch = newUsersByChannel.find((c) => c.name === hoveredNewUsers)!;
                  return (
                    <>
                      <p className="text-2xl font-bold text-white">{ch.value}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{ch.name}</p>
                    </>
                  );
                })() : (
                  <>
                    <p className="text-2xl font-bold text-white">18.4k</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Total</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3 relative z-10">
              {newUsersByChannel.map((ch) => (
                <div key={ch.name} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHoveredNewUsers(ch.name)} onMouseLeave={() => setHoveredNewUsers(null)}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${ch.color}`} />
                    <span className="text-slate-300 text-xs font-medium">{ch.name}</span>
                  </div>
                  <span className="font-bold text-white text-xs">{ch.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            INSTAGRAM MODULES
           ══════════════════════════════════════════ */}

        {/* ── Section Separator ── */}
        <div className="flex items-center gap-4 mt-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-[4px]">Instagram Analytics</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
        </div>

        {/* ── Instagram KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {igKpis.map((kpi, idx) => (
            <div
              key={kpi.label}
              className="glass-panel p-4 rounded-2xl cursor-default text-center"
              style={{ ...glassStyle, animation: `animationIn 0.8s ease-out ${0.55 + idx * 0.05}s both` }}
            >
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{kpi.value}</p>
              <div className={`mt-1 flex items-center justify-center gap-1 text-[10px] font-bold ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                {kpi.up ? <ArrowUp /> : <ArrowDown />}
                {kpi.delta}
              </div>
            </div>
          ))}
        </div>

        {/* ── Stories em Tempo Real ── */}
        <div
          className="glass-panel rounded-2xl p-6 flex flex-col"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.55s both" }}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span className="text-rose-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Stories em Tempo Real<InfoTip title="Stories em Tempo Real" /></h3>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 custom-scrollbar relative z-10 snap-x snap-mandatory flex-1 min-h-0">
            {liveStories.map((st) => (
              <div
                key={st.seq}
                className="flex-shrink-0 w-64 rounded-xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-300 group/story snap-start flex flex-col hover:border-rose-500/20"
                style={{ background: "rgba(255,255,255,0.02)" }}
                onClick={() => setSelectedStory(st)}
              >
                {/* Cover image */}
                <div className="relative h-[200px] overflow-hidden">
                  <Image src={st.cover} alt={`Story ${st.seq}`} fill className="object-cover group-hover/story:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {st.type.includes("Video") && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover/story:bg-white/20 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white">Story {st.seq}</p>
                      <span className="text-[10px] font-bold text-amber-400">{st.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium">{st.type}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                      <span className="text-[10px] font-bold text-white">{st.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-rose-400/60" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      <span className="text-[10px] font-bold text-white">{st.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
                      <span className="text-[10px] font-bold text-white">{st.reactions}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/60" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      <span className="text-[10px] font-bold text-white">{st.shares}</span>
                    </div>
                  </div>
                  {st.interaction && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-rose-400 font-bold uppercase">{st.interaction.type === "poll" ? "Enquete" : st.interaction.type === "quiz" ? "Quiz" : st.interaction.type === "slider" ? "Slider" : "Countdown"}</span>
                      <span className="text-[9px] text-slate-500">Clique para ver</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Video Retention Curve + Share Rate ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Video Retention Curve */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl pt-5 px-6 pb-4 flex flex-col overflow-visible min-h-[390px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.6s both" }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Curva de Retenção de Vídeo<InfoTip title="Curva de Retenção de Vídeo" /></h3>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}>
                  <span className="text-xs font-bold text-emerald-400">68%</span>
                  <span className="text-[9px] text-slate-500">Conclusão</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.15)" }}>
                  <span className="text-xs font-bold text-rose-400">42%</span>
                  <span className="text-[9px] text-slate-500">Perda 0-3s</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)" }}>
                  <span className="text-xs font-bold text-violet-400">1.4x</span>
                  <span className="text-[9px] text-slate-500">Replay</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 flex-1">
              {(() => {
                const w = 800, h = 250, padX = 30, padTop = 20, padBot = 10;
                const maxSec = 30;
                const pts = videoRetention.map((d) => ({
                  x: padX + (d.sec / maxSec) * (w - padX * 2),
                  y: padTop + (1 - d.pct / 100) * (h - padTop - padBot),
                }));
                const smoothLine = (points: {x:number;y:number}[]) => {
                  if (points.length < 2) return "";
                  let d = `M${points[0].x},${points[0].y}`;
                  for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[Math.max(i - 1, 0)];
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    const p3 = points[Math.min(i + 2, points.length - 1)];
                    const tension = 0.35;
                    d += ` C${p1.x + (p2.x - p0.x) * tension},${p1.y + (p2.y - p0.y) * tension} ${p2.x - (p3.x - p1.x) * tension},${p2.y - (p3.y - p1.y) * tension} ${p2.x},${p2.y}`;
                  }
                  return d;
                };
                const line = smoothLine(pts);
                const area = `${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
                const x3s = padX + (3 / maxSec) * (w - padX * 2);
                return (<>
                  <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="retGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="rgba(52,211,153,1)" />
                        <stop offset="40%" stopColor="rgba(251,191,36,0.8)" />
                        <stop offset="100%" stopColor="rgba(251,113,133,0.6)" />
                      </linearGradient>
                      <linearGradient id="retAreaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(52,211,153,0.15)" />
                        <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                      </linearGradient>
                      <clipPath id="retReveal">
                        <rect x="0" y="0" width={w} height={h}>
                          <animate attributeName="width" from="0" to={w} dur="1.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" begin="0.6s" />
                        </rect>
                      </clipPath>
                    </defs>
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                      <line key={f} x1={0} x2={w} y1={padTop + f * (h - padTop - padBot)} y2={padTop + f * (h - padTop - padBot)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    ))}
                    {[100, 75, 50, 25, 0].map((v, i) => (
                      <text key={v} x={padX - 8} y={padTop + (i / 4) * (h - padTop - padBot) + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="monospace">{v}%</text>
                    ))}
                    <rect x={padX} y={padTop} width={x3s - padX} height={h - padTop - padBot} fill="rgba(251,113,133,0.04)" />
                    <line x1={x3s} y1={padTop} x2={x3s} y2={h - padBot} stroke="rgba(251,113,133,0.4)" strokeWidth="1.5" strokeDasharray="6 4" />
                    <text x={x3s + 6} y={padTop + 14} fill="rgba(251,113,133,0.7)" fontSize="10" fontFamily="monospace">3s</text>
                    <g clipPath="url(#retReveal)">
                      <path d={area} fill="url(#retAreaGrad)" />
                      <path d={line} fill="none" stroke="url(#retGrad)" strokeWidth="3" strokeLinecap="round" />
                      {pts.map((p, i) => {
                        const isHov = hoveredRetention === i;
                        return (
                          <g key={i} onMouseEnter={() => setHoveredRetention(i)} onMouseLeave={() => setHoveredRetention(null)} className="cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                            {isHov && <circle cx={p.x} cy={p.y} r="10" fill="rgba(52,211,153,0.15)" />}
                            {isHov && <line x1={p.x} y1={padTop} x2={p.x} y2={h - padBot} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 3" />}
                            <circle cx={p.x} cy={p.y} r={isHov ? 6 : 4} fill="rgba(52,211,153,0.8)" stroke={isHov ? "rgba(52,211,153,0.6)" : "rgba(0,0,0,0.3)"} strokeWidth="1.5" />
                            <text x={p.x} y={p.y - 10} textAnchor="middle" fill={hoveredRetention === null || isHov ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)"} fontSize="9" fontFamily="monospace">{videoRetention[i].pct}%</text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                  {/* Tooltip outside SVG to avoid clipping */}
                  {hoveredRetention !== null && (() => {
                    const idx = hoveredRetention;
                    const d = videoRetention[idx];
                    // Map X from seconds to percentage of the data range (0-30s), accounting for padX
                    const xFrac = padX / w + (d.sec / maxSec) * ((w - padX * 2) / w);
                    // Map Y from pct value (0-100) to container position
                    const yFrac = padTop / h + (1 - d.pct / 100) * ((h - padTop - padBot) / h);
                    return (
                      <div className="absolute pointer-events-none z-40" style={{ left: `${xFrac * 100}%`, top: `${yFrac * 100}%`, transform: "translate(-50%, -100%) translateY(-20px)" }}>
                        <div style={{ background: "rgba(0,0,0,0.92)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "8px", padding: "6px 12px", textAlign: "center", backdropFilter: "blur(8px)", boxShadow: "0 0 12px rgba(52,211,153,0.15)", whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "#34d399" }}>{d.pct}% retidos</div>
                          <div style={{ fontSize: "10px", color: "#94a3b8" }}>aos {d.sec}s do vídeo</div>
                        </div>
                      </div>
                    );
                  })()}
                </>);
              })()}
            </div>
            <div className="flex justify-between -mx-6 px-6 py-2 border-t border-white/5 text-[10px] text-slate-400 font-bold tracking-widest uppercase relative z-10">
              <span>0s</span><span>5s</span><span>10s</span><span>15s</span><span>20s</span><span>25s</span><span>30s</span>
            </div>
          </div>

          {/* Share Rate por Conteúdo */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl pt-5 px-4 pb-4 flex flex-col overflow-hidden min-h-[390px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.65s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-2 px-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-pink-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Share Rate por Conteúdo<InfoTip title="Share Rate por Conteúdo" /></h3>
              </div>
            </div>
            {(() => {
              const maxRate = Math.max(...shareRateByContent.map((d) => d.rate));
              const metaPct = (1 / maxRate) * 100;
              return (
                <div className="flex flex-col flex-1 relative z-10">
                  {/* Meta 1% vertical line spanning all bars */}
                  <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `calc(96px + (100% - 96px - 48px) * ${metaPct / 100})` }}>
                    <div className="w-0.5 h-full bg-amber-400/50" style={{ boxShadow: "0 0 6px rgba(251,191,36,0.3)" }} />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 rounded px-1.5 py-0.5 backdrop-blur-sm">META 1%</div>
                  </div>
                  {shareRateByContent.map((item, i) => {
                    const pct = (item.rate / maxRate) * 100;
                    const isAboveMeta = item.rate >= 1;
                    return (
                      <div key={item.name} className="flex items-center gap-2 group/bar cursor-pointer flex-1 min-h-0 relative">
                        <span className="text-[10px] font-medium text-slate-400 w-20 shrink-0 truncate">{item.name}</span>
                        <div className="flex-1 h-full py-[7px] relative">
                          <div className="h-full relative rounded-sm overflow-hidden bg-white/[0.02] ring-1 ring-white/5">
                            <div
                              className="absolute top-0 left-0 h-full rounded-sm transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                              style={{
                                width: `${pct}%`,
                                background: isAboveMeta
                                  ? "linear-gradient(to right, rgb(180,60,100), rgb(244,114,182))"
                                  : "linear-gradient(to right, rgb(80,60,80), rgb(148,100,130))",
                                boxShadow: isAboveMeta ? "0 0 12px rgba(244,114,182,0.2)" : "none",
                                animationDelay: `${i * 80}ms`,
                              }}
                            >
                              <div className="particles-wrapper-h">
                                {[0, 1].map((p) => (
                                  <i key={p} className="particle" style={{ animationDelay: `${i * 0.3 + p * 0.4}s` }} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Tooltip on hover */}
                          <div className="absolute left-1/2 -translate-x-1/2 -top-8 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-30">
                            <div className="bg-black/90 border border-pink-400/30 rounded-lg px-3 py-1.5 text-center whitespace-nowrap backdrop-blur-sm shadow-[0_0_12px_rgba(244,114,182,0.15)]">
                              <span className="text-[11px] font-bold text-pink-400">{item.shares.toLocaleString("pt-BR")}</span>
                              <span className="text-[9px] text-slate-400 ml-1">shares</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-pink-400 w-10 text-right shrink-0 drop-shadow-[0_0_6px_rgba(244,114,182,0.3)]">{item.rate}%</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Stories Funnel + Reach Origin ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Stories Funnel */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.7s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-cyan-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Funil de Stories — Sequência<InfoTip title="Funil de Stories — Sequência" /></h3>
              <CardDateFilter mode={storiesDateMode} setMode={setStoriesDateMode} single={storiesDate} setSingle={setStoriesDate} from={storiesDateFrom} setFrom={setStoriesDateFrom} to={storiesDateTo} setTo={setStoriesDateTo} />
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              {storiesFunnel.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="text-[10px] font-medium text-slate-500 w-20 shrink-0">{s.label}</span>
                  <div className="flex-1 h-7 relative rounded-md overflow-hidden bg-white/[0.02] ring-1 ring-white/5">
                    <div
                      className="absolute top-0 left-0 h-full rounded-md transition-all duration-500 hover:brightness-125 overflow-hidden animate-bar-enter"
                      style={{
                        width: `${s.pct}%`,
                        background: `linear-gradient(to right, ${s.color.from}, ${s.color.to})`,
                        boxShadow: `0 0 12px ${s.color.to}33`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    >
                      <div className="particles-wrapper-h">
                        {[0, 1, 2].map((p) => (
                          <i key={p} className="particle" style={{ animationDelay: `${i * 0.3 + p * 0.4}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-white w-10 text-right drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">{s.pct}%</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 mt-5 relative z-10">
              {[
                { icon: "⏩", label: "Avançar", value: "2.4k", bad: true },
                { icon: "⏮", label: "Voltar", value: "890", bad: false },
                { icon: "🚪", label: "Saídas", value: "1.1k", bad: true },
                { icon: "🔗", label: "Cliques no Link", value: "340", bad: false },
              ].map((m) => (
                <div key={m.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="text-sm mb-1">{m.icon}</div>
                  <div className={`text-sm font-bold ${m.bad ? "text-rose-400" : "text-emerald-400"}`}>{m.value}</div>
                  <div className="text-[10px] text-slate-300 font-semibold">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reach Origin Donut */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.75s both" }}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-pink-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Origem do Alcance<InfoTip title="Origem do Alcance" /></h3>
            </div>
            <div className="relative flex justify-center items-center py-2 z-10" onMouseLeave={() => setHoveredReach(null)}>
              <svg className="size-40" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="roP" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(244,114,182)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="roA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="roV" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(167,139,250)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0.6"/></linearGradient>
                  <linearGradient id="roC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0.6"/></linearGradient>
                  <linearGradient id="roS" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(148,163,184)" stopOpacity="0.5"/><stop offset="100%" stopColor="rgb(100,116,139)" stopOpacity="0.4"/></linearGradient>
                  <filter id="roGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                {(() => {
                  const r = 70, circ = 2 * Math.PI * r;
                  const gapAngle = 4;
                  const gapLen = (gapAngle / 360) * circ;
                  const totalGap = gapLen * reachOrigin.length;
                  const usable = circ - totalGap;
                  const gradIds = ["url(#roP)", "url(#roA)", "url(#roV)", "url(#roC)", "url(#roS)"];
                  let off = -circ / 4;
                  return reachOrigin.map((ch, idx) => {
                    const len = (ch.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gapLen;
                    const isHov = hoveredReach === ch.name;
                    const isDim = hoveredReach && !isHov;
                    return (
                      <g key={ch.name}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#roGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredReach(ch.name)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center pointer-events-none">
                {hoveredReach ? (() => {
                  const ch = reachOrigin.find((c) => c.name === hoveredReach)!;
                  const total = 142000;
                  const val = Math.round(total * ch.pct / 100);
                  return (
                    <>
                      <p className="text-xl font-bold text-white">{(val / 1000).toFixed(1)}k</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.name}</p>
                    </>
                  );
                })() : (
                  <>
                    <p className="text-xl font-bold text-white">142k</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Alcance Total</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2.5 relative z-10">
              {reachOrigin.map((ch) => (
                <div key={ch.name} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHoveredReach(ch.name)} onMouseLeave={() => setHoveredReach(null)}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${ch.color}`} />
                    <span className="text-slate-300 text-xs font-medium">{ch.name}</span>
                  </div>
                  <span className="font-bold text-white text-xs">{ch.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Follower Growth + Sentiment ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Follower Growth vs Churn */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl pt-5 px-6 pb-0 flex flex-col overflow-hidden min-h-[300px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.8s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Crescimento Líquido de Seguidores<InfoTip title="Crescimento Líquido de Seguidores" /></h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">Novos</span></div>
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-rose-400" /><span className="text-xs font-semibold text-slate-300">Unfollows</span></div>
              </div>
            </div>
            {(() => {
              const maxVal = Math.max(...followerGrowth.flatMap((d) => [d.novos, d.unfollows]));
              return (
                <div className="flex flex-col relative z-10 flex-1">
                  <div className="flex-1 flex items-end justify-between gap-8 relative">
                    <div className="absolute top-0 left-0 right-0 h-px border-t border-dashed border-white/10 w-full z-0" />
                    <div className="absolute top-1/3 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />
                    <div className="absolute top-2/3 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />
                    {followerGrowth.map((d, mi) => {
                      const hNovos = (d.novos / maxVal) * 100;
                      const hUn = (d.unfollows / maxVal) * 100;
                      return (
                        <div key={d.week} className="flex items-end gap-2 w-full h-full z-10">
                          <div className="relative w-1/2 h-full flex flex-col justify-end group/bar cursor-pointer">
                            <div className="text-[11px] font-extrabold text-emerald-400 text-center mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">{d.novos}</div>
                            <div className="relative w-full rounded-t-lg overflow-hidden bg-white/[0.02] ring-1 ring-white/5" style={{ height: `${hNovos}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                                style={{ background: "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))", boxShadow: "0 0 12px rgba(52,211,153,0.15)", animationDelay: `${mi * 100}ms` }}
                              >
                                <div className="particles-wrapper">
                                  {[0, 1, 2].map((p) => (<i key={p} className="particle" style={{ animationDelay: `${mi * 0.4 + p * 0.5}s` }} />))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="relative w-1/2 h-full flex flex-col justify-end group/bar cursor-pointer">
                            <div className="text-[11px] font-extrabold text-rose-400 text-center mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">{d.unfollows}</div>
                            <div className="relative w-full rounded-t-lg overflow-hidden bg-white/[0.02] ring-1 ring-white/5" style={{ height: `${hUn}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                                style={{ background: "linear-gradient(to top, rgb(150,40,50), rgb(251,113,133))", boxShadow: "0 0 12px rgba(251,113,133,0.15)", animationDelay: `${mi * 100 + 50}ms` }}
                              >
                                <div className="particles-wrapper">
                                  {[0, 1, 2].map((p) => (<i key={p} className="particle" style={{ animationDelay: `${mi * 0.4 + p * 0.5}s` }} />))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between gap-8 -mx-6 px-6 py-2 border-t border-white/5">
                    {followerGrowth.map((d) => (
                      <span key={d.week} className="text-xs text-neutral-500 text-center w-full">{d.week}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sentiment Analysis */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.85s both" }}
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Análise de Sentimento<InfoTip title="Análise de Sentimento" /></h3>
              <CardDateFilter mode={sentimentDateMode} setMode={setSentimentDateMode} single={sentimentDate} setSingle={setSentimentDate} from={sentimentDateFrom} setFrom={setSentimentDateFrom} to={sentimentDateTo} setTo={setSentimentDateTo} />
            </div>
            <div className="relative flex justify-center items-center py-4 z-10" onMouseLeave={() => setHoveredSentiment(null)}>
              <svg className="size-36" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="stEm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(52,211,153)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(16,185,129)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="stAm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="stRo" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,113,133)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(244,63,94)" stopOpacity="0.7"/></linearGradient>
                  <filter id="stGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                {(() => {
                  const r = 70, circ = 2 * Math.PI * r;
                  const gapAngle = 5;
                  const gapLen = (gapAngle / 360) * circ;
                  const totalGap = gapLen * sentimentData.length;
                  const usable = circ - totalGap;
                  const gradIds = ["url(#stEm)", "url(#stAm)", "url(#stRo)"];
                  let off = -circ / 4;
                  return sentimentData.map((ch, idx) => {
                    const len = (ch.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gapLen;
                    const isHov = hoveredSentiment === ch.label;
                    const isDim = hoveredSentiment && !isHov;
                    return (
                      <g key={ch.label}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#stGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredSentiment(ch.label)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center pointer-events-none">
                {hoveredSentiment ? (() => {
                  const ch = sentimentData.find((c) => c.label === hoveredSentiment)!;
                  const colorMap: Record<string, string> = { "bg-emerald-400": "text-emerald-400", "bg-amber-400": "text-amber-400", "bg-rose-400": "text-rose-400" };
                  return (
                    <>
                      <p className={`text-lg font-bold ${colorMap[ch.color] || "text-white"}`}>{ch.pct}%</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.label}</p>
                    </>
                  );
                })() : (
                  <>
                    <p className="text-lg font-bold text-emerald-400">56%</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Positivo</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 space-y-2.5 relative z-10">
              {sentimentData.map((s) => (
                <div key={s.label} className="flex items-center justify-between cursor-default" onMouseEnter={() => setHoveredSentiment(s.label)} onMouseLeave={() => setHoveredSentiment(null)}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${s.color}`} />
                    <span className="text-xs font-semibold text-slate-300">{s.label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{s.pct}%</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Taxa de Resposta</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                  <div className="text-lg font-bold text-emerald-400">68%</div>
                  <div className="text-[9px] text-slate-500">Respondidos</div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.12)" }}>
                  <div className="text-lg font-bold text-amber-400">2.4h</div>
                  <div className="text-[9px] text-slate-500">Tempo Médio</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Age Range + Gender Donuts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Faixa Etária */}
          <div
            className="lg:col-span-6 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.88s both" }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-cyan-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Faixa Etária<InfoTip title="Faixa Etária" /></h3>
            </div>
            <div className="relative flex justify-center items-center py-2 z-10" onMouseLeave={() => setHoveredAge(null)}>
              <svg className="size-40" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="agC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="agA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="agP" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(244,114,182)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="agV" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(167,139,250)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0.6"/></linearGradient>
                  <linearGradient id="agS" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(148,163,184)" stopOpacity="0.5"/><stop offset="100%" stopColor="rgb(100,116,139)" stopOpacity="0.4"/></linearGradient>
                  <filter id="agGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                {(() => {
                  const r = 70, circ = 2 * Math.PI * r;
                  const gapAngle = 4;
                  const gapLen = (gapAngle / 360) * circ;
                  const totalGap = gapLen * ageRangeData.length;
                  const usable = circ - totalGap;
                  const gradIds = ["url(#agC)", "url(#agA)", "url(#agP)", "url(#agV)", "url(#agS)"];
                  let off = -circ / 4;
                  return ageRangeData.map((ch, idx) => {
                    const len = (ch.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gapLen;
                    const isHov = hoveredAge === ch.label;
                    const isDim = hoveredAge && !isHov;
                    return (
                      <g key={ch.label}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#agGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredAge(ch.label)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center pointer-events-none">
                {hoveredAge ? (() => {
                  const ch = ageRangeData.find((c) => c.label === hoveredAge)!;
                  return (
                    <>
                      <p className="text-xl font-bold text-white">{ch.pct}%</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.label}</p>
                    </>
                  );
                })() : (
                  <>
                    <p className="text-xl font-bold text-white">25-34</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Maior Faixa</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2.5 relative z-10">
              {ageRangeData.map((ch) => (
                <div key={ch.label} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHoveredAge(ch.label)} onMouseLeave={() => setHoveredAge(null)}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${ch.color}`} />
                    <span className="text-slate-300 text-xs font-medium">{ch.label}</span>
                  </div>
                  <span className="font-bold text-white text-xs">{ch.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sexo */}
          <div
            className="lg:col-span-6 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.92s both" }}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-pink-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Sexo<InfoTip title="Sexo" /></h3>
            </div>
            <div className="relative flex justify-center items-center py-2 z-10" onMouseLeave={() => setHoveredGender(null)}>
              <svg className="size-40" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="gnP" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(244,114,182)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="gnC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0.7"/></linearGradient>
                  <linearGradient id="gnA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                  <filter id="gnGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                {(() => {
                  const r = 70, circ = 2 * Math.PI * r;
                  const gapAngle = 5;
                  const gapLen = (gapAngle / 360) * circ;
                  const totalGap = gapLen * genderData.length;
                  const usable = circ - totalGap;
                  const gradIds = ["url(#gnP)", "url(#gnC)", "url(#gnA)"];
                  let off = -circ / 4;
                  return genderData.map((ch, idx) => {
                    const len = (ch.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gapLen;
                    const isHov = hoveredGender === ch.label;
                    const isDim = hoveredGender && !isHov;
                    return (
                      <g key={ch.label}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#gnGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradIds[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredGender(ch.label)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center pointer-events-none">
                {hoveredGender ? (() => {
                  const ch = genderData.find((c) => c.label === hoveredGender)!;
                  return (
                    <>
                      <p className="text-xl font-bold text-white">{ch.pct}%</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.label}</p>
                    </>
                  );
                })() : (
                  <>
                    <p className="text-xl font-bold text-white">58%</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Feminino</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2.5 relative z-10">
              {genderData.map((ch) => (
                <div key={ch.label} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHoveredGender(ch.label)} onMouseLeave={() => setHoveredGender(null)}>
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${ch.color}`} />
                    <span className="text-slate-300 text-xs font-medium">{ch.label}</span>
                  </div>
                  <span className="font-bold text-white text-xs">{ch.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Profile Conversion Funnel ── */}
        <div
          className="glass-panel rounded-2xl p-6"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.9s both" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span className="text-violet-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Conversão Perfil → Follow<InfoTip title="Conversão Perfil → Follow" /></h3>
            <CardDateFilter mode={convDateMode} setMode={setConvDateMode} single={convDate} setSingle={setConvDate} from={convDateFrom} setFrom={setConvDateFrom} to={convDateTo} setTo={setConvDateTo} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.15)" }}>
              <div>
                <p className="text-xs font-medium text-slate-400">Visitas ao Perfil</p>
                <p className="text-2xl font-bold text-pink-400 mt-1">3.840</p>
              </div>
              <div className="text-pink-400/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-slate-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <span className="text-sm font-bold text-white">8.6%</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">Taxa de Conversão</span>
              <span className="text-[9px] text-emerald-400/70">Meta: 5-15%</span>
            </div>
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
              <div>
                <p className="text-xs font-medium text-slate-400">Novos Seguidores</p>
                <p className="text-2xl font-bold text-violet-400 mt-1">330</p>
              </div>
              <div className="text-violet-400/40">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              </div>
            </div>
          </div>
        </div>

        </>)}
        {/* ═══ End Instagram Organic ═══ */}

        {/* ═══ TikTok / YouTube / Facebook Organic ═══ */}
        {socialNetwork !== "instagram" && (() => {
          const net = organicNetworkData[socialNetwork as "tiktok" | "youtube" | "facebook"];
          return (<>

        {/* ── Organic KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {net.kpis.map((kpi, idx) => {
            const isRight = idx >= 2;
            return (
            <div
              key={kpi.label}
              className="glass-panel p-5 rounded-2xl cursor-default relative hover:z-50"
              style={{ ...glassStyle, animation: `animationIn 0.8s ease-out ${0.2 + idx * 0.05}s both`, overflow: "visible" }}
            >
              <div className="absolute bottom-3 right-3 cursor-help group/tip z-20">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500/40 group-hover/tip:text-slate-300 transition-colors">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <div
                  className={`absolute bottom-full mb-3 w-64 p-3 rounded-lg border border-white/10 text-left opacity-0 scale-95 pointer-events-none group-hover/tip:opacity-100 group-hover/tip:scale-100 group-hover/tip:pointer-events-auto transition-all duration-200 origin-bottom z-[200] ${isRight ? "right-0" : "left-0"}`}
                  style={{ background: "rgba(8,10,18,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)" }}
                >
                  <p className="text-[11px] text-slate-300/90 leading-[1.6] font-normal normal-case tracking-normal">{kpi.tooltip}</p>
                  <div className={`absolute -bottom-[5px] w-2.5 h-2.5 rotate-45 border-r border-b border-white/10 ${isRight ? "right-2" : "left-2"}`} style={{ background: "rgba(8,10,18,0.97)" }} />
                </div>
              </div>
              <div className="flex items-center justify-between mb-1 relative z-10">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{kpi.label}</p>
                <div className="text-amber-400/60">{kpiIcons[kpi.icon]}</div>
              </div>
              <p className="text-2xl font-bold text-amber-400 relative z-10 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{kpi.value}</p>
              <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold relative z-10 ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                {kpi.up ? <ArrowUp /> : <ArrowDown />}
                {kpi.delta} vs mês ant.
              </div>
            </div>
            );
          })}
        </div>

        {/* ── Top Content + Content Type Donut ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Top Content Table */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.3s both" }}
          >
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Top Conteúdo Orgânico</h3>
            </div>
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    {net.topContent.columns.map((col, ci) => (
                      <th key={col} className={`text-[10px] text-slate-500 uppercase tracking-wider font-bold pb-3 pr-4 ${ci === 0 ? "" : "text-right"}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {net.topContent.rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      {net.topContent.columns.map((col, ci) => (
                        <td key={col} className={`py-3 pr-4 text-xs ${ci === 0 ? "font-medium text-slate-300" : "text-right font-mono"} ${
                          ci === net.topContent.columns.length - 1 ? "text-emerald-400 font-bold" : ci === 0 ? "" : "text-white font-bold"
                        }`}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Content Type Donut */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.35s both" }}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">{net.donutTitle}</h3>
            </div>
            {(() => {
              // hovDonut state is at component level
              const donutColors = ["url(#odP)", "url(#odA)", "url(#odV)", "url(#odC)", "url(#odS)"];
              return (
                <>
                  <div className="relative flex justify-center items-center py-2 z-10" onMouseLeave={() => setHovDonut(null)}>
                    <svg className="size-40" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="odP" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(244,114,182)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/></linearGradient>
                        <linearGradient id="odA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                        <linearGradient id="odV" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(167,139,250)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0.6"/></linearGradient>
                        <linearGradient id="odC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0.6"/></linearGradient>
                        <linearGradient id="odS" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(148,163,184)" stopOpacity="0.5"/><stop offset="100%" stopColor="rgb(100,116,139)" stopOpacity="0.4"/></linearGradient>
                        <filter id="odGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                      </defs>
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                      {(() => {
                        const r = 70, circ = 2 * Math.PI * r;
                        const gapAngle = 4;
                        const gapLen = (gapAngle / 360) * circ;
                        const totalGap = gapLen * net.donut.length;
                        const usable = circ - totalGap;
                        let off = -circ / 4;
                        return net.donut.map((ch, idx) => {
                          const len = (ch.pct / 100) * usable;
                          const dash = `${len} ${circ - len}`;
                          const thisOff = off;
                          off += len + gapLen;
                          const isHov = hovDonut === ch.name;
                          const isDim = hovDonut && !isHov;
                          return (
                            <g key={ch.name}>
                              {isHov && (
                                <circle cx="100" cy="100" r={r} fill="transparent" stroke={donutColors[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#odGlow)" />
                              )}
                              <circle cx="100" cy="100" r={r} fill="transparent" stroke={donutColors[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                              <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHovDonut(ch.name)} />
                            </g>
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute text-center pointer-events-none">
                      {hovDonut ? (() => {
                        const ch = net.donut.find((c) => c.name === hovDonut)!;
                        return (
                          <>
                            <p className="text-xl font-bold text-white">{ch.pct}%</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.name}</p>
                          </>
                        );
                      })() : (
                        <>
                          <p className="text-xl font-bold text-white">100%</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Total</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2.5 relative z-10">
                    {net.donut.map((ch) => (
                      <div key={ch.name} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHovDonut(ch.name)} onMouseLeave={() => setHovDonut(null)}>
                        <div className="flex items-center gap-2">
                          <div className={`size-2.5 rounded-full ${ch.color}`} />
                          <span className="text-slate-300 text-xs font-medium">{ch.name}</span>
                        </div>
                        <span className="font-bold text-white text-xs">{ch.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* ── Organic Evolution ── */}
        <div
          className="glass-panel rounded-2xl pt-5 px-6 pb-0 flex flex-col overflow-visible min-h-[320px]"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.4s both" }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Evolução Orgânica</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">{net.evolutionLabels[0]}</span></div>
              <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-slate-400" /><span className="text-xs font-semibold text-slate-300">{net.evolutionLabels[1]}</span></div>
            </div>
          </div>
          {(() => {
            // hovEvo state is at component level
            const data = net.evolution;
            const maxS1 = Math.max(...data.map((d) => d.series1));
            const maxS2 = Math.max(...data.map((d) => d.series2));
            const w = 800, h = 240, padX = 10, padTop = 20, padBot = 10;
            const s1Pts = data.map((d, i) => ({
              x: padX + (i / (data.length - 1)) * (w - padX * 2),
              y: padTop + (1 - d.series1 / maxS1) * (h - padTop - padBot),
            }));
            const s2Pts = data.map((d, i) => ({
              x: padX + (i / (data.length - 1)) * (w - padX * 2),
              y: padTop + (1 - d.series2 / maxS2) * (h - padTop - padBot) * 0.85 + (h - padTop - padBot) * 0.05,
            }));
            const smoothLine = (pts: {x:number;y:number}[]) => {
              if (pts.length < 2) return "";
              let d = `M${pts[0].x},${pts[0].y}`;
              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(i - 1, 0)];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[Math.min(i + 2, pts.length - 1)];
                const tension = 0.35;
                d += ` C${p1.x + (p2.x - p0.x) * tension},${p1.y + (p2.y - p0.y) * tension} ${p2.x - (p3.x - p1.x) * tension},${p2.y - (p3.y - p1.y) * tension} ${p2.x},${p2.y}`;
              }
              return d;
            };
            const s1Line = smoothLine(s1Pts);
            const s1Area = `${s1Line} L${s1Pts[s1Pts.length - 1].x},${h} L${s1Pts[0].x},${h} Z`;
            const s2Line = smoothLine(s2Pts);
            return (
              <div className="relative z-10 flex-1" onMouseLeave={() => setHovEvo(null)}>
                <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="oeAreaGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(52,211,153,1)" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="rgba(52,211,153,1)" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="oeLineGrad" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="rgba(52,211,153,0.6)" />
                      <stop offset="50%" stopColor="rgba(52,211,153,1)" />
                      <stop offset="100%" stopColor="rgba(16,185,129,0.8)" />
                    </linearGradient>
                    <clipPath id="oeChartReveal">
                      <rect x="0" y="0" width={w} height={h}>
                        <animate attributeName="width" from="0" to={w} dur="1.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" begin="0.5s" />
                      </rect>
                    </clipPath>
                  </defs>
                  {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                    <line key={f} x1={0} x2={w} y1={padTop + f * (h - padTop - padBot)} y2={padTop + f * (h - padTop - padBot)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  ))}
                  <g clipPath="url(#oeChartReveal)">
                    <path d={s1Area} fill="url(#oeAreaGrad)" />
                    <path d={s1Line} fill="none" stroke="url(#oeLineGrad)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
                    <path d={s2Line} fill="none" stroke="rgba(148,163,184,0.4)" strokeDasharray="6,4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                    {s1Pts.map((p, i) => {
                      const isHov = hovEvo === i;
                      return (
                        <g key={`s1-${i}`}>
                          {isHov && <line x1={p.x} y1={padTop} x2={p.x} y2={h - padBot} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 3" />}
                          {isHov && <circle cx={p.x} cy={p.y} r="10" fill="rgba(52,211,153,0.12)" />}
                          <circle cx={p.x} cy={p.y} r={isHov ? 6 : 4} fill="rgba(52,211,153,0.8)" stroke={isHov ? "rgba(52,211,153,0.6)" : "rgba(0,0,0,0.3)"} strokeWidth="1.5" />
                        </g>
                      );
                    })}
                    {s2Pts.map((p, i) => {
                      const isHov = hovEvo === i;
                      return (
                        <g key={`s2-${i}`}>
                          {isHov && <circle cx={p.x} cy={p.y} r="8" fill="rgba(148,163,184,0.1)" />}
                          <circle cx={p.x} cy={p.y} r={isHov ? 5 : 3} fill="rgba(148,163,184,0.4)" stroke={isHov ? "rgba(148,163,184,0.5)" : "rgba(0,0,0,0.2)"} strokeWidth="1" />
                        </g>
                      );
                    })}
                    {s1Pts.map((p, i) => (
                      <rect key={`hit-${i}`} x={i === 0 ? 0 : (s1Pts[i - 1].x + p.x) / 2} y={0} width={i === s1Pts.length - 1 ? w - (s1Pts[i - 1].x + p.x) / 2 : (i === 0 ? (p.x + s1Pts[1].x) / 2 : ((s1Pts[i + 1].x - s1Pts[i - 1].x) / 2))} height={h} fill="transparent" className="cursor-pointer" onMouseEnter={() => setHovEvo(i)} />
                    ))}
                  </g>
                </svg>
                {hovEvo !== null && (() => {
                  const d = data[hovEvo];
                  const p = s1Pts[hovEvo];
                  const leftPct = (p.x / w) * 100;
                  const topPct = (p.y / h) * 100;
                  const isNearRight = leftPct > 80;
                  const isNearLeft = leftPct < 20;
                  const tx = isNearRight ? "-85%" : isNearLeft ? "-15%" : "-50%";
                  return (
                    <div className="absolute pointer-events-none z-40" style={{ left: `${leftPct}%`, top: `${topPct}%`, transform: `translate(${tx}, -100%) translateY(-14px)` }}>
                      <div style={{ background: "rgba(0,0,0,0.92)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "8px", padding: "8px 14px", textAlign: "center", backdropFilter: "blur(8px)", boxShadow: "0 0 12px rgba(52,211,153,0.15)", whiteSpace: "nowrap" }}>
                        <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "4px", fontWeight: 600 }}>{d.month}</div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center" }}>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#34d399" }}>{d.series1 >= 1000 ? `${(d.series1 / 1000).toFixed(0)}k` : d.series1}</div>
                            <div style={{ fontSize: "9px", color: "#64748b" }}>{net.evolutionLabels[0]}</div>
                          </div>
                          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>{d.series2 >= 1000 ? `${(d.series2 / 1000).toFixed(1)}k` : d.series2}</div>
                            <div style={{ fontSize: "9px", color: "#64748b" }}>{net.evolutionLabels[1]}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })()}
          <div className="flex justify-between -mx-6 px-6 py-2 border-t border-white/5 text-[10px] text-slate-400 font-bold tracking-widest uppercase relative z-10">
            {net.evolution.map((d) => <span key={d.month}>{d.month}</span>)}
          </div>
        </div>

        {/* ── Section Separator — Analytics ── */}
        <div className="flex items-center gap-4 mt-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-[4px]">{net.analyticsTitle}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />
        </div>

        {/* ── Retention Curve + Share Rate ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Retention Curve */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl pt-5 px-6 pb-4 flex flex-col overflow-visible min-h-[390px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.6s both" }}
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Curva de Retenção de Vídeo</h3>
              </div>
            </div>
            {(() => {
              // hovRet state is at component level
              const retData = net.retention;
              const maxSec = net.retentionMaxSec;
              const w = 800, h = 250, padX = 30, padTop = 20, padBot = 10;
              const pts = retData.map((d) => ({
                x: padX + (d.sec / maxSec) * (w - padX * 2),
                y: padTop + (1 - d.pct / 100) * (h - padTop - padBot),
              }));
              const smoothLine = (points: {x:number;y:number}[]) => {
                if (points.length < 2) return "";
                let d = `M${points[0].x},${points[0].y}`;
                for (let i = 0; i < points.length - 1; i++) {
                  const p0 = points[Math.max(i - 1, 0)];
                  const p1 = points[i];
                  const p2 = points[i + 1];
                  const p3 = points[Math.min(i + 2, points.length - 1)];
                  const tension = 0.35;
                  d += ` C${p1.x + (p2.x - p0.x) * tension},${p1.y + (p2.y - p0.y) * tension} ${p2.x - (p3.x - p1.x) * tension},${p2.y - (p3.y - p1.y) * tension} ${p2.x},${p2.y}`;
                }
                return d;
              };
              const line = smoothLine(pts);
              const area = `${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
              const x3s = padX + (3 / maxSec) * (w - padX * 2);
              return (
                <div className="relative z-10 flex-1">
                  <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="retGradO" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="rgba(52,211,153,1)" />
                        <stop offset="40%" stopColor="rgba(251,191,36,0.8)" />
                        <stop offset="100%" stopColor="rgba(251,113,133,0.6)" />
                      </linearGradient>
                      <linearGradient id="retAreaGradO" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(52,211,153,0.15)" />
                        <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                      </linearGradient>
                      <clipPath id="retRevealO">
                        <rect x="0" y="0" width={w} height={h}>
                          <animate attributeName="width" from="0" to={w} dur="1.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1" begin="0.6s" />
                        </rect>
                      </clipPath>
                    </defs>
                    {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                      <line key={f} x1={0} x2={w} y1={padTop + f * (h - padTop - padBot)} y2={padTop + f * (h - padTop - padBot)} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    ))}
                    {[100, 75, 50, 25, 0].map((v, i) => (
                      <text key={v} x={padX - 8} y={padTop + (i / 4) * (h - padTop - padBot) + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="10" fontFamily="monospace">{v}%</text>
                    ))}
                    <rect x={padX} y={padTop} width={x3s - padX} height={h - padTop - padBot} fill="rgba(251,113,133,0.04)" />
                    <line x1={x3s} y1={padTop} x2={x3s} y2={h - padBot} stroke="rgba(251,113,133,0.4)" strokeWidth="1.5" strokeDasharray="6 4" />
                    <text x={x3s + 6} y={padTop + 14} fill="rgba(251,113,133,0.7)" fontSize="10" fontFamily="monospace">3s</text>
                    <g clipPath="url(#retRevealO)">
                      <path d={area} fill="url(#retAreaGradO)" />
                      <path d={line} fill="none" stroke="url(#retGradO)" strokeWidth="3" strokeLinecap="round" />
                      {pts.map((p, i) => {
                        const isHov = hovRet === i;
                        return (
                          <g key={i} onMouseEnter={() => setHovRet(i)} onMouseLeave={() => setHovRet(null)} className="cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                            {isHov && <circle cx={p.x} cy={p.y} r="10" fill="rgba(52,211,153,0.15)" />}
                            {isHov && <line x1={p.x} y1={padTop} x2={p.x} y2={h - padBot} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="4 3" />}
                            <circle cx={p.x} cy={p.y} r={isHov ? 6 : 4} fill="rgba(52,211,153,0.8)" stroke={isHov ? "rgba(52,211,153,0.6)" : "rgba(0,0,0,0.3)"} strokeWidth="1.5" />
                            <text x={p.x} y={p.y - 10} textAnchor="middle" fill={hovRet === null || isHov ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)"} fontSize="9" fontFamily="monospace">{retData[i].pct}%</text>
                          </g>
                        );
                      })}
                    </g>
                  </svg>
                  {hovRet !== null && (() => {
                    const idx = hovRet;
                    const d = retData[idx];
                    const xFrac = padX / w + (d.sec / maxSec) * ((w - padX * 2) / w);
                    const yFrac = padTop / h + (1 - d.pct / 100) * ((h - padTop - padBot) / h);
                    return (
                      <div className="absolute pointer-events-none z-40" style={{ left: `${xFrac * 100}%`, top: `${yFrac * 100}%`, transform: "translate(-50%, -100%) translateY(-20px)" }}>
                        <div style={{ background: "rgba(0,0,0,0.92)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "8px", padding: "6px 12px", textAlign: "center", backdropFilter: "blur(8px)", boxShadow: "0 0 12px rgba(52,211,153,0.15)", whiteSpace: "nowrap" }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "#34d399" }}>{d.pct}% retidos</div>
                          <div style={{ fontSize: "10px", color: "#94a3b8" }}>aos {d.sec}s do vídeo</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
            <div className="flex justify-between -mx-6 px-6 py-2 border-t border-white/5 text-[10px] text-slate-400 font-bold tracking-widest uppercase relative z-10">
              {(() => {
                const maxS = net.retentionMaxSec;
                const labels = maxS <= 30 ? ["0s","5s","10s","15s","20s","25s","30s"] : ["0s","30s","60s","120s","180s","240s","300s"];
                return labels.map((l) => <span key={l}>{l}</span>);
              })()}
            </div>
          </div>

          {/* Share Rate / CTR by Thumbnail / Engagement by Type */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl pt-5 px-4 pb-4 flex flex-col overflow-hidden min-h-[390px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.65s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-2 px-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-pink-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">{net.shareRateTitle}</h3>
              </div>
            </div>
            {(() => {
              const maxRate = Math.max(...net.shareRate.map((d) => d.rate));
              return (
                <div className="flex flex-col flex-1 relative z-10">
                  {net.shareRate.map((item, i) => {
                    const pct = (item.rate / maxRate) * 100;
                    return (
                      <div key={item.name} className="flex items-center gap-2 group/bar cursor-pointer flex-1 min-h-0 relative">
                        <span className="text-[10px] font-medium text-slate-400 w-24 shrink-0 truncate">{item.name}</span>
                        <div className="flex-1 h-full py-[7px] relative">
                          <div className="h-full relative rounded-sm overflow-hidden bg-white/[0.02] ring-1 ring-white/5">
                            <div
                              className="absolute top-0 left-0 h-full rounded-sm transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                              style={{
                                width: `${pct}%`,
                                background: "linear-gradient(to right, rgb(180,60,100), rgb(244,114,182))",
                                boxShadow: "0 0 12px rgba(244,114,182,0.2)",
                                animationDelay: `${i * 80}ms`,
                              }}
                            >
                              <div className="particles-wrapper-h">
                                {[0, 1].map((p) => (
                                  <i key={p} className="particle" style={{ animationDelay: `${i * 0.3 + p * 0.4}s` }} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-pink-400 w-10 text-right shrink-0 drop-shadow-[0_0_6px_rgba(244,114,182,0.3)]">{item.rate}%</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Reach Origin / FYP + Follower Growth ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Reach Origin Donut */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.7s both" }}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-6 relative z-10">
              <span className="text-pink-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">{net.reachOriginTitle}</h3>
            </div>
            {(() => {
              // hovRO state is at component level
              const roColors = ["url(#roP2)", "url(#roA2)", "url(#roV2)", "url(#roC2)", "url(#roS2)"];
              return (
                <>
                  <div className="relative flex justify-center items-center py-2 z-10" onMouseLeave={() => setHovRO(null)}>
                    <svg className="size-40" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="roP2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(244,114,182)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/></linearGradient>
                        <linearGradient id="roA2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                        <linearGradient id="roV2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(167,139,250)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity="0.6"/></linearGradient>
                        <linearGradient id="roC2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.8"/><stop offset="100%" stopColor="rgb(6,182,212)" stopOpacity="0.6"/></linearGradient>
                        <linearGradient id="roS2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(148,163,184)" stopOpacity="0.5"/><stop offset="100%" stopColor="rgb(100,116,139)" stopOpacity="0.4"/></linearGradient>
                        <filter id="roGlow2"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                      </defs>
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                      {(() => {
                        const r = 70, circ = 2 * Math.PI * r;
                        const gapAngle = 4;
                        const gapLen = (gapAngle / 360) * circ;
                        const totalGap = gapLen * net.reachOrigin.length;
                        const usable = circ - totalGap;
                        let off = -circ / 4;
                        return net.reachOrigin.map((ch, idx) => {
                          const len = (ch.pct / 100) * usable;
                          const dash = `${len} ${circ - len}`;
                          const thisOff = off;
                          off += len + gapLen;
                          const isHov = hovRO === ch.name;
                          const isDim = hovRO && !isHov;
                          return (
                            <g key={ch.name}>
                              {isHov && (
                                <circle cx="100" cy="100" r={r} fill="transparent" stroke={roColors[idx]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#roGlow2)" />
                              )}
                              <circle cx="100" cy="100" r={r} fill="transparent" stroke={roColors[idx]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                              <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHovRO(ch.name)} />
                            </g>
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute text-center pointer-events-none">
                      {hovRO ? (() => {
                        const ch = net.reachOrigin.find((c) => c.name === hovRO)!;
                        return (
                          <>
                            <p className="text-xl font-bold text-white">{ch.pct}%</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.name}</p>
                          </>
                        );
                      })() : (
                        <>
                          <p className="text-xl font-bold text-white">100%</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">Total</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2.5 relative z-10">
                    {net.reachOrigin.map((ch) => (
                      <div key={ch.name} className="flex items-center justify-between text-sm cursor-default" onMouseEnter={() => setHovRO(ch.name)} onMouseLeave={() => setHovRO(null)}>
                        <div className="flex items-center gap-2">
                          <div className={`size-2.5 rounded-full ${ch.color}`} />
                          <span className="text-slate-300 text-xs font-medium">{ch.name}</span>
                        </div>
                        <span className="font-bold text-white text-xs">{ch.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          {/* Follower Growth */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl pt-5 px-6 pb-0 flex flex-col overflow-hidden min-h-[300px]"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.75s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </span>
                <h3 className="font-bold text-sm text-slate-300">Crescimento de Seguidores</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-emerald-400" /><span className="text-xs font-semibold text-slate-300">Novos</span></div>
                <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-rose-400" /><span className="text-xs font-semibold text-slate-300">Unfollows</span></div>
              </div>
            </div>
            {(() => {
              const fgData = net.followerGrowth;
              const maxVal = Math.max(...fgData.flatMap((d) => [d.novos, d.unfollows]));
              return (
                <div className="flex flex-col relative z-10 flex-1">
                  <div className="flex-1 flex items-end justify-between gap-8 relative">
                    <div className="absolute top-0 left-0 right-0 h-px border-t border-dashed border-white/10 w-full z-0" />
                    <div className="absolute top-1/3 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />
                    <div className="absolute top-2/3 left-0 right-0 h-px border-t border-dashed border-white/[0.04] w-full z-0" />
                    {fgData.map((d, mi) => {
                      const hNovos = (d.novos / maxVal) * 100;
                      const hUn = (d.unfollows / maxVal) * 100;
                      return (
                        <div key={d.week} className="flex items-end gap-2 w-full h-full z-10">
                          <div className="relative w-1/2 h-full flex flex-col justify-end group/bar cursor-pointer">
                            <div className="text-[11px] font-extrabold text-emerald-400 text-center mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">{d.novos}</div>
                            <div className="relative w-full rounded-t-lg overflow-hidden bg-white/[0.02] ring-1 ring-white/5" style={{ height: `${hNovos}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                                style={{ background: "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))", boxShadow: "0 0 12px rgba(52,211,153,0.15)", animationDelay: `${mi * 100}ms` }}
                              >
                                <div className="particles-wrapper">
                                  {[0, 1, 2].map((p) => (<i key={p} className="particle" style={{ animationDelay: `${mi * 0.4 + p * 0.5}s` }} />))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="relative w-1/2 h-full flex flex-col justify-end group/bar cursor-pointer">
                            <div className="text-[11px] font-extrabold text-rose-400 text-center mb-1 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">{d.unfollows}</div>
                            <div className="relative w-full rounded-t-lg overflow-hidden bg-white/[0.02] ring-1 ring-white/5" style={{ height: `${hUn}%` }}>
                              <div
                                className="absolute bottom-0 left-0 right-0 h-full rounded-t-lg transition-all duration-500 group-hover/bar:brightness-125 overflow-hidden animate-bar-enter"
                                style={{ background: "linear-gradient(to top, rgb(150,40,50), rgb(251,113,133))", boxShadow: "0 0 12px rgba(251,113,133,0.15)", animationDelay: `${mi * 100 + 50}ms` }}
                              >
                                <div className="particles-wrapper">
                                  {[0, 1, 2].map((p) => (<i key={p} className="particle" style={{ animationDelay: `${mi * 0.4 + p * 0.5}s` }} />))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between gap-8 -mx-6 px-6 py-2 border-t border-white/5">
                    {fgData.map((d) => (
                      <span key={d.week} className="text-xs text-neutral-500 text-center w-full">{d.week}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Bottom Section (Duet/Audience/Demographics) + Profile Conversion ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Bottom Section */}
          <div
            className="lg:col-span-5 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.8s both" }}
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-amber-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">{net.bottomSection.title}</h3>
            </div>
            {(() => {
              // hovBS state is at component level
              const bsData = net.bottomSection.data;
              const bsColors = ["url(#bsP)", "url(#bsA)", "url(#bsS)"];
              return (
                <>
                  <div className="relative flex justify-center items-center py-4 z-10" onMouseLeave={() => setHovBS(null)}>
                    <svg className="size-36" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="bsP" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(244,114,182)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(236,72,153)" stopOpacity="0.7"/></linearGradient>
                        <linearGradient id="bsA" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.9"/><stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.7"/></linearGradient>
                        <linearGradient id="bsS" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="rgb(148,163,184)" stopOpacity="0.5"/><stop offset="100%" stopColor="rgb(100,116,139)" stopOpacity="0.4"/></linearGradient>
                        <filter id="bsGlow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                      </defs>
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="16" />
                      {(() => {
                        const r = 70, circ = 2 * Math.PI * r;
                        const gapAngle = 5;
                        const gapLen = (gapAngle / 360) * circ;
                        const totalGap = gapLen * bsData.length;
                        const usable = circ - totalGap;
                        let off = -circ / 4;
                        return bsData.map((ch, idx) => {
                          const len = (ch.pct / 100) * usable;
                          const dash = `${len} ${circ - len}`;
                          const thisOff = off;
                          off += len + gapLen;
                          const isHov = hovBS === ch.label;
                          const isDim = hovBS && !isHov;
                          return (
                            <g key={ch.label}>
                              {isHov && (
                                <circle cx="100" cy="100" r={r} fill="transparent" stroke={bsColors[idx % bsColors.length]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#bsGlow)" />
                              )}
                              <circle cx="100" cy="100" r={r} fill="transparent" stroke={bsColors[idx % bsColors.length]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                              <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHovBS(ch.label)} />
                            </g>
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute text-center pointer-events-none">
                      {hovBS ? (() => {
                        const ch = bsData.find((c) => c.label === hovBS)!;
                        return (
                          <>
                            <p className="text-lg font-bold text-white">{ch.pct}%</p>
                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{ch.label}</p>
                          </>
                        );
                      })() : (
                        <>
                          <p className="text-lg font-bold text-white">{bsData[0].pct}%</p>
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{bsData[0].label}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2.5 relative z-10">
                    {bsData.map((s) => (
                      <div key={s.label} className="flex items-center justify-between cursor-default" onMouseEnter={() => setHovBS(s.label)} onMouseLeave={() => setHovBS(null)}>
                        <div className="flex items-center gap-2">
                          <div className={`size-2.5 rounded-full ${s.color}`} />
                          <span className="text-xs font-semibold text-slate-300">{s.label}</span>
                        </div>
                        <span className="text-xs font-bold text-white">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                  {net.bottomSection.extra && (
                    <div className="mt-5 pt-4 border-t border-white/5 relative z-10">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Detalhes</p>
                      <div className="grid grid-cols-2 gap-3">
                        {net.bottomSection.extra.map((e) => (
                          <div key={e.label} className="text-center p-3 rounded-xl" style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)" }}>
                            <div className="text-lg font-bold text-emerald-400">{e.value}</div>
                            <div className="text-[9px] text-slate-500">{e.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Profile Conversion */}
          <div
            className="lg:col-span-7 glass-panel rounded-2xl p-6"
            style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.85s both" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <span className="text-violet-400/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              </span>
              <h3 className="font-bold text-sm text-slate-300">Conversão de Perfil</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(244,114,182,0.06)", border: "1px solid rgba(244,114,182,0.15)" }}>
                <div>
                  <p className="text-xs font-medium text-slate-400">{net.profileConversion.left.label}</p>
                  <p className="text-2xl font-bold text-pink-400 mt-1">{net.profileConversion.left.value}</p>
                </div>
                <div className="text-pink-400/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-slate-500">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
                <span className="text-sm font-bold text-white">{net.profileConversion.rate}</span>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">Taxa de Conversão</span>
              </div>
              <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                <div>
                  <p className="text-xs font-medium text-slate-400">{net.profileConversion.right.label}</p>
                  <p className="text-2xl font-bold text-violet-400 mt-1">{net.profileConversion.right.value}</p>
                </div>
                <div className="text-violet-400/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

          </>);
        })()}
        {/* ═══ End Other Networks Organic ═══ */}

        </>)}

      </main>

      {/* ── Footer Status – fixed bottom ── */}
      <footer
        className="fixed bottom-8 left-4 right-4 flex items-center justify-between rounded-xl px-8 py-3"
        style={{
          ...glassStyle,
          zIndex: 20,
          animation: "animationIn 0.8s ease-out 0.6s both",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sistema Online - Dados em Tempo Real</span>
        </div>
        <div className="text-[10px] text-neutral-500">
          Última atualização: hoje às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </footer>

      {/* ── Ad Detail Modal ── */}
      {/* ── Story Detail Modal ── */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStory(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row"
            style={{ ...glassStyle, background: "linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)", animation: "animationIn 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedStory(null)} className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {/* Left — Story cover image */}
            <div className="relative md:w-[420px] shrink-0 bg-black flex items-center justify-center">
              <div className="relative w-full aspect-[9/16]">
                <Image src={selectedStory.cover} alt={`Story ${selectedStory.seq}`} fill className="object-cover" />
              </div>
              {selectedStory.type.includes("Video") && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                  </div>
                </div>
              )}
            </div>

            {/* Right — Info */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              <div>
                <h4 className="text-base font-bold text-white">Story {selectedStory.seq}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-slate-300">{selectedStory.type}</span>
                  <span className="text-sm font-bold text-amber-400">{selectedStory.time}</span>
                </div>
              </div>

              {/* Engagement ring */}
              {(() => {
                const viewsNum = parseInt(selectedStory.views.replace(/\./g, ""));
                const likesNum = parseInt(selectedStory.likes.replace(/\./g, ""));
                const reactNum = parseInt(selectedStory.reactions.replace(/\./g, ""));
                const sharesNum = parseInt(selectedStory.shares.replace(/\./g, ""));
                const interNum = likesNum + reactNum + sharesNum;
                const rate = (interNum / viewsNum) * 100;
                const r = 54;
                const circ = 2 * Math.PI * r;
                const filled = (Math.min(rate, 100) / 100) * circ;
                return (
                  <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        <svg className="size-32" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                          <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(251,113,133,0.8)" strokeWidth="10" strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={circ / 4} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-xl font-bold text-rose-400">{rate.toFixed(1)}%</p>
                          <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Engajamento</p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2.5">
                        {[
                          { label: "Curtidas", val: selectedStory.likes, num: likesNum, color: "bg-rose-400" },
                          { label: "Reações", val: selectedStory.reactions, num: reactNum, color: "bg-amber-400" },
                          { label: "Shares", val: selectedStory.shares, num: sharesNum, color: "bg-cyan-400" },
                        ].map(m => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{m.label}</span>
                              <span className="text-xs font-bold text-white">{m.val}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${m.color} rounded-full`} style={{ width: `${(m.num / interNum) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Total interações</span>
                          <span className="text-sm font-bold text-white">{interNum.toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Views", value: selectedStory.views, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg> },
                  { label: "Curtidas", value: selectedStory.likes, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> },
                  { label: "Reações", value: selectedStory.reactions, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg> },
                  { label: "Shares", value: selectedStory.shares, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg> },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-rose-400/60">{m.icon}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{m.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Interaction results */}
              {selectedStory.interaction && (
                <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <h5 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-4">Resultado da Interação</h5>
                  {(selectedStory.interaction.type === "poll" || selectedStory.interaction.type === "quiz") && "options" in selectedStory.interaction && (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-white mb-3">{selectedStory.interaction.question}</p>
                      {selectedStory.interaction.options.map((opt) => {
                        const isCorrect = "correct" in opt && opt.correct;
                        return (
                          <div key={opt.label} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium ${isCorrect ? "text-emerald-400" : "text-slate-300"}`}>
                                {isCorrect && "✓ "}{opt.label}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">{opt.votes} votos</span>
                                <span className="text-xs font-bold text-white">{opt.pct}%</span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full animate-bar-enter"
                                style={{
                                  width: `${opt.pct}%`,
                                  background: isCorrect
                                    ? "linear-gradient(90deg, rgb(52,211,153), rgb(16,185,129))"
                                    : selectedStory.interaction!.type === "poll"
                                      ? "linear-gradient(90deg, rgb(244,114,182), rgb(236,72,153))"
                                      : "linear-gradient(90deg, rgb(148,163,184), rgb(100,116,139))",
                                  boxShadow: isCorrect ? "0 0 12px rgba(52,211,153,0.3)" : undefined,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {selectedStory.interaction.type === "slider" && "avg" in selectedStory.interaction && (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-white">{selectedStory.interaction.question}</p>
                      <div className="h-4 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full animate-bar-enter" style={{ width: `${selectedStory.interaction.avg}%`, background: "linear-gradient(90deg, rgb(251,191,36), rgb(245,158,11))", boxShadow: "0 0 12px rgba(251,191,36,0.3)" }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-amber-400">{selectedStory.interaction.avg}%</span>
                        <span className="text-xs text-slate-500">{selectedStory.interaction.total} respostas</span>
                      </div>
                    </div>
                  )}
                  {selectedStory.interaction.type === "countdown" && "reminders" in selectedStory.interaction && (
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold text-white">{selectedStory.interaction.label}</p>
                      <div className="flex items-center justify-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-400" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <span className="text-3xl font-bold text-violet-400">{selectedStory.interaction.reminders.toLocaleString("pt-BR")}</span>
                      </div>
                      <span className="text-xs text-slate-500">lembretes ativados</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAd(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal – horizontal layout */}
          <div
            className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row"
            style={{ ...glassStyle, background: "linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)", animation: "animationIn 0.3s ease-out both" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button onClick={() => setSelectedAd(null)} className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>

            {/* Left – Cover image (full, no crop) */}
            <div className="relative md:w-[420px] shrink-0 bg-black flex items-center justify-center">
              <div className="relative w-full aspect-[9/16]">
                <Image src={selectedAd.cover} alt={selectedAd.name} fill className="object-contain" />
              </div>
              {selectedAd.type.includes("Video") && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" className="ml-0.5"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                  </div>
                </div>
              )}
            </div>

            {/* Right – Info */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {/* Title + status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedAd.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedAd.type}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                  selectedAd.status === "ATIVO"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                }`}>
                  {selectedAd.status}
                </span>
              </div>

              <div className="pt-4" />

              {/* Taxa de Engajamento – ring gauge */}
              {(() => {
                const viewsNum = parseInt(selectedAd.views.replace(/\./g, ""));
                const likesNum = parseInt(selectedAd.likes.replace(/\./g, ""));
                const commentsNum = parseInt(selectedAd.comments.replace(/\./g, ""));
                const interNum = likesNum + commentsNum;
                const rate = (interNum / viewsNum) * 100;
                const r = 54;
                const circ = 2 * Math.PI * r;
                const filled = (rate / 100) * circ;
                return (
                  <div className="rounded-xl p-5 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-6">
                      {/* Ring gauge */}
                      <div className="relative shrink-0">
                        <svg className="size-32" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                          <circle cx="60" cy="60" r={r} fill="transparent" stroke="rgba(52,211,153,0.8)" strokeWidth="10" strokeDasharray={`${filled} ${circ - filled}`} strokeDashoffset={circ / 4} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s ease" }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-xl font-bold text-emerald-400">{rate.toFixed(1)}%</p>
                          <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Engajamento</p>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2.5">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Curtidas</span>
                              <span className="text-xs font-bold text-white">{selectedAd.likes}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(likesNum / interNum) * 100}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Comentários</span>
                              <span className="text-xs font-bold text-white">{selectedAd.comments}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(commentsNum / interNum) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">Total interações</span>
                          <span className="text-sm font-bold text-white">{interNum.toLocaleString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Views", value: selectedAd.views, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg> },
                  { label: "Curtidas", value: selectedAd.likes, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> },
                  { label: "Comentários", value: selectedAd.comments, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> },
                  { label: "Alcance", value: selectedAd.reach, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-3 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-amber-400/60">{m.icon}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{m.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Performance row */}
              <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">CPM</p>
                  <p className="text-sm font-bold text-slate-300 mt-1">{selectedAd.cpm}</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">CPC</p>
                  <p className="text-sm font-bold text-slate-300 mt-1">{selectedAd.cpc}</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ROAS</p>
                  <p className={`text-sm font-bold mt-1 ${selectedAd.roasGood ? "text-emerald-400" : "text-slate-500"}`}>{selectedAd.roas}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
