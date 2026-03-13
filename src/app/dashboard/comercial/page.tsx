"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─────────────────────────────────────────────
   DATA — KPIs de Topo (B01 expandido)
   ───────────────────────────────────────────── */

const kpis: { label: string; value: string; delta: string; up: boolean; icon: string; meta: number; realizado: number; inverse?: boolean }[] = [
  { label: "Faturamento", value: "R$ 520k", delta: "+12%", up: true, icon: "dollar", meta: 600000, realizado: 520000 },
  { label: "Novas Vendas", value: "142", delta: "+8.1%", up: true, icon: "cart", meta: 180, realizado: 142 },
  { label: "Ticket Médio", value: "R$ 3.6k", delta: "-2%", up: false, icon: "receipt", meta: 4000, realizado: 3600 },
  { label: "Win Rate", value: "22.5%", delta: "+3.1%", up: true, icon: "trophy", meta: 30, realizado: 22.5 },
  { label: "Pipeline Ativo", value: "R$ 890k", delta: "+18%", up: true, icon: "pipeline", meta: 1000000, realizado: 890000 },
  { label: "CAC", value: "R$ 1.2k", delta: "-8%", up: true, icon: "target", meta: 1500, realizado: 1200 },
  { label: "Ciclo Venda", value: "14d", delta: "-10%", up: true, icon: "clock", meta: 18, realizado: 14 },
  { label: "MQL→SQL", value: "75%", delta: "+2%", up: true, icon: "zap", meta: 80, realizado: 75 },
  { label: "Score SPIN", value: "7.5", delta: "+4.2%", up: true, icon: "brain", meta: 10, realizado: 7.5 },
  { label: "MRR Acum.", value: "R$ 93k", delta: "+18%", up: true, icon: "dollar", meta: 120000, realizado: 93000 },
  { label: "Taxa BANT+", value: "64%", delta: "+2.3%", up: true, icon: "target", meta: 80, realizado: 64 },
  { label: "Tempo 1º Atend.", value: "3.8h", delta: "-12%", up: true, icon: "clock", meta: 4, realizado: 3.8, inverse: true },
];

/* ─────────────────────────────────────────────
   DATA — Funil SDR + Closer (B06)
   ───────────────────────────────────────────── */

const sdrFunnel = {
  stages: [
    { label: "Lead Novo (MQL)", count: "1.240", delta: "—", up: true, w: 100 },
    { label: "Primeiro Contato", count: "1.054", delta: "+3.2%", up: true, w: 85 },
    { label: "Lead Trabalhando", count: "868", delta: "-1.4%", up: false, w: 70 },
    { label: "SQL — Reunião Ag.", count: "930", delta: "+5.8%", up: true, w: 58, highlight: true },
    { label: "Reunião Realizada", count: "791", delta: "+2.1%", up: true, w: 45 },
  ],
  between: [
    { left: { k: "TX. CONTATO", v: "85%", d: "+2.1%", up: true }, right: { k: "TEMPO", v: "< 1h", d: "-12%", up: true } },
    { left: { k: "TX. QUALIF.", v: "82,3%", d: "-1.4%", up: false }, right: { k: "TEMPO", v: "3.2d", d: "+0.5d", up: false } },
    { left: { k: "TX. MQL→SQL", v: "75%", d: "+5.8%", up: true }, right: { k: "TEMPO", v: "5.1d", d: "-0.8d", up: true } },
    { left: { k: "SHOW RATE", v: "85%", d: "+3.2%", up: true }, right: { k: "TEMPO", v: "1.2d", d: "-0.3d", up: true } },
  ],
};

const closerFunnel = {
  stages: [
    { label: "Reunião Realizada", count: "791", delta: "+2.1%", up: true, w: 100 },
    { label: "Proposta Enviada", count: "465", delta: "+4.5%", up: true, w: 78 },
    { label: "Em Negociação", count: "139", delta: "-2.3%", up: false, w: 55 },
    { label: "Venda Fechada", count: "21", delta: "+8.1%", up: true, w: 38, highlight: true },
    { label: "Perdido / No-show", count: "118", delta: "+1.2%", up: false, w: 28 },
  ],
  between: [
    { left: { k: "TX. PROPOSTA", v: "58,8%", d: "+3.1%", up: true }, right: { k: "TEMPO", v: "2.3d", d: "-0.5d", up: true } },
    { left: { k: "TX. NEGOCIAÇÃO", v: "29,9%", d: "-4.2%", up: false }, right: { k: "TEMPO", v: "6.8d", d: "+1.2d", up: false } },
    { left: { k: "WIN RATE", v: "15,1%", d: "+2.8%", up: true }, right: { k: "TEMPO", v: "4.1d", d: "-1.0d", up: true } },
    { left: { k: "TX. PERDA", v: "84,9%", d: "-2.8%", up: true }, right: { k: "NO-SHOW", v: "15%", d: "-1.1%", up: true } },
  ],
};

const sdrMetrics = [
  { label: "Taxa de Contato", value: "85%", desc: "contatados / MQL" },
  { label: "Taxa MQL → SQL", value: "75%", desc: "qualificados" },
  { label: "Tempo Médio Qualif.", value: "5.1d", desc: "MQL → SQL" },
  { label: "Show Rate", value: "85%", desc: "reuniões realizadas" },
  { label: "Tentativas/Lead", value: "3.4x", desc: "touchpoints médio" },
];

const closerMetrics = [
  { label: "Win Rate", value: "22.5%", desc: "propostas ganhas" },
  { label: "Tempo SQL→Fech.", value: "13.2d", desc: "ciclo do closer" },
  { label: "Taxa de No-show", value: "15%", desc: "não compareceram" },
  { label: "Ticket Médio", value: "R$ 3.6k", desc: "por fechamento" },
  { label: "Propostas Abertas", value: "47", desc: "aguardando resposta" },
];

/* ─────────────────────────────────────────────
   DATA — Ranking de Canais (B07) — 4 abas
   ───────────────────────────────────────────── */

type RankingTab = "volume" | "faturamento" | "conversao" | "ciclo";

const rankingCanaisData: Record<RankingTab, { entries: { name: string; value: string; pct: number; color: string }[] }> = {
  volume: {
    entries: [
      { name: "Instagram Ads", value: "52 vendas", pct: 90, color: "rgba(251,191,36,0.5)" },
      { name: "Google Ads", value: "39 vendas", pct: 68, color: "rgba(148,163,184,0.4)" },
      { name: "Indicação", value: "32 vendas", pct: 55, color: "rgba(180,83,9,0.4)" },
      { name: "Orgânico", value: "19 vendas", pct: 32, color: "rgba(110,231,183,0.35)" },
    ],
  },
  faturamento: {
    entries: [
      { name: "Indicação", value: "R$ 198k", pct: 90, color: "rgba(52,211,153,0.5)" },
      { name: "Instagram Ads", value: "R$ 152k", pct: 70, color: "rgba(251,191,36,0.4)" },
      { name: "Google Ads", value: "R$ 113k", pct: 50, color: "rgba(148,163,184,0.4)" },
      { name: "Orgânico", value: "R$ 57k", pct: 25, color: "rgba(167,139,250,0.35)" },
    ],
  },
  conversao: {
    entries: [
      { name: "Indicação", value: "8.4%", pct: 85, color: "rgba(251,191,36,0.5)" },
      { name: "Orgânico", value: "5.1%", pct: 50, color: "rgba(148,163,184,0.4)" },
      { name: "Google Ads", value: "3.2%", pct: 33, color: "rgba(180,83,9,0.4)" },
      { name: "Instagram Ads", value: "2.0%", pct: 20, color: "rgba(110,231,183,0.35)" },
    ],
  },
  ciclo: {
    entries: [
      { name: "Orgânico", value: "8.2d", pct: 90, color: "rgba(52,211,153,0.5)" },
      { name: "Instagram Ads", value: "12.1d", pct: 70, color: "rgba(148,163,184,0.4)" },
      { name: "Google Ads", value: "15.8d", pct: 50, color: "rgba(180,83,9,0.4)" },
      { name: "Indicação", value: "24.0d", pct: 25, color: "rgba(251,113,133,0.35)" },
    ],
  },
};

const rankingTabLabels: Record<RankingTab, string> = {
  volume: "Volume",
  faturamento: "Faturamento",
  conversao: "Conversão",
  ciclo: "Ciclo",
};

/* ─────────────────────────────────────────────
   DATA — Ranking de Vendedores (B08)
   ───────────────────────────────────────────── */

type SellerTab = "sdr" | "closer" | "todos";

const sdrRanking = [
  { name: "Ana Lima", value: "312 SQLs", subMetrics: "Tx.Qual: 82% · Show: 91% · Tempo: 4.2d", pct: 90, initials: "AL", color: "from-cyan-500 to-cyan-400" },
  { name: "Carlos M.", value: "251 SQLs", subMetrics: "Tx.Qual: 76% · Show: 87% · Tempo: 5.5d", pct: 72, initials: "CM", color: "from-sky-500 to-sky-400" },
  { name: "Fernanda R.", value: "194 SQLs", subMetrics: "Tx.Qual: 71% · Show: 82% · Tempo: 6.1d", pct: 55, initials: "FR", color: "from-teal-500 to-teal-400" },
  { name: "Pedro S.", value: "173 SQLs", subMetrics: "Tx.Qual: 68% · Show: 80% · Tempo: 6.8d", pct: 50, initials: "PS", color: "from-emerald-500 to-emerald-400" },
];

const closerRanking = [
  { name: "Rafael S.", value: "R$ 198k", subMetrics: "Win: 31% · Ticket: R$4.2k · Ciclo: 11d · SPIN: 8.4", pct: 90, initials: "RS", color: "from-amber-500 to-amber-400" },
  { name: "Juliana P.", value: "R$ 142k", subMetrics: "Win: 26% · Ticket: R$3.8k · Ciclo: 14d · SPIN: 7.8", pct: 65, initials: "JP", color: "from-orange-500 to-orange-400" },
  { name: "Marcos T.", value: "R$ 97k", subMetrics: "Win: 19% · Ticket: R$3.2k · Ciclo: 16d · SPIN: 7.1", pct: 44, initials: "MT", color: "from-yellow-600 to-yellow-500" },
  { name: "Beatriz C.", value: "R$ 83k", subMetrics: "Win: 17% · Ticket: R$2.9k · Ciclo: 18d · SPIN: 6.5", pct: 38, initials: "BC", color: "from-rose-500 to-rose-400" },
];

/* ─────────────────────────────────────────────
   DATA — Meta vs Realizado (B09)
   ───────────────────────────────────────────── */

const metaCards = [
  { label: "Faturamento", realizado: 520000, meta: 600000, unit: "R$", format: (v: number) => `R$ ${(v / 1000).toFixed(0)}k` },
  { label: "Vendas", realizado: 142, meta: 180, unit: "", format: (v: number) => `${v}` },
  { label: "SQLs Gerados", realizado: 930, meta: 1100, unit: "", format: (v: number) => `${v}` },
];

/* ─────────────────────────────────────────────
   DATA — Pipeline Ativo (B10)
   ───────────────────────────────────────────── */

const pipelineItems = [
  { name: "Barbearia Premium", value: "R$ 45k", stage: "Negociação", days: 3, risk: "low" as const },
  { name: "Barber Studio VIP", value: "R$ 32k", stage: "Proposta", days: 7, risk: "medium" as const },
  { name: "Dom Barba", value: "R$ 28k", stage: "Negociação", days: 12, risk: "high" as const },
  { name: "Corte & Estilo", value: "R$ 22k", stage: "Proposta", days: 2, risk: "low" as const },
  { name: "Navalha Dourada", value: "R$ 18k", stage: "Negociação", days: 15, risk: "high" as const },
  { name: "Barba & Cia", value: "R$ 15k", stage: "Proposta", days: 5, risk: "low" as const },
];

/* ─────────────────────────────────────────────
   DATA — Motivos de Perda (B11)
   ───────────────────────────────────────────── */

const lossReasons = [
  { reason: "Preço alto", pct: 32, color: "#fb7185", neutralizacao: 65 },
  { reason: "Sem orçamento", pct: 22, color: "#fbbf24", neutralizacao: 58 },
  { reason: "Concorrente", pct: 18, color: "#a78bfa", neutralizacao: 72 },
  { reason: "Timing", pct: 14, color: "#22d3ee", neutralizacao: 80 },
  { reason: "Sem interesse", pct: 8, color: "#6ee7b7", neutralizacao: 75 },
  { reason: "Perfil errado", pct: 6, color: "#94a3b8", neutralizacao: 45 },
];

/* ─────────────────────────────────────────────
   DATA — Evolução 12 Meses (B12)
   ───────────────────────────────────────────── */

