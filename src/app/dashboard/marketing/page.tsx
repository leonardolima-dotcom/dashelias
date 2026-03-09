"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
        <div className="flex items-center gap-3">
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
        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
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
              <h3 className="font-bold text-sm text-slate-300">Funil de Conversão</h3>
            </div>

            {/* Funnel stages – centered with side metrics */}
            <div className="relative z-10">
              {(() => {
                const stages = [
                  { label: "Impressões", count: "245.800", delta: "+18.3%", up: true, w: 72,
                    after: [{ k: "CPC", v: "R$ 0,82", d: "+5.1%", up: true }, { k: "CTR", v: "4,8%", d: "+12.4%", up: true }] },
                  { label: "Cliques", count: "11.800", delta: "+12.1%", up: true, w: 60,
                    after: [{ k: "C/PageView", v: "R$ 1,05", d: "+3.7%", up: true }, { k: "Connect Rate", v: "86,2%", d: "-2.4%", up: false }] },
                  { label: "PageViews", count: "10.170", delta: "-3.8%", up: false, w: 50,
                    after: [{ k: "C/Checkout", v: "R$ 3,20", d: "+6.8%", up: true }, { k: "%Checkout", v: "7,6%", d: "+14.2%", up: true }] },
                  { label: "Checkout", count: "775", delta: "+7.2%", up: true, w: 42,
                    after: [{ k: "C/Compra", v: "R$ 10,04", d: "-5.1%", up: false }, { k: "%Compra", v: "32,1%", d: "+8.9%", up: true }] },
                  { label: "Compras", count: "249", delta: "+5.6%", up: true, w: 34, highlight: true, after: [] },
                ];
                return stages.map((stage, i) => (
                  <div key={stage.label}>
                    {/* Row: left metric | funnel bar | right metric */}
                    <div className="flex items-center">
                      {/* Left metric */}
                      <div className="flex-1 min-w-0 pr-3 text-right">
                        {stage.after.length > 0 && (
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{stage.after[0].k}</p>
                            <p className="text-sm font-bold text-white leading-tight">{stage.after[0].v}</p>
                            {stage.after[0].d !== "-" && (
                              <p className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${stage.after[0].up ? "text-emerald-400" : "text-rose-400"}`}>
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  {stage.after[0].up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                                </svg>
                                {stage.after[0].d}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Funnel bar – centered */}
                      <div
                        className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-default py-2.5 ${stage.highlight ? "border border-amber-400/30" : "border border-white/[0.06]"}`}
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

                      {/* Right metric */}
                      <div className="flex-1 min-w-0 pl-3">
                        {stage.after.length > 1 && (
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{stage.after[1].k}</p>
                            <p className="text-sm font-bold text-white leading-tight">{stage.after[1].v}</p>
                            {stage.after[1].d !== "-" && (
                              <p className={`text-[9px] font-bold flex items-center gap-0.5 ${stage.after[1].up ? "text-emerald-400" : "text-rose-400"}`}>
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  {stage.after[1].up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                                </svg>
                                {stage.after[1].d}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dotted connector between stages */}
                    {i < stages.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <div className="w-px h-2 border-l border-dashed border-white/10" />
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
            <h3 className="font-bold text-sm text-slate-300">Melhores Anúncios</h3>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-2 custom-scrollbar relative z-10 snap-x snap-mandatory flex-1 min-h-0">
            {ads.map((ad) => (
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
              <h3 className="font-bold text-sm text-slate-300">Engajamento por Público</h3>
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
                  const gradIds = ["url(#engAmber)", "url(#engEmerald)"];
                  const usable = circ - gap * engagement.length;
                  let off = -circ / 4;
                  return engagement.map((e, idx) => {
                    const len = (e.pct / 100) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gap;
                    const isHov = hoveredEngagement === e.label;
                    const isDim = hoveredEngagement && !isHov;
                    const gradColor = gradIds[idx] || gradIds[gradIds.length - 1];
                    return (
                      <g key={e.label}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradColor} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="round" opacity="0.2" filter="url(#engGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={gradColor} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="round" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredEngagement(e.label)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              {hoveredEngagement && (() => {
                const e = engagement.find((x) => x.label === hoveredEngagement)!;
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
              {engagement.map((e) => (
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
              <h3 className="font-bold text-sm text-slate-300">Evolução Temporal</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-slate-500">Impressões</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-slate-500" />
                <span className="text-[10px] text-slate-500">Cliques</span>
              </div>
            </div>
          </div>
          <div className="relative h-48 w-full z-10" onMouseLeave={() => setHoveredEvolution(null)}>
            {(() => {
              const maxImp = Math.max(...evolutionData.map((d) => d.impressoes));
              const maxClk = Math.max(...evolutionData.map((d) => d.cliques));
              const pad = 20;
              const w = 1000;
              const h = 200;
              const impPts = evolutionData.map((d, i) => ({
                x: pad + (i / (evolutionData.length - 1)) * (w - pad * 2),
                y: h - pad - ((d.impressoes / maxImp) * (h - pad * 2)),
              }));
              const clkPts = evolutionData.map((d, i) => ({
                x: pad + (i / (evolutionData.length - 1)) * (w - pad * 2),
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
              const colW = (w - pad * 2) / evolutionData.length;
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
                      {evolutionData.map((_, i) => (
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
                    {evolutionData.map((_, i) => (
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
                    const d = evolutionData[hoveredEvolution];
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
              {evolutionData.map((d) => <span key={d.date}>{d.date}</span>)}
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
              <h3 className="font-bold text-sm text-slate-300">Investimento vs Retorno por Campanha</h3>
            </div>
            <div className="space-y-6 relative z-10">
              {campaigns.map((c) => (
                <div key={c.name} className="space-y-2 group/bar">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-emerald-400">{c.returned} retornado</span>
                  </div>
                  <div className="relative">
                    <svg width="100%" height="14" className="block overflow-visible">
                      <defs>
                        <linearGradient id={`invGrad-${c.name.replace(/\s/g,"")}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgb(217,119,6)" />
                          <stop offset="100%" stopColor="rgb(251,191,36)" />
                        </linearGradient>
                        <linearGradient id={`retGrad-${c.name.replace(/\s/g,"")}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(52,211,153,0.5)" />
                          <stop offset="100%" stopColor="rgba(5,150,105,0.7)" />
                        </linearGradient>
                        <filter id={`barGlow-${c.name.replace(/\s/g,"")}`}>
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      {/* Track */}
                      <rect x="0" y="1" width="100%" height="12" rx="6" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      {/* Invest bar */}
                      <rect x="0" y="1" width={`${c.investPct}%`} height="12" rx="6"
                        fill={`url(#invGrad-${c.name.replace(/\s/g,"")})`}
                        className="transition-all duration-300 group-hover/bar:brightness-110"
                        filter={`url(#barGlow-${c.name.replace(/\s/g,"")})`}
                      />
                      {/* Shimmer on invest bar */}
                      <rect x="0" y="1" width={`${c.investPct}%`} height="12" rx="6"
                        fill="url(#shimmer)" className="opacity-30" style={{ mixBlendMode: "overlay" }}
                      />
                      {/* Return bar */}
                      <rect x={`${c.investPct}%`} y="1" width={`${c.returnPct}%`} height="12" rx="6"
                        fill={`url(#retGrad-${c.name.replace(/\s/g,"")})`}
                        className="transition-all duration-300"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gasto: <span className="text-red-400 font-semibold">{c.spent}</span></span>
                    <span className="text-slate-500">ROAS: {c.roas}</span>
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
