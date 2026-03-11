"use client";

import { useState, useRef, useCallback } from "react";
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

const paidVsOrganicConversions = [
  { month: "Nov", pago: 320, organico: 180 },
  { month: "Dez", pago: 380, organico: 240 },
  { month: "Jan", pago: 350, organico: 290 },
  { month: "Fev", pago: 370, organico: 340 },
];

/* ─────────────────────────────────────────────
   DATA — PAID TRAFFIC ADDITIONS
   ───────────────────────────────────────────── */

const healthScore = [
  { label: "Freq. Anúncio", value: "1.8x", status: "good" as const, tooltip: "Frequência do Anúncio — Média de vezes que o mesmo usuário viu seu anúncio. Cálculo: Impressões ÷ Alcance. Acima de 3.5x indica fadiga criativa (CPC sobe, CTR cai). Fonte: Meta Ads Manager. Zona verde ≤ 2.5, amarela 2.5–3.5, vermelha > 3.5." },
  { label: "Quality Score", value: "8.2", status: "good" as const, tooltip: "Quality Score — Nota de 1 a 10 atribuída pelo Google Ads com base na relevância do anúncio, CTR esperado e experiência na landing page. Cálculo: média ponderada de Ad Relevance + Expected CTR + Landing Page Experience. Acima de 7 = saudável." },
  { label: "Budget Pace", value: "74%", status: "warn" as const, tooltip: "Budget Pace — Percentual do orçamento consumido em relação ao planejado para o período. Cálculo: Gasto Real ÷ Budget Planejado × 100. Detecta campanhas em overspend (> 100%) ou underspend (< 60%). Fonte: Soma dos gastos por campanha ativa." },
  { label: "ROAS vs Meta", value: "4.2x", status: "good" as const, tooltip: "ROAS vs Meta — Retorno sobre investimento em anúncios comparado à meta definida. Cálculo: Receita Gerada ÷ Investimento em Ads. O break-even ROAS mínimo é 2.0x para ser lucrativo. Acima de 4x = excelente. Fonte: Meta Ads + Google Ads." },
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
  const [mainTab, setMainTab] = useState<"pago" | "organico">("pago");
  const [hoveredNewUsers, setHoveredNewUsers] = useState<string | null>(null);
  const [hoveredHeat, setHoveredHeat] = useState<{ day: string; hour: number; val: number; x: number; y: number } | null>(null);
  const [hoveredReach, setHoveredReach] = useState<string | null>(null);
  const [hoveredSentiment, setHoveredSentiment] = useState<string | null>(null);
  const [hoveredRetention, setHoveredRetention] = useState<number | null>(null);
  const [hoveredOrgEvo, setHoveredOrgEvo] = useState<number | null>(null);

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
          {/* Tab switcher */}
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

        {/* ── Health Score ── */}
        <div
          className="glass-panel rounded-2xl p-6"
          style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.1s both", overflow: "visible" }}
        >
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <span className="text-amber-400/60">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </span>
            <h3 className="font-bold text-sm text-slate-300">Score de Saúde da Conta</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 relative z-10" style={{ overflow: "visible" }}>
            {healthScore.map((h, hi) => {
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

            {/* Funnel stages – centered with side metrics between bars */}
            <div className="relative z-10">
              {(() => {
                const stages = [
                  { label: "Impressões", count: "245.800", delta: "+18.3%", up: true, w: 72 },
                  { label: "Cliques", count: "11.800", delta: "+12.1%", up: true, w: 60 },
                  { label: "PageViews", count: "10.170", delta: "-3.8%", up: false, w: 50 },
                  { label: "Checkout", count: "775", delta: "+7.2%", up: true, w: 42 },
                  { label: "Compras", count: "249", delta: "+5.6%", up: true, w: 34, highlight: true },
                ];
                const betweenMetrics = [
                  { left: { k: "CPC", v: "R$ 0,82", d: "+5.1%", up: true }, right: { k: "CTR", v: "4,8%", d: "+12.4%", up: true } },
                  { left: { k: "C/PAGEVIEW", v: "R$ 1,05", d: "+3.7%", up: true }, right: { k: "CONNECT RATE", v: "86,2%", d: "-2.4%", up: false } },
                  { left: { k: "C/CHECKOUT", v: "R$ 3,20", d: "+6.8%", up: true }, right: { k: "%CHECKOUT", v: "7,6%", d: "+14.2%", up: true } },
                  { left: { k: "C/COMPRA", v: "R$ 10,04", d: "-5.1%", up: false }, right: { k: "%COMPRA", v: "32,1%", d: "+8.9%", up: true } },
                ];

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
              {campaigns.map((c, i) => (
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
            <h3 className="font-bold text-sm text-slate-300">Budget Pace por Campanha</h3>
          </div>
          <div className="space-y-5 relative z-10">
            {budgetPace.map((b, i) => {
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
              <h3 className="font-bold text-sm text-slate-300">Comportamento On-site</h3>
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
                <h3 className="font-bold text-sm text-slate-300">Frequência do Anúncio</h3>
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
            <h3 className="font-bold text-sm text-slate-300">Mapa de Calor — Conversões por Hora × Dia</h3>
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

        </>)}

        {/* ════════════════ TRÁFEGO ORGÂNICO ════════════════ */}
        {mainTab === "organico" && (<>

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
              <h3 className="font-bold text-sm text-slate-300">Sessões por Canal — Mensal</h3>
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
              <h3 className="font-bold text-sm text-slate-300">Top Keywords Orgânicas</h3>
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
                <h3 className="font-bold text-sm text-slate-300">Conversões: Pago vs Orgânico</h3>
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
                <h3 className="font-bold text-sm text-slate-300">Evolução Impressões Orgânicas</h3>
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
              <h3 className="font-bold text-sm text-slate-300">Novos Usuários por Canal</h3>
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
                <h3 className="font-bold text-sm text-slate-300">Curva de Retenção de Vídeo</h3>
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
                <h3 className="font-bold text-sm text-slate-300">Share Rate por Conteúdo</h3>
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
              <h3 className="font-bold text-sm text-slate-300">Funil de Stories — Sequência</h3>
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
              <h3 className="font-bold text-sm text-slate-300">Origem do Alcance</h3>
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
                <h3 className="font-bold text-sm text-slate-300">Crescimento Líquido de Seguidores</h3>
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
              <h3 className="font-bold text-sm text-slate-300">Análise de Sentimento</h3>
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
            <h3 className="font-bold text-sm text-slate-300">Conversão Perfil → Follow</h3>
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