const evolution12m = [
  { month: "Abr", vendas: 98, conversao: 1.2, ticket: 3200, mrr: 62000 },
  { month: "Mai", vendas: 112, conversao: 1.4, ticket: 3350, mrr: 71000 },
  { month: "Jun", vendas: 105, conversao: 1.3, ticket: 3100, mrr: 68000 },
  { month: "Jul", vendas: 118, conversao: 1.5, ticket: 3400, mrr: 75000 },
  { month: "Ago", vendas: 125, conversao: 1.6, ticket: 3500, mrr: 79000 },
  { month: "Set", vendas: 130, conversao: 1.7, ticket: 3550, mrr: 82000 },
  { month: "Out", vendas: 119, conversao: 1.5, ticket: 3300, mrr: 76000 },
  { month: "Nov", vendas: 138, conversao: 1.8, ticket: 3600, mrr: 85000 },
  { month: "Dez", vendas: 155, conversao: 2.0, ticket: 3800, mrr: 95000 },
  { month: "Jan", vendas: 128, conversao: 1.6, ticket: 3450, mrr: 80000 },
  { month: "Fev", vendas: 135, conversao: 1.7, ticket: 3550, mrr: 84000 },
  { month: "Mar", vendas: 142, conversao: 1.7, ticket: 3600, mrr: 93000 },
];

/* ─────────────────────────────────────────────
   DATA — Volume diário 30 dias (B03/B04 expandido)
   ───────────────────────────────────────────── */

const volumeDiario = [
  { day: "01", vendas: 4, fat: 14 }, { day: "02", vendas: 6, fat: 22 }, { day: "03", vendas: 3, fat: 11 },
  { day: "04", vendas: 5, fat: 18 }, { day: "05", vendas: 7, fat: 25 }, { day: "06", vendas: 2, fat: 7 },
  { day: "07", vendas: 1, fat: 4 }, { day: "08", vendas: 5, fat: 19 }, { day: "09", vendas: 8, fat: 29 },
  { day: "10", vendas: 6, fat: 22 }, { day: "11", vendas: 4, fat: 15 }, { day: "12", vendas: 7, fat: 26 },
  { day: "13", vendas: 3, fat: 11 }, { day: "14", vendas: 2, fat: 7 }, { day: "15", vendas: 6, fat: 21 },
  { day: "16", vendas: 9, fat: 33 }, { day: "17", vendas: 5, fat: 18 }, { day: "18", vendas: 4, fat: 15 },
  { day: "19", vendas: 7, fat: 25 }, { day: "20", vendas: 3, fat: 11 }, { day: "21", vendas: 1, fat: 4 },
  { day: "22", vendas: 6, fat: 22 }, { day: "23", vendas: 8, fat: 29 }, { day: "24", vendas: 5, fat: 18 },
  { day: "25", vendas: 4, fat: 14 }, { day: "26", vendas: 7, fat: 26 }, { day: "27", vendas: 6, fat: 22 },
  { day: "28", vendas: 3, fat: 11 }, { day: "29", vendas: 5, fat: 18 }, { day: "30", vendas: 8, fat: 29 },
];

const metaDiariaVendas = 6;
const metaDiariaFat = 20; // R$k

/* ─────────────────────────────────────────────
   DATA — Indicadores de Eficiência SDR/Closer (B05)
   ───────────────────────────────────────────── */

const efficiencySDR = [
  { label: "Taxa de Conexão", value: "85%", pct: 85 },
  { label: "Tempo MQL→SQL", value: "5.1d", pct: 64 },
  { label: "Tentativas até Contato", value: "3.4x", pct: 43 },
  { label: "Show Rate", value: "85%", pct: 85 },
  { label: "Ligações/Semana", value: "248", pct: 82 },
  { label: "Emails Enviados/Sem", value: "325", pct: 78 },
];

const efficiencyCloser = [
  { label: "Win Rate", value: "22.5%", pct: 56 },
  { label: "Tempo SQL→Fechamento", value: "13.2d", pct: 73 },
  { label: "Taxa de No-show", value: "15%", pct: 15 },
  { label: "Propostas em Aberto", value: "47", pct: 59 },
  { label: "Score SPIN Médio", value: "7.5", pct: 75 },
  { label: "Taxa Indicação", value: "28%", pct: 70 },
];

/* ─────────────────────────────────────────────
   DATA — SPIN Selling Semanal
   ───────────────────────────────────────────── */

const spinWeekly = [
  { sem: "S1", score: 5.8, a: 10, b: 30, c: 60 },
  { sem: "S2", score: 6.2, a: 15, b: 40, c: 45 },
  { sem: "S3", score: 6.5, a: 20, b: 45, c: 35 },
  { sem: "S4", score: 6.9, a: 25, b: 45, c: 30 },
  { sem: "S5", score: 7.2, a: 30, b: 45, c: 25 },
  { sem: "S6", score: 7.6, a: 40, b: 40, c: 20 },
  { sem: "S7", score: 7.3, a: 30, b: 40, c: 30 },
  { sem: "S8", score: 7.8, a: 45, b: 40, c: 15 },
  { sem: "S9", score: 8.1, a: 50, b: 35, c: 15 },
  { sem: "S10", score: 7.0, a: 25, b: 40, c: 35 },
  { sem: "S11", score: 7.5, a: 40, b: 42, c: 18 },
  { sem: "S12", score: 8.2, a: 55, b: 30, c: 15 },
];

/* ─────────────────────────────────────────────
   DATA — Atividade SDR Semanal
   ───────────────────────────────────────────── */

const atividadeSDR = [
  { sem: "S1", ligacoes: 145, emails: 210, tentativas: 3.8, tempoResp: 6.2, tempoMsg: 2.8, tempoLig: 5.1 },
  { sem: "S2", ligacoes: 162, emails: 228, tentativas: 4.1, tempoResp: 5.8, tempoMsg: 2.5, tempoLig: 4.8 },
  { sem: "S3", ligacoes: 178, emails: 245, tentativas: 4.3, tempoResp: 5.1, tempoMsg: 2.1, tempoLig: 4.2 },
  { sem: "S4", ligacoes: 170, emails: 240, tentativas: 4.5, tempoResp: 4.8, tempoMsg: 1.9, tempoLig: 3.9 },
  { sem: "S5", ligacoes: 195, emails: 268, tentativas: 4.8, tempoResp: 4.3, tempoMsg: 1.6, tempoLig: 3.5 },
  { sem: "S6", ligacoes: 210, emails: 285, tentativas: 5.0, tempoResp: 4.0, tempoMsg: 1.4, tempoLig: 3.2 },
  { sem: "S7", ligacoes: 188, emails: 260, tentativas: 4.6, tempoResp: 4.5, tempoMsg: 1.8, tempoLig: 3.8 },
  { sem: "S8", ligacoes: 220, emails: 295, tentativas: 5.2, tempoResp: 3.8, tempoMsg: 1.2, tempoLig: 2.9 },
  { sem: "S9", ligacoes: 232, emails: 310, tentativas: 5.4, tempoResp: 3.5, tempoMsg: 1.0, tempoLig: 2.5 },
  { sem: "S10", ligacoes: 215, emails: 290, tentativas: 5.0, tempoResp: 4.1, tempoMsg: 1.3, tempoLig: 3.1 },
  { sem: "S11", ligacoes: 248, emails: 325, tentativas: 5.6, tempoResp: 3.3, tempoMsg: 0.9, tempoLig: 2.2 },
  { sem: "S12", ligacoes: 260, emails: 340, tentativas: 5.8, tempoResp: 3.0, tempoMsg: 0.7, tempoLig: 1.8 },
];

/* ─────────────────────────────────────────────
   DATA — SDR Semanal Completo (12 semanas)
   ───────────────────────────────────────────── */

const sdrWeekly = [
  { sem: "S1", leads: 78, contato: 28, qualif: 9, demos: 7, showUps: 5, txResp: 35.9, txBANT: 50.0, txShowUp: 71.4 },
  { sem: "S2", leads: 85, contato: 33, qualif: 12, demos: 9, showUps: 7, txResp: 38.8, txBANT: 54.5, txShowUp: 77.8 },
  { sem: "S3", leads: 92, contato: 38, qualif: 15, demos: 11, showUps: 8, txResp: 41.3, txBANT: 60.0, txShowUp: 72.7 },
  { sem: "S4", leads: 88, contato: 36, qualif: 14, demos: 11, showUps: 9, txResp: 40.9, txBANT: 58.3, txShowUp: 81.8 },
  { sem: "S5", leads: 95, contato: 42, qualif: 18, demos: 14, showUps: 11, txResp: 44.2, txBANT: 62.1, txShowUp: 78.6 },
  { sem: "S6", leads: 102, contato: 45, qualif: 20, demos: 15, showUps: 12, txResp: 44.1, txBANT: 64.5, txShowUp: 80.0 },
  { sem: "S7", leads: 98, contato: 41, qualif: 17, demos: 13, showUps: 9, txResp: 41.8, txBANT: 63.0, txShowUp: 69.2 },
  { sem: "S8", leads: 105, contato: 46, qualif: 21, demos: 16, showUps: 13, txResp: 43.8, txBANT: 65.6, txShowUp: 81.3 },
  { sem: "S9", leads: 110, contato: 49, qualif: 22, demos: 17, showUps: 14, txResp: 44.5, txBANT: 64.7, txShowUp: 82.4 },
  { sem: "S10", leads: 108, contato: 47, qualif: 20, demos: 16, showUps: 11, txResp: 43.5, txBANT: 60.6, txShowUp: 68.8 },
  { sem: "S11", leads: 115, contato: 52, qualif: 23, demos: 18, showUps: 14, txResp: 45.2, txBANT: 63.9, txShowUp: 77.8 },
  { sem: "S12", leads: 120, contato: 55, qualif: 25, demos: 19, showUps: 15, txResp: 45.8, txBANT: 65.8, txShowUp: 78.9 },
];

/* ─────────────────────────────────────────────
   DATA — Closer Semanal Completo (12 semanas)
   ───────────────────────────────────────────── */

const closerWeekly = [
  { sem: "S1", demos: 5, propostas: 3, fech: 1, mrr: 1290, txFech: 20.0, ciclo: 25, ticket: 1290, indicacao: 0, followUp: 4.5 },
  { sem: "S2", demos: 7, propostas: 4, fech: 2, mrr: 3780, txFech: 28.6, ciclo: 22, ticket: 1890, indicacao: 0, followUp: 3.8 },
  { sem: "S3", demos: 8, propostas: 5, fech: 2, mrr: 3780, txFech: 25.0, ciclo: 19, ticket: 1890, indicacao: 10, followUp: 3.2 },
  { sem: "S4", demos: 9, propostas: 6, fech: 3, mrr: 6270, txFech: 33.3, ciclo: 17, ticket: 2090, indicacao: 15, followUp: 2.8 },
  { sem: "S5", demos: 11, propostas: 7, fech: 4, mrr: 8760, txFech: 36.4, ciclo: 15, ticket: 2190, indicacao: 20, followUp: 2.5 },
  { sem: "S6", demos: 12, propostas: 8, fech: 4, mrr: 8760, txFech: 33.3, ciclo: 14, ticket: 2190, indicacao: 22, followUp: 2.2 },
  { sem: "S7", demos: 9, propostas: 5, fech: 3, mrr: 6270, txFech: 33.3, ciclo: 16, ticket: 2090, indicacao: 18, followUp: 2.8 },
  { sem: "S8", demos: 13, propostas: 9, fech: 5, mrr: 11250, txFech: 38.5, ciclo: 12, ticket: 2250, indicacao: 25, followUp: 1.9 },
  { sem: "S9", demos: 14, propostas: 10, fech: 5, mrr: 11250, txFech: 35.7, ciclo: 11, ticket: 2250, indicacao: 28, followUp: 1.7 },
  { sem: "S10", demos: 11, propostas: 7, fech: 3, mrr: 6270, txFech: 27.3, ciclo: 18, ticket: 2090, indicacao: 20, followUp: 2.3 },
  { sem: "S11", demos: 14, propostas: 10, fech: 5, mrr: 11250, txFech: 35.7, ciclo: 10, ticket: 2250, indicacao: 30, followUp: 1.5 },
  { sem: "S12", demos: 15, propostas: 11, fech: 6, mrr: 13950, txFech: 40.0, ciclo: 9, ticket: 2325, indicacao: 32, followUp: 1.3 },
];

/* ─────────────────────────────────────────────
   DATA — Heatmap de Objeções (semana x tipo)
   ───────────────────────────────────────────── */

