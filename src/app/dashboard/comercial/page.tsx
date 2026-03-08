"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─────────────────────────────────────────────
   DATA  (extracted from instruções.html)
   ───────────────────────────────────────────── */

const kpis = [
  { label: "Vendas", value: "142", delta: "+5%", up: true, icon: "shopping-cart" },
  { label: "Faturamento", value: "R$ 520k", delta: "+12%", up: true, icon: "dollar" },
  { label: "Ticket Médio", value: "R$ 3.6k", delta: "-2%", up: false, icon: "receipt" },
  { label: "MQL p/ Fatur.", value: "R$ 1.2k", delta: "+8%", up: true, icon: "target" },
  { label: "SQL p/ Fatur.", value: "R$ 2.8k", delta: "+4%", up: true, icon: "zap" },
  { label: "Ciclo Venda", value: "14 dias", delta: "-10%", up: false, icon: "clock" },
];

const funnelStages = [
  { label: "LEADS NOVOS (MQL)", count: "1.240", pct: "100%", width: "100%", delay: 0 },
  { label: "QUALIFICADOS (SQL)", count: "930", pct: "75%", width: "calc(100% - 1rem)", delay: 80 },
  { label: "PROPOSTAS", count: "465", pct: "50%", width: "calc(100% - 2rem)", delay: 160 },
  { label: "NEGOCIAÇÃO", count: "139", pct: "30%", width: "calc(100% - 3rem)", delay: 240 },
  { label: "VENDAS", count: "21", pct: "15%", width: "calc(100% - 4rem)", delay: 320, highlight: true },
];

const vendasBars = [
  { day: "SEG", h: "40%", val: "16" },
  { day: "TER", h: "60%", val: "22" },
  { day: "QUA", h: "45%", val: "18" },
  { day: "QUI", h: "80%", val: "26" },
  { day: "SEX", h: "55%", val: "20" },
  { day: "SAB", h: "30%", val: "12" },
  { day: "DOM", h: "95%", val: "28", today: true },
];

const faturamentoBars = [
  { day: "SEG", h: "50%", val: "R$ 52k" },
  { day: "TER", h: "40%", val: "R$ 41k" },
  { day: "QUA", h: "70%", val: "R$ 72k" },
  { day: "QUI", h: "90%", val: "R$ 94k" },
  { day: "SEX", h: "65%", val: "R$ 67k" },
  { day: "SAB", h: "40%", val: "R$ 42k" },
  { day: "DOM", h: "85%", val: "R$ 88k", today: true },
];

const efficiency = [
  { label: "Taxa Vendas vs MQL", value: "1.7%", pct: 1.7 },
  { label: "Taxa Vendas vs SQL", value: "2.26%", pct: 2.26 },
  { label: "Tempo Médio Ciclo", value: "14.2d", pct: 45 },
];

/* ─────────────────────────────────────────────
   SMALL COMPONENTS
   ───────────────────────────────────────────── */

const kpiIcons: Record<string, React.ReactNode> = {
  "shopping-cart": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  ),
  dollar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  receipt: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
    </svg>
  ),
  target: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  zap: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
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
   BAR CHART COMPONENT
   ───────────────────────────────────────────── */