const heatmapData: { sem: string; chatgpt: number; preco: number; cfm: number; prontuario: number; dependencia: number }[] = [
  { sem: "S1", chatgpt: 1, preco: 1, cfm: 0, prontuario: 1, dependencia: 3 },
  { sem: "S2", chatgpt: 4, preco: 2, cfm: 1, prontuario: 0, dependencia: 1 },
  { sem: "S3", chatgpt: 1, preco: 5, cfm: 1, prontuario: 1, dependencia: 0 },
  { sem: "S4", chatgpt: 2, preco: 5, cfm: 1, prontuario: 1, dependencia: 0 },
  { sem: "S5", chatgpt: 1, preco: 2, cfm: 5, prontuario: 2, dependencia: 1 },
  { sem: "S6", chatgpt: 2, preco: 4, cfm: 2, prontuario: 2, dependencia: 1 },
  { sem: "S7", chatgpt: 4, preco: 2, cfm: 1, prontuario: 1, dependencia: 2 },
  { sem: "S8", chatgpt: 2, preco: 3, cfm: 2, prontuario: 4, dependencia: 1 },
  { sem: "S9", chatgpt: 2, preco: 5, cfm: 2, prontuario: 2, dependencia: 1 },
  { sem: "S10", chatgpt: 2, preco: 4, cfm: 2, prontuario: 1, dependencia: 2 },
  { sem: "S11", chatgpt: 2, preco: 2, cfm: 4, prontuario: 2, dependencia: 1 },
  { sem: "S12", chatgpt: 4, preco: 3, cfm: 2, prontuario: 2, dependencia: 1 },
];

const heatmapLabels: ("chatgpt" | "preco" | "cfm" | "prontuario" | "dependencia")[] = ["chatgpt", "preco", "cfm", "prontuario", "dependencia"];
const heatmapNames: Record<string, string> = { chatgpt: "ChatGPT", preco: "Preço", cfm: "CFM", prontuario: "Prontuário", dependencia: "Dependência IA" };

/* ─────────────────────────────────────────────
   DATA — Objeções com Neutralização
   ───────────────────────────────────────────── */

const objecoesData = [
  { nome: "Preço alto", qtd: 38, neutralizacao: 65 },
  { nome: "Concorrente", qtd: 27, neutralizacao: 72 },
  { nome: "Sem orçamento", qtd: 23, neutralizacao: 58 },
  { nome: "Timing ruim", qtd: 19, neutralizacao: 80 },
  { nome: "Sem interesse", qtd: 14, neutralizacao: 75 },
];

/* ─────────────────────────────────────────────
   DATA — Insights IA
   ───────────────────────────────────────────── */

const insights = [
  { tipo: "positivo" as const, titulo: "Score SPIN acima da meta", descricao: "Média 7.5 no período (meta: 7.0). Equipe alinhada com metodologia.", acao: "Manter ritmo de coaching e documentar playbook" },
  { tipo: "positivo" as const, titulo: "Taxa de fechamento consistente", descricao: "Média 22.5% nas últimas 4 semanas (meta: 20%)", acao: "Pipeline saudável — escalar volume de demos" },
  { tipo: "alerta" as const, titulo: "Tempo 1º atendimento caiu 12%", descricao: "De 4.1h para 3.0h — melhora significativa no SLA", acao: "Manter automações de alerta de novo lead" },
  { tipo: "oportunidade" as const, titulo: "Objeção 'Preço alto' dominante", descricao: "32% das perdas. Taxa de neutralização: apenas 65%", acao: "Atualizar kit de ROI e comparação de mercado" },
  { tipo: "positivo" as const, titulo: "Ciclo de venda encurtou 38%", descricao: "De 22 dias para 14 dias no período", acao: "Qualificação mais eficiente acelerando fechamento" },
  { tipo: "oportunidade" as const, titulo: "MRR acelerando na 2ª metade", descricao: "R$ 56k vs R$ 37k na 1ª metade (+51%)", acao: "Momento ideal para expansão de equipe" },
  { tipo: "positivo" as const, titulo: "Taxa de indicação crescente", descricao: "28% nas últimas 4 semanas (meta: 25%)", acao: "Programa de referral funcionando — considerar incentivos" },
  { tipo: "alerta" as const, titulo: "Volume de ligações abaixo da meta", descricao: "Média 202 ligações/sem (meta: 250)", acao: "Revisar blocos de prospecção no calendário" },
];

/* ─────────────────────────────────────────────
   TOOLTIP DATA
   ───────────────────────────────────────────── */

const cardTooltips: Record<string, string> = {
  "KPIs de Topo": "Indicadores principais do comercial. Inclui vendas totais, faturamento, ticket médio, win rate, pipeline ativo, CAC, ciclo de venda e taxa MQL→SQL. Cada KPI mostra progresso vs meta mensal.",
  "Funil SDR": "Etapas de prospecção e qualificação do SDR: Lead Novo → Primeiro Contato → Trabalhando → SQL → Reunião. Mostra volume, taxa de conversão e tempo médio por etapa.",
  "Funil Closer": "Etapas de fechamento do Closer: Reunião → Proposta → Negociação → Venda. Inclui motivos de perda e tempo por etapa.",
  "Ranking de Canais": "Ranking dos canais de aquisição com 4 visões: Volume de vendas, Faturamento gerado, Taxa de conversão MQL→Venda e Ciclo médio de venda.",
  "Ranking de Vendedores": "Performance individual da equipe, separada por função SDR e Closer. SDRs ranqueados por SQLs gerados, Closers por faturamento.",
  "Meta vs Realizado": "Progresso mensal em relação às metas definidas para Faturamento, Vendas e SQLs. Inclui projeção de fechamento do mês baseada no ritmo atual.",
  "Pipeline Ativo": "Oportunidades em andamento no funil. Mostra valor total em negociação e alerta de deals em risco (sem interação recente).",
  "Motivos de Perda": "Análise dos motivos pelos quais leads saem do funil. Identifica objeções recorrentes para melhorar pitch e processo.",
  "Evolução 12 Meses": "Tendência mensal de vendas, taxa de conversão e ticket médio nos últimos 12 meses. Identifica sazonalidade e impacto de mudanças.",
  "Volume Diário": "Vendas e faturamento por dia nos últimos 30 dias. Linha pontilhada mostra a meta diária. Barras verdes = acima da meta, âmbar = abaixo.",
  "Indicadores de Eficiência": "Métricas de eficiência SDR (conexão, qualificação, ligações, emails) e Closer (win rate, SPIN, indicação).",
  "Score SPIN Selling": "Nota média 0-10 de aderência à metodologia SPIN nas calls, avaliada por IA. Score A (≥8), B (6-7.9), C (<6).",
  "Atividade SDR": "Volume de atividades semanais: ligações, emails enviados, tentativas/lead e tempo 1º atendimento.",
  "Análise de Objeções": "Ranking de objeções por frequência com taxa de neutralização sobreposta.",
  "Insights IA": "Alertas inteligentes gerados por regras programáticas baseadas nos dados do período.",
  "Volume SDR": "Evolução semanal do volume absoluto de leads recebidos, qualificados e demos agendadas ao longo de 12 semanas.",
  "Taxas SDR": "Evolução das 3 taxas de conversão do SDR (Resposta, BANT+, Show-Up) com linhas de meta.",
  "MRR e Fechamento": "MRR gerado por semana (barras) e taxa de fechamento (linha sobreposta) ao longo de 12 semanas.",
  "Ciclo Médio": "Dias médios entre a realização da demo e o fechamento do contrato por semana.",
  "Follow-up pós-Demo": "Tempo médio em horas para follow-up após a demo realizada. Meta: < 2h.",
  "Ticket e Indicação": "Evolução do ticket médio por contrato e taxa de indicação por semana.",
  "Heatmap Objeções": "Mapa de calor mostrando intensidade de cada objeção por semana. Quanto mais escuro, mais frequente.",
  "Tabela Semanal": "Tabela detalhada com 13 métricas por semana, ordenável por coluna.",
  "Tempo 1ª Mensagem": "Tempo médio para envio da primeira mensagem (WhatsApp/email) após receber o lead. Meta: < 1h.",
  "Tempo 1ª Ligação": "Tempo médio para realizar a primeira ligação ao lead. Meta: < 4h.",
};

/* ─────────────────────────────────────────────
   ICONS
   ───────────────────────────────────────────── */

const kpiIcons: Record<string, React.ReactNode> = {
  cart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  receipt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/></svg>,
  trophy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  pipeline: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>,
  target: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  brain: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4c0 .5.1 1 .3 1.4A3.5 3.5 0 0 0 5 11c0 1.5.9 2.7 2.2 3.2A3 3 0 0 0 7 16a3 3 0 0 0 3 3h.2A3 3 0 0 0 12 22a3 3 0 0 0 1.8-3H14a3 3 0 0 0 3-3c0-.6-.2-1.2-.5-1.8A3.5 3.5 0 0 0 19 11a3.5 3.5 0 0 0-3.3-3.5c.2-.5.3-1 .3-1.5a4 4 0 0 0-4-4z"/></svg>,
};

/* ─────────────────────────────────────────────
   DATA — Visão Geral Original (Funil + Vol. Semanal)
   ───────────────────────────────────────────── */

const funnelOverview = [
  { label: "Leads (MQL)", count: "1.240", delta: "+6.2%", up: true, w: 100 },
  { label: "SQL", count: "930", delta: "+5.8%", up: true, w: 80 },
  { label: "Propostas", count: "465", delta: "+4.5%", up: true, w: 60 },
  { label: "Negociação", count: "139", delta: "-2.3%", up: false, w: 42 },
  { label: "Vendas", count: "21", delta: "+8.1%", up: true, w: 28, highlight: true },
];

const volumeSemanal = [
  { day: "SEG", vendas: 16, fat: 52 },
  { day: "TER", vendas: 22, fat: 41 },
  { day: "QUA", vendas: 18, fat: 72 },
  { day: "QUI", vendas: 26, fat: 94 },
  { day: "SEX", vendas: 20, fat: 67 },
  { day: "SAB", vendas: 12, fat: 42 },
  { day: "DOM", vendas: 28, fat: 88 },
];

const indicadoresSimples = [
  { label: "Taxa Vendas vs MQL", value: "1.7%", pct: 1.7 },
  { label: "Taxa Vendas vs SQL", value: "2.26%", pct: 2.26 },
  { label: "Tempo Médio Ciclo", value: "14.2d", pct: 79 },
];

/* ─────────────────────────────────────────────
   GLASS STYLE
   ───────────────────────────────────────────── */

const glassStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
  backdropFilter: "blur(6px) saturate(140%)",
  WebkitBackdropFilter: "blur(6px) saturate(140%)",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  overflow: "hidden",
};

/* ─────────────────────────────────────────────
   InfoTip — Portal-based tooltip
   ───────────────────────────────────────────── */