function BarChart({
  title,
  subtitle,
  bars,
  icon,
}: {
  title: string;
  subtitle?: string;
  bars: typeof vendasBars;
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 group" style={glassStyle}>
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          {icon && <span className="text-amber-400/60">{icon}</span>}
          <h3 className="font-semibold text-sm text-slate-300">{title}</h3>
        </div>
        {subtitle && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            {subtitle}
          </div>
        )}
      </div>

      {/* Bars */}
      <div className="h-48 flex items-end justify-between gap-3 relative mt-1">
        <div className="absolute top-0 left-0 right-0 h-px border-t border-dashed border-white/10 w-full z-0" />
        {bars.map((bar, i) => (
          <div key={bar.day} className="flex flex-col items-center gap-3 w-full h-full group/bar cursor-pointer z-10">
            {bar.val && (
              <div className="text-[10px] font-bold text-amber-400 whitespace-nowrap h-4 flex items-end">
                {bar.val}
              </div>
            )}
            <div className="relative w-full flex-1 rounded-lg overflow-hidden bg-white/[0.02] ring-1 ring-white/5">
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-lg transition-all duration-500 group-hover/bar:brightness-110 bg-gradient-to-t from-amber-600 to-amber-400 overflow-hidden ${
                  bar.today
                    ? "shadow-[0_0_30px_rgba(251,191,36,0.3)]"
                    : "shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                } animate-bar-enter`}
                style={{ height: bar.h, animationDelay: `${i * 100}ms` }}
              >
                <div className="particles-wrapper" style={{ animationDelay: `${i * 0.6}s` }}>
                  {[0, 1, 2, 3, 4].map((p) => (
                    <i key={p} className="particle" style={{ animationDelay: `${i * 0.6 + p * 0.4}s` }} />
                  ))}
                </div>
              </div>
            </div>
            <span className={`text-xs transition-colors group-hover/bar:text-white ${bar.today ? "text-amber-400 font-semibold" : "text-neutral-500"}`}>
              {bar.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
   ───────────────────────────────────────────── */

export default function ComercialPage() {
  const router = useRouter();

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background layers – fixed */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <div className="h-[120vh] w-[120vh] rounded-full"
          style={{ background: "rgba(255, 177, 23, 0.25)", filter: "blur(120px)", animation: "orbPulse 5s ease-in-out infinite" }} />
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
                <h2 className="text-xl font-bold text-white tracking-tight">Dashboard Comercial</h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Performance Mensal</p>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi, idx) => (
              <div
                key={kpi.label}
                className="glass-panel p-5 rounded-2xl cursor-default"
                style={{ ...glassStyle, animation: `animationIn 0.8s ease-out ${0.2 + idx * 0.05}s both` }}
              >
                {/* Subtle glow on hover */}
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

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Funnel */}
            <div
              className="lg:col-span-4 glass-panel rounded-2xl p-6"
              style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.3s both" }}
            >
              {/* Glow */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="font-bold text-lg text-white tracking-tight">Funil de Vendas</h3>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                {funnelStages.map((stage, i) => (
                  <div
                    key={stage.label}
                    className="flex items-center gap-4 group/funnel"
                    style={{ paddingLeft: `${i * 1}rem` }}
                  >
                    <div
                      className={`h-14 rounded-l-lg border-l-4 flex items-center px-4 relative transition-all duration-300 ${
                        stage.highlight ? "border-amber-400" : `border-amber-400/${100 - i * 20}`
                      }`}
                      style={{ width: stage.width }}
                      onMouseEnter={(e) => {
                        const bg = stage.highlight ? "rgba(245,158,11,0.20)" : `rgba(245,158,11,${(20 - i * 4) / 100})`;
                        e.currentTarget.style.background = bg;
                        if (stage.highlight) e.currentTarget.style.boxShadow = "0 0 15px rgba(251,191,36,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${stage.highlight ? "text-amber-400" : "text-slate-300"}`}>
                          {stage.label}
                        </p>
                        <p className="text-lg font-bold text-white">{stage.count}</p>
                      </div>
                      <div
                        className={`absolute -right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10px] font-bold z-10 ${
                          stage.highlight
                            ? "bg-amber-400 text-black"
                            : "bg-black border border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {stage.pct}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-metrics */}
              <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-black border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Tx. MQL para SQL</p>
                    <span className="text-amber-400/50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
                  </div>
                  <p className="text-xl font-bold text-white">75,0%</p>
                </div>
                <div className="bg-black border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Tx. SQL para Venda</p>
                    <span className="text-emerald-400/50"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg></span>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">22,5%</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="lg:col-span-8 space-y-6">
              {/* Bar Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BarChart title="Vol. Vendas (Dia)" bars={vendasBars} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>} />
                <BarChart title="Vol. Faturamento (Dia)" subtitle="+R$ 12k HOJE" bars={faturamentoBars} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
              </div>

              {/* Efficiency Indicators */}
              <div
                className="glass-panel rounded-2xl p-6"
                style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.5s both" }}
              >
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <span className="text-amber-400/60"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg></span>
                  <h3 className="font-bold text-sm text-slate-300">Indicadores de Eficiência</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                  {efficiency.map((ind) => (
                    <div key={ind.label} className="flex flex-col gap-2">
                      <span className="text-xs text-slate-400">{ind.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(251,191,36,0.3)] relative"
                            style={{ width: `${Math.max(ind.pct, 3)}%` }}
                          >
                            <div className="particles-wrapper-h">
                              <i className="particle" /><i className="particle" /><i className="particle" />
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-white min-w-[3.5rem] text-right">{ind.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
    </div>
  );
}