function InfoTip({ title }: { title: string }) {
  const tip = cardTooltips[title];
  const [show, setShow] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  if (!tip) return null;

  const handleEnter = () => {
    if (iconRef.current) {
      const r = iconRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: Math.max(12, Math.min(r.left + r.width / 2 - 140, window.innerWidth - 300)) });
    }
    setShow(true);
  };

  return (
    <div ref={iconRef} className="inline-flex ml-1.5 cursor-pointer" onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${show ? "text-slate-300" : "text-slate-500/40"}`}>
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
      {show && typeof document !== "undefined" && createPortal(
        <div style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 99999, width: 280, padding: "12px 14px", borderRadius: 10, background: "rgba(8,10,18,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", fontSize: 11, lineHeight: 1.6, color: "#94a3b8", pointerEvents: "none" }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4, fontSize: 12 }}>{title}</div>
          {tip}
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */

export default function ComercialPage() {
  const router = useRouter();

  // Ranking Canais tab
  const [rankTab, setRankTab] = useState<RankingTab>("faturamento");
  // Ranking Vendedores tab
  const [sellerTab, setSellerTab] = useState<SellerTab>("closer");
  // Volume chart mode
  const [volumeMode, setVolumeMode] = useState<"vendas" | "faturamento">("vendas");
  // Efficiency tab
  const [effTab, setEffTab] = useState<"sdr" | "closer">("sdr");
  // Hovered states
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredEvo, setHoveredEvo] = useState<number | null>(null);
  const [hoveredPipe, setHoveredPipe] = useState<number | null>(null);
  // Mouse position for tooltips
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  // Expanded seller
  const [expandedSeller, setExpandedSeller] = useState<number | null>(null);
  const [hoveredLoss, setHoveredLoss] = useState<string | null>(null);
  // New state variables
  const [spinTab, setSpinTab] = useState<"score" | "dist">("score");
  const [hoveredSpin, setHoveredSpin] = useState<number | null>(null);
  const [hoveredAtv, setHoveredAtv] = useState<number | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(true);

  // Random particles helper — each particle starts at a different random time
  const rndParticles = (count: number, horizontal = false) => (
    <div className={horizontal ? "particles-wrapper-h" : "particles-wrapper"}>
      {Array.from({ length: count }, (_, p) => (
        <div key={p} className="particle" style={{ animationDelay: `${(Math.random() * 3).toFixed(2)}s`, animationDuration: `${(1.4 + Math.random() * 2.8).toFixed(2)}s` }} />
      ))}
    </div>
  );

  // Evolution chart computed values
  const maxVendas = Math.max(...evolution12m.map(e => e.vendas));
  const maxVolume = volumeMode === "vendas" ? Math.max(...volumeDiario.map(d => d.vendas)) : Math.max(...volumeDiario.map(d => d.fat));
  const maxSpin = 10;
  const maxLig = Math.max(...atividadeSDR.map(d => d.ligacoes));

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <div className="h-[120vh] w-[120vh] rounded-full" style={{ background: "rgba(255, 177, 23, 0.25)", filter: "blur(120px)", animation: "orbPulse 5s ease-in-out infinite" }} />
      </div>
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <Image src="/seu_elias_logo_upscaled 1.png" alt="" fill className="opacity-[0.04] select-none object-contain p-8" draggable={false} />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 fixed top-0 left-0 right-0" style={{ ...glassStyle, zIndex: 30, animation: "animationIn 0.8s ease-out 0.1s both" }}>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/escolha")} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Dashboard Comercial</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Performance de Vendas</p>
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
      <main className="relative px-6 pt-28 pb-28 space-y-6 text-slate-100">

        {/* ════════ INSIGHTS IA — Alertas Inteligentes ════════ */}
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.08s both" }}>
          <div className="flex items-center gap-3 px-5 py-3 cursor-pointer select-none hover:bg-white/[0.02] transition-colors" onClick={() => setInsightsOpen(v => !v)} style={{ borderBottom: insightsOpen ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8),0_0_20px_rgba(251,191,36,0.4)]" style={{ animation: "insightPulse 2s ease-in-out infinite" }} />
              <div className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8),0_0_20px_rgba(52,211,153,0.4)]" style={{ animation: "insightPulse 2s ease-in-out 0.4s infinite" }} />
              <div className="size-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8),0_0_20px_rgba(251,113,133,0.4)]" style={{ animation: "insightPulse 2s ease-in-out 0.8s infinite" }} />
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/></svg>
            <h3 className="text-sm font-bold text-white tracking-wide">Insights IA — Alertas Inteligentes</h3>
            <span className="text-[10px] text-neutral-500 font-bold">{insights.length} alertas</span>
            <InfoTip title="Insights IA" />
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" style={{ animation: "insightPulse 1.5s ease-in-out 0.2s infinite" }} />
                <div className="size-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]" style={{ animation: "insightPulse 1.5s ease-in-out 0.6s infinite" }} />
                <div className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" style={{ animation: "insightPulse 1.5s ease-in-out 1.0s infinite" }} />
              </div>
              <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1 hover:bg-white/[0.1] transition-colors">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{insightsOpen ? "Recolher" : "Expandir"}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-amber-400 transition-transform duration-300 ${insightsOpen ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-400 ease-in-out ${insightsOpen ? "p-4 max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden p-0"}`}>
            {insights.map((ins, i) => {
              const colors = ins.tipo === "positivo"
                ? { dot: "bg-emerald-500", glow: "shadow-[0_0_10px_rgba(16,185,129,0.6)]", border: "border-emerald-500/25", bg: "bg-emerald-500/[0.06]", label: "text-emerald-400" }
                : ins.tipo === "alerta"
                ? { dot: "bg-rose-500", glow: "shadow-[0_0_10px_rgba(244,63,94,0.6)]", border: "border-rose-500/25", bg: "bg-rose-500/[0.06]", label: "text-rose-400" }
                : { dot: "bg-amber-500", glow: "shadow-[0_0_10px_rgba(245,158,11,0.6)]", border: "border-amber-500/25", bg: "bg-amber-500/[0.06]", label: "text-amber-400" };
              return (
                <div key={i} className="group relative" style={{ animation: `animationIn 0.5s ease-out ${0.1 + i * 0.08}s both` }}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <div className={`size-2 rounded-full ${colors.dot} ${colors.glow}`} style={{ animation: `insightPulse ${1.8 + i * 0.2}s ease-in-out infinite` }} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.label}`}>{ins.tipo}</span>
                  </div>
                  <div className={`relative rounded-xl p-3 border ${colors.border} ${colors.bg} transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg`}>
                    <p className="text-[11px] font-bold text-white mb-1 leading-snug">{ins.titulo}</p>
                    <p className="text-[10px] text-neutral-400 leading-relaxed mb-1.5">{ins.descricao}</p>
                    <div className="flex items-start gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={colors.label}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      <p className="text-[9px] text-slate-500 italic leading-snug">{ins.acao}</p>
                    </div>
                    <div className={`absolute -top-1.5 left-4 w-3 h-3 rotate-45 border-l border-t ${colors.border} ${colors.bg}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════ B01 — KPIs de Topo ════════ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, idx) => {
            const pctMeta = kpi.inverse ? Math.min((kpi.meta / kpi.realizado) * 100, 100) : Math.min((kpi.realizado / kpi.meta) * 100, 100);
            const metaColor = pctMeta >= 80 ? "bg-emerald-500" : pctMeta >= 60 ? "bg-amber-500" : "bg-rose-500";
            return (
              <div key={kpi.label} className="glass-panel p-4 rounded-2xl cursor-default border border-white/[0.04] hover:border-white/[0.08] transition-colors" style={{ ...glassStyle, animation: `animationIn 0.8s ease-out ${0.15 + idx * 0.04}s both` }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">{kpi.label}</p>
                  <div className="text-amber-400/60">{kpiIcons[kpi.icon]}</div>
                </div>
                <p className="text-xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{kpi.value}</p>
                <div className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${kpi.up ? "text-emerald-400" : "text-rose-400"}`}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {kpi.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                  </svg>
                  {kpi.delta}
                </div>
                {/* Meta bar */}
                <div className="mt-2">
                  <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className={`h-full ${metaColor} rounded-full transition-all duration-1000`} style={{ width: `${pctMeta}%` }} />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{pctMeta.toFixed(0)}% da meta</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ════════ FUNIL SDR + CLOSER + Rankings ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Col 3 — Rankings empilhados (moved to end via CSS order) */}
          <div className="flex flex-col gap-4 h-full lg:order-3">
          {/* Ranking Vendedores */}
          <div className="glass-panel rounded-2xl p-4 border border-white/[0.04] flex-1 flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.5s both" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <h3 className="font-bold text-xs text-slate-300">Ranking de Vendedores</h3>
                <InfoTip title="Ranking de Vendedores" />
              </div>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5 mb-4">
              {([["sdr", "SDR"], ["closer", "Closer"], ["todos", "Todos"]] as [SellerTab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => { setSellerTab(t); setExpandedSeller(null); }} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${sellerTab === t ? (t === "sdr" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20") : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {(sellerTab === "sdr" ? sdrRanking : sellerTab === "closer" ? closerRanking : [...sdrRanking.slice(0, 2), ...closerRanking.slice(0, 2)]).map((s, i) => {
                const posColors = ["text-amber-400", "text-slate-400", "text-amber-700", "text-neutral-600"];
                const barColor = sellerTab === "sdr" ? "rgba(34,211,238,0.3)" : sellerTab === "closer" ? "rgba(251,191,36,0.3)" : i < 2 ? "rgba(34,211,238,0.3)" : "rgba(251,191,36,0.3)";
                const isExpanded = expandedSeller === i;
                return (
                  <div key={s.name + i} className="cursor-pointer group/r" onClick={() => setExpandedSeller(isExpanded ? null : i)}>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold w-4 text-center shrink-0 ${posColors[i] || "text-neutral-600"}`}>{i + 1}°</span>
                      <div className={`size-8 rounded-full bg-gradient-to-br ${s.color} shrink-0 flex items-center justify-center shadow-lg`}>
                        <span className="text-[10px] font-bold text-white">{s.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white truncate">{s.name}</span>
                          <span className="text-xs font-bold text-white shrink-0 ml-2">{s.value}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500 group-hover/r:brightness-125" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${barColor}, transparent)` }} />
                        </div>
                      </div>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-neutral-500 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    {isExpanded && (
                      <div className="ml-[3.25rem] mt-1 mb-1 p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <p className="text-[10px] text-neutral-400">{s.subMetrics}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Ranking Canais */}
          <div className="glass-panel rounded-2xl p-4 border border-white/[0.04] flex-1 flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.45s both" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/><path d="M15 7A3 3 0 1 0 9 7"/><path d="M12 2v1"/><path d="m4.6 4.6.7.7"/><path d="M20.1 4.6l-.7.7"/></svg>
                <h3 className="font-bold text-xs text-slate-300">Ranking de Canais</h3>
                <InfoTip title="Ranking de Canais" />
              </div>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5 mb-4">
              {(["volume", "faturamento", "conversao", "ciclo"] as RankingTab[]).map(t => (
                <button key={t} onClick={() => setRankTab(t)} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${rankTab === t ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>
                  {rankingTabLabels[t]}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {rankingCanaisData[rankTab].entries.map((e, i) => {
                const posColors = ["text-amber-400", "text-slate-400", "text-amber-700", "text-neutral-600"];
                return (
                  <div key={e.name} className="flex items-center gap-2 group/r cursor-pointer">
                    <span className={`text-[10px] font-bold w-4 text-center ${posColors[i] || "text-neutral-600"}`}>{i + 1}°</span>
                    <div className="flex-1 h-6 bg-white/[0.02] rounded overflow-hidden border border-white/[0.04]">
                      <div className="h-full rounded flex items-center px-2 transition-all duration-500 group-hover/r:brightness-125" style={{ width: `${e.pct}%`, background: `linear-gradient(90deg, ${e.color}, transparent)` }}>
                        <span className="text-[10px] font-bold text-white/90 truncate">{e.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white min-w-[50px] text-right">{e.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
          {/* Closer Funnel */}
          <div className="glass-panel rounded-2xl p-4 border border-white/[0.04] relative lg:order-1" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.2s both" }}>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">CLOSER</span>
              </div>
              <h3 className="font-bold text-xs text-slate-300">Apresentação & Fechamento<InfoTip title="Funil Closer" /></h3>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-1">
              {closerFunnel.stages.map((stage, i) => {
                const prev = i > 0 ? closerFunnel.between[i - 1] : null;
                return (
                  <div key={stage.label} className="flex items-center justify-center" style={{ width: "100%" }}>
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg transition-all duration-300 cursor-default py-1 px-3 ${stage.highlight ? "border border-amber-400/30" : "border border-white/[0.06]"}`}
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
                      {prev && (
                        <div className="flex items-center justify-center gap-3 mb-0.5">
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold">{prev.left.k} <span className="text-white">{prev.left.v}</span></span>
                          <span className="text-[7px] text-white/10">|</span>
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold">{prev.right.k} <span className="text-white">{prev.right.v}</span></span>
                        </div>
                      )}
                      <span className={`text-[9px] font-medium ${stage.highlight ? "text-amber-400" : "text-slate-400"}`}>{stage.label}</span>
                      <span className="text-lg font-bold text-white leading-tight">{stage.count}</span>
                      <span className={`text-[9px] font-bold flex items-center gap-0.5 ${stage.up ? "text-emerald-400" : "text-rose-400"}`}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          {stage.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                        </svg>
                        {stage.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 relative z-10">
              <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2">Métricas Closer</p>
              <div className="grid grid-cols-5 gap-1.5">
                {closerMetrics.map(m => (
                  <div key={m.label} className="bg-amber-500/[0.04] border border-amber-500/10 rounded-lg p-1.5 text-center">
                    <p className="text-[11px] font-bold text-white">{m.value}</p>
                    <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SDR Funnel */}
          <div className="glass-panel rounded-2xl p-4 border border-white/[0.04] relative lg:order-2" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.25s both" }}>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <div className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">SDR</span>
              </div>
              <h3 className="font-bold text-xs text-slate-300">Prospecção & Qualificação<InfoTip title="Funil SDR" /></h3>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-1">
              {sdrFunnel.stages.map((stage, i) => {
                const prev = i > 0 ? sdrFunnel.between[i - 1] : null;
                return (
                  <div key={stage.label} className="flex items-center justify-center" style={{ width: "100%" }}>
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg transition-all duration-300 cursor-default py-1 px-3 ${stage.highlight ? "border border-cyan-400/30" : "border border-white/[0.06]"}`}
                      style={{
                        width: `${stage.w}%`,
                        background: stage.highlight
                          ? "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = stage.highlight
                          ? "linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(6,182,212,0.10) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)";
                        if (stage.highlight) e.currentTarget.style.boxShadow = "0 0 20px rgba(6,182,212,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = stage.highlight
                          ? "linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {prev && (
                        <div className="flex items-center justify-center gap-3 mb-0.5">
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold">{prev.left.k} <span className="text-white">{prev.left.v}</span></span>
                          <span className="text-[7px] text-white/10">|</span>
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold">{prev.right.k} <span className="text-white">{prev.right.v}</span></span>
                        </div>
                      )}
                      <span className={`text-[9px] font-medium ${stage.highlight ? "text-cyan-400" : "text-slate-400"}`}>{stage.label}</span>
                      <span className="text-lg font-bold text-white leading-tight">{stage.count}</span>
                      <span className={`text-[9px] font-bold flex items-center gap-0.5 ${stage.up ? "text-emerald-400" : "text-rose-400"}`}>
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          {stage.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                        </svg>
                        {stage.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 relative z-10">
              <p className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest mb-2">Métricas SDR</p>
              <div className="grid grid-cols-5 gap-1.5">
                {sdrMetrics.map(m => (
                  <div key={m.label} className="bg-cyan-500/[0.04] border border-cyan-500/10 rounded-lg p-1.5 text-center">
                    <p className="text-[11px] font-bold text-white">{m.value}</p>
                    <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════ FUNIL DE VENDAS — alinhado às colunas 2+3 ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Meta vs Realizado — vertical */}
          <div className="glass-panel rounded-2xl p-4 border border-white/[0.04] flex flex-col lg:order-2" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.4s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              <h3 className="font-bold text-xs text-slate-300">Meta vs Realizado</h3>
              <InfoTip title="Meta vs Realizado" />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              {metaCards.map((m) => {
                const pct = Math.min((m.realizado / m.meta) * 100, 100);
                const diasPassados = new Date().getDate();
                const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                const projecao = (m.realizado / diasPassados) * diasNoMes;
                const pctColor = pct >= 80 ? "from-emerald-600 to-emerald-400" : pct >= 60 ? "from-amber-600 to-amber-400" : "from-rose-600 to-rose-400";
                const projColor = projecao >= m.meta ? "text-emerald-400" : "text-amber-400";
                return (
                  <div key={m.label} className="bg-black/30 border border-white/5 rounded-xl p-3 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                      <span className="text-[10px] font-bold text-white">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-lg font-bold text-white leading-tight">{m.format(m.realizado)}</span>
                      <span className="text-[10px] text-neutral-500 mb-0.5">/ {m.format(m.meta)}</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5 mb-1.5 relative">
                      <div className={`h-full bg-gradient-to-r ${pctColor} rounded-full relative overflow-hidden animate-bar-enter`} style={{ width: `${pct}%`, boxShadow: "0 0 12px rgba(251,191,36,0.2)" }}>
                        {rndParticles(2, true)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-neutral-500">Restam {diasNoMes - diasPassados}d</span>
                      <span className={`text-[10px] font-bold ${projColor}`}>Proj: {m.format(Math.round(projecao))}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-2 lg:order-1 glass-panel rounded-2xl p-5 border border-white/[0.04] flex flex-col relative z-10" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.2s both", isolation: "isolate" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                <h3 className="font-bold text-sm text-slate-300">Funil de Vendas</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">MQL → SQL</span>
                  <span className="text-xs font-bold text-emerald-400">75,0%</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">SQL → Venda</span>
                  <span className="text-xs font-bold text-emerald-400">22,5%</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              {funnelOverview.map((stage, i) => {
                const convRate = i > 0 ? ((parseFloat(funnelOverview[i].count.replace(".", "")) / parseFloat(funnelOverview[i - 1].count.replace(".", ""))) * 100).toFixed(0) + "%" : null;
                return (
                  <div key={stage.label} className="w-full">
                    {i > 0 && (
                      <div className="flex items-center justify-center gap-2 py-0.5">
                        <div className="w-px h-1.5 border-l border-dashed border-white/10" />
                        <span className="text-[9px] font-bold text-amber-400/60">{convRate}</span>
                        <div className="w-px h-1.5 border-l border-dashed border-white/10" />
                      </div>
                    )}
                    <div className="flex items-center justify-center">
                      <div
                        className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl transition-all duration-300 cursor-default py-1.5 ${stage.highlight ? "border border-amber-400/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]" : "border border-white/[0.06]"}`}
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
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${stage.highlight ? "text-amber-400" : "text-slate-500"}`}>{stage.label}</span>
                        <span className={`text-lg font-bold leading-tight ${stage.highlight ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "text-white"}`}>{stage.count}</span>
                        <span className={`text-[9px] font-bold flex items-center gap-0.5 ${stage.up ? "text-emerald-400" : "text-rose-400"}`}>
                          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            {stage.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
                          </svg>
                          {stage.delta}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ════════ Volume Semanal ════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vol. Vendas (Dia) */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.04] flex flex-col overflow-hidden" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.25s both", isolation: "isolate" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Vol. Vendas (Dia)</h3>
            </div>
            {(() => {
              const maxV = Math.max(...volumeSemanal.map(d => d.vendas));
              return (
                <div className="flex-1 flex gap-3 min-h-[200px]">
                  {volumeSemanal.map((d, i) => {
                    const h = (d.vendas / maxV) * 100;
                    const isToday = d.day === "DOM";
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                        <span className="text-xs font-bold text-amber-400 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] mb-1.5">{d.vendas}</span>
                        <div className="flex-1 relative w-full">
                          <div className={`absolute bottom-0 left-0 right-0 rounded-t-lg overflow-hidden transition-all duration-500 group-hover/bar:brightness-125 animate-bar-enter ${isToday ? "shadow-[0_0_16px_rgba(251,191,36,0.4)] ring-1 ring-amber-400/30" : "shadow-[0_0_12px_rgba(251,191,36,0.15)]"}`} style={{ height: `${h}%`, minHeight: 4, background: "linear-gradient(to top, rgb(217,119,6), rgb(251,191,36))", animationDelay: `${i * 0.08}s` }}>
                            {rndParticles(5)}
                          </div>
                        </div>
                        <span className={`text-xs font-bold mt-2 ${isToday ? "text-amber-400" : "text-neutral-500"}`}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Vol. Faturamento (Dia) */}
          <div className="glass-panel rounded-2xl p-5 border border-white/[0.04] flex flex-col overflow-hidden" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.3s both", isolation: "isolate" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <h3 className="font-bold text-sm text-slate-300">Vol. Faturamento (Dia)</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-400"><path d="m5 12 7-7 7 7"/></svg>
                <span className="text-[11px] font-bold text-emerald-400">R$ 12k HOJE</span>
              </div>
            </div>
            {(() => {
              const maxF = Math.max(...volumeSemanal.map(d => d.fat));
              return (
                <div className="flex-1 flex gap-3 min-h-[200px]">
                  {volumeSemanal.map((d, i) => {
                    const h = (d.fat / maxF) * 100;
                    const isToday = d.day === "DOM";
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                        <span className="text-xs font-bold text-amber-400 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)] mb-1.5">R$ {d.fat}k</span>
                        <div className="flex-1 relative w-full">
                          <div className={`absolute bottom-0 left-0 right-0 rounded-t-lg overflow-hidden transition-all duration-500 group-hover/bar:brightness-125 animate-bar-enter ${isToday ? "shadow-[0_0_16px_rgba(251,191,36,0.4)] ring-1 ring-amber-400/30" : "shadow-[0_0_12px_rgba(251,191,36,0.15)]"}`} style={{ height: `${h}%`, minHeight: 4, background: "linear-gradient(to top, rgb(217,119,6), rgb(251,191,36))", animationDelay: `${i * 0.08}s` }}>
                            {rndParticles(5)}
                          </div>
                        </div>
                        <span className={`text-xs font-bold mt-2 ${isToday ? "text-amber-400" : "text-neutral-500"}`}>{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
          </div>

        {/* Indicadores de Eficiência — Simples */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.04]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.35s both" }}>
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            <h3 className="font-bold text-sm text-slate-300">Indicadores de Eficiência</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {indicadoresSimples.map(ind => (
              <div key={ind.label} className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-400">{ind.label}</span>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5 relative">
                    <div className="h-full rounded-full relative overflow-hidden animate-bar-enter" style={{ width: `${Math.max(ind.pct, 3)}%`, background: "linear-gradient(90deg, rgb(217,119,6), rgb(251,191,36))", boxShadow: "0 0 12px rgba(251,191,36,0.3)" }}>
                      {rndParticles(3, true)}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white min-w-[4rem] text-right">{ind.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ════════ B03/B04 — Volume Diário 30d + B12 — Evolução 12M ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume Diário */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.5s both" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 6-6"/></svg>
                <h3 className="font-bold text-sm text-slate-300">Volume Diário — 30 dias</h3>
                <InfoTip title="Volume Diário" />
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5">
                <button onClick={() => setVolumeMode("vendas")} className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${volumeMode === "vendas" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Vendas</button>
                <button onClick={() => setVolumeMode("faturamento")} className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${volumeMode === "faturamento" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Faturamento</button>
              </div>
            </div>
            {/* Y-axis + Chart area */}
            <div className="flex gap-2 flex-1">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between py-1 text-[11px] text-neutral-500 text-right min-w-[32px]">
                <span>{volumeMode === "vendas" ? maxVolume : `${maxVolume}k`}</span>
                <span>{volumeMode === "vendas" ? Math.round(maxVolume * 0.5) : `${Math.round(maxVolume * 0.5)}k`}</span>
                <span>0</span>
              </div>
              {/* Chart */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex gap-[2px] relative min-h-[12rem]">
                  {/* Grid lines */}
                  <div className="absolute left-0 right-0 top-0 border-t border-white/[0.04] pointer-events-none" />
                  <div className="absolute left-0 right-0 top-1/2 border-t border-white/[0.04] pointer-events-none" />
                  {/* Meta line */}
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400/40 pointer-events-none z-[1]" style={{ bottom: `${((volumeMode === "vendas" ? metaDiariaVendas : metaDiariaFat) / maxVolume) * 100}%` }}>
                    <span className="absolute -top-4 right-0 text-[11px] font-bold text-rose-400/70 bg-black/60 px-1 rounded">Meta: {volumeMode === "vendas" ? metaDiariaVendas : `R$ ${metaDiariaFat}k`}</span>
                  </div>
                  {volumeDiario.map((d, i) => {
                    const val = volumeMode === "vendas" ? d.vendas : d.fat;
                    const meta = volumeMode === "vendas" ? metaDiariaVendas : metaDiariaFat;
                    const h = (val / maxVolume) * 100;
                    const aboveMeta = val >= meta;
                    const isHov = hoveredBar === i;
                    const isToday = i === volumeDiario.length - 1;
                    return (
                      <div key={i} className="flex-1 relative cursor-pointer group/bar" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
                        {isHov && createPortal(
                          <div className="fixed bg-black/95 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white whitespace-nowrap z-[9999] shadow-lg pointer-events-none" style={{ left: mousePos.x + 12, top: mousePos.y - 28 }}>
                            <span className="text-neutral-400">Dia {d.day}</span> · <span className={aboveMeta ? "text-emerald-400" : "text-amber-400"}>{volumeMode === "vendas" ? `${val} vendas` : `R$ ${val}k`}</span>
                          </div>,
                          document.body
                        )}
                        <div className={`absolute bottom-0 left-0 right-0 rounded-t-sm overflow-hidden transition-all duration-500 group-hover/bar:brightness-125 animate-bar-enter ${isToday ? "shadow-[0_0_12px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/30" : ""}`} style={{ height: `${h}%`, minHeight: 2, background: aboveMeta ? "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))" : "linear-gradient(to top, rgb(217,119,6), rgb(251,191,36))", boxShadow: aboveMeta ? "0 0 10px rgba(52,211,153,0.2)" : "0 0 10px rgba(251,191,36,0.15)", animationDelay: `${i * 0.02}s` }}>
                          {rndParticles(3)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* X-axis labels */}
                <div className="flex mt-2">
                  {volumeDiario.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                      {i % 5 === 0 ? <span className="text-[11px] text-neutral-500">{d.day}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
                <span className="text-[11px] text-neutral-400">Acima da meta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-gradient-to-t from-amber-600 to-amber-400" />
                <span className="text-[11px] text-neutral-400">Abaixo da meta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 border-t-2 border-dashed border-rose-400/50" />
                <span className="text-[11px] text-neutral-400">Meta diária ({volumeMode === "vendas" ? `${metaDiariaVendas} vendas` : `R$ ${metaDiariaFat}k`})</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <div className="w-3 h-3 rounded-sm bg-amber-400/30 ring-1 ring-amber-400/30" />
                <span className="text-[11px] text-neutral-400">Hoje</span>
              </div>
            </div>
          </div>

          {/* Evolução 12 Meses */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.55s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              <h3 className="font-bold text-sm text-slate-300">Evolução 12 Meses</h3>
              <InfoTip title="Evolução 12 Meses" />
            </div>
            <div className="flex-1 flex gap-1.5 relative min-h-[12rem]">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 text-[10px] text-neutral-500">{maxVendas}</div>
              <div className="absolute left-0 bottom-[18px] text-[10px] text-neutral-500">0</div>
              {evolution12m.map((m, i) => {
                const h = (m.vendas / maxVendas) * 100;
                const isHov = hoveredEvo === i;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center cursor-pointer group/bar" onMouseEnter={() => setHoveredEvo(i)} onMouseLeave={() => setHoveredEvo(null)} onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}>
                    {isHov && createPortal(
                      <div className="fixed bg-black/90 border border-white/10 rounded px-2 py-1 text-[11px] font-bold text-white whitespace-nowrap z-[9999] pointer-events-none" style={{ left: mousePos.x + 12, top: mousePos.y - 28 }}>
                        {m.month}: {m.vendas} vendas · Conv: {m.conversao}% · Ticket: R$ {(m.ticket / 1000).toFixed(1)}k · MRR: R$ {(m.mrr / 1000).toFixed(0)}k
                      </div>,
                      document.body
                    )}
                    <div className="flex-1 relative w-full">
                      <div className="absolute bottom-0 left-0 right-0 rounded-t overflow-hidden transition-all duration-500 group-hover/bar:brightness-125 animate-bar-enter" style={{ height: `${h}%`, minHeight: 2, background: "linear-gradient(to top, rgb(217,119,6), rgb(251,191,36))", boxShadow: "0 0 12px rgba(251,191,36,0.15)", animationDelay: `${i * 0.06}s` }}>
                        {rndParticles(3)}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1">{m.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span>Média: {Math.round(evolution12m.reduce((a, b) => a + b.vendas, 0) / 12)} vendas/mês</span>
              <span>Tendência: <span className="text-emerald-400">↑ +8.2%</span></span>
            </div>
          </div>
        </div>

        {/* ════════ B10 — Pipeline Ativo + B11 — Motivos de Perda ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Ativo */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.55s both" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                <h3 className="font-bold text-sm text-slate-300">Pipeline Ativo</h3>
                <InfoTip title="Pipeline Ativo" />
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-400">R$ 160k</p>
                <p className="text-[11px] text-neutral-500">em negociação</p>
              </div>
            </div>
            <div className="space-y-2">
              {pipelineItems.map((p, i) => {
                const riskColor = p.risk === "low" ? "bg-emerald-500" : p.risk === "medium" ? "bg-amber-500" : "bg-rose-500";
                const riskLabel = p.risk === "low" ? "Saudável" : p.risk === "medium" ? "Atenção" : "Em risco";
                const isHov = hoveredPipe === i;
                return (
                  <div key={p.name} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${isHov ? "bg-white/[0.03] border-white/[0.08]" : "bg-white/[0.01] border-white/[0.04]"}`} onMouseEnter={() => setHoveredPipe(i)} onMouseLeave={() => setHoveredPipe(null)}>
                    <div className={`size-2 rounded-full ${riskColor} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{p.name}</p>
                      <p className="text-[11px] text-neutral-500">{p.stage} · {p.days}d</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{p.value}</p>
                      <p className={`text-[11px] font-bold ${p.risk === "low" ? "text-emerald-400" : p.risk === "medium" ? "text-amber-400" : "text-rose-400"}`}>{riskLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-emerald-500" /> {pipelineItems.filter(p => p.risk === "low").length} saudáveis</span>
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-amber-500" /> {pipelineItems.filter(p => p.risk === "medium").length} atenção</span>
                <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-rose-500" /> {pipelineItems.filter(p => p.risk === "high").length} em risco</span>
              </div>
              <span className="text-[11px] text-amber-400 font-bold">Forecast: R$ 112k</span>
            </div>
          </div>

          {/* Motivos de Perda */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.6s both" }}>
            <div className="flex items-center gap-2 mb-5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Motivos de Perda</h3>
              <InfoTip title="Motivos de Perda" />
            </div>
            {/* Donut + Legend — fill card */}
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <div className="relative flex justify-center items-center py-2" onMouseLeave={() => setHoveredLoss(null)}>
                <svg className="size-56" viewBox="0 0 200 200">
                  <defs>
                    <filter id="lossGlow">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                  {(() => {
                    const r = 70;
                    const circ = 2 * Math.PI * r;
                    const gap = 8;
                    const usable = circ - gap * lossReasons.length;
                    let off = -circ / 4;
                    return lossReasons.map((lr) => {
                      const len = (lr.pct / 100) * usable;
                      const dash = `${len} ${circ - len}`;
                      const thisOff = off;
                      off += len + gap;
                      const isHov = hoveredLoss === lr.reason;
                      const isDim = hoveredLoss && !isHov;
                      return (
                        <g key={lr.reason}>
                          {isHov && (
                            <circle cx="100" cy="100" r={r} fill="transparent" stroke={lr.color} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#lossGlow)" />
                          )}
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={lr.color} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredLoss(lr.reason)} />
                        </g>
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoveredLoss ? (() => {
                    const lr = lossReasons.find(x => x.reason === hoveredLoss)!;
                    return (<>
                      <p className="text-2xl font-bold text-white">{lr.pct}%</p>
                      <p className="text-[11px] text-slate-400">{lr.reason}</p>
                      <p className="text-[10px] text-emerald-400">Neutr: {lr.neutralizacao}%</p>
                    </>);
                  })() : (<>
                    <p className="text-2xl font-bold text-white">118</p>
                    <p className="text-[11px] text-neutral-400">perdidos</p>
                  </>)}
                </div>
              </div>
              <div className="w-full space-y-1.5">
                {lossReasons.map(lr => {
                  const isHov = hoveredLoss === lr.reason;
                  const isDim = hoveredLoss && !isHov;
                  return (
                    <div key={lr.reason} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all cursor-pointer" style={{ opacity: isDim ? 0.3 : 1, background: isHov ? "rgba(255,255,255,0.04)" : "transparent" }} onMouseEnter={() => setHoveredLoss(lr.reason)} onMouseLeave={() => setHoveredLoss(null)}>
                      <div className="size-2.5 rounded-sm flex-shrink-0" style={{ background: lr.color }} />
                      <span className="text-xs text-slate-300 flex-1">{lr.reason}</span>
                      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden max-w-[100px]">
                        <div className="h-full rounded-full" style={{ width: `${lr.pct}%`, background: lr.color, opacity: 0.7 }} />
                      </div>
                      <span className="text-xs font-bold text-white min-w-[32px] text-right">{lr.pct}%</span>
                      <span className="text-[10px] text-emerald-400 min-w-[40px] text-right">N: {lr.neutralizacao}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ════════ B05 — Indicadores de Eficiência SDR/Closer ════════ */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.04]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.6s both" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Indicadores de Eficiência</h3>
              <InfoTip title="Indicadores de Eficiência" />
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5">
              <button onClick={() => setEffTab("sdr")} className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${effTab === "sdr" ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>SDR</button>
              <button onClick={() => setEffTab("closer")} className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${effTab === "closer" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Closer</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {(effTab === "sdr" ? efficiencySDR : efficiencyCloser).map(ind => {
              const grad = effTab === "sdr" ? "linear-gradient(90deg, rgb(8,145,178), rgb(34,211,238))" : "linear-gradient(90deg, rgb(217,119,6), rgb(251,191,36))";
              const glow = effTab === "sdr" ? "0 0 12px rgba(34,211,238,0.3)" : "0 0 12px rgba(251,191,36,0.3)";
              return (
                <div key={ind.label} className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400">{ind.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5 relative">
                      <div className="h-full rounded-full relative overflow-hidden animate-bar-enter" style={{ width: `${Math.max(ind.pct, 3)}%`, background: grad, boxShadow: glow }}>
                        {rndParticles(3, true)}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white min-w-[3.5rem] text-right">{ind.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════ SCORE SPIN SELLING + Atividade SDR ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score SPIN Selling */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.65s both" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-amber-400/60">{kpiIcons.brain}</div>
                <h3 className="font-bold text-sm text-slate-300">Score SPIN Selling</h3>
                <InfoTip title="Score SPIN Selling" />
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5">
                <button onClick={() => setSpinTab("score")} className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${spinTab === "score" ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Score</button>
                <button onClick={() => setSpinTab("dist")} className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${spinTab === "dist" ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" : "text-slate-500 hover:text-slate-400 border border-transparent"}`}>Distribuição</button>
              </div>
            </div>
            <div className="flex-1 flex gap-1.5 relative min-h-[14rem]">
              {spinTab === "score" ? (
                <>
                  <div className="absolute left-0 right-0 border-t-2 border-dashed border-purple-400/40 pointer-events-none z-[1]" style={{ bottom: `${(7.5 / maxSpin) * 100}%` }}>
                    <span className="absolute -top-4 right-0 text-[11px] font-bold text-purple-400/70 bg-black/60 px-1 rounded">Meta: 7.5</span>
                  </div>
                  {spinWeekly.map((d, i) => {
                    const h = (d.score / maxSpin) * 100;
                    const isHov = hoveredSpin === i;
                    const color = d.score >= 8 ? "from-emerald-600 to-emerald-400" : d.score >= 6 ? "from-amber-600 to-amber-400" : "from-rose-600 to-rose-400";
                    return (
                      <div key={d.sem} className="flex-1 flex flex-col items-center cursor-pointer group/bar" onMouseEnter={() => setHoveredSpin(i)} onMouseLeave={() => setHoveredSpin(null)} onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}>
                        {isHov && typeof document !== "undefined" && createPortal(
                          <div className="fixed bg-black/95 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white whitespace-nowrap z-[9999] shadow-lg pointer-events-none" style={{ left: mousePos.x + 12, top: mousePos.y - 28 }}>
                            {d.sem}: Score <span className={d.score >= 8 ? "text-emerald-400" : d.score >= 6 ? "text-amber-400" : "text-rose-400"}>{d.score}</span> · A: {d.a}% B: {d.b}% C: {d.c}%
                          </div>, document.body
                        )}
                        <div className="flex-1 relative w-full">
                          <div className={`absolute bottom-0 left-0 right-0 rounded-t overflow-hidden transition-all duration-500 group-hover/bar:brightness-125 bg-gradient-to-t ${color}`}
                            style={{ height: `${h}%`, minHeight: 2, boxShadow: "0 0 12px rgba(168,85,247,0.15)", animationDelay: `${i * 0.06}s` }}>
                            {rndParticles(3)}
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-1">{d.sem}</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                spinWeekly.map((d, i) => (
                  <div key={d.sem} className="flex-1 flex flex-col items-center cursor-pointer group/bar" onMouseEnter={() => setHoveredSpin(i)} onMouseLeave={() => setHoveredSpin(null)} onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}>
                    {hoveredSpin === i && typeof document !== "undefined" && createPortal(
                      <div className="fixed bg-black/95 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white whitespace-nowrap z-[9999] shadow-lg pointer-events-none" style={{ left: mousePos.x + 12, top: mousePos.y - 28 }}>
                        {d.sem}: <span className="text-emerald-400">A {d.a}%</span> · <span className="text-amber-400">B {d.b}%</span> · <span className="text-rose-400">C {d.c}%</span>
                      </div>, document.body
                    )}
                    <div className="flex-1 relative w-full flex flex-col justify-end">
                      <div className="rounded-t-sm bg-rose-500/80" style={{ height: `${d.c}%`, minHeight: 1 }} />
                      <div className="bg-amber-500/80" style={{ height: `${d.b}%`, minHeight: 1 }} />
                      <div className="rounded-t bg-emerald-500/80" style={{ height: `${d.a}%`, minHeight: 1 }} />
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1">{d.sem}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-emerald-500" /> Score A (≥8)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-amber-500" /> Score B (6-7.9)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-rose-500" /> {"Score C (<6)"}</span>
              <span className="ml-auto">Média: <span className="text-purple-400 font-bold">{(spinWeekly.reduce((a, b) => a + b.score, 0) / spinWeekly.length).toFixed(1)}</span></span>
            </div>
          </div>

          {/* Atividade SDR */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.7s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/60"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Atividade SDR (Semanal)</h3>
              <InfoTip title="Atividade SDR" />
            </div>
            <div className="flex-1 flex gap-1 relative min-h-[14rem]">
              <div className="absolute left-0 right-0 border-t-2 border-dashed border-cyan-400/40 pointer-events-none z-[1]" style={{ bottom: `${(200 / maxLig) * 100}%` }}>
                <span className="absolute -top-4 right-0 text-[11px] font-bold text-cyan-400/70 bg-black/60 px-1 rounded">Meta: 200</span>
              </div>
              {atividadeSDR.map((d, i) => {
                const hLig = (d.ligacoes / maxLig) * 100;
                const isHov = hoveredAtv === i;
                return (
                  <div key={d.sem} className="flex-1 flex flex-col items-center cursor-pointer group/bar" onMouseEnter={() => setHoveredAtv(i)} onMouseLeave={() => setHoveredAtv(null)} onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}>
                    {isHov && typeof document !== "undefined" && createPortal(
                      <div className="fixed bg-black/95 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white whitespace-nowrap z-[9999] shadow-lg pointer-events-none" style={{ left: mousePos.x + 12, top: mousePos.y - 28 }}>
                        {d.sem}: <span className="text-cyan-400">{d.ligacoes} lig.</span> · {d.emails} emails · {d.tentativas}x/lead · <span className={d.tempoResp <= 4 ? "text-emerald-400" : "text-amber-400"}>{d.tempoResp}h resp</span>
                      </div>, document.body
                    )}
                    <div className="flex-1 relative w-full">
                      <div className="absolute bottom-0 left-0 right-0 rounded-t overflow-hidden transition-all duration-500 group-hover/bar:brightness-125"
                        style={{ height: `${hLig}%`, minHeight: 2, background: d.ligacoes >= 200 ? "linear-gradient(to top, rgb(8,145,178), rgb(34,211,238))" : "linear-gradient(to top, rgb(217,119,6), rgb(251,191,36))", boxShadow: "0 0 10px rgba(34,211,238,0.15)", animationDelay: `${i * 0.06}s` }}>
                        {rndParticles(3)}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-500 mt-1">{d.sem}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span>Média Lig: <span className="text-cyan-400 font-bold">{Math.round(atividadeSDR.reduce((a, b) => a + b.ligacoes, 0) / atividadeSDR.length)}</span>/sem</span>
              <span>Média Emails: <span className="text-cyan-400 font-bold">{Math.round(atividadeSDR.reduce((a, b) => a + b.emails, 0) / atividadeSDR.length)}</span>/sem</span>
              <span>Tempo 1º Resp: <span className="text-emerald-400 font-bold">{(atividadeSDR.reduce((a, b) => a + b.tempoResp, 0) / atividadeSDR.length).toFixed(1)}h</span></span>
            </div>
          </div>
        </div>

        {/* ════════ Tempo 1ª Mensagem + Tempo 1ª Ligação ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tempo 1ª Mensagem */}
          <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]" style={{ animation: "animationIn 0.8s ease-out 0.72s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Tempo 1ª Mensagem (horas)</h3>
              <InfoTip title="Tempo 1ª Mensagem" />
            </div>
            {(() => {
              const maxVal = Math.max(...atividadeSDR.map(x => x.tempoMsg));
              const BAR_AREA = 130;
              return (
                <div className="flex gap-[6px]">
                  {atividadeSDR.map((d, i) => {
                    const h = (d.tempoMsg / maxVal) * BAR_AREA;
                    const color = d.tempoMsg <= 1.0 ? "#10b981" : d.tempoMsg <= 2.0 ? "#fbbf24" : "#f43f5e";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0">
                        <span className="text-[9px] font-bold leading-none mb-1" style={{ color }}>{d.tempoMsg.toFixed(1)}</span>
                        <div className="w-full relative" style={{ height: BAR_AREA }}>
                          <div className="absolute bottom-0 left-0 right-0 rounded-t" style={{ height: Math.max(h, 4), background: `linear-gradient(to top, ${color}44, ${color})` }} />
                        </div>
                        <span className="text-[9px] text-neutral-500 mt-1.5 leading-none">{d.sem}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {"≤ 1h"}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 1-2h</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> {"> 2h"}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">{"Meta: ≤ 1h"}</span>
            </div>
          </div>

          {/* Tempo 1ª Ligação */}
          <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]" style={{ animation: "animationIn 0.8s ease-out 0.74s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Tempo 1ª Ligação (horas)</h3>
              <InfoTip title="Tempo 1ª Ligação" />
            </div>
            {(() => {
              const maxVal = Math.max(...atividadeSDR.map(x => x.tempoLig));
              const BAR_AREA = 130;
              return (
                <div className="flex gap-[6px]">
                  {atividadeSDR.map((d, i) => {
                    const h = (d.tempoLig / maxVal) * BAR_AREA;
                    const color = d.tempoLig <= 2.0 ? "#10b981" : d.tempoLig <= 4.0 ? "#fbbf24" : "#f43f5e";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0">
                        <span className="text-[9px] font-bold leading-none mb-1" style={{ color }}>{d.tempoLig.toFixed(1)}</span>
                        <div className="w-full relative" style={{ height: BAR_AREA }}>
                          <div className="absolute bottom-0 left-0 right-0 rounded-t" style={{ height: Math.max(h, 4), background: `linear-gradient(to top, ${color}44, ${color})` }} />
                        </div>
                        <span className="text-[9px] text-neutral-500 mt-1.5 leading-none">{d.sem}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {"≤ 2h"}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 2-4h</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> {"> 4h"}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">{"Meta: ≤ 4h"}</span>
            </div>
          </div>
        </div>

        {/* ════════ Volume SDR + Taxas SDR ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volume SDR */}
          <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]" style={{ animation: "animationIn 0.8s ease-out 0.76s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/60"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <h3 className="font-bold text-sm text-slate-300">Volume SDR (12 semanas)</h3>
              <InfoTip title="Volume SDR" />
            </div>
            {(() => {
              const maxL = Math.max(...sdrWeekly.map(d => d.leads));
              const W = 1000; const H = 160; const PY = 10;
              const n = sdrWeekly.length;
              const x = (i: number) => (i / (n - 1)) * W;
              const y = (v: number) => H - PY - (v / maxL) * (H - PY * 2);
              const area = (key: "leads" | "qualif" | "demos") =>
                sdrWeekly.map((d, i) => `${x(i)},${y(d[key])}`).join(" ") + ` ${W},${H - PY} 0,${H - PY}`;
              const line = (key: "leads" | "qualif" | "demos") =>
                sdrWeekly.map((d, i) => `${x(i)},${y(d[key])}`).join(" ");
              return (
                <div className="relative">
                  <div className="flex justify-between text-[9px] text-neutral-600 mb-1">
                    <span>{maxL}</span><span>0</span>
                  </div>
                  <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H }}>
                    {[0, 0.33, 0.66, 1].map(p => (
                      <line key={p} x1="0" x2={W} y1={PY + p * (H - PY * 2)} y2={PY + p * (H - PY * 2)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    ))}
                    <polygon points={area("leads")} fill="rgba(34,211,238,0.1)" />
                    <polyline points={line("leads")} fill="none" stroke="#22d3ee" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <polygon points={area("qualif")} fill="rgba(251,191,36,0.08)" />
                    <polyline points={line("qualif")} fill="none" stroke="#fbbf24" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <polygon points={area("demos")} fill="rgba(52,211,153,0.06)" />
                    <polyline points={line("demos")} fill="none" stroke="#34d399" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    {sdrWeekly.map((d, i) => (
                      <g key={d.sem}>
                        <circle cx={x(i)} cy={y(d.leads)} r="4" fill="#22d3ee" vectorEffect="non-scaling-stroke" />
                        <circle cx={x(i)} cy={y(d.qualif)} r="3.5" fill="#fbbf24" vectorEffect="non-scaling-stroke" />
                        <circle cx={x(i)} cy={y(d.demos)} r="3.5" fill="#34d399" vectorEffect="non-scaling-stroke" />
                      </g>
                    ))}
                  </svg>
                  <div className="flex justify-between mt-1">
                    {sdrWeekly.map(d => <span key={d.sem} className="text-[9px] text-neutral-500">{d.sem}</span>)}
                  </div>
                </div>
              );
            })()}
            <div className="flex items-center gap-5 mt-3 pt-2 border-t border-white/[0.04] text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Leads</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Qualificados</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Demos</span>
            </div>
          </div>

          {/* Taxas SDR */}
          <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/[0.06]" style={{ animation: "animationIn 0.8s ease-out 0.78s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/60"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              <h3 className="font-bold text-sm text-slate-300">Taxas SDR (%)</h3>
              <InfoTip title="Taxas SDR" />
            </div>
            {(() => {
              const W = 1000; const H = 160; const PY = 10;
              const n = sdrWeekly.length;
              const x = (i: number) => (i / (n - 1)) * W;
              const y = (v: number) => H - PY - (v / 100) * (H - PY * 2);
              const line = (key: "txResp" | "txBANT" | "txShowUp") =>
                sdrWeekly.map((d, i) => `${x(i)},${y(d[key])}`).join(" ");
              const yPct = (v: number) => ((1 - v / 100) * (H - PY * 2) + PY) / H * 100;
              return (
                <div className="relative">
                  <div className="text-[9px] text-neutral-600 mb-1">100%</div>
                  <div className="relative" style={{ height: H }}>
                    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: H, position: "absolute", inset: 0 }}>
                      {[0, 0.33, 0.66, 1].map(p => (
                        <line key={p} x1="0" x2={W} y1={PY + p * (H - PY * 2)} y2={PY + p * (H - PY * 2)} stroke="rgba(255,255,255,0.03)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      ))}
                      <line x1="0" x2={W} y1={y(40)} y2={y(40)} stroke="rgba(251,191,36,0.2)" strokeWidth="1" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
                      <line x1="0" x2={W} y1={y(60)} y2={y(60)} stroke="rgba(52,211,153,0.2)" strokeWidth="1" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
                      <line x1="0" x2={W} y1={y(75)} y2={y(75)} stroke="rgba(34,211,238,0.2)" strokeWidth="1" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
                      <polyline points={line("txResp")} fill="none" stroke="#fbbf24" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      <polyline points={line("txBANT")} fill="none" stroke="#34d399" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      <polyline points={line("txShowUp")} fill="none" stroke="#22d3ee" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                      {sdrWeekly.map((d, i) => (
                        <g key={d.sem}>
                          <circle cx={x(i)} cy={y(d.txResp)} r="3.5" fill="#fbbf24" vectorEffect="non-scaling-stroke" />
                          <circle cx={x(i)} cy={y(d.txBANT)} r="3.5" fill="#34d399" vectorEffect="non-scaling-stroke" />
                          <circle cx={x(i)} cy={y(d.txShowUp)} r="4" fill="#22d3ee" vectorEffect="non-scaling-stroke" />
                        </g>
                      ))}
                    </svg>
                    {/* meta labels positioned at line height */}
                    <span className="absolute right-0 text-[8px] text-cyan-400/60 -translate-y-1/2 pointer-events-none" style={{ top: `${yPct(75)}%` }}>75%</span>
                    <span className="absolute right-0 text-[8px] text-emerald-400/60 -translate-y-1/2 pointer-events-none" style={{ top: `${yPct(60)}%` }}>60%</span>
                    <span className="absolute right-0 text-[8px] text-amber-400/60 -translate-y-1/2 pointer-events-none" style={{ top: `${yPct(40)}%` }}>40%</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-neutral-600 mt-0.5">
                    <span>0%</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    {sdrWeekly.map(d => <span key={d.sem} className="text-[9px] text-neutral-500">{d.sem}</span>)}
                  </div>
                </div>
              );
            })()}
            <div className="flex items-center gap-5 mt-3 pt-2 border-t border-white/[0.04] text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Resposta</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> BANT+</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Show-Up</span>
            </div>
          </div>
        </div>

        {/* ════════ MRR + Fechamento | Ciclo Médio ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.8s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-amber-400/60">{kpiIcons.dollar}</div>
              <h3 className="font-bold text-sm text-slate-300">MRR e Taxa de Fechamento</h3>
              <InfoTip title="MRR e Fechamento" />
            </div>
            {(() => {
              const maxMRR = Math.max(...closerWeekly.map(d => d.mrr));
              return (
                <div className="flex-1 relative min-h-[14rem]">
                  <div className="absolute left-0 top-0 text-[10px] text-neutral-500">R${(maxMRR/1000).toFixed(0)}k</div>
                  <div className="absolute right-0 top-0 text-[10px] text-neutral-500">50%</div>
                  <div className="flex gap-1 items-end h-[13rem]">
                    {closerWeekly.map((d, i) => {
                      const h = (d.mrr / maxMRR) * 100;
                      return (
                        <div key={d.sem} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                          <div className="flex-1 relative w-full flex items-end justify-center">
                            <div className="w-full rounded-t overflow-hidden transition-all duration-500 group-hover/bar:brightness-125"
                              style={{ height: `${h}%`, minHeight: 2, background: "linear-gradient(to top, rgb(180,83,9), rgb(251,191,36))", animationDelay: `${i * 0.06}s` }}>
                              {rndParticles(2)}
                            </div>
                          </div>
                          <span className="text-[9px] text-neutral-500 mt-1">{d.sem}</span>
                        </div>
                      );
                    })}
                  </div>
                  <svg className="absolute inset-0 w-full h-[13rem] pointer-events-none" viewBox="0 0 480 200" preserveAspectRatio="none">
                    <polyline points={closerWeekly.map((d, i) => `${i * (480 / 11) + 20},${200 - (d.txFech / 50) * 180}`).join(" ")} fill="none" stroke="rgb(52,211,153)" strokeWidth="2.5" />
                    {closerWeekly.map((d, i) => (
                      <circle key={d.sem} cx={i * (480 / 11) + 20} cy={200 - (d.txFech / 50) * 180} r="3" fill="rgb(52,211,153)" />
                    ))}
                  </svg>
                </div>
              );
            })()}
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400" /> MRR (R$)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" /> Taxa Fech. (%)</span>
              <span className="ml-auto font-bold text-amber-400">Total MRR: R$ {(closerWeekly.reduce((a,b)=>a+b.mrr,0)/1000).toFixed(0)}k</span>
            </div>
          </div>

          {/* Ciclo Médio de Venda */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.82s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-amber-400/60">{kpiIcons.clock}</div>
              <h3 className="font-bold text-sm text-slate-300">Ciclo Médio de Venda (dias)</h3>
              <InfoTip title="Ciclo Médio" />
            </div>
            <div className="flex-1 relative min-h-[14rem]">
              <div className="absolute left-0 top-0 text-[10px] text-neutral-500">30d</div>
              <div className="absolute left-0 bottom-[20px] text-[10px] text-neutral-500">0d</div>
              <div className="absolute left-6 right-0 border-t-2 border-dashed border-emerald-400/40 pointer-events-none" style={{ bottom: `${(14 / 30) * 85 + 10}%` }}>
                <span className="absolute -top-3 right-0 text-[9px] text-emerald-400/60">Meta: 14d</span>
              </div>
              <svg className="w-full h-full" viewBox="0 0 480 200" preserveAspectRatio="none">
                <polygon points={closerWeekly.map((d, i) => `${i * (480 / 11)},${200 - (d.ciclo / 30) * 180}`).join(" ") + ` 480,200 0,200`} fill="rgba(251,191,36,0.08)" />
                <polyline points={closerWeekly.map((d, i) => `${i * (480 / 11)},${200 - (d.ciclo / 30) * 180}`).join(" ")} fill="none" stroke="rgb(251,191,36)" strokeWidth="2.5" />
                {closerWeekly.map((d, i) => (
                  <circle key={d.sem} cx={i * (480 / 11)} cy={200 - (d.ciclo / 30) * 180} r="4" fill={d.ciclo <= 14 ? "rgb(52,211,153)" : d.ciclo <= 18 ? "rgb(251,191,36)" : "rgb(251,113,133)"} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                ))}
              </svg>
              <div className="flex justify-between mt-1">
                {closerWeekly.map(d => <span key={d.sem} className="text-[10px] text-neutral-500">{d.sem}</span>)}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500" /> {"≤14d"}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500" /> 15-18d</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500" /> {">18d"}</span>
              <span className="ml-auto">Atual: <span className="text-emerald-400 font-bold">{closerWeekly[closerWeekly.length-1].ciclo}d</span></span>
            </div>
          </div>
        </div>

        {/* ════════ Follow-up + Ticket/Indicação ════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.84s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-amber-400/60">{kpiIcons.clock}</div>
              <h3 className="font-bold text-sm text-slate-300">Tempo Follow-up pós-Demo (horas)</h3>
              <InfoTip title="Follow-up pós-Demo" />
            </div>
            <div className="flex-1 flex gap-1.5 items-end min-h-[14rem] relative">
              <div className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-400/40 pointer-events-none z-[1]" style={{ bottom: `${(2 / 5) * 100}%` }}>
                <span className="absolute -top-4 right-0 text-[11px] font-bold text-emerald-400/70 bg-black/60 px-1 rounded">Meta: 2h</span>
              </div>
              {closerWeekly.map((d, i) => {
                const h = (d.followUp / 5) * 100;
                const color = d.followUp <= 2 ? "from-emerald-600 to-emerald-400" : d.followUp <= 3 ? "from-amber-600 to-amber-400" : "from-rose-600 to-rose-400";
                return (
                  <div key={d.sem} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                    <span className="text-[10px] font-bold text-white mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity">{d.followUp}h</span>
                    <div className="flex-1 relative w-full flex items-end">
                      <div className={`w-full rounded-t overflow-hidden transition-all duration-500 group-hover/bar:brightness-125 bg-gradient-to-t ${color}`}
                        style={{ height: `${h}%`, minHeight: 2, animationDelay: `${i * 0.06}s` }}>
                        {rndParticles(2)}
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-500 mt-1">{d.sem}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-emerald-500" /> {"≤2h"}</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-amber-500" /> 2-3h</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-rose-500" /> {">3h"}</span>
              <span className="ml-auto">Atual: <span className="text-emerald-400 font-bold">{closerWeekly[closerWeekly.length-1].followUp}h</span></span>
            </div>
          </div>

          {/* Ticket Médio + Taxa Indicação */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.04] flex flex-col" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.86s both" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-amber-400/60">{kpiIcons.receipt}</div>
              <h3 className="font-bold text-sm text-slate-300">Ticket Médio + Taxa Indicação</h3>
              <InfoTip title="Ticket e Indicação" />
            </div>
            {(() => {
              const maxTk = Math.max(...closerWeekly.map(d => d.ticket));
              return (
                <div className="flex-1 relative min-h-[14rem]">
                  <div className="absolute left-0 top-0 text-[10px] text-neutral-500">R${(maxTk/1000).toFixed(1)}k</div>
                  <div className="absolute right-0 top-0 text-[10px] text-neutral-500">40%</div>
                  <div className="flex gap-1 items-end h-[13rem]">
                    {closerWeekly.map((d, i) => {
                      const h = (d.ticket / maxTk) * 100;
                      return (
                        <div key={d.sem} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                          <div className="flex-1 relative w-full flex items-end justify-center">
                            <div className="w-full rounded-t overflow-hidden transition-all duration-500 group-hover/bar:brightness-125"
                              style={{ height: `${h}%`, minHeight: 2, background: "linear-gradient(to top, rgb(8,145,178), rgb(34,211,238))", animationDelay: `${i * 0.06}s` }}>
                              {rndParticles(2)}
                            </div>
                          </div>
                          <span className="text-[9px] text-neutral-500 mt-1">{d.sem}</span>
                        </div>
                      );
                    })}
                  </div>
                  <svg className="absolute inset-0 w-full h-[13rem] pointer-events-none" viewBox="0 0 480 200" preserveAspectRatio="none">
                    <polyline points={closerWeekly.map((d, i) => `${i * (480 / 11) + 20},${200 - (d.indicacao / 40) * 180}`).join(" ")} fill="none" stroke="rgb(251,191,36)" strokeWidth="2.5" />
                    {closerWeekly.map((d, i) => (
                      <circle key={d.sem} cx={i * (480 / 11) + 20} cy={200 - (d.indicacao / 40) * 180} r="3" fill="rgb(251,191,36)" />
                    ))}
                  </svg>
                </div>
              );
            })()}
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-cyan-400" /> Ticket Médio (R$)</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400" /> Taxa Indicação (%)</span>
            </div>
          </div>
        </div>

        {/* ════════ Heatmap de Objeções ════════ */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.04]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.88s both" }}>
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
            <h3 className="font-bold text-sm text-slate-300">Heatmap de Objeções (Semana × Tipo)</h3>
            <InfoTip title="Heatmap Objeções" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-neutral-500 font-bold uppercase tracking-wider pb-2 pr-4">Objeção</th>
                  {heatmapData.map(d => <th key={d.sem} className="text-center text-neutral-500 font-bold pb-2 px-1">{d.sem}</th>)}
                </tr>
              </thead>
              <tbody>
                {heatmapLabels.map(key => (
                  <tr key={key}>
                    <td className="text-slate-400 font-medium pr-4 py-1">{heatmapNames[key]}</td>
                    {heatmapData.map(d => {
                      const v = d[key];
                      const maxH = 5;
                      const intensity = v / maxH;
                      const bg = v === 0 ? "rgba(255,255,255,0.02)" : `rgba(251,191,36,${0.1 + intensity * 0.6})`;
                      return (
                        <td key={d.sem} className="text-center py-1 px-1">
                          <div className="rounded-md px-2 py-1.5 text-[11px] font-bold transition-all cursor-default" style={{ background: bg, color: v >= 3 ? "#fff" : v >= 1 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }}>
                            {v}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-500">
            <span>Intensidade:</span>
            {[0, 1, 2, 3, 4, 5].map(v => (
              <div key={v} className="w-6 h-4 rounded-sm" style={{ background: v === 0 ? "rgba(255,255,255,0.02)" : `rgba(251,191,36,${0.1 + (v/5) * 0.6})` }} />
            ))}
            <span>{"0 → 5+"}</span>
          </div>
        </div>

        {/* ════════ Análise de Objeções ════════ */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.04]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.9s both" }}>
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <h3 className="font-bold text-sm text-slate-300">Análise de Objeções — Frequência vs Neutralização</h3>
            <InfoTip title="Análise de Objeções" />
          </div>
          <div className="space-y-3">
            {objecoesData.map(obj => {
              const maxQtd = Math.max(...objecoesData.map(o => o.qtd));
              const barW = (obj.qtd / maxQtd) * 100;
              return (
                <div key={obj.nome} className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 w-28 text-right shrink-0">{obj.nome}</span>
                  <div className="flex-1 relative">
                    <div className="h-6 bg-white/[0.03] rounded overflow-hidden border border-white/[0.04]">
                      <div className="h-full rounded flex items-center px-2" style={{ width: `${barW}%`, background: "linear-gradient(90deg, rgba(251,191,36,0.3), transparent)" }}>
                        <span className="text-[10px] font-bold text-white">{obj.qtd}x</span>
                      </div>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-2">
                      <span className={`text-[11px] font-bold ${obj.neutralizacao >= 70 ? "text-emerald-400" : obj.neutralizacao >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                        Neutr: {obj.neutralizacao}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════ Tabela Semanal Detalhada ════════ */}
        <div className="glass-panel rounded-2xl p-6 border border-white/[0.04]" style={{ ...glassStyle, animation: "animationIn 0.8s ease-out 0.92s both" }}>
          <div className="flex items-center gap-2 mb-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400/60"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
            <h3 className="font-bold text-sm text-slate-300">Tabela Semanal Detalhada</h3>
            <InfoTip title="Tabela Semanal" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/10">
                  {["Sem", "Leads", "Qualif.", "Demos", "ShowUp", "Tx.Resp", "Tx.BANT", "SPIN", "Fech.", "Tx.Fech", "MRR", "Ciclo", "Ticket"].map(h => (
                    <th key={h} className="text-left text-neutral-500 font-bold uppercase tracking-wider px-2 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sdrWeekly.map((s, i) => {
                  const c = closerWeekly[i];
                  const sp = spinWeekly[i];
                  const spinColor = sp.score >= 8 ? "text-emerald-400" : sp.score >= 6 ? "text-amber-400" : "text-rose-400";
                  const spinBg = sp.score >= 8 ? "bg-emerald-500/10 border-emerald-500/20" : sp.score >= 6 ? "bg-amber-500/10 border-amber-500/20" : "bg-rose-500/10 border-rose-500/20";
                  return (
                    <tr key={s.sem} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-2 py-2 font-bold text-amber-400">{s.sem}</td>
                      <td className="px-2 py-2 text-white">{s.leads}</td>
                      <td className="px-2 py-2 text-white">{s.qualif}</td>
                      <td className="px-2 py-2 text-white">{s.demos}</td>
                      <td className="px-2 py-2 text-white">{s.showUps}</td>
                      <td className="px-2 py-2"><span className={s.txResp >= 40 ? "text-emerald-400" : "text-amber-400"}>{s.txResp.toFixed(1)}%</span></td>
                      <td className="px-2 py-2"><span className={s.txBANT >= 60 ? "text-emerald-400" : "text-amber-400"}>{s.txBANT.toFixed(1)}%</span></td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-bold ${spinBg} ${spinColor}`}>
                          {sp.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-white">{c.fech}</td>
                      <td className="px-2 py-2"><span className={c.txFech >= 30 ? "text-emerald-400" : "text-amber-400"}>{c.txFech.toFixed(1)}%</span></td>
                      <td className="px-2 py-2 text-white">R$ {(c.mrr/1000).toFixed(1)}k</td>
                      <td className="px-2 py-2"><span className={c.ciclo <= 14 ? "text-emerald-400" : c.ciclo <= 18 ? "text-amber-400" : "text-rose-400"}>{c.ciclo}d</span></td>
                      <td className="px-2 py-2 text-white">R$ {(c.ticket/1000).toFixed(1)}k</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="fixed bottom-8 left-4 right-4 flex items-center justify-between rounded-xl px-8 py-3" style={{ ...glassStyle, zIndex: 20, animation: "animationIn 0.8s ease-out 0.6s both" }}>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema Online - Dados em Tempo Real</span>
        </div>
        <div className="text-xs text-neutral-500">
          Última atualização: hoje às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
      </footer>
    </div>
  );
}
