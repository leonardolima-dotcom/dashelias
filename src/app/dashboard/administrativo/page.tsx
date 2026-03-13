"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createPortal } from "react-dom";

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */

const RECEITA_MENSAL = [
  { mes: "Out", realizada: 68400, projetada: 12000, recuperada: 4200 },
  { mes: "Nov", realizada: 72100, projetada: 15600, recuperada: 5800 },
  { mes: "Dez", realizada: 81300, projetada: 9800, recuperada: 3100 },
  { mes: "Jan", realizada: 59200, projetada: 18200, recuperada: 6400 },
  { mes: "Fev", realizada: 87600, projetada: 14100, recuperada: 7200 },
  { mes: "Mar", realizada: 43200, projetada: 38400, recuperada: 3800 },
];

const FUNIL_DATA = [
  { etapa: "Captados", valor: 247, pct: 100 },
  { etapa: "Enriquecidos", valor: 231, pct: 93 },
  { etapa: "Qualificados", valor: 178, pct: 72 },
  { etapa: "Negociação", valor: 112, pct: 45 },
  { etapa: "Fechados", valor: 89, pct: 36 },
  { etapa: "Perdidos", valor: 158, pct: 64 },
];

const FUNIL_EVOLUCAO = [
  { dia: "01", captados: 12, qualificados: 8, fechados: 3 },
  { dia: "05", captados: 18, qualificados: 14, fechados: 5 },
  { dia: "10", captados: 9, qualificados: 7, fechados: 4 },
  { dia: "15", captados: 22, qualificados: 16, fechados: 8 },
  { dia: "20", captados: 15, qualificados: 11, fechados: 6 },
  { dia: "25", captados: 20, qualificados: 15, fechados: 7 },
  { dia: "30", captados: 14, qualificados: 10, fechados: 5 },
];

const VENDEDORES = [
  { nome: "Agente SDR", tipo: "ia", vendas: 34, receita: 78200, conversao: 41, ticket: 2300, tempoResp: "12s", custo: 420 },
  { nome: "Camila Rocha", tipo: "humano", vendas: 28, receita: 89600, conversao: 38, ticket: 3200, tempoResp: "23min", custo: 4600 },
  { nome: "Lucas Mendes", tipo: "humano", vendas: 15, receita: 36000, conversao: 22, ticket: 2400, tempoResp: "1h12min", custo: 4600 },
  { nome: "Pedro Alves", tipo: "humano", vendas: 8, receita: 19200, conversao: 15, ticket: 2400, tempoResp: "2h30min", custo: 4600 },
  { nome: "Ana Beatriz", tipo: "humano", vendas: 4, receita: 9600, conversao: 11, ticket: 2400, tempoResp: "3h45min", custo: 4600 },
];

const PERF_SEMANAL = [
  { sem: "S1", agente: 6, camila: 5, lucas: 3, pedro: 2 },
  { sem: "S2", agente: 8, camila: 7, lucas: 4, pedro: 1 },
  { sem: "S3", agente: 7, camila: 6, lucas: 2, pedro: 2 },
  { sem: "S4", agente: 9, camila: 8, lucas: 3, pedro: 1 },
  { sem: "S5", agente: 11, camila: 7, lucas: 4, pedro: 3 },
  { sem: "S6", agente: 10, camila: 9, lucas: 5, pedro: 2 },
];

const AGENTES: { nome: string; icon: string; status: "online" | "degradado" | "offline"; exec24h: number; sucesso: number; tokens: number; custoMes: number; uptime: number; lastExec: string; custoExec: number; valorGerado: number; roi: number; resultado: string; equivHumano: string; equivCusto: number; deflexao: number; escalacoes: number; sparkline: number[] }[] = [
  { nome: "Enriquecimento", icon: "search", status: "online", exec24h: 47, sucesso: 97.8, tokens: 124000, custoMes: 62, uptime: 99.8, lastExec: "2min", custoExec: 1.32, valorGerado: 4200, roi: 67.7, resultado: "Leads enriquecidos", equivHumano: "Analyst júnior", equivCusto: 2500, deflexao: 75, escalacoes: 12, sparkline: [40, 45, 42, 47, 44, 46, 47] },
  { nome: "SDR", icon: "chat", status: "online", exec24h: 189, sucesso: 91.2, tokens: 890000, custoMes: 445, uptime: 99.2, lastExec: "30s", custoExec: 2.35, valorGerado: 28400, roi: 63.8, resultado: "Leads qualificados", equivHumano: "SDR humano", equivCusto: 3200, deflexao: 58, escalacoes: 66, sparkline: [170, 185, 190, 178, 195, 182, 189] },
  { nome: "Agendamento", icon: "calendar", status: "online", exec24h: 23, sucesso: 95.6, tokens: 45000, custoMes: 22, uptime: 99.9, lastExec: "8min", custoExec: 0.96, valorGerado: 6900, roi: 313.6, resultado: "Reuniões agendadas", equivHumano: "Assistente admin", equivCusto: 1800, deflexao: 92, escalacoes: 2, sparkline: [20, 22, 19, 25, 21, 24, 23] },
  { nome: "Cobrança", icon: "dollar", status: "degradado", exec24h: 56, sucesso: 87.3, tokens: 210000, custoMes: 105, uptime: 97.1, lastExec: "5min", custoExec: 1.88, valorGerado: 3800, roi: 36.2, resultado: "Inadimplência recuperada", equivHumano: "Analista cobrança", equivCusto: 2200, deflexao: 79, escalacoes: 11, sparkline: [52, 48, 55, 50, 58, 53, 56] },
  { nome: "Pós-venda", icon: "handshake", status: "online", exec24h: 34, sucesso: 98.1, tokens: 78000, custoMes: 39, uptime: 99.7, lastExec: "14min", custoExec: 1.15, valorGerado: 5200, roi: 133.3, resultado: "LTV preservado", equivHumano: "CS humano", equivCusto: 2800, deflexao: 88, escalacoes: 4, sparkline: [30, 32, 28, 35, 33, 31, 34] },
];

const AGENT_EXEC_DIARIO = [
  { dia: "Seg", sucesso: 62, erro: 4 },
  { dia: "Ter", sucesso: 58, erro: 7 },
  { dia: "Qua", sucesso: 71, erro: 3 },
  { dia: "Qui", sucesso: 65, erro: 5 },
  { dia: "Sex", sucesso: 55, erro: 8 },
  { dia: "Sáb", sucesso: 32, erro: 2 },
  { dia: "Dom", sucesso: 18, erro: 1 },
];

const INCIDENT_LOG = [
  { agente: "Cobrança", tipo: "warn" as const, titulo: "Degradação atual — Taxa de erro subiu para 12.7%", meta: "13/03 08:26 · Timeout API WhatsApp Business · 7 exec falharam (504)", duracao: "Em curso", duracaoTempo: "4h 23min" },
  { agente: "Cobrança", tipo: "ok" as const, titulo: "Degradação resolvida — Taxa voltou ao normal", meta: "24/02 14:10 → 16:45 · Rate limit OpenAI · 18 exec falharam", duracao: "Resolvido", duracaoTempo: "2h 35min" },
  { agente: "Cobrança", tipo: "crit" as const, titulo: "Offline — Workflow n8n parou", meta: "14/02 09:15 → 11:00 · Credencial WhatsApp expirou · Impacto: ~R$280", duracao: "Resolvido", duracaoTempo: "1h 45min" },
  { agente: "SDR", tipo: "warn" as const, titulo: "Degradação — Taxa de sucesso caiu para 84%", meta: "07/03 20:40 → 21:55 · Instabilidade Supabase · Resolvido automaticamente", duracao: "Resolvido", duracaoTempo: "1h 15min" },
  { agente: "SDR", tipo: "ok" as const, titulo: "Rate limit ajustado", meta: "01/03 10:00 · Quota OpenAI aumentada preventivamente", duracao: "Resolvido", duracaoTempo: "—" },
];

const UPTIME_30D: Record<string, ("ok" | "warn" | "crit" | "off")[]> = {
  Enriquecimento: Array(30).fill("ok"),
  SDR: [...Array(6).fill("ok"), "warn", ...Array(23).fill("ok")] as ("ok" | "warn" | "crit" | "off")[],
  Agendamento: Array(30).fill("ok"),
  Cobrança: [...Array(7).fill("ok"), "warn", ...Array(5).fill("ok"), "crit", ...Array(8).fill("ok"), "warn", ...Array(5).fill("ok"), "warn"] as ("ok" | "warn" | "crit" | "off")[],
  "Pós-venda": Array(30).fill("ok"),
};

const ESCALATION_REASONS = [
  { motivo: "Pergunta fora do escopo", pct: 38, cor: "rgba(251,113,133,0.6)" },
  { motivo: "Lead pediu falar com humano", pct: 26, cor: "rgba(251,191,36,0.6)" },
  { motivo: "Objeção de preço", pct: 17, cor: "rgba(167,139,250,0.6)" },
  { motivo: "Lead agressivo", pct: 12, cor: "rgba(96,165,250,0.6)" },
  { motivo: "Outros", pct: 7, cor: "rgba(255,255,255,0.15)" },
];

const HEATMAP_DATA = [
  { dia: "Seg", horas: [0,2,5,12,18,22,25,28,24,19,14,8,4,1] },
  { dia: "Ter", horas: [0,1,4,10,16,20,23,26,22,17,12,7,3,0] },
  { dia: "Qua", horas: [0,3,6,14,20,26,30,32,28,22,16,9,5,2] },
  { dia: "Qui", horas: [0,2,5,11,17,21,24,27,23,18,13,7,4,1] },
  { dia: "Sex", horas: [0,1,4,9,15,19,22,24,20,16,11,6,3,0] },
  { dia: "Sáb", horas: [0,0,1,3,6,8,10,12,10,7,4,2,1,0] },
  { dia: "Dom", horas: [0,0,0,1,3,4,5,6,5,3,2,1,0,0] },
];
const HEATMAP_HOURS = ["06h","07h","08h","09h","10h","11h","12h","13h","14h","15h","16h","17h","18h","19h"];

const ALUNOS = [
  { id: 1, nome: "Carlos Silva", tel: "(11) 98765-4321", email: "carlos@email.com", ig: "@carlosbarber", cidade: "São Paulo", estado: "SP", score: 87, produto: "Formação Barber Pro", status_pag: "paga" as const, parcelas: "6/6", turma: "Turma 47 — Mai/2026", faturamento: 12000, segmento: "Barbearia", estado_civil: "Casado", socio: true, dataMatricula: "10/09/25", canalOrigem: "Instagram", closer: "Lucas Martins", horasTela: 24.5, modulosConcluidos: 8, totalModulos: 12, ultimoLogin: 1, streakAtual: 3, streakMax: 8, riscoChurn: "baixo" as const },
  { id: 2, nome: "Marcos Oliveira", tel: "(11) 91234-5678", email: "marcos@email.com", ig: "@marcoscuts", cidade: "Campinas", estado: "SP", score: 62, produto: "Formação Barber Pro", status_pag: "parcial" as const, parcelas: "4/12", turma: "Turma 47 — Mai/2026", faturamento: 8000, segmento: "Barbearia", estado_civil: "Solteiro", socio: false, dataMatricula: "14/01/26", canalOrigem: "Instagram", closer: "Lucas Martins", horasTela: 3.2, modulosConcluidos: 2, totalModulos: 12, ultimoLogin: 9, streakAtual: 0, streakMax: 4, riscoChurn: "alto" as const },
  { id: 3, nome: "Rafael Santos", tel: "(21) 99876-5432", email: "rafa@email.com", ig: "@rafabarber", cidade: "Rio de Janeiro", estado: "RJ", score: 31, produto: "Master Cut", status_pag: "atrasada" as const, parcelas: "2/12", turma: "Turma 50 — Ago/2026", faturamento: 6000, segmento: "Salão", estado_civil: "Casado", socio: true, dataMatricula: "05/12/25", canalOrigem: "Google Ads", closer: "Ana Paula", horasTela: 0.8, modulosConcluidos: 0, totalModulos: 8, ultimoLogin: 34, streakAtual: 0, streakMax: 1, riscoChurn: "critico" as const },
  { id: 4, nome: "João Pedro Lima", tel: "(11) 97654-3210", email: "jp@email.com", ig: "@jpbarber", cidade: "São Paulo", estado: "SP", score: 93, produto: "Formação Barber Pro", status_pag: "paga" as const, parcelas: "12/12", turma: "Turma 47 — Mai/2026", faturamento: 18000, segmento: "Barbearia Premium", estado_civil: "Solteiro", socio: false, dataMatricula: "01/08/25", canalOrigem: "Indicação", closer: "Seu Elias", horasTela: 41.2, modulosConcluidos: 12, totalModulos: 12, ultimoLogin: 0, streakAtual: 12, streakMax: 15, riscoChurn: "baixo" as const },
  { id: 5, nome: "Felipe Costa", tel: "(31) 98765-1234", email: "felipe@email.com", ig: "@felipecuts", cidade: "Belo Horizonte", estado: "MG", score: 78, produto: "Formação Barber Pro", status_pag: "parcial" as const, parcelas: "3/6", turma: "Turma 48 — Jun/2026", faturamento: 10000, segmento: "Barbearia", estado_civil: "União estável", socio: true, dataMatricula: "20/11/25", canalOrigem: "Instagram", closer: "Lucas Martins", horasTela: 11.7, modulosConcluidos: 5, totalModulos: 12, ultimoLogin: 2, streakAtual: 5, streakMax: 7, riscoChurn: "baixo" as const },
  { id: 6, nome: "André Souza", tel: "(11) 91111-2222", email: "andre@email.com", ig: "@andrebarber", cidade: "Guarulhos", estado: "SP", score: 55, produto: "Master Cut", status_pag: "parcial" as const, parcelas: "2/12", turma: "Turma 48 — Jun/2026", faturamento: 5000, segmento: "Salão", estado_civil: "Solteiro", socio: false, dataMatricula: "03/02/26", canalOrigem: "Instagram", closer: "Ana Paula", horasTela: 6.4, modulosConcluidos: 3, totalModulos: 8, ultimoLogin: 5, streakAtual: 0, streakMax: 3, riscoChurn: "medio" as const },
];

const ALUNO_MODULOS: Record<number, Array<{ nome: string; ordem: number; status: "concluido" | "progresso" | "bloqueado" | "disponivel"; aulasTotal: number; aulasConcluidas: number; tempoConsumido: string; dataConclusao?: string; aulaAtual?: string }>> = {
  1: [
    { nome: "Módulo 1 — Fundamentos do Corte", ordem: 1, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "1h 42min", dataConclusao: "18/09/25" },
    { nome: "Módulo 2 — Técnicas de Navalha", ordem: 2, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 05min", dataConclusao: "25/09/25" },
    { nome: "Módulo 3 — Degradê Avançado", ordem: 3, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 18min", dataConclusao: "04/10/25" },
    { nome: "Módulo 4 — Business da Barbearia", ordem: 4, status: "concluido", aulasTotal: 10, aulasConcluidas: 10, tempoConsumido: "3h 12min", dataConclusao: "15/10/25" },
    { nome: "Módulo 5 — Atendimento ao Cliente", ordem: 5, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 28min", dataConclusao: "22/10/25" },
    { nome: "Módulo 6 — Marketing para Barbeiros", ordem: 6, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 44min", dataConclusao: "01/11/25" },
    { nome: "Módulo 7 — Colorimetria", ordem: 7, status: "concluido", aulasTotal: 10, aulasConcluidas: 10, tempoConsumido: "3h 30min", dataConclusao: "14/11/25" },
    { nome: "Módulo 8 — Química Capilar", ordem: 8, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 15min", dataConclusao: "25/11/25" },
    { nome: "Módulo 9 — Barboterapia", ordem: 9, status: "progresso", aulasTotal: 6, aulasConcluidas: 4, tempoConsumido: "1h 10min", aulaAtual: "Aula 5 — Massagem craniana" },
    { nome: "Módulo 10 — Gestão Financeira", ordem: 10, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 11 — Liderança de Equipe", ordem: 11, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 12 — Projeto Final", ordem: 12, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
  ],
  2: [
    { nome: "Módulo 1 — Fundamentos do Corte", ordem: 1, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "1h 24min", dataConclusao: "18/01/26" },
    { nome: "Módulo 2 — Técnicas de Navalha", ordem: 2, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "1h 48min", dataConclusao: "23/01/26" },
    { nome: "Módulo 3 — Degradê Avançado", ordem: 3, status: "progresso", aulasTotal: 8, aulasConcluidas: 3, tempoConsumido: "0h 52min", aulaAtual: "Aula 4 — Técnica de Fade Perfeito" },
    { nome: "Módulo 4 — Business da Barbearia", ordem: 4, status: "bloqueado", aulasTotal: 10, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 5 — Atendimento ao Cliente", ordem: 5, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 6 — Marketing para Barbeiros", ordem: 6, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 7 — Colorimetria", ordem: 7, status: "bloqueado", aulasTotal: 10, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 8 — Química Capilar", ordem: 8, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 9 — Barboterapia", ordem: 9, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 10 — Gestão Financeira", ordem: 10, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 11 — Liderança de Equipe", ordem: 11, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 12 — Projeto Final", ordem: 12, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
  ],
  3: [
    { nome: "Módulo 1 — Introdução ao Corte", ordem: 1, status: "progresso", aulasTotal: 6, aulasConcluidas: 2, tempoConsumido: "0h 48min", aulaAtual: "Aula 3 — Tesoura reta" },
    { nome: "Módulo 2 — Técnicas Básicas", ordem: 2, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 3 — Navalha Básica", ordem: 3, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 4 — Degradê Básico", ordem: 4, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 5 — Barba Desenhada", ordem: 5, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 6 — Sobrancelha", ordem: 6, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 7 — Pigmentação", ordem: 7, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 8 — Projeto Final", ordem: 8, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
  ],
  4: [
    { nome: "Módulo 1 — Fundamentos do Corte", ordem: 1, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "1h 50min", dataConclusao: "08/08/25" },
    { nome: "Módulo 2 — Técnicas de Navalha", ordem: 2, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 10min", dataConclusao: "15/08/25" },
    { nome: "Módulo 3 — Degradê Avançado", ordem: 3, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 40min", dataConclusao: "25/08/25" },
    { nome: "Módulo 4 — Business da Barbearia", ordem: 4, status: "concluido", aulasTotal: 10, aulasConcluidas: 10, tempoConsumido: "3h 05min", dataConclusao: "05/09/25" },
    { nome: "Módulo 5 — Atendimento ao Cliente", ordem: 5, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 32min", dataConclusao: "12/09/25" },
    { nome: "Módulo 6 — Marketing para Barbeiros", ordem: 6, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 48min", dataConclusao: "22/09/25" },
    { nome: "Módulo 7 — Colorimetria", ordem: 7, status: "concluido", aulasTotal: 10, aulasConcluidas: 10, tempoConsumido: "3h 25min", dataConclusao: "04/10/25" },
    { nome: "Módulo 8 — Química Capilar", ordem: 8, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 20min", dataConclusao: "14/10/25" },
    { nome: "Módulo 9 — Barboterapia", ordem: 9, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 45min", dataConclusao: "22/10/25" },
    { nome: "Módulo 10 — Gestão Financeira", ordem: 10, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 38min", dataConclusao: "01/11/25" },
    { nome: "Módulo 11 — Liderança de Equipe", ordem: 11, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 52min", dataConclusao: "10/11/25" },
    { nome: "Módulo 12 — Projeto Final", ordem: 12, status: "concluido", aulasTotal: 4, aulasConcluidas: 4, tempoConsumido: "3h 10min", dataConclusao: "18/11/25" },
  ],
  5: [
    { nome: "Módulo 1 — Fundamentos do Corte", ordem: 1, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "1h 38min", dataConclusao: "28/11/25" },
    { nome: "Módulo 2 — Técnicas de Navalha", ordem: 2, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "1h 55min", dataConclusao: "06/12/25" },
    { nome: "Módulo 3 — Degradê Avançado", ordem: 3, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 22min", dataConclusao: "15/12/25" },
    { nome: "Módulo 4 — Business da Barbearia", ordem: 4, status: "concluido", aulasTotal: 10, aulasConcluidas: 10, tempoConsumido: "3h 00min", dataConclusao: "28/12/25" },
    { nome: "Módulo 5 — Atendimento ao Cliente", ordem: 5, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 25min", dataConclusao: "05/01/26" },
    { nome: "Módulo 6 — Marketing para Barbeiros", ordem: 6, status: "progresso", aulasTotal: 8, aulasConcluidas: 5, tempoConsumido: "1h 20min", aulaAtual: "Aula 6 — Redes Sociais" },
    { nome: "Módulo 7 — Colorimetria", ordem: 7, status: "bloqueado", aulasTotal: 10, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 8 — Química Capilar", ordem: 8, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 9 — Barboterapia", ordem: 9, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 10 — Gestão Financeira", ordem: 10, status: "bloqueado", aulasTotal: 8, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 11 — Liderança de Equipe", ordem: 11, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 12 — Projeto Final", ordem: 12, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
  ],
  6: [
    { nome: "Módulo 1 — Introdução ao Corte", ordem: 1, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 12min", dataConclusao: "10/02/26" },
    { nome: "Módulo 2 — Técnicas Básicas", ordem: 2, status: "concluido", aulasTotal: 6, aulasConcluidas: 6, tempoConsumido: "1h 30min", dataConclusao: "18/02/26" },
    { nome: "Módulo 3 — Navalha Básica", ordem: 3, status: "concluido", aulasTotal: 8, aulasConcluidas: 8, tempoConsumido: "2h 05min", dataConclusao: "28/02/26" },
    { nome: "Módulo 4 — Degradê Básico", ordem: 4, status: "progresso", aulasTotal: 8, aulasConcluidas: 4, tempoConsumido: "1h 10min", aulaAtual: "Aula 5 — Low Fade" },
    { nome: "Módulo 5 — Barba Desenhada", ordem: 5, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 6 — Sobrancelha", ordem: 6, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 7 — Pigmentação", ordem: 7, status: "bloqueado", aulasTotal: 6, aulasConcluidas: 0, tempoConsumido: "0min" },
    { nome: "Módulo 8 — Projeto Final", ordem: 8, status: "bloqueado", aulasTotal: 4, aulasConcluidas: 0, tempoConsumido: "0min" },
  ],
};

const ALUNO_TIMELINE: Record<number, Array<{ tipo: string; data: string; titulo: string; descricao: string; tags: Array<{ label: string; color?: string }> }>> = {
  2: [
    { tipo: "alerta", data: "13 Mar 2026 · hoje", titulo: "Alerta: 9 dias sem acesso", descricao: "Agente Pós-venda identificou inatividade. Mensagem de reativação enviada via WhatsApp às 09:14. Aguardando resposta.", tags: [{ label: "Agente Pós-venda", color: "purple" }, { label: "WhatsApp enviado" }] },
    { tipo: "acesso", data: "04 Mar 2026", titulo: "Último acesso — Módulo 3 (Aula 3/8)", descricao: "Sessão de 34min. Assistiu até Aula 3 do Módulo 3 mas não concluiu. Saiu no meio da aula \"Técnica de Fade Perfeito\".", tags: [{ label: "34 min de sessão" }, { label: "Progresso 37.5% do módulo" }] },
    { tipo: "pagamento_atraso", data: "01 Mar 2026", titulo: "Parcela 5/12 venceu sem pagamento", descricao: "Vencimento: R$400,00. Agente de Cobrança enviou 3 mensagens (01/03, 05/03 e 08/03). Sem resposta até o momento.", tags: [{ label: "R$400 em atraso", color: "red" }, { label: "3 tentativas de cobrança", color: "purple" }] },
    { tipo: "mentoria", data: "22 Fev 2026", titulo: "Mentoria Individual — 1h 20min", descricao: "Sessão com Seu Elias. Tema: \"Como precificar serviços na minha barbearia\". Gravação disponível. Plano de ação: 3 ações definidas pelo aluno. Feedback: 5/5", tags: [{ label: "Mentoria Individual", color: "purple" }, { label: "1h 20min" }, { label: "5/5", color: "green" }, { label: "Gravação disponível" }] },
    { tipo: "engajamento", data: "15 – 23 Jan 2026", titulo: "Período de maior engajamento — Módulos 1 e 2", descricao: "8 dias consecutivos de acesso (streak máximo). Concluiu Módulo 1 em 4 dias e Módulo 2 em mais 5 dias. Total: 3.2h de conteúdo consumido.", tags: [{ label: "8 dias de streak", color: "green" }, { label: "3.2h consumidas" }, { label: "2 módulos concluídos" }] },
    { tipo: "pagamento_ok", data: "14 Jan 2026", titulo: "Parcela 1/12 paga — R$400,00", descricao: "Pagamento via Pix confirmado. Acesso liberado à Área do Aluno. Agente de Boas-vindas enviou mensagem de onboarding.", tags: [{ label: "Pix confirmado", color: "green" }, { label: "Onboarding automático", color: "purple" }] },
    { tipo: "matricula", data: "14 Jan 2026", titulo: "Matrícula — Formação Barber Pro", descricao: "Fechamento realizado pelo Closer Lucas Martins. Canal de origem: Instagram. SDR qualificou em 3 dias. Ciclo total da venda: 8 dias.", tags: [{ label: "Matrícula", color: "cyan" }, { label: "12x R$400" }, { label: "Closer: Lucas" }, { label: "Origem: Instagram" }] },
    { tipo: "contato", data: "06 Jan 2026", titulo: "Primeiro contato — Agente SDR", descricao: "Lead captado via Instagram Stories. Agente SDR iniciou conversa em 4min após opt-in. Qualificado como SQL após 3 mensagens.", tags: [{ label: "Agente SDR", color: "purple" }, { label: "Instagram Ads" }, { label: "Qualificado em 3 msgs" }] },
  ],
  1: [
    { tipo: "acesso", data: "12 Mar 2026", titulo: "Acesso — Módulo 9 (Aula 4/6)", descricao: "Sessão de 28min. Avançou para Aula 5 do Módulo 9.", tags: [{ label: "28 min de sessão" }, { label: "Progresso 67% do módulo" }] },
    { tipo: "pagamento_ok", data: "10 Mar 2026", titulo: "Parcela 6/6 paga — R$800,00", descricao: "Pagamento via Pix. Curso totalmente quitado.", tags: [{ label: "Pix confirmado", color: "green" }, { label: "Quitado", color: "green" }] },
    { tipo: "mentoria", data: "05 Mar 2026", titulo: "Mentoria Individual — 45min", descricao: "Tema: \"Escalando minha barbearia\". Feedback: 5/5. Plano de ação definido.", tags: [{ label: "Mentoria Individual", color: "purple" }, { label: "45min" }, { label: "5/5", color: "green" }] },
    { tipo: "matricula", data: "10 Set 2025", titulo: "Matrícula — Formação Barber Pro", descricao: "Fechamento pelo Closer Lucas Martins. Canal: Instagram. Pix 6x R$800/mês.", tags: [{ label: "Matrícula", color: "cyan" }, { label: "6x R$800" }, { label: "Origem: Instagram" }] },
  ],
  3: [
    { tipo: "alerta", data: "13 Mar 2026 · hoje", titulo: "Alerta: 34 dias sem acesso — risco crítico", descricao: "Aluno não acessa a plataforma há mais de 1 mês. Agente de Cobrança e Pós-venda sem resposta. Score em queda livre.", tags: [{ label: "Risco crítico", color: "red" }, { label: "Sem resposta", color: "red" }] },
    { tipo: "pagamento_atraso", data: "05 Feb 2026", titulo: "Parcela 3/12 venceu sem pagamento", descricao: "Vencimento: R$200,00. Tentativas de cobrança sem sucesso. Acumulando 2 parcelas em atraso.", tags: [{ label: "R$400 total em atraso", color: "red" }, { label: "5 tentativas", color: "purple" }] },
    { tipo: "acesso", data: "07 Fev 2026", titulo: "Último acesso — Módulo 1 (Aula 2/6)", descricao: "Sessão de apenas 12min. Não avançou no conteúdo.", tags: [{ label: "12 min de sessão" }, { label: "Sem progresso" }] },
    { tipo: "matricula", data: "05 Dez 2025", titulo: "Matrícula — Master Cut", descricao: "Fechamento pela Closer Ana Paula. Canal: Google Ads. Pix 12x R$200/mês.", tags: [{ label: "Matrícula", color: "cyan" }, { label: "12x R$200" }, { label: "Origem: Google Ads" }] },
  ],
  4: [
    { tipo: "certificado", data: "18 Nov 2025", titulo: "Certificado emitido — Formação Barber Pro", descricao: "Concluiu 100% do curso em 3 meses e 18 dias. Desempenho excepcional. Certificado digital enviado por email.", tags: [{ label: "Concluído", color: "green" }, { label: "100% do curso", color: "green" }, { label: "3 meses" }] },
    { tipo: "mentoria", data: "10 Nov 2025", titulo: "Mentoria Final — 1h 30min", descricao: "Sessão de encerramento com Seu Elias. Plano de carreira definido. Feedback: 5/5.", tags: [{ label: "Mentoria Final", color: "purple" }, { label: "1h 30min" }, { label: "5/5", color: "green" }] },
    { tipo: "matricula", data: "01 Ago 2025", titulo: "Matrícula — Formação Barber Pro", descricao: "Indicação direta do Seu Elias. Pix 12x R$400/mês.", tags: [{ label: "Matrícula", color: "cyan" }, { label: "12x R$400" }, { label: "Indicação" }] },
  ],
};

const ALUNO_CONTATOS: Record<number, Array<{ data: string; canal: string; agente: string; mensagem: string; statusResp: string }>> = {
  2: [
    { data: "13/03/26", canal: "WhatsApp", agente: "Agente Pós-venda", mensagem: "Oi Marcos, sentimos sua falta! Seu módulo 3 está esperando por você...", statusResp: "Enviada" },
    { data: "08/03/26", canal: "WhatsApp", agente: "Humano", mensagem: "Marcos, preciso de 5min com você sobre sua parcela...", statusResp: "Sem resposta" },
    { data: "05/03/26", canal: "WhatsApp", agente: "Agente Cobrança", mensagem: "Marcos, identificamos sua parcela em aberto...", statusResp: "Não visto" },
    { data: "01/03/26", canal: "WhatsApp", agente: "Agente Cobrança", mensagem: "Oi Marcos, sua parcela vence amanhã...", statusResp: "Visto" },
    { data: "22/02/26", canal: "WhatsApp", agente: "Agente Pós-venda", mensagem: "Marcos! Sua mentoria com o Seu Elias está confirmada para hoje às 14h...", statusResp: "Respondeu" },
    { data: "14/01/26", canal: "WhatsApp", agente: "Agente Boas-vindas", mensagem: "Bem-vindo à Formação Barber Pro! Seu acesso está liberado...", statusResp: "Respondeu" },
    { data: "10/01/26", canal: "WhatsApp", agente: "Agente SDR", mensagem: "Marcos, tudo certo? Vi que você se interessou pela Formação Barber Pro...", statusResp: "Respondeu" },
    { data: "06/01/26", canal: "WhatsApp", agente: "Agente SDR", mensagem: "Oi Marcos! Vi que você clicou no nosso anúncio sobre triplicar sua renda...", statusResp: "Respondeu" },
  ],
  3: [
    { data: "10/03/26", canal: "WhatsApp", agente: "Agente Cobrança", mensagem: "Rafael, suas parcelas estão acumulando. Precisamos conversar...", statusResp: "Sem resposta" },
    { data: "05/03/26", canal: "WhatsApp", agente: "Humano", mensagem: "Rafael, sou o Elias. Quero te ajudar a resolver essa situação...", statusResp: "Sem resposta" },
    { data: "25/02/26", canal: "WhatsApp", agente: "Agente Cobrança", mensagem: "Rafael, sua parcela de fevereiro venceu. Podemos ajudar?", statusResp: "Não visto" },
    { data: "05/02/26", canal: "WhatsApp", agente: "Agente Cobrança", mensagem: "Rafael, identificamos sua parcela em aberto...", statusResp: "Visto" },
  ],
};

const TURMAS = [
  { id: 1, nome: "Turma 47 — Mai/2026", produto: "Formação Barber Pro", inicio: "12/05/2026", fim: "16/05/2026", total: 28, ocupadas: 22, bloqueadas: 2, status: "aberta", local: "São Paulo, SP", horarios: [
    { dia: "Seg", inicio: "08:00", fim: "12:00", tipo: "Teórico" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qui", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Sex", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
  { id: 2, nome: "Turma 48 — Jun/2026", produto: "Formação Barber Pro", inicio: "09/06/2026", fim: "13/06/2026", total: 28, ocupadas: 14, bloqueadas: 0, status: "aberta", local: "São Paulo, SP", horarios: [
    { dia: "Seg", inicio: "08:00", fim: "12:00", tipo: "Teórico" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qui", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Sex", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
  { id: 3, nome: "Turma 49 — Jul/2026", produto: "Formação Barber Pro", inicio: "14/07/2026", fim: "18/07/2026", total: 28, ocupadas: 3, bloqueadas: 0, status: "aberta", local: "São Paulo, SP", horarios: [
    { dia: "Seg", inicio: "08:00", fim: "12:00", tipo: "Teórico" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qui", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Sex", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
  { id: 4, nome: "Turma 50 — Ago/2026", produto: "Master Cut", inicio: "04/08/2026", fim: "06/08/2026", total: 28, ocupadas: 8, bloqueadas: 1, status: "aberta", local: "Rio de Janeiro, RJ", horarios: [
    { dia: "Seg", inicio: "08:00", fim: "18:00", tipo: "Teórico + Prático" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
];

const LISTA_ESPERA = [
  { id: 1, nome: "Ana Lima", tel: "(11) 94444-5555", canal: "Indicação", produto: "Formação Barber Pro", dataEntrada: "20/02/26" },
  { id: 2, nome: "Pedro Freitas", tel: "(11) 95555-6666", canal: "Instagram", produto: "Formação Barber Pro", dataEntrada: "22/02/26" },
  { id: 3, nome: "Julia Mendes", tel: "(21) 96666-7777", canal: "WhatsApp", produto: "Formação Barber Pro", dataEntrada: "01/03/26" },
  { id: 4, nome: "Roberto Barros", tel: "(11) 97777-8888", canal: "Instagram", produto: "Formação Barber Pro", dataEntrada: "04/03/26" },
  { id: 5, nome: "Diego Santos", tel: "(31) 98888-9999", canal: "Indicação", produto: "Formação Barber Pro", dataEntrada: "07/03/26" },
  { id: 6, nome: "Camila Moura", tel: "(11) 91111-3333", canal: "Instagram", produto: "Formação Barber Pro", dataEntrada: "08/03/26" },
  { id: 7, nome: "Lucas Nascimento", tel: "(21) 92222-4444", canal: "WhatsApp", produto: "Formação Barber Pro", dataEntrada: "09/03/26" },
  { id: 8, nome: "Thiago Rocha", tel: "(11) 93333-5555", canal: "Instagram", produto: "Master Cut", dataEntrada: "25/02/26" },
  { id: 9, nome: "Marina Costa", tel: "(21) 94444-6666", canal: "Google Ads", produto: "Master Cut", dataEntrada: "03/03/26" },
  { id: 10, nome: "Bruno Alves", tel: "(31) 95555-7777", canal: "Indicação", produto: "Master Cut", dataEntrada: "10/03/26" },
];

const METAS = { metaReceita: 58000, metaVendas: 120, metaLeads: 300 };

const DAILY = {
  vendasOntem: 7, deltaVendasDia: 2,
  leadsHoje: 34, deltaLeadsMedia: 8,
  cobrancasHoje: 4800, cobrancasQtd: 3,
  inadTotal: 12400, inadDeltaSemana: 800,
  negociacoesAbertas: 18, negociacoesFechHoje: 5,
};

const DRE = {
  receitaBruta: { matriculas: 43200, recuperada: 3800, total: 47000 },
  deducoes: { taxasPix: 423, taxasCartao: 650, total: 1073 },
  receitaLiquida: 45927,
  custosVariaveis: { comissoes: 8640, ia: 673, material: 2100, total: 11413 },
  margemContribuicao: { valor: 34514, pct: 79.9 },
  custosFixos: { folha: 10000, aluguel: 3200, saas: 2400, marketing: 1787, total: 17387 },
  lucroOperacional: { valor: 17127, pct: 39.7 },
  lucroLiquido: { valor: 14307, pct: 33.1 },
};

const CUSTOS_CATEGORIAS = [
  { label: "Comissões", valor: 8640, pctTotal: 29.9, pctReceita: 20.0, cor: "rgba(251,191,36,0.7)" },
  { label: "Folha", valor: 10000, pctTotal: 34.7, pctReceita: 23.1, cor: "rgba(59,130,246,0.7)" },
  { label: "Aluguel", valor: 3200, pctTotal: 11.1, pctReceita: 7.4, cor: "rgba(139,92,246,0.7)" },
  { label: "SaaS", valor: 2400, pctTotal: 8.3, pctReceita: 5.6, cor: "rgba(16,185,129,0.7)" },
  { label: "Marketing", valor: 1787, pctTotal: 6.2, pctReceita: 4.1, cor: "rgba(236,72,153,0.7)" },
  { label: "IA", valor: 673, pctTotal: 2.3, pctReceita: 1.6, cor: "rgba(34,211,238,0.7)" },
  { label: "Material", valor: 2100, pctTotal: 7.3, pctReceita: 4.9, cor: "rgba(148,163,184,0.7)" },
];

const RECEITA_CUSTO_6M = [
  { mes: "Out", receita: 68400, custoVar: 14200, custoFixo: 16800, margem: 54.7 },
  { mes: "Nov", receita: 72100, custoVar: 15100, custoFixo: 16900, margem: 55.6 },
  { mes: "Dez", receita: 81300, custoVar: 16800, custoFixo: 17000, margem: 58.4 },
  { mes: "Jan", receita: 59200, custoVar: 12400, custoFixo: 17100, margem: 50.2 },
  { mes: "Fev", receita: 87600, custoVar: 18200, custoFixo: 17200, margem: 59.5 },
  { mes: "Mar", receita: 43200, custoVar: 11413, custoFixo: 17387, margem: 33.1 },
];

const CASHFLOW_FORECAST = [
  { periodo: "Abril (30d)", saldo: 36800, entradas: [{ l: "Matrículas novas", v: 42000 }, { l: "Parcelas recorrentes", v: 14200 }, { l: "Recuperação", v: 4200 }], saidas: [{ l: "Custos fixos", v: -17400 }, { l: "Custos variáveis", v: -6200 }], status: "healthy" as const },
  { periodo: "Maio (60d)", saldo: 24600, entradas: [{ l: "Matrículas novas", v: 38000 }, { l: "Parcelas recorrentes", v: 12800 }, { l: "Recuperação", v: 3400 }], saidas: [{ l: "Custos fixos", v: -17400 }, { l: "Custos variáveis", v: -12200 }], status: "warning" as const },
  { periodo: "Junho (90d)", saldo: 18400, entradas: [{ l: "Matrículas novas", v: 32000 }, { l: "Parcelas recorrentes", v: 11200 }, { l: "Recuperação", v: 2800 }], saidas: [{ l: "Custos fixos", v: -17400 }, { l: "Custos variáveis", v: -10200 }], status: "caution" as const },
];

const CALENDARIO_PAGAMENTOS = [
  { dia: "13/03", valor: 4800, parcelas: 2, risco: "today" as const },
  { dia: "14/03", valor: 2400, parcelas: 1, risco: "normal" as const },
  { dia: "15/03", valor: 7200, parcelas: 3, risco: "normal" as const },
  { dia: "17/03", valor: 14400, parcelas: 6, risco: "peak" as const },
  { dia: "20/03", valor: 9600, parcelas: 4, risco: "normal" as const },
  { dia: "22/03", valor: 4800, parcelas: 2, risco: "normal" as const },
  { dia: "25/03", valor: 2400, parcelas: 1, risco: "critical" as const },
  { dia: "27/03", valor: 7200, parcelas: 3, risco: "normal" as const },
];

const PRODUTOS_FINANCEIRO = [
  { nome: "Formação Barber Pro", turmas: "T47-T48", tipo: "Presencial", ticket: 4800, alunos: 22, margem: 48.2, cpv: 2486, lucroUnit: 2314 },
  { nome: "Master Cut", turmas: "T50", tipo: "Online", ticket: 2400, alunos: 67, margem: 34.7, cpv: 1566, lucroUnit: 834 },
];

const AGING_INADIMPLENCIA = [
  { faixa: "1-30 dias", valor: 2400, recovery: 82, cor: "rgba(251,191,36,0.7)" },
  { faixa: "31-45 dias", valor: 8000, recovery: 48, cor: "rgba(249,115,22,0.7)" },
  { faixa: "45+ dias", valor: 2000, recovery: 8, cor: "rgba(244,63,94,0.7)" },
];

const INAD_DETALHADA = [
  { nome: "André Souza", dias: 8, valor: 2400, recovery: 82, turma: "Turma 48", tentativas: 1, status: "Negociando" },
  { nome: "Marcos Oliveira", dias: 12, valor: 4800, recovery: 61, turma: "Turma 47", tentativas: 2, status: "Prometeu pagar" },
  { nome: "Rafael Santos", dias: 34, valor: 3200, recovery: 32, turma: "Turma 50", tentativas: 5, status: "Sem resposta" },
  { nome: "Bruno Lima", dias: 45, valor: 2000, recovery: 8, turma: "Turma 47", tentativas: 8, status: "Write-off" },
];

const AIR_MENSAL = [
  { mes: "Out", airTotal: 12000, airSDR: 9800, airAgend: 1800, airEnriq: 400, pctReceita: 41.4, receitaHumana: 17000 },
  { mes: "Nov", airTotal: 14200, airSDR: 11600, airAgend: 2100, airEnriq: 500, pctReceita: 44.8, receitaHumana: 17500 },
  { mes: "Dez", airTotal: 17100, airSDR: 14000, airAgend: 2500, airEnriq: 600, pctReceita: 51.2, receitaHumana: 16300 },
  { mes: "Jan", airTotal: 19400, airSDR: 15800, airAgend: 2900, airEnriq: 700, pctReceita: 53.1, receitaHumana: 17200 },
  { mes: "Fev", airTotal: 23900, airSDR: 19500, airAgend: 3600, airEnriq: 800, pctReceita: 62.6, receitaHumana: 14300 },
  { mes: "Mar", airTotal: 28400, airSDR: 23200, airAgend: 4600, airEnriq: 600, pctReceita: 65.7, receitaHumana: 14800 },
];

const AIRE_TIMELINE = [
  { mes: "Ago/25", receita: 28900, baseline: 26900, aire: 2000, crescMoM: 9.5, label: "Go-live SDR" },
  { mes: "Set/25", receita: 31200, baseline: 27400, aire: 3800, crescMoM: 7.9, label: "Enriquecimento" },
  { mes: "Out/25", receita: 29000, baseline: 27900, aire: 1100, crescMoM: -7.1, label: "Stack completa" },
  { mes: "Nov/25", receita: 38600, baseline: 28400, aire: 10200, crescMoM: 33.1, label: "" },
  { mes: "Dez/25", receita: 33400, baseline: 28900, aire: 4500, crescMoM: -13.5, label: "5 agentes online" },
  { mes: "Jan/26", receita: 41100, baseline: 28900, aire: 12200, crescMoM: 23.1, label: "" },
  { mes: "Fev/26", receita: 38200, baseline: 29400, aire: 8800, crescMoM: -7.1, label: "" },
  { mes: "Mar/26", receita: 43200, baseline: 29100, aire: 14100, crescMoM: 13.1, label: "Hoje" },
];

const ATIVIDADE = [
  { icon: "bot", text: "Agente SDR fechou venda com Thiago Almeida — R$ 2.400", tempo: "3 min" },
  { icon: "dollar", text: "Parcela 4/12 de João Pedro paga via Pix", tempo: "12 min" },
  { icon: "calendar", text: "Turma 48 agendada automaticamente para Ana Costa", tempo: "28 min" },
  { icon: "alert", text: "Lead Marcos Oliveira escalado para vendedor humano", tempo: "45 min" },
  { icon: "bell", text: "Cobrança enviada para Rafael Santos — 5 dias de atraso", tempo: "1h" },
  { icon: "search", text: "Lead enriquecido: Felipe Costa — Score 78, Low Ticket", tempo: "1h20" },
  { icon: "bot", text: "Agente SDR iniciou conversa com 3 novos leads", tempo: "2h" },
  { icon: "check", text: "Camila Rocha fechou venda high ticket — R$ 4.800", tempo: "3h" },
];

/* ═══════════════════════════════════════════
   HELPERS & STYLE
   ═══════════════════════════════════════════ */

const fmt = (n: number) => n.toLocaleString("pt-BR");
const fmtR = (n: number) => `R$ ${fmt(n)}`;


const rndParticles = (count: number, horizontal = false) => (
  <div className={horizontal ? "particles-wrapper-h" : "particles-wrapper"}>
    {Array.from({ length: count }, (_, p) => (
      <div key={p} className="particle" style={{ animationDelay: `${(Math.random() * 3).toFixed(2)}s`, animationDuration: `${(1.4 + Math.random() * 2.8).toFixed(2)}s` }} />
    ))}
  </div>
);

/* Health score calculator */
function healthScore() {
  const receitaAtual = RECEITA_MENSAL[RECEITA_MENSAL.length - 1].realizada;
  const pctMeta = (receitaAtual / METAS.metaReceita) * 100;
  const inadPct = (DAILY.inadTotal / receitaAtual) * 100;
  const agentesOffline = AGENTES.filter(a => a.status === "offline").length;
  const agentesDegradado = AGENTES.filter(a => a.status === "degradado").length;
  const reasons: string[] = [];
  let score = 0; // 0=green, 1=amber, 2=red

  if (pctMeta < 40) { score = 2; reasons.push("Meta abaixo de 40%"); }
  else if (pctMeta < 60) { score = Math.max(score, 1); reasons.push(`Meta em ${pctMeta.toFixed(0)}%`); }
  if (inadPct > 10) { score = 2; reasons.push("Inadimplência acima de 10%"); }
  else if (inadPct > 5) { score = Math.max(score, 1); reasons.push("Inadimplência em atenção"); }
  if (agentesOffline > 0) { score = 2; reasons.push(`${agentesOffline} agente(s) offline`); }
  if (agentesDegradado > 0) { score = Math.max(score, 1); reasons.push(`${agentesDegradado} agente(s) degradado(s)`); }

  const level = (["green", "amber", "red"] as const)[score];

  const labels = { green: "Empresa Saudável", amber: "Atenção Necessária", red: "Ação Necessária" };
  const agentesOnline = AGENTES.filter(a => a.status === "online").length;
  const turmasAbertas = TURMAS.filter(t => t.status === "aberta").length;

  return { level, label: labels[level], reasons, pctMeta, agentesOnline, agentesDegradado, turmasAbertas };
}

/* Dynamic alerts generator */
function generateAlerts() {
  const alerts: { title: string; context: string; severity: "critical" | "warning" | "info"; since: string; tela: string }[] = [];
  const degradados = AGENTES.filter(a => a.status === "degradado");
  const offline = AGENTES.filter(a => a.status === "offline");
  if (offline.length > 0) alerts.push({ title: `Agente ${offline[0].nome} offline`, context: `${12} cobranças não enviadas`, severity: "critical", since: "Há 3 horas", tela: "agentes" });
  if (degradados.length > 0) alerts.push({ title: `Agente ${degradados[0].nome} degradado`, context: `Taxa de sucesso: ${degradados[0].sucesso}%`, severity: "critical", since: "Há 2 horas", tela: "agentes" });
  const turmasUrgentes = TURMAS.filter(t => { const d = Math.ceil((new Date(t.fim.split("/").reverse().join("-")).getTime() - Date.now()) / 86400000); return t.status === "aberta" && d <= 14; });
  turmasUrgentes.forEach(t => { const vagas = t.total - t.ocupadas - t.bloqueadas; if (vagas <= 5) alerts.push({ title: `${t.nome} · ${vagas} vagas restantes`, context: `Fecha em ${Math.ceil((new Date(t.fim.split("/").reverse().join("-")).getTime() - Date.now()) / 86400000)} dias · ${3} leads em negociação`, severity: "warning", since: "", tela: "turmas" }); });
  const inadimplentes = ALUNOS.filter(a => a.status_pag === "atrasada");
  if (inadimplentes.length > 0) alerts.push({ title: `${inadimplentes.length} inadimplentes há +30 dias`, context: `Total R$ ${fmt(DAILY.inadTotal)} · Última tentativa: há 4 dias`, severity: "info", since: "", tela: "financeiro" });
  return alerts.sort((a, b) => { const s = { critical: 0, warning: 1, info: 2 }; return s[a.severity] - s[b.severity]; }).slice(0, 5);
}

const PAGES = [
  { key: "home", label: "Visão Geral" },
  { key: "funil", label: "Funil de Vendas" },
  { key: "financeiro", label: "Financeiro" },

  { key: "agentes", label: "Agentes IA" },
  { key: "alunos", label: "Base de Alunos" },
  { key: "turmas", label: "Turmas" },
];

const cardTooltips: Record<string, string> = {
  "Receita Mensal": "Receita realizada vs projetada nos últimos 6 meses, incluindo valores recuperados pelo agente de cobrança.",
  "Mini Funil": "Resumo visual do funil de vendas do mês atual com taxas de conversão entre etapas.",
  "Funil de Vendas": "Funil completo com todas as etapas de conversão. Clique em uma etapa para ver detalhes.",
  "Evolução do Funil": "Evolução diária de leads captados, qualificados e fechados nos últimos 30 dias.",
  "Ranking de Vendedores": "Performance individual da equipe ordenada por receita gerada no período.",
  "Comparativo IA vs Humanos": "Comparação direta entre agentes IA e vendedores humanos em métricas-chave.",
  "Performance Semanal": "Vendas semanais por membro da equipe ao longo das últimas 6 semanas.",
  "Execuções dos Agentes": "Volume de execuções diárias dos agentes IA separadas por sucesso e erro.",
  "Custo por Agente": "Custo mensal de cada agente IA comparado ao custo de um vendedor humano.",
  "Formas de Pagamento": "Distribuição de vendas por forma de pagamento com taxa de inadimplência.",
  "Inadimplência por Aluno": "Lista de alunos com parcelas em atraso ordenada por valor.",
};

const pagBadgeColor = (s: string) => s === "paga" ? "green" : s === "atrasada" ? "red" : "amber";

/* ═══════════════════════════════════════════
   SVG ICONS (no emoji)
   ═══════════════════════════════════════════ */

function Icon({ name, size = 14, className = "" }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    dollar: <><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 6-6" /></>,
    percent: <><line x1="19" x2="5" y1="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
    alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></>,
    cart: <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    bot: <><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></>,
    calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>,
    graduation: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    funnel: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    handshake: <><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88" /><path d="m10 13-2-2a1 1 0 1 0-3 3l3.88 3.88a3 3 0 0 0 4.24 0" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></>,
    lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    chair: <><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" /><path d="M3 16h18" /><path d="M5 16v5" /><path d="M19 16v5" /><rect width="20" height="4" x="2" y="12" rx="1" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || icons.info}
    </svg>
  );
}

/* ═══════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */

function InfoTip({ title }: { title: string }) {
  const tip = cardTooltips[title];
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setPortalRoot(document.body); }, []);
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
    <div ref={iconRef} className="cursor-help inline-flex ml-2 align-middle" onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      <Icon name="info" size={13} className={`transition-colors ${show ? "text-slate-300" : "text-slate-500/40"}`} />
      {show && portalRoot && createPortal(
        <div className="fixed w-72 p-3 rounded-lg border border-white/10 text-left" style={{ top: pos.top, left: pos.left, transform: "translateY(-100%)", background: "rgba(8,10,18,0.97)", backdropFilter: "blur(16px)", boxShadow: "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)", zIndex: 99999, pointerEvents: "none" }}>
          <p className="text-[11px] text-slate-300/90 leading-[1.6] font-normal normal-case tracking-normal">{tip}</p>
          <div className="absolute -bottom-[5px] left-3 w-2.5 h-2.5 rotate-45 border-r border-b border-white/10" style={{ background: "rgba(8,10,18,0.97)" }} />
        </div>,
        portalRoot
      )}
    </div>
  );
}

function SectionHeader({ icon, title, sub, children }: { icon: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6 relative z-10">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={16} className="text-amber-400/60" />
        <h3 className="font-bold text-sm text-slate-300">{title}<InfoTip title={title} /></h3>
        {sub && <span className="text-xs text-neutral-500 ml-1">{sub}</span>}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, delta, deltaUp, icon, idx = 0 }: {
  label: string; value: string | number; sub?: string; delta?: string; deltaUp?: boolean; icon: string; idx?: number;
}) {
  return (
    <div className="rounded-2xl p-5 cursor-default border border-white/[0.06] bg-white/[0.02]" style={{ animation: `animationIn 0.8s ease-out ${0.15 + idx * 0.04}s both` }}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">{label}</p>
        <Icon name={icon} size={14} className="text-amber-400/60" />
      </div>
      <p className="text-xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
      {delta && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${deltaUp ? "text-emerald-400" : "text-rose-400"}`}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {deltaUp ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
          </svg>
          {delta} vs mês ant.
        </div>
      )}
    </div>
  );
}

function Badge({ children, color = "amber" }: { children: React.ReactNode; color?: string }) {
  const styles: Record<string, string> = {
    amber: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    green: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    red: "bg-rose-400/10 text-rose-400 border-rose-400/20",
    blue: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    purple: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    slate: "bg-slate-400/10 text-slate-400 border-slate-400/20",
    cyan: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${styles[color] || styles.amber}`}>{children}</span>;
}

function OccBar({ total, ocupadas, bloqueadas }: { total: number; ocupadas: number; bloqueadas: number }) {
  const conf = ocupadas - bloqueadas;
  const free = total - ocupadas;
  return (
    <div>
      <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04] ring-1 ring-white/5">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 relative overflow-hidden animate-bar-enter" style={{ width: `${(conf / total) * 100}%` }}>{rndParticles(2, true)}</div>
        {bloqueadas > 0 && <div style={{ width: `${(bloqueadas / total) * 100}%`, background: "repeating-linear-gradient(45deg,#FBBF24,#FBBF24 2px,#F59E0B 2px,#F59E0B 4px)" }} />}
      </div>
      <div className="flex gap-3 mt-1.5 text-[10px] text-slate-500">
        <span><b className="text-emerald-400">{conf}</b> conf.</span>
        {bloqueadas > 0 && <span><b className="text-amber-400">{bloqueadas}</b> bloq.</span>}
        <span><b className="text-slate-400">{free}</b> livres</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SCREENS
   ═══════════════════════════════════════════ */

function HomeScreen({ setPage }: { setPage: (p: string) => void }) {
  const health = healthScore();
  const alerts = generateAlerts();
  const receitaAtual = RECEITA_MENSAL[RECEITA_MENSAL.length - 1].realizada;
  const diaAtual = new Date().getDate();
  const diasNoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const paceDaily = receitaAtual / diaAtual;
  const projecao = Math.round(paceDaily * diasNoMes);
  const pctMeta = (receitaAtual / METAS.metaReceita) * 100;
  const pctProjecao = (projecao / METAS.metaReceita) * 100;
  const metaColor = pctMeta >= 60 ? "bg-emerald-500" : pctMeta >= 40 ? "bg-amber-500" : "bg-rose-500";
  const metaTextColor = pctMeta >= 60 ? "text-emerald-400" : pctMeta >= 40 ? "text-amber-400" : "text-rose-400";
  const healthDot = { green: "bg-emerald-500", amber: "bg-amber-500", red: "bg-rose-500" };
  const healthText = { green: "text-emerald-400", amber: "text-amber-400", red: "text-rose-400" };

  return (
    <div className="space-y-5">

      {/* ① STATUS — uma linha com alertas */}
      <div className="flex items-center gap-3 flex-wrap" style={{ animation: "animationIn 0.8s ease-out 0.1s both" }}>
        <div className={`size-2 rounded-full shrink-0 ${healthDot[health.level]}`} />
        <span className={`text-sm font-semibold ${healthText[health.level]}`}>{health.label}</span>
        <span className="text-xs text-slate-500">{health.reasons.length > 0 ? health.reasons.join(" · ") : "Tudo normal"}</span>
        <div className="flex-1" />
        {alerts.filter(a => a.severity === "critical" || a.severity === "warning").map((a, i) => {
          const dotColor = { critical: "#fb7185", warning: "#fbbf24", info: "#94a3b8" }[a.severity];
          return (
            <button key={i} onClick={() => setPage(a.tela)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
              <span className="size-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
              {a.title}
            </button>
          );
        })}
      </div>

      {/* ② KPIs PRINCIPAIS — 4 cards grandes e legíveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ animation: "animationIn 0.8s ease-out 0.15s both" }}>
        {[
          { label: "Receita", value: fmtR(receitaAtual), sub: `${pctMeta.toFixed(0)}% da meta de ${fmtR(METAS.metaReceita)}`, delta: "12%", up: true, page: "financeiro" },
          { label: "Vendas", value: "89", sub: `Ticket médio R$ 2.580`, delta: "8%", up: true, page: "funil" },
          { label: "Conversão", value: "36%", sub: "89 de 247 leads", delta: "3pp", up: true, page: "funil" },
          { label: "Inadimplência", value: fmtR(12400), sub: "8 alunos · 4.2% da carteira", delta: "1.1%", up: false, page: "financeiro" },
        ].map((d, i) => (
          <div key={i} onClick={() => setPage(d.page)} className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-white/[0.12] transition-colors">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">{d.label}</p>
            <p className="text-2xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{d.value}</p>
            <p className="text-xs text-slate-500 mt-1">{d.sub}</p>
            <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${d.up ? "text-emerald-400" : "text-rose-400"}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {d.up ? <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></> : <><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></>}
              </svg>
              {d.delta} vs mês ant.
            </div>
          </div>
        ))}
      </div>

      {/* ③ META PROGRESS — barra simples */}
      <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.2s both" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Meta {new Date().toLocaleDateString("pt-BR", { month: "long" })}</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-base font-bold ${metaTextColor}`}>{fmtR(receitaAtual)}</span>
            <span className="text-xs text-slate-500">/ {fmtR(METAS.metaReceita)}</span>
          </div>
        </div>
        <div className="relative h-3 bg-white/[0.04] rounded-full overflow-visible ring-1 ring-white/5">
          <div className={`h-full ${metaColor} rounded-full transition-all duration-1000 relative overflow-hidden`} style={{ width: `${Math.min(pctMeta, 100)}%` }}>
            {rndParticles(3, true)}
          </div>
          <div className="absolute top-[-2px] w-0.5 h-[18px] rounded-full bg-amber-400/70" style={{ left: `${Math.min(pctProjecao, 100)}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] text-slate-500">Projeção: {fmtR(projecao)}</span>
          <span className={`text-[11px] font-semibold ${pctProjecao >= 100 ? "text-emerald-400" : "text-amber-400"}`}>
            {pctProjecao >= 100 ? "No caminho" : "Ritmo insuficiente"} ({pctProjecao.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* ④ HOJE + AGENTES — lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ animation: "animationIn 0.8s ease-out 0.25s both" }}>
        {/* Snapshot do dia */}
        <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Hoje</p>
          <div className="space-y-4">
            {[
              { label: "Vendas ontem", value: String(DAILY.vendasOntem), num: DAILY.vendasOntem, max: 15, extra: `+${DAILY.deltaVendasDia} vs dia ant.`, up: true, page: "funil" },
              { label: "Leads captados", value: String(DAILY.leadsHoje), num: DAILY.leadsHoje, max: 60, extra: `+${DAILY.deltaLeadsMedia} vs média`, up: true, page: "funil" },
              { label: "Cobranças", value: fmtR(DAILY.cobrancasHoje), num: DAILY.cobrancasHoje, max: 10000, extra: `${DAILY.cobrancasQtd} parcelas vencendo`, up: false, page: "financeiro" },
              { label: "Negociações abertas", value: String(DAILY.negociacoesAbertas), num: DAILY.negociacoesAbertas, max: 30, extra: `${DAILY.negociacoesFechHoje} para fechar hoje`, up: true, page: "funil" },
            ].map((d, i) => {
              const pct = Math.min((d.num / d.max) * 100, 100);
              return (
              <button key={i} onClick={() => setPage(d.page)} className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{d.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{d.value}</span>
                    <span className={`text-xs font-semibold ${d.up ? "text-emerald-400" : "text-rose-400"}`}>{d.extra}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full relative overflow-hidden animate-bar-enter" style={{ width: `${pct}%`, background: "linear-gradient(90deg, rgb(217,119,6), rgb(251,191,36))", boxShadow: "0 0 12px rgba(251,191,36,0.4), 0 0 4px rgba(251,191,36,0.2)", animationDelay: `${i * 0.08}s` }}>
                    {rndParticles(2, true)}
                  </div>
                </div>
              </button>
              );
            })}
          </div>
        </div>
        {/* Agentes */}
        <div className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">Agentes</p>
          <div className="space-y-2">
            {AGENTES.map((a, i) => {
              const dotColor = { online: "#10b981", degradado: "#fbbf24", offline: "#ef4444" }[a.status];
              const textColor = { online: "text-emerald-400", degradado: "text-amber-400", offline: "text-rose-400" }[a.status];
              return (
                <button key={i} onClick={() => setPage("agentes")}
                  className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <span className="size-2 rounded-full" style={{ background: dotColor }} />
                  <span className="text-sm text-slate-300 font-medium">{a.nome}</span>
                  <span className={`text-xs font-semibold capitalize ${textColor}`}>{a.status}</span>
                  <span className="text-xs text-slate-600 ml-auto">{a.exec24h} exec</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⑤ Receita (chart) + Mini Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.4s both" }}>
          <SectionHeader icon="chart" title="Receita Mensal" sub="Últimos 6 meses" />
          <div className="relative z-10">
            {(() => {
              const maxV = Math.max(...RECEITA_MENSAL.map(r => r.realizada + r.projetada), METAS.metaReceita);
              const metaY = (1 - METAS.metaReceita / maxV) * 100;
              return (
                <div className="relative">
                  {/* Meta line */}
                  <div className="absolute left-0 right-0 border-t border-dashed border-amber-500/40 pointer-events-none z-20 flex justify-end" style={{ top: `${metaY}%` }}>
                    <span className="text-[8px] font-bold text-amber-400/80 -mt-3 mr-1">Meta</span>
                  </div>
                  <div className="flex gap-3 min-h-[200px]">
                    {RECEITA_MENSAL.map((r, i) => {
                      const isCurrentMonth = i === RECEITA_MENSAL.length - 1;
                      const hReal = (r.realizada / maxV) * 100;
                      const hProj = isCurrentMonth ? ((projecao - r.realizada) / maxV) * 100 : (r.projetada / maxV) * 100;
                      const hRec = (r.recuperada / maxV) * 100;
                      return (
                        <div key={r.mes} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                          {isCurrentMonth && <span className={`text-[8px] font-bold mb-1 ${pctProjecao >= 100 ? "text-emerald-400" : "text-amber-400"}`}>Proj. {(projecao / 1000).toFixed(0)}k</span>}
                          <div className="flex-1 relative w-full flex flex-col justify-end gap-px">
                            {isCurrentMonth && hProj > 0 && (
                              <div className="w-full rounded-t-md overflow-hidden relative" style={{ height: `${Math.max(hProj, 0)}%`, minHeight: 2, background: "rgba(16,185,129,0.15)", borderTop: "1px dashed rgba(16,185,129,0.3)" }} />
                            )}
                            {!isCurrentMonth && (
                              <div className="w-full rounded-t-md overflow-hidden relative animate-bar-enter" style={{ height: `${hProj}%`, minHeight: 2, background: "rgba(16,185,129,0.25)", animationDelay: `${i * 0.06}s` }} />
                            )}
                            <div className="w-full rounded-t-md overflow-hidden relative animate-bar-enter" style={{ height: `${hReal}%`, minHeight: 2, background: "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))", boxShadow: "0 0 12px rgba(16,185,129,0.2)", animationDelay: `${i * 0.06}s` }}>
                              {rndParticles(3)}
                            </div>
                            <div className="w-full rounded-sm overflow-hidden relative animate-bar-enter" style={{ height: `${hRec}%`, minHeight: 2, background: "linear-gradient(to top, rgb(180,120,0), rgb(251,191,36))", boxShadow: "0 0 8px rgba(251,191,36,0.15)", animationDelay: `${i * 0.06}s` }} />
                          </div>
                          <span className={`text-[10px] font-bold mt-2 ${isCurrentMonth ? "text-white" : "text-neutral-500"}`}>{r.mes}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            <div className="flex gap-4 mt-4 justify-center">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgb(52,211,153)" }} />Realizada</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(16,185,129,0.15)", borderTop: "1px dashed rgba(16,185,129,0.3)" }} />Projeção</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgb(251,191,36)" }} />Recuperada</span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><span className="w-2.5 h-0 border-t border-dashed border-amber-500/60" style={{ width: 10 }} />Meta</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.45s both" }}>
          <SectionHeader icon="funnel" title="Mini Funil" sub="Março 2026" />
          <div className="flex flex-col gap-3 relative z-10">
            {FUNIL_DATA.slice(0, 5).map((f, i) => {
              const barGradients = [
                "linear-gradient(90deg, rgb(34,211,238), rgb(6,182,212))",
                "linear-gradient(90deg, rgb(96,165,250), rgb(37,99,235))",
                "linear-gradient(90deg, rgb(192,132,252), rgb(147,51,234))",
                "linear-gradient(90deg, rgb(251,191,36), rgb(217,119,6))",
                "linear-gradient(90deg, rgb(52,211,153), rgb(5,150,105))",
              ];
              const barGlows = [
                "0 0 12px rgba(34,211,238,0.3)",
                "0 0 12px rgba(96,165,250,0.3)",
                "0 0 12px rgba(192,132,252,0.3)",
                "0 0 12px rgba(251,191,36,0.3)",
                "0 0 12px rgba(52,211,153,0.3)",
              ];
              return (
                <div key={i}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400 font-medium">{f.etapa}</span>
                    <span className="font-bold text-white">{f.valor}</span>
                  </div>
                  <div className="h-3.5 bg-white/[0.04] rounded-full overflow-hidden relative ring-1 ring-white/5">
                    <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden animate-bar-enter" style={{ width: `${f.pct}%`, background: barGradients[i], boxShadow: barGlows[i], animationDelay: `${i * 0.08}s` }}>
                      {rndParticles(2, true)}
                    </div>
                    {i < 4 && (
                      <span className="absolute right-2 top-0.5 text-[8px] text-slate-500 font-bold">
                        {Math.round(FUNIL_DATA[i + 1].valor / f.valor * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="text-center mt-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <span className="text-[10px] font-bold text-rose-400">{FUNIL_DATA[5].valor} leads perdidos ({FUNIL_DATA[5].pct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Turmas (A6 — com urgência) + Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.5s both" }}>
          <SectionHeader icon="calendar" title="Próximas Turmas" />
          <div className="space-y-4">
            {TURMAS.filter(t => t.status === "aberta").slice(0, 3).map(t => {
              const diasRestantes = Math.ceil((new Date(t.fim.split("/").reverse().join("-")).getTime() - Date.now()) / 86400000);
              const vagasLivres = t.total - t.ocupadas - t.bloqueadas;
              return (
                <div key={t.id} className="pb-4 border-b border-white/[0.06] last:border-0 last:pb-0">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{t.nome}</span>
                      <span className="text-[10px] text-slate-600">{t.local}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/[0.06] ${diasRestantes <= 7 ? "text-rose-400" : diasRestantes <= 14 ? "text-amber-400" : "text-slate-500"}`}>
                        Fecha em {diasRestantes}d
                      </span>
                    </div>
                    <span className={`text-lg font-bold ${vagasLivres > 5 ? "text-emerald-400" : vagasLivres > 0 ? "text-amber-400" : "text-rose-400"}`}>
                      {vagasLivres}
                    </span>
                  </div>
                  <OccBar total={t.total} ocupadas={t.ocupadas} bloqueadas={t.bloqueadas} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.55s both" }}>
          <SectionHeader icon="clock" title="Atividade Recente" />
          <div className="flex flex-col gap-0.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar relative z-10">
            {ATIVIDADE.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors rounded-lg px-2">
                <div className="size-6 rounded flex items-center justify-center shrink-0 bg-white/[0.04]">
                  <Icon name={a.icon} size={12} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-300 leading-relaxed">{a.text}</div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 whitespace-nowrap">há {a.tempo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FunilScreen() {
  const [etapaSel, setEtapaSel] = useState<string | null>(null);
  const funnelColors = ["rgba(148,163,184,0.7)", "rgba(59,130,246,0.7)", "rgba(139,92,246,0.7)", "rgba(217,119,6,0.8)", "rgba(16,185,129,0.7)"];
  const funnelGlows = ["rgba(148,163,184,0.15)", "rgba(59,130,246,0.2)", "rgba(139,92,246,0.2)", "rgba(251,191,36,0.25)", "rgba(16,185,129,0.2)"];

  const TICKET_MEDIO = 2580;
  const sdrStages = FUNIL_DATA.slice(0, 3);
  const closerStages = FUNIL_DATA.slice(3, 5);
  const perdidos = FUNIL_DATA[5];

  const stageTimes: Record<string, string> = { Captados: "0.3d", Enriquecidos: "0.8d", Qualificados: "1.2d", "Negociação": "1.8d", Fechados: "2.1d" };
  const stageDeltas: Record<string, { val: string; up: boolean }> = {
    Captados: { val: "+12%", up: true }, Enriquecidos: { val: "+5%", up: true },
    Qualificados: { val: "-8%", up: false }, "Negociação": { val: "+3%", up: true },
    Fechados: { val: "+18%", up: true },
  };
  const stageSla: Record<string, string> = { "Negociação": "14 leads há +7d" };

  const pipelineKpis = [
    { label: "Leads no funil", value: "247", sub: "Total ativo", delta: "+12%", up: true },
    { label: "Pipeline Negociação", value: fmtR(112 * TICKET_MEDIO), sub: "112 leads", delta: "+3%", up: true },
    { label: "Receita fechada", value: fmtR(89 * TICKET_MEDIO), sub: "89 contratos", delta: "+18%", up: true },
    { label: "Projeção pipeline→close", value: fmtR(Math.round(112 * 0.79 * TICKET_MEDIO)), sub: "79% conv. esperada", delta: "+8%", up: true },
    { label: "Tempo ciclo completo", value: "4.2d", sub: "Captado → Fechado", delta: "-0.8d", up: true },
  ];

  const detailData: Record<string, { kpis: { label: string; value: string }[]; reasons: { label: string; pct: number }[]; leads: { nome: string; dias: number; acao: string }[] }> = {
    Captados: {
      kpis: [{ label: "Tempo médio", value: "0.3d" }, { label: "Alertas SLA", value: "0" }, { label: "Pipeline", value: fmtR(247 * TICKET_MEDIO) }, { label: "Projeção", value: fmtR(Math.round(247 * 0.36 * TICKET_MEDIO)) }],
      reasons: [{ label: "Sem resposta", pct: 42 }, { label: "Sem perfil", pct: 31 }, { label: "Duplicado", pct: 27 }],
      leads: [{ nome: "Lucas Mendes", dias: 1, acao: "Ligar" }, { nome: "Ana Costa", dias: 0, acao: "Enriquecer" }],
    },
    Enriquecidos: {
      kpis: [{ label: "Tempo médio", value: "0.8d" }, { label: "Alertas SLA", value: "3" }, { label: "Pipeline", value: fmtR(231 * TICKET_MEDIO) }, { label: "Projeção", value: fmtR(Math.round(231 * 0.39 * TICKET_MEDIO)) }],
      reasons: [{ label: "Dados inválidos", pct: 38 }, { label: "Sem interesse", pct: 35 }, { label: "Concorrência", pct: 27 }],
      leads: [{ nome: "Pedro Silva", dias: 2, acao: "Validar" }, { nome: "Maria Souza", dias: 1, acao: "Qualificar" }],
    },
    Qualificados: {
      kpis: [{ label: "Tempo médio", value: "1.2d" }, { label: "Alertas SLA", value: "5" }, { label: "Pipeline", value: fmtR(178 * TICKET_MEDIO) }, { label: "Projeção", value: fmtR(Math.round(178 * 0.50 * TICKET_MEDIO)) }],
      reasons: [{ label: "Preço alto", pct: 44 }, { label: "Sem urgência", pct: 33 }, { label: "Decisor ausente", pct: 23 }],
      leads: [{ nome: "Carlos Ramos", dias: 3, acao: "Agendar demo" }, { nome: "Julia Ferreira", dias: 2, acao: "Enviar proposta" }, { nome: "Roberto Alves", dias: 1, acao: "Follow-up" }],
    },
    "Negociação": {
      kpis: [{ label: "Tempo médio", value: "1.8d" }, { label: "Alertas SLA", value: "14" }, { label: "Pipeline", value: fmtR(112 * TICKET_MEDIO) }, { label: "Projeção", value: fmtR(Math.round(112 * 0.79 * TICKET_MEDIO)) }],
      reasons: [{ label: "Preço", pct: 48 }, { label: "Concorrência", pct: 28 }, { label: "Timing", pct: 24 }],
      leads: [{ nome: "Fernanda Lima", dias: 8, acao: "Desconto" }, { nome: "Gustavo Reis", dias: 5, acao: "Reunião final" }, { nome: "Tatiane Melo", dias: 3, acao: "Contrato" }],
    },
    Fechados: {
      kpis: [{ label: "Tempo médio", value: "2.1d" }, { label: "Alertas SLA", value: "0" }, { label: "Receita", value: fmtR(89 * TICKET_MEDIO) }, { label: "Ticket médio", value: fmtR(TICKET_MEDIO) }],
      reasons: [{ label: "Indicação", pct: 52 }, { label: "Inbound", pct: 30 }, { label: "Outbound", pct: 18 }],
      leads: [{ nome: "Ricardo Nunes", dias: 0, acao: "Onboarding" }, { nome: "Patrícia Dias", dias: 0, acao: "Onboarding" }],
    },
  };

  const renderBar = (f: typeof FUNIL_DATA[0], i: number, colorIdx: number) => {
    const isSelected = etapaSel === f.etapa;
    const delta = stageDeltas[f.etapa];
    const sla = stageSla[f.etapa];
    const prevVal = colorIdx > 0 ? FUNIL_DATA[colorIdx - 1].valor : null;
    const convPct = prevVal ? Math.round((f.valor / prevVal) * 100) : null;
    return (
      <div key={i} onClick={() => setEtapaSel(isSelected ? null : f.etapa)}
        className={`cursor-pointer p-3 rounded-xl transition-all duration-200 ${isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}>
        {/* Header: name + meta info */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-bold text-white">{f.etapa}</span>
          <span className="text-sm font-extrabold text-amber-400">{f.valor}</span>
          {convPct && <span className={`text-xs font-medium ${convPct < 70 ? "text-rose-400" : "text-slate-500"}`}>{convPct}% conv.</span>}
          <span className="text-xs text-slate-500">{stageTimes[f.etapa]}</span>
          {delta && (
            <span className={`text-xs font-semibold ${delta.up ? "text-emerald-400" : "text-rose-400"}`}>
              {delta.up ? "▲" : "▼"} {delta.val}
            </span>
          )}
          {sla && (
            <span className="text-xs font-semibold text-rose-400">· {sla}</span>
          )}
        </div>
        {/* Bar */}
        <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
          <div className="h-full rounded-full relative overflow-hidden animate-bar-enter"
            style={{ width: `${f.pct}%`, minWidth: 4, background: `linear-gradient(90deg, ${funnelColors[colorIdx]}, ${funnelColors[colorIdx].replace(/0\.\d+\)/, "0.35)")})`, boxShadow: `0 0 12px ${funnelGlows[colorIdx]}`, animationDelay: `${i * 0.06}s` }}>
            {rndParticles(2, true)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* F4: Pipeline financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" style={{ animation: "animationIn 0.8s ease-out 0.1s both" }}>
        {pipelineKpis.map((k, i) => (
          <div key={i} className="rounded-2xl p-5 border border-white/[0.06] bg-white/[0.02]">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">{k.label}</p>
            <p className="text-xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{k.value}</p>
            <p className="text-xs text-slate-500 mt-1">{k.sub}</p>
            <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${k.up ? "text-emerald-400" : "text-rose-400"}`}>
              {k.up ? "▲" : "▼"} {k.delta} vs mês ant.
            </div>
          </div>
        ))}
      </div>

      {/* F1: Dual Funnel */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.2s both" }}>
        <SectionHeader icon="funnel" title="Funil de Vendas" sub="Março 2026">
          <span className="text-xs text-slate-500">Clique em uma etapa para detalhes</span>
        </SectionHeader>
        <div className="flex flex-col gap-1 relative z-10">
          {/* SDR Lane */}
          <div className="rounded-xl p-3 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-[5px] h-[5px] rounded-full bg-cyan-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lane SDR — Captação & Qualificação</span>
            </div>
            {sdrStages.map((f, i) => renderBar(f, i, i))}
          </div>

          {/* Handoff divider */}
          <div className="flex items-center gap-3 py-2 px-4">
            <div className="flex-1 border-t border-dashed border-white/[0.06]" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Handoff SDR → Closer</span>
            <div className="flex-1 border-t border-dashed border-white/[0.06]" />
          </div>

          {/* Closer Lane */}
          <div className="rounded-xl p-3 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-[5px] h-[5px] rounded-full bg-amber-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lane Closer — Negociação & Fechamento</span>
            </div>
            {closerStages.map((f, i) => renderBar(f, i, i + 3))}
          </div>

          {/* Perdidos */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] mt-1">
            <span className="text-xs font-bold text-rose-400">{perdidos.valor} Perdidos</span>
            <span className="text-xs text-rose-400/70 ml-2">Maior gargalo: Qualificado → Negociação (perda de 37%)</span>
          </div>
        </div>
      </div>

      {/* F5: Detail panel */}
      {etapaSel && detailData[etapaSel] && (
        <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.4s ease-out both" }}>
          <SectionHeader icon="chart" title={`Detalhe: ${etapaSel}`} sub="Análise da etapa selecionada" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {detailData[etapaSel].kpis.map((k, i) => (
              <div key={i} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{k.label}</p>
                <p className="text-lg font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] mt-1">{k.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Reason breakdown */}
            <div>
              <p className="text-xs font-bold text-white mb-3">Motivos de perda / origem</p>
              <div className="space-y-2">
                {detailData[etapaSel].reasons.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs text-slate-400">{r.label}</span>
                      <span className="text-xs font-bold text-white">{r.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-amber-400/60" style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Mini lead list */}
            <div>
              <p className="text-xs font-bold text-white mb-3">Leads nesta etapa</p>
              <div className="space-y-2">
                {detailData[etapaSel].leads.map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <span className="text-xs font-bold text-white">{l.nome}</span>
                      <span className="text-xs text-slate-500 ml-2">{l.dias}d na etapa</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">{l.acao}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* F6: Evolution chart with 5 series */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.4s both" }}>
        <SectionHeader icon="chart" title="Evolução do Funil" sub="Leads por dia nos últimos 30 dias" />
        <div className="relative z-10">
          {(() => {
            const evoData = FUNIL_EVOLUCAO.map(f => ({
              ...f,
              enriquecidos: Math.round(f.captados * 0.93),
              negociacao: Math.round(f.qualificados * 0.63),
            }));
            type EvoKey = "captados" | "enriquecidos" | "qualificados" | "negociacao" | "fechados";
            const allKeys: EvoKey[] = ["captados", "enriquecidos", "qualificados", "negociacao", "fechados"];
            const maxVal = Math.max(...evoData.flatMap(f => allKeys.map(k => f[k])));
            const w = 800; const h = 180; const pad = 30;
            const makePath = (key: EvoKey) =>
              evoData.map((f, i) => {
                const x = pad + (i / (evoData.length - 1)) * (w - pad * 2);
                const y = h - pad - (f[key] / maxVal) * (h - pad * 2);
                return `${i === 0 ? "M" : "L"}${x},${y}`;
              }).join(" ");
            const makeArea = (key: EvoKey) => {
              const pts = evoData.map((f, i) => {
                const x = pad + (i / (evoData.length - 1)) * (w - pad * 2);
                const y = h - pad - (f[key] / maxVal) * (h - pad * 2);
                return `${x},${y}`;
              });
              return `${pad},${h - pad} ${pts.join(" ")} ${w - pad},${h - pad}`;
            };
            const colors: Record<EvoKey, string> = {
              captados: "#94a3b8", enriquecidos: "#22d3ee", qualificados: "#a855f7",
              negociacao: "#fbbf24", fechados: "#10b981",
            };
            return (
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }} preserveAspectRatio="none">
                {[0, 0.25, 0.5, 0.75, 1].map(f => (
                  <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="rgba(255,255,255,0.04)" />
                ))}
                {allKeys.map(key => (
                  <g key={key}>
                    <polygon points={makeArea(key)} fill={colors[key]} opacity="0.06" />
                    <path d={makePath(key)} fill="none" stroke={colors[key]} strokeWidth="2" strokeLinejoin="round" />
                  </g>
                ))}
                {evoData.map((f, i) => (
                  <text key={i} x={pad + (i / (evoData.length - 1)) * (w - pad * 2)} y={h - 5} textAnchor="middle" fill="#64748b" fontSize="10">D{f.dia}</text>
                ))}
              </svg>
            );
          })()}
          <div className="flex gap-5 mt-4 justify-center flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />Captados</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />Enriquecidos</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />Qualificados</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Negociação</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Fechados</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceiroScreen() {
  const [hoveredPag, setHoveredPag] = useState<string | null>(null);
  const [dreDetail, setDreDetail] = useState<string | null>(null);
  const [hoveredAire, setHoveredAire] = useState<number | null>(null);
  const formaPag = [
    { forma: "Cartão de crédito", vendas: 31, total: 79980, inadimplencia: "2.1%", delta: "-0.3%" },
    { forma: "Pix à vista", vendas: 12, total: 30960, inadimplencia: "0%", delta: "—" },
    { forma: "Pix 6x", vendas: 24, total: 57600, inadimplencia: "8.3%", delta: "+1.2%" },
    { forma: "Pix 12x", vendas: 22, total: 52800, inadimplencia: "18.2%", delta: "+2.4%" },
  ];
  const pieColors = ["rgba(59,130,246,0.7)", "rgba(16,185,129,0.7)", "rgba(251,191,36,0.7)", "rgba(239,68,68,0.7)"];
  const cashStatusColor = { healthy: "text-emerald-400", warning: "text-amber-400", caution: "text-rose-400" };
  const cashDot = { healthy: "#10b981", warning: "#fbbf24", caution: "#f43f5e" };
  const riscoColor = { today: "text-cyan-400", normal: "text-slate-400", peak: "text-amber-400", critical: "text-rose-400" };
  const riscoDot = { today: "#22d3ee", normal: "#64748b", peak: "#fbbf24", critical: "#f43f5e" };
  const recoveryColor = (r: number) => r >= 70 ? "text-emerald-400" : r >= 40 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="space-y-6">
      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Receita Bruta" value={fmtR(DRE.receitaBruta.total)} sub="Matrículas + Recuperada" delta="12%" deltaUp icon="dollar" idx={0} />
        <KpiCard label="Receita Líquida" value={fmtR(DRE.receitaLiquida)} sub={`Após deduções: ${fmtR(DRE.deducoes.total)}`} icon="dollar" idx={1} />
        <KpiCard label="Margem Contribuição" value={`${DRE.margemContribuicao.pct}%`} sub={fmtR(DRE.margemContribuicao.valor)} delta="+2.1pp" deltaUp icon="percent" idx={2} />
        <KpiCard label="Lucro Operacional" value={fmtR(DRE.lucroOperacional.valor)} sub={`${DRE.lucroOperacional.pct}% margem`} delta="+4.2%" deltaUp icon="chart" idx={3} />
        <KpiCard label="Lucro Líquido" value={fmtR(DRE.lucroLiquido.valor)} sub={`${DRE.lucroLiquido.pct}% margem`} delta="+3.8%" deltaUp icon="target" idx={4} />
        <KpiCard label="Inadimplência" value={fmtR(12400)} sub="4.2% da carteira" delta="1.1%" deltaUp={false} icon="alert" idx={5} />
      </div>

      {/* DRE */}
      {(() => {
        const dreRows: { key: string; label: string; pct: string; valor: number; negative?: boolean; subtotal?: boolean; final?: boolean; subs?: { label: string; valor: number }[] }[] = [
          { key: "receita", label: "Receita Bruta", pct: "100%", valor: DRE.receitaBruta.total, subs: [{ label: "Matrículas", valor: DRE.receitaBruta.matriculas }, { label: "Recuperada (cobrança)", valor: DRE.receitaBruta.recuperada }] },
          { key: "deducoes", label: "Deduções (taxas)", pct: "2.3%", valor: DRE.deducoes.total, negative: true, subs: [{ label: "Taxas Pix", valor: DRE.deducoes.taxasPix }, { label: "Taxas Cartão", valor: DRE.deducoes.taxasCartao }] },
          { key: "liquida", label: "Receita Líquida", pct: "97.7%", valor: DRE.receitaLiquida, subtotal: true },
          { key: "custovar", label: "Custos Variáveis", pct: "24.3%", valor: DRE.custosVariaveis.total, negative: true, subs: [{ label: "Comissões equipe", valor: DRE.custosVariaveis.comissoes }, { label: "IA / Agentes", valor: DRE.custosVariaveis.ia }, { label: "Material didático", valor: DRE.custosVariaveis.material }] },
          { key: "margem", label: "Margem de Contribuição", pct: `${DRE.margemContribuicao.pct}%`, valor: DRE.margemContribuicao.valor, subtotal: true },
          { key: "custofix", label: "Custos Fixos", pct: "37.0%", valor: DRE.custosFixos.total, negative: true, subs: [{ label: "Folha de pagamento", valor: DRE.custosFixos.folha }, { label: "Aluguel", valor: DRE.custosFixos.aluguel }, { label: "SaaS / Ferramentas", valor: DRE.custosFixos.saas }, { label: "Marketing", valor: DRE.custosFixos.marketing }] },
          { key: "opex", label: "Lucro Operacional", pct: `${DRE.lucroOperacional.pct}%`, valor: DRE.lucroOperacional.valor, subtotal: true },
          { key: "lucro", label: "Lucro Líquido", pct: `${DRE.lucroLiquido.pct}%`, valor: DRE.lucroLiquido.valor, final: true },
        ];
        return (
          <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.3s both" }}>
            <SectionHeader icon="dollar" title="DRE Simplificado" sub="Março 2026" />
            <div className="relative z-10">
              {dreRows.map((row) => (
                <div key={row.key}>
                  {/* Main row */}
                  <div
                    className={`flex items-center py-3.5 px-4 rounded-lg transition-colors ${row.subtotal ? "bg-white/[0.03] border-b border-white/[0.06]" : row.final ? "bg-white/[0.04] border border-white/[0.08] mt-2 rounded-xl" : "border-b border-white/[0.04]"} ${row.subs ? "cursor-pointer hover:bg-white/[0.03]" : ""}`}
                    onClick={() => row.subs && setDreDetail(dreDetail === row.key ? null : row.key)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {row.subs && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-slate-500 transition-transform shrink-0 ${dreDetail === row.key ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                      )}
                      <span className={`text-sm font-bold ${row.final ? "text-amber-400" : row.subtotal ? "text-white" : row.negative ? "text-slate-400" : "text-slate-300"}`}>{row.label}</span>
                    </div>
                    <span className={`text-sm w-16 text-right shrink-0 ${row.final ? "text-amber-400 font-bold" : row.subtotal ? "text-slate-300 font-bold" : "text-slate-500"}`}>{row.pct}</span>
                    <span className={`text-base font-bold w-28 text-right shrink-0 ${row.final ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" : row.negative ? "text-rose-400" : "text-white"}`}>
                      {row.negative ? `(${fmtR(row.valor)})` : fmtR(row.valor)}
                    </span>
                  </div>
                  {/* Expandable detail */}
                  {row.subs && dreDetail === row.key && (
                    <div className="ml-8 mr-4 mb-2 mt-1 space-y-0.5" style={{ animation: "animationIn 0.3s ease-out both" }}>
                      {row.subs.map((s, j) => (
                        <div key={j} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-white/[0.02] transition-colors">
                          <span className="text-xs text-slate-500">{s.label}</span>
                          <span className="text-xs font-bold text-slate-400">{fmtR(s.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Cost Breakdown + 6-Month Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.4s both" }}>
          <SectionHeader icon="chart" title="Custos por Categoria" sub="Março 2026" />
          <div className="space-y-4 relative z-10">
            {CUSTOS_CATEGORIAS.map((c, i) => (
              <div key={i} className="group/cost cursor-pointer">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-slate-300 group-hover/cost:text-white transition-colors">{c.label}</span>
                  <div className="flex gap-4 items-baseline">
                    <span className="text-sm font-bold text-white">{fmtR(c.valor)}</span>
                    <span className="text-xs text-slate-500 w-16 text-right">{c.pctReceita}% rec.</span>
                  </div>
                </div>
                <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
                  <div className="h-full rounded-full animate-bar-enter transition-all duration-500 group-hover/cost:brightness-125" style={{ width: `${c.pctTotal}%`, background: `linear-gradient(90deg, ${c.cor}, ${c.cor.replace("0.7", "0.35")})`, boxShadow: `0 0 10px ${c.cor.replace("0.7", "0.25")}`, animationDelay: `${i * 0.05}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] flex flex-col" style={{ animation: "animationIn 0.8s ease-out 0.45s both" }}>
          <SectionHeader icon="chart" title="Receita vs Custos — 6 Meses" sub="Evolução e Margem %" />
          <div className="relative z-10 flex-1 flex flex-col">
            {(() => {
              const maxV = Math.max(...RECEITA_CUSTO_6M.map(r => r.receita));
              return (
                <div className="flex gap-3 flex-1">
                  {RECEITA_CUSTO_6M.map((r, i) => {
                    const hRec = (r.receita / maxV) * 100;
                    const hVar = (r.custoVar / maxV) * 100;
                    const hFix = (r.custoFixo / maxV) * 100;
                    const isCurrent = i === RECEITA_CUSTO_6M.length - 1;
                    return (
                      <div key={r.mes} className="flex-1 flex flex-col items-center group/bar cursor-pointer relative">
                        {/* Hover tooltip */}
                        <span className="text-xs font-bold text-emerald-400 absolute -top-5 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">{fmtR(r.receita)}</span>
                        {/* Bars fill full height */}
                        <div className="flex-1 w-full flex flex-col justify-end gap-0.5">
                          <div className={`w-full rounded-t-md overflow-hidden relative animate-bar-enter transition-all duration-500 group-hover/bar:brightness-125 ${isCurrent ? "ring-1 ring-emerald-400/30" : ""}`} style={{ height: `${hRec}%`, background: "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))", boxShadow: `0 0 12px rgba(16,185,129,${isCurrent ? "0.35" : "0.15"})`, animationDelay: `${i * 0.06}s` }}>
                            {rndParticles(2)}
                          </div>
                          <div className="w-full rounded-sm overflow-hidden relative animate-bar-enter transition-all duration-500 group-hover/bar:brightness-125" style={{ height: `${hVar}%`, background: "linear-gradient(to top, rgb(159,18,57), rgb(244,63,94))", boxShadow: "0 0 8px rgba(244,63,94,0.12)", animationDelay: `${i * 0.06}s` }} />
                          <div className="w-full rounded-b-sm overflow-hidden relative animate-bar-enter transition-all duration-500 group-hover/bar:brightness-125" style={{ height: `${hFix}%`, background: "linear-gradient(to top, rgb(146,100,0), rgb(251,191,36))", boxShadow: "0 0 8px rgba(251,191,36,0.12)", animationDelay: `${i * 0.06}s` }} />
                        </div>
                        <span className={`text-xs mt-2 font-bold shrink-0 ${isCurrent ? "text-white" : "text-neutral-500"}`}>{r.mes}</span>
                        <span className={`text-xs font-bold shrink-0 ${r.margem > 50 ? "text-emerald-400" : r.margem > 35 ? "text-cyan-400" : "text-amber-400"}`}>{r.margem}%</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex gap-5 mt-3 justify-center flex-wrap shrink-0">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgb(52,211,153)" }} />Receita</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgb(244,63,94)" }} />Custos Var.</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgb(251,191,36)" }} />Custos Fixos</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />Margem %</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] flex flex-col" style={{ animation: "animationIn 0.8s ease-out 0.5s both" }}>
          <SectionHeader icon="chart" title="Previsão de Caixa" sub="30 / 60 / 90 dias" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 flex-1">
            {CASHFLOW_FORECAST.map((cf, i) => (
              <div key={i} className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02] flex flex-col">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="size-2.5 rounded-full" style={{ background: cashDot[cf.status] }} />
                  <span className="text-sm font-bold text-white">{cf.periodo}</span>
                </div>
                <p className={`text-xl font-bold ${cashStatusColor[cf.status]} mb-4`}>+{fmtR(cf.saldo)}</p>
                <div className="space-y-2 flex-1 flex flex-col justify-end">
                  {cf.entradas.map((e, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">{e.l}</span>
                      <span className="text-sm font-bold text-emerald-400">+{fmtR(e.v)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/[0.04] my-1" />
                  {cf.saidas.map((s, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">{s.l}</span>
                      <span className="text-sm font-bold text-rose-400">{fmtR(s.v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.55s both" }}>
          <SectionHeader icon="calendar" title="Vencimentos Próximos" sub="14 dias" />
          <div className="space-y-1 relative z-10">
            {CALENDARIO_PAGAMENTOS.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors group/cal cursor-default">
                <div className="flex items-center gap-2.5 w-20">
                  <span className="size-2 rounded-full shrink-0" style={{ background: riscoDot[p.risco] }} />
                  <span className={`text-sm font-bold ${riscoColor[p.risco]}`}>{p.dia}</span>
                </div>
                <span className="text-sm text-slate-400 flex-1 text-center">{p.parcelas} parcela{p.parcelas > 1 ? "s" : ""}</span>
                <span className={`text-sm font-bold w-24 text-right ${p.risco === "peak" ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]" : p.risco === "critical" ? "text-rose-400" : "text-white"}`}>{fmtR(p.valor)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Product */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.6s both" }}>
        <SectionHeader icon="target" title="Receita & Margem por Produto" sub="Comparativo de rentabilidade" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          {PRODUTOS_FINANCEIRO.map((p, i) => {
            const receitaTotal = p.ticket * p.alunos;
            const lucroTotal = p.lucroUnit * p.alunos;
            return (
              <div key={i} className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-base font-bold text-white">{p.nome}</p>
                    <p className="text-sm text-slate-500">{p.turmas} · {p.tipo}</p>
                  </div>
                  <Badge color={p.margem > 40 ? "green" : "amber"}>{p.margem}% margem</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { l: "Ticket", v: fmtR(p.ticket) },
                    { l: "Alunos ativos", v: String(p.alunos) },
                    { l: "CPV unitário", v: fmtR(p.cpv) },
                    { l: "Lucro/aluno", v: fmtR(p.lucroUnit) },
                  ].map((m, j) => (
                    <div key={j}>
                      <p className="text-sm text-slate-400">{m.l}</p>
                      <p className="text-base font-bold text-white">{m.v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 border-t border-white/[0.06]">
                  <div>
                    <p className="text-sm text-slate-400">Receita total</p>
                    <p className="text-base font-bold text-emerald-400">{fmtR(receitaTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Lucro total</p>
                    <p className="text-base font-bold text-amber-400">{fmtR(lucroTotal)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aging + Delinquency Table */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.65s both" }}>
        <SectionHeader icon="alert" title="Inadimplência — Aging & Recovery" sub="Score de recuperação por faixa" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 relative z-10">
          {AGING_INADIMPLENCIA.map((a, i) => (
            <div key={i} className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-sm text-slate-400 mb-1">{a.faixa}</p>
              <p className="text-xl font-bold text-white mb-3">{fmtR(a.valor)}</p>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5 mb-2">
                <div className="h-full rounded-full" style={{ width: `${a.recovery}%`, background: `linear-gradient(90deg, ${a.cor}, ${a.cor.replace("0.7", "0.4")})`, boxShadow: `0 0 10px ${a.cor.replace("0.7", "0.25")}` }} />
              </div>
              <p className={`text-sm font-bold ${recoveryColor(a.recovery)}`}>{a.recovery}% prob. recuperação</p>
            </div>
          ))}
          <div className="rounded-xl p-5 border border-white/[0.08] bg-white/[0.03]">
            <p className="text-sm text-slate-400 mb-1">Recuperação esperada</p>
            <p className="text-xl font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">{fmtR(6500)}</p>
            <p className="text-sm text-slate-500 mt-2">52.4% do total inadimplente</p>
          </div>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Aluno", "Turma", "Dias", "Valor", "Recovery", "Tentativas", "Status"].map(h => (
                  <th key={h} className="text-xs font-bold text-neutral-500 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INAD_DETALHADA.map((a, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pr-4 text-sm font-bold text-white">{a.nome}</td>
                  <td className="py-3.5 pr-4 text-sm text-slate-400">{a.turma}</td>
                  <td className="py-3.5 pr-4"><Badge color={a.dias > 30 ? "red" : a.dias > 15 ? "amber" : "slate"}>{a.dias}d</Badge></td>
                  <td className="py-3.5 pr-4 text-sm font-bold text-rose-400">{fmtR(a.valor)}</td>
                  <td className="py-3.5 pr-4"><span className={`text-sm font-bold ${recoveryColor(a.recovery)}`}>{a.recovery}%</span></td>
                  <td className="py-3.5 pr-4 text-sm text-slate-400">{a.tentativas}</td>
                  <td className="py-3.5 pr-4"><Badge color={a.status === "Write-off" || a.status === "Sem resposta" ? "red" : "amber"}>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.7s both" }}>
        <SectionHeader icon="dollar" title="Formas de Pagamento" sub="Inadimplência por forma" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          <div className="lg:col-span-4 flex justify-center items-center">
            <div className="relative" onMouseLeave={() => setHoveredPag(null)}>
              <svg className="size-56" viewBox="0 0 200 200">
                <defs>
                  <filter id="pagGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="18" />
                {(() => {
                  const r = 70;
                  const circ = 2 * Math.PI * r;
                  const gap = 8;
                  const total = formaPag.reduce((a, f) => a + f.vendas, 0);
                  const usable = circ - gap * formaPag.length;
                  let off = -circ / 4;
                  return formaPag.map((f, i) => {
                    const len = (f.vendas / total) * usable;
                    const dash = `${len} ${circ - len}`;
                    const thisOff = off;
                    off += len + gap;
                    const isHov = hoveredPag === f.forma;
                    const isDim = hoveredPag && !isHov;
                    return (
                      <g key={f.forma}>
                        {isHov && (
                          <circle cx="100" cy="100" r={r} fill="transparent" stroke={pieColors[i]} strokeWidth={24} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" opacity="0.2" filter="url(#pagGlow)" />
                        )}
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke={pieColors[i]} strokeWidth={isHov ? 22 : 16} strokeDasharray={dash} strokeDashoffset={-thisOff} strokeLinecap="butt" style={{ transition: "all 0.3s cubic-bezier(.4,0,.2,1)", opacity: isDim ? 0.2 : 1 }} />
                        <circle cx="100" cy="100" r={r} fill="transparent" stroke="transparent" strokeWidth="30" strokeDasharray={dash} strokeDashoffset={-thisOff} className="cursor-pointer" onMouseEnter={() => setHoveredPag(f.forma)} />
                      </g>
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {hoveredPag ? (() => {
                  const f = formaPag.find(x => x.forma === hoveredPag)!;
                  const total = formaPag.reduce((a, x) => a + x.vendas, 0);
                  return (<>
                    <p className="text-2xl font-bold text-white">{Math.round((f.vendas / total) * 100)}%</p>
                    <p className="text-xs text-slate-400">{f.forma}</p>
                  </>);
                })() : (<>
                  <p className="text-2xl font-bold text-white">{formaPag.reduce((a, f) => a + f.vendas, 0)}</p>
                  <p className="text-xs text-neutral-400">vendas</p>
                </>)}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Forma", "Vendas", "Total", "Inadimpl.", "Δ MoM"].map(h => (
                    <th key={h} className="text-xs font-bold text-neutral-500 uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {formaPag.map((f, i) => {
                  const isHov = hoveredPag === f.forma;
                  return (
                  <tr key={i} className={`border-b border-white/[0.03] transition-all cursor-pointer ${isHov ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
                    onMouseEnter={() => setHoveredPag(f.forma)} onMouseLeave={() => setHoveredPag(null)}>
                    <td className="py-3.5 pr-4">
                      <span className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: pieColors[i], boxShadow: `0 0 6px ${pieColors[i]}` }} />
                        <span className="text-sm text-slate-300">{f.forma}</span>
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-slate-400">{f.vendas}</td>
                    <td className="py-3.5 pr-4 text-sm font-bold text-white">{fmtR(f.total)}</td>
                    <td className="py-3.5 pr-4"><span className={`text-sm font-bold ${parseFloat(f.inadimplencia) > 10 ? "text-rose-400" : parseFloat(f.inadimplencia) > 5 ? "text-amber-400" : "text-emerald-400"}`}>{f.inadimplencia}</span></td>
                    <td className="py-3.5 pr-4"><span className={`text-sm font-bold ${f.delta.startsWith("+") ? "text-rose-400" : f.delta === "—" ? "text-slate-500" : "text-emerald-400"}`}>{f.delta}</span></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {parseFloat(formaPag[3].inadimplencia) > 15 && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                <span className="size-1.5 rounded-full bg-rose-400" />
                <span className="text-xs text-rose-400">Pix 12x com inadimplência crítica ({formaPag[3].inadimplencia}) — crescendo {formaPag[3].delta} MoM</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ AIR — Receita Gerada por IA ══════ */}
      {(() => {
        const airMar = AIR_MENSAL[AIR_MENSAL.length - 1];
        const airFev = AIR_MENSAL[AIR_MENSAL.length - 2];
        const airDeltaPct = ((airMar.airTotal - airFev.airTotal) / airFev.airTotal * 100).toFixed(1);
        const airMaxBar = Math.max(...AIR_MENSAL.map(m => Math.max(m.airTotal, m.receitaHumana)));
        const totalCustoIA = 673;
        const airROI = (airMar.airTotal / totalCustoIA).toFixed(1);

        // Donut calc
        const pctIA = airMar.pctReceita;
        const circ = 2 * Math.PI * 70;
        const arcIA = circ * (pctIA / 100);
        const arcHum = circ - arcIA;

        return (
          <div className="rounded-2xl p-6 border border-emerald-500/10 bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.75s both" }}>
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div>
                <SectionHeader icon="bot" title="AIR — Receita Gerada por IA" sub="AI-Generated Revenue" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">{fmtR(airMar.airTotal)}</p>
                <p className="text-xs text-slate-500">{airMar.pctReceita}% da receita total · Mar/26</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 relative z-10">
              {[
                { l: "AIR Total · Mar", v: fmtR(airMar.airTotal), c: "text-emerald-400", d: `▲ +${airDeltaPct}% vs Fev` },
                { l: "% da Receita Total", v: `${airMar.pctReceita}%`, c: "text-white", d: `▲ +${(airMar.pctReceita - airFev.pctReceita).toFixed(1)}pp vs Fev` },
                { l: "Receita sem IA", v: fmtR(airMar.receitaHumana), c: "text-slate-400", d: `= ${(100 - airMar.pctReceita).toFixed(1)}% da receita` },
                { l: "Custo IA → AIR", v: `${airROI}×`, c: "text-emerald-400", d: `R$${totalCustoIA} gerou ${fmtR(airMar.airTotal)}` },
              ].map((k, i) => (
                <div key={i} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] text-center">
                  <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">{k.l}</p>
                  <p className="text-xs text-slate-500 mt-1">{k.d}</p>
                </div>
              ))}
            </div>

            {/* Chart: barras lado a lado Humana vs IA + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 relative z-10">
              {/* Barras */}
              <div className="lg:col-span-8 rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Receita Humana vs Receita IA — 6 meses</p>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(52,211,153,0.7)" }} />Receita IA (AIR)</span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(99,102,241,0.5)" }} />Receita humana</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-1" style={{ minHeight: 140 }}>
                  {AIR_MENSAL.map((m, i) => {
                    const hHum = (m.receitaHumana / airMaxBar) * 100;
                    const hAI = (m.airTotal / airMaxBar) * 100;
                    const isCurrent = i === AIR_MENSAL.length - 1;
                    return (
                      <div key={m.mes} className="flex-1 flex flex-col items-center">
                        <div className="flex gap-0.5 items-end w-full justify-center flex-1">
                          <div className="w-[40%] rounded-t-md overflow-hidden relative animate-bar-enter" style={{ height: `${hHum}%`, minHeight: 2, background: "rgba(99,102,241,0.45)", animationDelay: `${i * 0.06}s` }}>
                            {rndParticles(2)}
                          </div>
                          <div className="w-[40%] rounded-t-md overflow-hidden relative animate-bar-enter" style={{ height: `${hAI}%`, minHeight: 2, background: isCurrent ? "rgba(52,211,153,0.8)" : "rgba(52,211,153,0.55)", boxShadow: isCurrent ? "0 0 12px rgba(52,211,153,0.2)" : "none", animationDelay: `${i * 0.06 + 0.03}s` }}>
                            {rndParticles(2)}
                          </div>
                        </div>
                        <span className={`text-xs font-bold h-4 leading-4 ${isCurrent ? "text-emerald-400" : "invisible"}`}>{fmtR(m.airTotal).replace("R$ ", "")}</span>
                        <span className={`text-xs font-bold ${isCurrent ? "text-emerald-400" : "text-neutral-500"}`}>{m.mes}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Donut composição */}
              <div className="lg:col-span-4 rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center">
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Composição · Mar</p>
                <svg className="size-40" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(99,102,241,0.3)" strokeWidth="18" />
                  <circle cx="100" cy="100" r="70" fill="transparent" stroke="rgba(52,211,153,0.7)" strokeWidth="18"
                    strokeDasharray={`${arcIA} ${arcHum}`} strokeDashoffset={circ * 0.25}
                    strokeLinecap="butt" style={{ transition: "all 0.8s cubic-bezier(.4,0,.2,1)" }} />
                  <text x="100" y="94" textAnchor="middle" fill="white" fontSize="22" fontWeight="800">{pctIA}%</text>
                  <text x="100" y="112" textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="10">receita IA</text>
                </svg>
                <div className="mt-3 space-y-1.5 text-xs w-full">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(52,211,153,0.7)" }} /><span className="text-slate-400">IA</span><span className="ml-auto font-bold text-emerald-400">{pctIA}%</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(99,102,241,0.5)" }} /><span className="text-slate-400">Humana</span><span className="ml-auto font-bold text-white">{(100 - pctIA).toFixed(1)}%</span></div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">IA superou humana em Dez/25</p>
              </div>
            </div>

            {/* Breakdown AIR por agente */}
            <div className="relative z-10">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Contribuição AIR por Agente — Março</p>
              <div className="space-y-2">
                {[
                  { icon: "chat", nome: "SDR", valor: airMar.airSDR, pct: ((airMar.airSDR / airMar.airTotal) * 100).toFixed(1), cor: "rgba(52,211,153,0.6)" },
                  { icon: "calendar", nome: "Agendamento", valor: airMar.airAgend, pct: ((airMar.airAgend / airMar.airTotal) * 100).toFixed(1), cor: "rgba(34,211,238,0.5)" },
                  { icon: "search", nome: "Enriquecimento", valor: airMar.airEnriq, pct: ((airMar.airEnriq / airMar.airTotal) * 100).toFixed(1), cor: "rgba(167,139,250,0.5)" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 group/airbar cursor-pointer">
                    <div className="size-6 rounded flex items-center justify-center bg-white/[0.04] shrink-0">
                      <Icon name={a.icon} size={12} className="text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400 w-[110px] shrink-0">{a.nome}</span>
                    <div className="flex-1 h-4 relative">
                      <div className="absolute inset-0 bg-white/[0.04] rounded overflow-hidden">
                        <div className="h-full rounded overflow-hidden animate-bar-enter group-hover/airbar:brightness-125 transition-all"
                          style={{ width: `${(a.valor / airMar.airSDR) * 100}%`, background: `linear-gradient(90deg, ${a.cor}, ${a.cor.replace("0.6", "0.25").replace("0.5", "0.2")})`, animationDelay: `${i * 0.06}s` }} />
                      </div>
                      <span className="absolute -top-7 px-2 py-0.5 rounded text-xs font-bold text-white bg-neutral-800 border border-white/10 shadow-lg opacity-0 group-hover/airbar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20" style={{ left: `${(a.valor / airMar.airSDR) * 100}%`, transform: "translateX(-50%)" }}>{fmtR(a.valor)}</span>
                    </div>
                    <span className="text-xs font-bold text-white w-[45px] text-right">{a.pct}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">Cobrança e Pós-venda são contabilizados em Receita Recuperada e Retenção de LTV — não entram no AIR de novas matrículas.</p>
            </div>
          </div>
        );
      })()}

      {/* ══════ AIRE — Evolução da Receita após IA ══════ */}
      {(() => {
        const aireTotal = AIRE_TIMELINE.reduce((s, m) => s + m.aire, 0);
        const aireMar = AIRE_TIMELINE[AIRE_TIMELINE.length - 1];
        const custoIATotal = 673 * AIRE_TIMELINE.length;
        const aireROI = (aireTotal / custoIATotal).toFixed(1);
        const allVals = AIRE_TIMELINE.flatMap(m => [m.receita, m.baseline]);
        const maxRecChart = Math.max(...allVals);
        const minRecChart = Math.min(...allVals) * 0.9;
        const rangeChart = maxRecChart - minRecChart;
        const chartH = 180;
        const chartW = 900;
        const padL = 10;
        const padR = 10;
        const topPad = 30;
        const botPad = 24;
        const usableH = chartH - topPad - botPad;

        const ptReal = AIRE_TIMELINE.map((m, i) => {
          const x = padL + (i / (AIRE_TIMELINE.length - 1)) * (chartW - padL - padR);
          const y = topPad + usableH - ((m.receita - minRecChart) / rangeChart) * usableH;
          return `${x},${y}`;
        });
        const ptBase = AIRE_TIMELINE.map((m, i) => {
          const x = padL + (i / (AIRE_TIMELINE.length - 1)) * (chartW - padL - padR);
          const y = topPad + usableH - ((m.baseline - minRecChart) / rangeChart) * usableH;
          return `${x},${y}`;
        });
        // Area between lines (for shading)
        const areaPoints = [...ptReal, ...ptBase.reverse()].join(" ");

        return (
          <div className="rounded-2xl p-6 border border-purple-500/10 bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.8s both" }}>
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div>
                <SectionHeader icon="chart" title="AIRE — Evolução pós-IA" sub="AI Revenue Impact Evolution" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-purple-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.25)]">+{fmtR(aireTotal)}</p>
                <p className="text-xs text-slate-500">Receita incremental acumulada desde implementação</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 relative z-10">
              {[
                { l: "AIRE Acumulado", v: `+${fmtR(aireTotal)}`, c: "text-purple-400", d: "desde Ago/25" },
                { l: "AIRE · Mar/26", v: `+${fmtR(aireMar.aire)}`, c: "text-purple-400", d: `vs ${fmtR(aireMar.baseline)} sem IA` },
                { l: "Aceleração CAGR", v: "4.8×", c: "text-white", d: "vs crescimento pré-IA" },
                { l: "Payback da IA", v: "< 1 mês", c: "text-emerald-400", d: `custo total: ${fmtR(custoIATotal)} · ROI: ${aireROI}×` },
              ].map((k, i) => (
                <div key={i} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] text-center">
                  <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">{k.l}</p>
                  <p className="text-xs text-slate-500 mt-1">{k.d}</p>
                </div>
              ))}
            </div>

            {/* Timeline milestones */}
            <div className="flex gap-0 rounded-xl overflow-hidden border border-white/[0.06] mb-5 relative z-10">
              {[
                { date: "Jul/25", label: "Pré-IA", valor: "R$26.400", c: "text-slate-500", bg: "" },
                { date: "Ago/25", label: "Go-live SDR", valor: "R$28.900", c: "text-amber-400", bg: "bg-amber-400/[0.02]" },
                { date: "Out/25", label: "Stack completa", valor: "R$29.000", c: "text-cyan-400", bg: "" },
                { date: "Dez/25", label: "5 agentes online", valor: "R$33.400", c: "text-emerald-400", bg: "" },
                { date: "Mar/26", label: "Hoje", valor: "R$43.200", c: "text-emerald-400", bg: "bg-emerald-400/[0.02]" },
              ].map((ms, i) => (
                <div key={i} className={`flex-1 py-3 px-2 text-center border-r border-white/[0.06] last:border-r-0 ${ms.bg}`}>
                  <p className="text-xs text-slate-600">{ms.date}</p>
                  <p className={`text-xs font-bold ${ms.c}`}>{ms.label}</p>
                  <p className="text-sm font-black text-white mt-1">{ms.valor}</p>
                </div>
              ))}
            </div>

            {/* Chart: dual lines with area */}
            <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] mb-5 relative z-10">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Receita real vs Projeção sem IA</p>
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" onMouseLeave={() => setHoveredAire(null)}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
                  <line key={i} x1={padL} y1={topPad + usableH - f * usableH} x2={chartW - padR} y2={topPad + usableH - f * usableH} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                {/* Shaded area */}
                <polygon points={areaPoints} fill="rgba(167,139,250,0.08)" />
                {/* Baseline (dashed) */}
                <polyline points={ptBase.reverse().join(" ")} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="5,4" />
                {/* Real line */}
                <polyline points={ptReal.join(" ")} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinejoin="round" />
                {/* Data points + hover areas */}
                {AIRE_TIMELINE.map((m, i) => {
                  const rp = ptReal[i].split(",");
                  const bp = ptBase[i].split(",");
                  const rx = Number(rp[0]);
                  const ry = Number(rp[1]);
                  const by = Number(bp[1]);
                  const isHov = hoveredAire === i;
                  const isCurrent = i === AIRE_TIMELINE.length - 1;
                  return (
                    <g key={i}>
                      {/* Vertical guide on hover */}
                      {isHov && <line x1={rx} y1={topPad} x2={rx} y2={topPad + usableH} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3,3" />}
                      {/* Dots */}
                      <circle cx={rx} cy={ry} r={isHov ? 5 : isCurrent ? 4 : 0} fill="#34d399" style={{ transition: "r 0.15s" }} />
                      <circle cx={rx} cy={by} r={isHov ? 4 : 0} fill="rgba(255,255,255,0.3)" style={{ transition: "r 0.15s" }} />
                      {/* Tooltip */}
                      {isHov && (() => {
                        const tw = 160;
                        const th = 34;
                        let tx = rx - tw / 2;
                        if (tx < 2) tx = 2;
                        if (tx + tw > chartW - 2) tx = chartW - tw - 2;
                        const above = ry - th - 10;
                        const ty = above >= 2 ? above : ry + 12;
                        return (
                          <>
                            <rect x={tx} y={ty} width={tw} height={th} rx="5" fill="rgba(10,12,24,0.95)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <text x={tx + tw / 2} y={ty + 13} textAnchor="middle" fontSize="9" fontWeight="700" fill="#34d399">{fmtR(m.receita)} <tspan fill="rgba(167,139,250,0.8)">+{fmtR(m.aire)}</tspan></text>
                            <text x={tx + tw / 2} y={ty + 26} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)">sem IA: {fmtR(m.baseline)}</text>
                          </>
                        );
                      })()}
                      {/* Invisible hit area */}
                      <rect x={rx - (chartW / AIRE_TIMELINE.length) / 2} y={0} width={chartW / AIRE_TIMELINE.length} height={chartH} fill="transparent" onMouseEnter={() => setHoveredAire(i)} style={{ cursor: "crosshair" }} />
                    </g>
                  );
                })}
                {/* Month labels */}
                {AIRE_TIMELINE.map((m, i) => {
                  const x = padL + (i / (AIRE_TIMELINE.length - 1)) * (chartW - padL - padR);
                  const isCurrent = i === AIRE_TIMELINE.length - 1;
                  const isHov = hoveredAire === i;
                  return <text key={i} x={x} y={chartH - 4} fontSize="9" fill={isCurrent || isHov ? "#34d399" : "rgba(255,255,255,0.25)"} textAnchor="middle" fontWeight={isCurrent || isHov ? "700" : "400"}>{m.mes.replace("/25", "").replace("/26", "")}</text>;
                })}
              </svg>
              <div className="flex gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3.5 h-0.5 rounded bg-emerald-400" />Receita real</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-3.5 h-0.5 rounded border-b border-dashed border-white/30" />Projeção sem IA</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(167,139,250,0.2)" }} />AIRE (incremental)</span>
              </div>
            </div>

            {/* Table: growth comparison */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden relative z-10">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider px-4 pt-4 pb-2">Taxa de crescimento — Pré-IA vs Pós-IA</p>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Período", "Receita", "Cresc. MoM", "Sem IA (proj.)", "AIRE do mês"].map(h => (
                      <th key={h} className={`py-2 px-4 text-xs text-neutral-500 font-bold uppercase tracking-wider ${h === "Período" ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AIRE_TIMELINE.map((m, i) => {
                    const isCurrent = i === AIRE_TIMELINE.length - 1;
                    return (
                      <tr key={i} className={`border-b border-white/[0.025] ${isCurrent ? "bg-emerald-400/[0.03]" : m.label === "Go-live SDR" ? "bg-amber-400/[0.015]" : ""}`}>
                        <td className="py-2.5 px-4">
                          <span className={`text-xs font-bold ${isCurrent ? "text-emerald-400" : "text-white"}`}>{m.mes}</span>
                          {m.label && <span className={`ml-2 text-xs ${m.label === "Go-live SDR" ? "text-amber-400" : m.label === "Hoje" ? "text-emerald-400" : "text-cyan-400"}`}>{m.label}</span>}
                        </td>
                        <td className={`py-2.5 px-4 text-right text-xs ${isCurrent ? "font-bold text-emerald-400" : "text-white"}`}>{fmtR(m.receita)}</td>
                        <td className={`py-2.5 px-4 text-right text-xs font-bold ${m.crescMoM >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{m.crescMoM >= 0 ? "▲" : "▼"} {m.crescMoM >= 0 ? "+" : ""}{m.crescMoM}%</td>
                        <td className="py-2.5 px-4 text-right text-sm text-slate-300">{fmtR(m.baseline)}</td>
                        <td className={`py-2.5 px-4 text-right text-xs font-bold ${isCurrent ? "text-purple-400" : "text-purple-400/70"}`}>+{fmtR(m.aire)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AgentesScreen() {
  const [selAgent, setSelAgent] = useState<number | null>(null);
  const [execFilter, setExecFilter] = useState<string>("todos");
  const statusColors: Record<string, { dot: string; text: string; glow: string }> = {
    online: { dot: "#10b981", text: "text-emerald-400", glow: "rgba(16,185,129,0.4)" },
    degradado: { dot: "#fbbf24", text: "text-amber-400", glow: "rgba(251,191,36,0.4)" },
    offline: { dot: "#ef4444", text: "text-rose-400", glow: "rgba(239,68,68,0.4)" },
  };
  const sel = selAgent !== null ? AGENTES[selAgent] : null;
  const totalCusto = AGENTES.reduce((a, b) => a + b.custoMes, 0);
  const totalValor = AGENTES.reduce((a, b) => a + b.valorGerado, 0);
  const totalROI = totalValor / totalCusto;
  const hmMax = Math.max(...HEATMAP_DATA.flatMap(d => d.horas));

  return (
    <div className="space-y-6">
      {/* ── ROI Banner ── */}
      <div className="rounded-2xl p-5 border border-emerald-500/10 bg-white/[0.02] flex items-center justify-between flex-wrap gap-4" style={{ animation: "animationIn 0.8s ease-out 0.1s both" }}>
        <div className="flex items-center gap-3 relative z-10">
          <Icon name="bot" size={18} className="text-amber-400" />
          <div>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">ROI Total — 5 Agentes de IA</p>
            <p className="text-sm text-slate-400 mt-0.5">R$ {fmt(totalCusto)}/mês investidos → R$ {fmt(totalValor)}/mês gerados</p>
          </div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">{totalROI.toFixed(1)}×</p>
            <p className="text-xs text-slate-500">retorno por R$1</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">R$ {fmt(AGENTES.reduce((a, b) => a + b.equivCusto, 0))}</p>
            <p className="text-xs text-slate-500">equipe humana equiv.</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400">{((totalCusto / AGENTES.reduce((a, b) => a + b.equivCusto, 0)) * 100).toFixed(1)}%</p>
            <p className="text-xs text-slate-500">do custo humano</p>
          </div>
        </div>
      </div>

      {/* ── Agent Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {AGENTES.map((a, i) => {
          const sc = statusColors[a.status];
          const isSelected = selAgent === i;
          const spkMax = Math.max(...a.sparkline);
          return (
            <div key={i} onClick={() => setSelAgent(selAgent === i ? null : i)}
              className={`rounded-2xl p-4 border cursor-pointer transition-all duration-200 bg-white/[0.02] ${isSelected ? "border-amber-400/20" : "border-white/[0.06] hover:border-white/[0.1]"}`}
              style={{ animation: `animationIn 0.8s ease-out ${0.15 + i * 0.05}s both` }}>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded flex items-center justify-center bg-white/[0.04]">
                    <Icon name={a.icon} size={14} className="text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-white">{a.nome}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">{a.uptime}%</span>
              </div>
              <div className="flex items-center gap-1.5 mb-2 relative z-10">
                <span className="size-1.5 rounded-full" style={{ background: sc.dot, boxShadow: `0 0 6px ${sc.glow}` }} />
                <span className={`text-xs font-bold capitalize ${sc.text}`}>{a.status}</span>
                <span className="text-xs text-slate-500 ml-auto">há {a.lastExec}</span>
              </div>
              {/* Sparkline */}
              <div className="relative z-10 mb-2">
                <svg viewBox="0 0 70 20" className="w-full h-5">
                  <polyline fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeLinejoin="round"
                    points={a.sparkline.map((v, j) => `${j * (70 / 6)},${20 - (v / spkMax) * 16}`).join(" ")} />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs relative z-10">
                <div><span className="text-slate-500">24h:</span> <span className="font-bold text-white">{a.exec24h}</span></div>
                <div><span className="text-slate-500">Sucesso:</span> <span className={`font-bold ${a.sucesso >= 95 ? "text-emerald-400" : a.sucesso >= 90 ? "text-amber-400" : "text-rose-400"}`}>{a.sucesso}%</span></div>
                <div><span className="text-slate-500">R$/exec:</span> <span className="font-bold text-white">R${a.custoExec.toFixed(2)}</span></div>
                <div><span className="text-slate-500">Custo:</span> <span className="font-bold text-white">R${a.custoMes}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Expanded Agent Panel ── */}
      {sel && selAgent !== null && (
        <div className="rounded-2xl p-6 border border-cyan-500/15 bg-white/[0.02]" style={{ animation: "animationIn 0.4s ease-out both" }}>
          <div className="flex items-start justify-between mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg flex items-center justify-center bg-white/[0.04]">
                <Icon name={sel.icon} size={18} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{sel.nome}</h3>
                <p className="text-xs text-slate-500">{sel.resultado} · {sel.equivHumano} equiv.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge color={sel.status === "online" ? "green" : sel.status === "degradado" ? "amber" : "red"}>{sel.status === "degradado" ? "Degradado" : sel.status}</Badge>
              {sel.status === "degradado" && <span className="text-xs text-slate-500">há 4h 23min</span>}
              <button onClick={() => setSelAgent(null)} className="text-slate-500 hover:text-white transition-colors text-xs">✕</button>
            </div>
          </div>

          {/* KPIs do agente */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 relative z-10">
            {[
              { l: "Taxa de Sucesso", v: `${sel.sucesso}%`, c: sel.sucesso >= 95 ? "text-emerald-400" : sel.sucesso >= 90 ? "text-amber-400" : "text-rose-400", d: sel.sucesso >= 95 ? "▲ estável" : "▼ −6.2% vs sem. ant." },
              { l: "Execuções 24h", v: String(sel.exec24h), c: "text-white", d: `▲ +${Math.round(sel.exec24h * 0.14)} vs média` },
              { l: "Valor gerado/mês", v: fmtR(sel.valorGerado), c: "text-emerald-400", d: sel.resultado },
              { l: "Custo por execução", v: `R$ ${sel.custoExec.toFixed(2)}`, c: "text-white", d: `R$${sel.custoMes} ÷ ${sel.exec24h}/dia` },
            ].map((k, i) => (
              <div key={i} className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02] text-center">
                <p className={`text-xl font-black ${k.c}`}>{k.v}</p>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mt-1">{k.l}</p>
                <p className="text-xs text-slate-500 mt-1">{k.d}</p>
              </div>
            ))}
          </div>

          {/* ROI + Uptime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 relative z-10">
            {/* ROI Card */}
            <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">ROI — {sel.nome} · Março</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Custo mensal</span><span className="text-rose-400 font-bold">− R$ {sel.custoMes}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Valor gerado</span><span className="text-emerald-400 font-bold">+ {fmtR(sel.valorGerado)}</span></div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">ROI</span>
                  <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{sel.roi}×</span>
                </div>
                <p className="text-xs text-slate-500">Para cada R$1 investido, R${sel.roi.toFixed(2)} de volta</p>
              </div>
            </div>

            {/* Uptime */}
            <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.02]">
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Uptime — últimos 30 dias</p>
              <p className={`text-2xl font-black ${sel.uptime >= 99 ? "text-emerald-400" : sel.uptime >= 97 ? "text-amber-400" : "text-rose-400"}`}>
                {sel.uptime}% <span className="text-sm text-slate-500 font-normal">disponibilidade</span>
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {(UPTIME_30D[sel.nome] || Array(30).fill("ok")).map((d, i) => (
                  <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{
                    background: d === "ok" ? "rgba(52,211,153,0.45)" : d === "warn" ? "rgba(251,191,36,0.5)" : d === "crit" ? "rgba(251,113,133,0.5)" : "rgba(255,255,255,0.06)"
                  }} />
                ))}
              </div>
              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "rgba(52,211,153,0.45)" }} />OK</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "rgba(251,191,36,0.5)" }} />Degradado</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "rgba(251,113,133,0.5)" }} />Offline</span>
              </div>
            </div>
          </div>

          {/* Incident Log */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden relative z-10">
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider px-4 pt-4 pb-2">Log de Incidentes — {sel.nome}</p>
            {INCIDENT_LOG.filter(inc => inc.agente === sel.nome).length === 0 ? (
              <p className="px-4 pb-4 text-xs text-slate-500">Nenhum incidente registrado nos últimos 30 dias</p>
            ) : (
              INCIDENT_LOG.filter(inc => inc.agente === sel.nome).map((inc, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-t border-white/[0.03]">
                  <span className="size-2 rounded-full mt-1.5 shrink-0" style={{
                    background: inc.tipo === "warn" ? "#fbbf24" : inc.tipo === "crit" ? "#fb7185" : "#34d399",
                    boxShadow: inc.tipo === "warn" ? "0 0 6px rgba(251,191,36,0.4)" : inc.tipo === "crit" ? "0 0 6px rgba(251,113,133,0.4)" : "none"
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white">{inc.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{inc.meta}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${inc.duracao === "Em curso" ? "text-amber-400" : "text-emerald-400"}`}>{inc.duracao}</p>
                    <p className="text-xs text-slate-500">{inc.duracaoTempo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Deflexão por Agente ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] flex flex-col items-center justify-center text-center" style={{ animation: "animationIn 0.8s ease-out 0.4s both" }}>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest relative z-10">Deflexão Geral</p>
          <p className="text-5xl font-black text-emerald-400 mt-3 drop-shadow-[0_0_20px_rgba(16,185,129,0.25)] relative z-10">73%</p>
          <p className="text-xs text-slate-400 mt-2 relative z-10">das interações resolvidas sem humano</p>
          <div className="mt-4 flex justify-center gap-5 text-xs relative z-10">
            <span><b className="text-emerald-400">256</b> <span className="text-slate-500">pela IA</span></span>
            <span><b className="text-blue-400">95</b> <span className="text-slate-500">escaladas</span></span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/[0.06] w-full space-y-2 text-xs relative z-10">
            <div className="flex justify-between"><span className="text-slate-500">Economia mensal</span><span className="text-emerald-400 font-bold">R$ 9.200</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Equiv. a</span><span className="font-bold text-white">~2 vendedores</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tendência</span><span className="text-emerald-400 font-bold">▲ +2.3% vs mês ant.</span></div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.45s both" }}>
          <SectionHeader icon="target" title="Deflexão por Agente" sub="Resolvido sem humano" />
          <div className="space-y-2.5 relative z-10">
            {[...AGENTES].sort((a, b) => b.deflexao - a.deflexao).map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-6 rounded flex items-center justify-center bg-white/[0.04] shrink-0">
                  <Icon name={a.icon} size={12} className="text-amber-400" />
                </div>
                <span className="text-xs text-slate-400 w-[100px] shrink-0">{a.nome}</span>
                <div className="flex-1 h-4 bg-white/[0.04] rounded overflow-hidden">
                  <div className="h-full rounded relative overflow-hidden animate-bar-enter flex items-center pl-2" style={{
                    width: `${a.deflexao}%`,
                    background: a.deflexao >= 80 ? "linear-gradient(90deg, rgba(52,211,153,0.5), rgba(52,211,153,0.25))" : a.deflexao >= 60 ? "linear-gradient(90deg, rgba(34,211,238,0.4), rgba(34,211,238,0.2))" : "linear-gradient(90deg, rgba(251,191,36,0.5), rgba(251,191,36,0.25))",
                    animationDelay: `${i * 0.06}s`
                  }}>
                    {rndParticles(2, true)}
                  </div>
                </div>
                <span className={`text-xs font-bold w-[38px] text-right ${a.deflexao >= 80 ? "text-emerald-400" : a.deflexao >= 60 ? "text-cyan-400" : "text-amber-400"}`}>{a.deflexao}%</span>
                <span className="text-xs text-slate-500 w-[80px] text-right">{a.escalacoes} esc.</span>
              </div>
            ))}
          </div>
          {/* Motivos de escalação SDR */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] relative z-10">
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">Top motivos — SDR (66 escalações)</p>
            <div className="space-y-1.5">
              {ESCALATION_REASONS.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 rounded-sm" style={{ width: `${r.pct * 2.5}px`, background: r.cor }} />
                  <span className="text-slate-500">{r.motivo} — {r.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Execuções + Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execuções com filtro */}
        <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] flex flex-col" style={{ animation: "animationIn 0.8s ease-out 0.5s both" }}>
          <SectionHeader icon="bot" title="Execuções dos Agentes" sub="Sucesso vs Erro">
            <div className="flex gap-1">
              {["todos", "SDR", "Cobrança"].map(f => (
                <button key={f} onClick={() => setExecFilter(f)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${execFilter === f ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/20" : "text-slate-500 border border-white/[0.06] hover:text-white"}`}>
                  {f === "todos" ? "Todos" : f}
                </button>
              ))}
            </div>
          </SectionHeader>
          <div className="flex-1 relative z-10">
            {(() => {
              const maxV = Math.max(...AGENT_EXEC_DIARIO.map(d => d.sucesso + d.erro));
              return (
                <div className="flex gap-3 min-h-[180px]">
                  {AGENT_EXEC_DIARIO.map((d, i) => {
                    const hS = ((d.sucesso) / maxV) * 100;
                    const hE = ((d.erro) / maxV) * 100;
                    return (
                      <div key={d.dia} className="flex-1 flex flex-col items-center group/bar cursor-pointer">
                        <span className="text-xs font-bold text-slate-300 mb-1.5">{d.sucesso}</span>
                        <div className="flex-1 relative w-full flex flex-col justify-end gap-px">
                          <div className="w-full rounded-t-md overflow-hidden relative animate-bar-enter" style={{ height: `${hS}%`, minHeight: 2, background: "linear-gradient(to top, rgb(6,120,80), rgb(52,211,153))", boxShadow: "0 0 12px rgba(16,185,129,0.15)", animationDelay: `${i * 0.06}s` }}>
                            {rndParticles(3)}
                          </div>
                          {d.erro > 0 && (
                            <div className="w-full rounded-sm overflow-hidden animate-bar-enter" style={{ height: `${hE}%`, minHeight: 2, background: "rgba(239,68,68,0.5)", animationDelay: `${i * 0.06}s` }} />
                          )}
                        </div>
                        <span className="text-xs font-bold mt-2 text-neutral-500">{d.dia}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex gap-4 mt-3 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgb(52,211,153)" }} />Sucesso</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(239,68,68,0.5)" }} />Erro</span>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.55s both" }}>
          <SectionHeader icon="clock" title="Heatmap de Atividade" sub="Hora × Dia" />
          <div className="relative z-10">
            {/* Header hours */}
            <div className="flex items-center gap-1 mb-1 ml-8">
              {HEATMAP_HOURS.map(h => (
                <div key={h} className="flex-1 text-center text-xs text-slate-600">{h}</div>
              ))}
            </div>
            {HEATMAP_DATA.map((row, ri) => (
              <div key={ri} className="flex items-center gap-1 mb-1">
                <span className="text-xs text-slate-600 w-7 shrink-0">{row.dia}</span>
                {row.horas.map((v, hi) => {
                  const intensity = hmMax > 0 ? v / hmMax : 0;
                  return (
                    <div key={hi} className="flex-1 h-5 rounded-sm flex items-center justify-center group/hm relative cursor-default" style={{
                      background: intensity === 0 ? "rgba(255,255,255,0.02)" : `rgba(52,211,153,${0.08 + intensity * 0.55})`
                    }}>
                      {v > 0 && <span className="text-[9px] font-bold" style={{ color: `rgba(255,255,255,${0.3 + intensity * 0.5})` }}>{v}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 justify-center text-xs text-slate-500">
              <span>Menos</span>
              {[0.08, 0.2, 0.35, 0.5, 0.63].map((op, i) => (
                <div key={i} className="w-4 h-3 rounded-sm" style={{ background: `rgba(52,211,153,${op})` }} />
              ))}
              <span>Mais</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROI Table ── */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.6s both" }}>
        <SectionHeader icon="chart" title="ROI por Agente" sub="Custo vs Valor Gerado" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Agente", "Custo/mês", "Exec/dia", "R$/exec", "Resultado", "Valor gerado", "ROI", "Equiv. humano"].map(h => (
                  <th key={h} className={`py-2.5 px-3 text-xs text-neutral-500 font-bold uppercase tracking-wider ${h === "Agente" || h === "Resultado" ? "text-left" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTES.map((a, i) => (
                <tr key={i} className={`border-b border-white/[0.025] ${a.status === "degradado" ? "bg-amber-400/[0.015]" : ""}`}>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Icon name={a.icon} size={14} className="text-amber-400" />
                      <div>
                        <span className="text-xs font-bold text-white">{a.nome}</span>
                        <span className={`block text-xs ${a.sucesso >= 95 ? "text-emerald-400" : a.sucesso >= 90 ? "text-amber-400" : "text-rose-400"}`}>{a.sucesso}% sucesso</span>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-3 text-right text-xs font-bold ${a.custoMes > 200 ? "text-rose-400" : a.custoMes > 50 ? "text-amber-400" : "text-emerald-400"}`}>R$ {a.custoMes}</td>
                  <td className="py-3 px-3 text-right text-xs text-white">{a.exec24h}</td>
                  <td className="py-3 px-3 text-right text-xs text-white">R$ {a.custoExec.toFixed(2)}</td>
                  <td className="py-3 px-3 text-xs text-slate-500 max-w-[180px]">{a.resultado}</td>
                  <td className="py-3 px-3 text-right text-xs font-bold text-emerald-400">+ {fmtR(a.valorGerado)}</td>
                  <td className="py-3 px-3 text-right text-sm font-black text-emerald-400">{a.roi}×</td>
                  <td className="py-3 px-3 text-right text-xs text-slate-500">{a.equivHumano} R${fmt(a.equivCusto)}</td>
                </tr>
              ))}
              <tr className="bg-emerald-400/[0.03]">
                <td className="py-3 px-3 text-sm font-black text-white">Total — 5 Agentes</td>
                <td className="py-3 px-3 text-right text-xs font-bold text-amber-400">R$ {totalCusto}</td>
                <td className="py-3 px-3 text-right text-xs font-bold text-white">{AGENTES.reduce((a, b) => a + b.exec24h, 0)}/dia</td>
                <td className="py-3 px-3 text-right text-xs text-white">R$ 1,93</td>
                <td className="py-3 px-3 text-xs text-slate-500">Qualificação + Agendamento + Recuperação + Retenção</td>
                <td className="py-3 px-3 text-right text-sm font-bold text-emerald-400">+ {fmtR(totalValor)}</td>
                <td className="py-3 px-3 text-right text-lg font-black text-emerald-400">{totalROI.toFixed(1)}×</td>
                <td className="py-3 px-3 text-right text-xs text-emerald-400 font-bold">= R${fmt(AGENTES.reduce((a, b) => a + b.equivCusto, 0))}<br /><span className="text-slate-500 font-normal">IA custa {((totalCusto / AGENTES.reduce((a, b) => a + b.equivCusto, 0)) * 100).toFixed(1)}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Custo por Agente (visual bars) ── */}
      <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02]" style={{ animation: "animationIn 0.8s ease-out 0.65s both" }}>
        <SectionHeader icon="dollar" title="Custo por Agente" sub="vs vendedor humano" />
        <div className="space-y-2 relative z-10">
          {AGENTES.map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-6 rounded flex items-center justify-center bg-white/[0.04] shrink-0">
                <Icon name={a.icon} size={12} className="text-amber-400" />
              </div>
              <span className="text-xs text-slate-400 w-[100px] shrink-0">{a.nome}</span>
              <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700 relative overflow-hidden animate-bar-enter" style={{ width: `${(a.custoMes / 4600) * 100}%`, minWidth: 2, animationDelay: `${i * 0.06}s` }}>
                  {rndParticles(2, true)}
                </div>
              </div>
              <span className="text-xs font-bold text-white w-[60px] text-right">R$ {a.custoMes}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 pt-3 border-t border-dashed border-white/[0.08]">
            <div className="size-6 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <Icon name="users" size={12} className="text-rose-400" />
            </div>
            <span className="text-xs text-slate-400 w-[100px] shrink-0">Vendedor humano</span>
            <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/5">
              <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full w-full relative overflow-hidden">{rndParticles(2, true)}</div>
            </div>
            <span className="text-xs font-bold text-rose-400 w-[60px] text-right">R$ 4.600</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Total IA: <b className="text-emerald-400">R$ {totalCusto}/mês</b> — equivalente a <b className="text-white">{((totalCusto / 4600) * 100).toFixed(0)}%</b> de um vendedor
          </div>
        </div>
      </div>
    </div>
  );
}

function AlunosScreen() {
  const [sel, setSel] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [tab, setTab] = useState<"resumo" | "jornada" | "financeiro" | "historico">("resumo");
  const [filtroTurma, setFiltroTurma] = useState("todas");
  const [filtroCurso, setFiltroCurso] = useState("todos");

  const turmasUnicas = Array.from(new Set(ALUNOS.map(a => a.turma)));
  const cursosUnicos = Array.from(new Set(ALUNOS.map(a => a.produto)));

  const filtered = ALUNOS.filter(a => {
    if (busca && !a.nome.toLowerCase().includes(busca.toLowerCase()) && !a.tel.includes(busca)) return false;
    if (filtroTurma !== "todas" && a.turma !== filtroTurma) return false;
    if (filtroCurso !== "todos" && a.produto !== filtroCurso) return false;
    return true;
  });
  const aluno = sel !== null ? ALUNOS.find(a => a.id === sel) : null;

  const getEngLine = (a: typeof ALUNOS[0]) => {
    if (a.modulosConcluidos === a.totalModulos) return { text: `✓ ${a.horasTela}h · ${a.modulosConcluidos}/${a.totalModulos} módulos · concluído`, color: "text-emerald-400" };
    if (a.ultimoLogin > 14) return { text: `⚠ ${a.horasTela}h · ${a.modulosConcluidos}/${a.totalModulos} módulos · sem login há ${a.ultimoLogin}d`, color: "text-rose-400" };
    if (a.ultimoLogin > 7) return { text: `⚠ ${a.horasTela}h · ${a.modulosConcluidos}/${a.totalModulos} módulos · sem login há ${a.ultimoLogin}d`, color: "text-amber-400" };
    return { text: `▶ ${a.horasTela}h · ${a.modulosConcluidos}/${a.totalModulos} módulos · ativo`, color: "text-cyan-400" };
  };

  const avatarGrad = (a: typeof ALUNOS[0]) =>
    a.riscoChurn === "critico" ? "from-rose-500/40 to-rose-400/20 border-rose-400/30" : a.riscoChurn === "alto" ? "from-amber-400/40 to-amber-300/20 border-amber-400/30" : a.riscoChurn === "medio" ? "from-amber-400/30 to-yellow-300/15 border-amber-400/20" : "from-emerald-500/30 to-cyan-400/15 border-emerald-400/25";

  const scoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-rose-400";
  const scoreStroke = (s: number) => s >= 70 ? "rgba(52,211,153,0.8)" : s >= 40 ? "rgba(251,191,36,0.8)" : "rgba(251,113,133,0.8)";
  const scoreLabel = (s: number) => s >= 70 ? "Saudável" : s >= 40 ? "Atenção" : "Crítico";

  const tlDotColor = (tipo: string) => {
    switch (tipo) {
      case "alerta": return "bg-rose-400";
      case "pagamento_atraso": return "bg-amber-400";
      case "pagamento_ok": return "bg-emerald-400";
      case "mentoria": return "bg-purple-400";
      case "engajamento": return "bg-emerald-400";
      case "matricula": return "bg-cyan-400";
      case "certificado": return "bg-emerald-400";
      case "contato": return "bg-slate-500";
      default: return "bg-slate-500";
    }
  };

  const tlTitleColor = (tipo: string) => {
    switch (tipo) {
      case "alerta": return "text-rose-400";
      case "pagamento_atraso": return "text-amber-400";
      case "mentoria": return "text-purple-400";
      case "engajamento": return "text-emerald-400";
      case "matricula": return "text-cyan-400";
      case "certificado": return "text-emerald-400";
      default: return "text-white";
    }
  };

  const tagColor = (c?: string) => {
    switch (c) {
      case "green": return "text-emerald-400 border-emerald-400/20";
      case "red": return "text-rose-400 border-rose-400/20";
      case "purple": return "text-purple-400 border-purple-400/20";
      case "cyan": return "text-cyan-400 border-cyan-400/20";
      default: return "text-slate-500 border-white/[0.08]";
    }
  };

  const getProximaAcao = (a: typeof ALUNOS[0]) => {
    if (a.score < 40 && a.ultimoLogin > 7) return { acao: "Ligar pessoalmente — risco de desistência", cor: "text-rose-400", bg: "bg-rose-400/[0.06] border-rose-400/20" };
    if (a.status_pag === "atrasada") return { acao: "Escalar cobrança para humano", cor: "text-amber-400", bg: "bg-amber-400/[0.06] border-amber-400/20" };
    if (a.ultimoLogin > 5) return { acao: "Enviar dica motivacional sobre o módulo atual", cor: "text-amber-400", bg: "bg-amber-400/[0.06] border-amber-400/20" };
    if (a.modulosConcluidos === a.totalModulos) return { acao: "Sugerir próximo curso ou mentoria avançada", cor: "text-emerald-400", bg: "bg-emerald-400/[0.06] border-emerald-400/20" };
    return { acao: "Manter acompanhamento automático", cor: "text-cyan-400", bg: "bg-cyan-400/[0.06] border-cyan-400/20" };
  };

  const pagas = aluno ? parseInt(aluno.parcelas.split("/")[0]) : 0;
  const totalParc = aluno ? parseInt(aluno.parcelas.split("/")[1]) : 0;
  const valorParcela = aluno ? Math.round(aluno.faturamento / totalParc * (totalParc / 12)) : 0;
  const totalCurso = valorParcela * totalParc;
  const valorPago = valorParcela * pagas;
  const emAtraso = aluno?.status_pag === "atrasada" ? valorParcela : 0;
  const aVencer = totalCurso - valorPago - emAtraso;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: aluno ? "380px 1fr" : "1fr" }}>
      {/* LEFT: Student list */}
      <div>
        <div className="rounded-xl p-0.5 border border-white/[0.08] bg-white/[0.02] mb-3">
          <input placeholder="Buscar por nome ou telefone..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-transparent outline-none text-slate-200 placeholder:text-slate-500" />
        </div>
        {/* Filters */}
        <div className="flex gap-3 mb-4 items-center">
          <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none cursor-pointer hover:border-white/[0.14] transition-colors appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px" }}>
            <option value="todas" className="bg-[#141414] text-slate-300">Todas as turmas</option>
            {turmasUnicas.map(t => (
              <option key={t} value={t} className="bg-[#141414] text-slate-300">{t}</option>
            ))}
          </select>
          <select value={filtroCurso} onChange={e => setFiltroCurso(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none cursor-pointer hover:border-white/[0.14] transition-colors appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px" }}>
            <option value="todos" className="bg-[#141414] text-slate-300">Todos os cursos</option>
            {cursosUnicos.map(c => (
              <option key={c} value={c} className="bg-[#141414] text-slate-300">{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map(a => {
            const eng = getEngLine(a);
            const initials = a.nome.split(" ").map(n => n[0]).join("").slice(0, 2);
            return aluno ? (
              /* ── Compact card (panel open) ── */
              <div key={a.id} onClick={() => { setSel(a.id); setTab("resumo"); }}
                className={`rounded-xl px-3 py-2.5 cursor-pointer border transition-all duration-200 bg-white/[0.02] ${sel === a.id ? "border-white/[0.12] bg-purple-400/[0.04]" : "border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"}`}>
                <div className="flex items-center gap-3 relative z-10">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatarGrad(a)} border flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-bold text-white/80">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold truncate ${sel === a.id ? "text-purple-300" : "text-white"}`}>{a.nome}</span>
                      {a.ultimoLogin > 14 && <span className="text-[10px] text-rose-400">⚠</span>}
                      {a.modulosConcluidos === a.totalModulos && <span className="text-[10px] text-emerald-400">✓</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.produto} · {a.parcelas}</div>
                  </div>
                  <Badge color={pagBadgeColor(a.status_pag)}>{a.status_pag}</Badge>
                </div>
              </div>
            ) : (
              /* ── Full card (no panel) ── */
              <div key={a.id} onClick={() => { setSel(a.id); setTab("resumo"); }}
                className="rounded-xl px-5 py-3.5 cursor-pointer border transition-all duration-200 bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"
                style={{ animation: "animationIn 0.8s ease-out 0.2s both" }}>
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad(a)} border flex items-center justify-center shrink-0`}>
                    <span className="text-sm font-bold text-white/80">{initials}</span>
                  </div>
                  <div className="w-[160px] shrink-0 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold truncate text-white">{a.nome}</span>
                      {a.ultimoLogin > 14 && <span className="text-[10px] text-rose-400">⚠</span>}
                      {a.modulosConcluidos === a.totalModulos && <span className="text-[10px] text-emerald-400">✓</span>}
                    </div>
                  </div>
                  <div className="w-[140px] shrink-0">
                    <div className="text-sm text-slate-300">{a.tel}</div>
                  </div>
                  <div className="w-[160px] shrink-0 min-w-0">
                    <div className="text-sm text-white/70 truncate">{a.produto}</div>
                  </div>
                  <div className="w-[100px] shrink-0 min-w-0">
                    <div className="text-xs text-slate-400 truncate">{a.turma.split(" — ")[0]}</div>
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <div className={`text-sm truncate ${eng.color}`}>{eng.text}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Student panel */}
      {aluno && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] flex flex-col overflow-hidden" style={{ animation: "animationIn 0.4s ease-out both" }}>
          {/* Panel header */}
          <div className="p-5 border-b border-white/[0.06] flex gap-4 items-start">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 border border-purple-400/20" style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.3),rgba(34,211,238,0.2))" }}>
              <span className="text-purple-300">{aluno.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-white tracking-tight">{aluno.nome}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{aluno.tel} · {aluno.ig} · {aluno.cidade}, {aluno.estado}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Segmento: {aluno.segmento} · {aluno.socio ? "Sócio" : "Individual"} · {aluno.produto} ({aluno.turma.split(" — ")[0]})</div>
              <div className="flex gap-1.5 flex-wrap mt-2">
                <Badge color={pagBadgeColor(aluno.status_pag)}>{aluno.status_pag} · {aluno.parcelas} parcelas</Badge>
                {aluno.ultimoLogin > 7 && <Badge color="red">Sem login há {aluno.ultimoLogin}d</Badge>}
                <Badge color={aluno.score >= 70 ? "green" : aluno.score >= 40 ? "amber" : "red"}>Score {aluno.score}</Badge>
                <Badge color="cyan">Matrícula {aluno.dataMatricula}</Badge>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors" style={{ background: "rgba(37,211,102,0.12)", color: "#25d366", borderColor: "rgba(37,211,102,0.25)" }}>WhatsApp</button>
              <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-colors">Reagendar</button>
              <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-colors">+ Nota</button>
              <button onClick={() => setSel(null)} className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] hover:text-white transition-colors" title="Fechar painel">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] shrink-0">
            {(["resumo", "jornada", "financeiro", "historico"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === t ? "text-purple-400 border-purple-400" : "text-slate-500 border-transparent hover:text-slate-400"}`}>
                {t === "historico" ? "Histórico" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* ═══ ABA RESUMO ═══ */}
            {tab === "resumo" && (
              <div className="space-y-4">
                {/* Score ring + indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5 flex items-center gap-4">
                    <svg viewBox="0 0 60 60" className="w-[60px] h-[60px] shrink-0">
                      <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="30" cy="30" r="24" fill="none" stroke={scoreStroke(aluno.score)} strokeWidth="6"
                        strokeDasharray={`${(aluno.score / 100) * 150.8} ${150.8 - (aluno.score / 100) * 150.8}`}
                        strokeDashoffset="-37.7" strokeLinecap="round" />
                      <text x="30" y="35" fontSize="14" fill="white" fontWeight="800" textAnchor="middle">{aluno.score}</text>
                    </svg>
                    <div>
                      <div className={`text-sm font-bold ${scoreColor(aluno.score)}`}>Score de Saúde: {scoreLabel(aluno.score)}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        {aluno.parcelas} parcelas pagas<br />
                        Última atividade há {aluno.ultimoLogin}d<br />
                        Risco de churn: <span className={aluno.riscoChurn === "critico" ? "text-rose-400" : aluno.riscoChurn === "alto" ? "text-amber-400" : aluno.riscoChurn === "medio" ? "text-amber-400" : "text-emerald-400"}>{aluno.riscoChurn === "critico" ? "Crítico" : aluno.riscoChurn === "alto" ? "Alto" : aluno.riscoChurn === "medio" ? "Médio" : "Baixo"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Engajamento", value: `${aluno.horasTela}h`, sub: `${aluno.modulosConcluidos}/${aluno.totalModulos} módulos`, color: aluno.horasTela > 10 ? "text-emerald-400" : aluno.horasTela > 3 ? "text-amber-400" : "text-rose-400" },
                      { label: "Pagamento", value: aluno.status_pag, sub: aluno.parcelas, color: aluno.status_pag === "paga" ? "text-emerald-400" : aluno.status_pag === "atrasada" ? "text-rose-400" : "text-amber-400" },
                      { label: "Último login", value: aluno.ultimoLogin === 0 ? "Hoje" : `${aluno.ultimoLogin}d`, sub: aluno.ultimoLogin > 7 ? "Inativo" : "Ativo", color: aluno.ultimoLogin > 14 ? "text-rose-400" : aluno.ultimoLogin > 7 ? "text-amber-400" : "text-emerald-400" },
                    ].map((k, i) => (
                      <div key={i} className="rounded-xl p-3 bg-white/[0.03] border border-white/5 text-center">
                        <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
                        <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{k.label}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próxima ação recomendada */}
                {(() => {
                  const acao = getProximaAcao(aluno);
                  return (
                    <div className={`rounded-xl p-4 border ${acao.bg}`}>
                      <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Próxima ação recomendada</div>
                      <div className={`text-xs font-bold ${acao.cor}`}>{acao.acao}</div>
                    </div>
                  );
                })()}

                {/* Timeline preview (últimos 3 eventos) */}
                <div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">Últimos eventos</div>
                  <div className="relative pl-5">
                    <div className="absolute left-[5px] top-0 bottom-0 w-px bg-white/[0.06]" />
                    {(ALUNO_TIMELINE[aluno.id] || []).slice(0, 3).map((ev, i) => (
                      <div key={i} className="relative pb-4 pl-5 last:pb-0">
                        <div className={`absolute left-[-5px] top-[3px] w-2.5 h-2.5 rounded-full ${tlDotColor(ev.tipo)}`} />
                        <div className="text-[9px] text-slate-600 mb-0.5">{ev.data}</div>
                        <div className={`text-xs font-bold ${tlTitleColor(ev.tipo)}`}>{ev.titulo}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{ev.descricao}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTab("jornada")} className="mt-3 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors">Ver jornada completa →</button>
                </div>
              </div>
            )}

            {/* ═══ ABA JORNADA ═══ */}
            {tab === "jornada" && (
              <div className="space-y-5">
                {/* KPIs de engajamento */}
                <div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Engajamento na Área do Aluno</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Horas de tela", value: `${aluno.horasTela}h`, sub: aluno.horasTela < 8 ? "⚠ Baixo (meta: 8h/mês)" : "Dentro da meta", subColor: aluno.horasTela < 8 ? "text-rose-400" : "text-slate-500", color: aluno.horasTela < 5 ? "text-amber-400" : aluno.horasTela < 8 ? "text-amber-400" : "text-emerald-400" },
                      { label: "Módulos concluídos", value: `${aluno.modulosConcluidos}/${aluno.totalModulos}`, sub: `${Math.round((aluno.modulosConcluidos / aluno.totalModulos) * 100)}% do curso`, subColor: "text-slate-500", color: aluno.modulosConcluidos === aluno.totalModulos ? "text-emerald-400" : "text-amber-400" },
                      { label: "Último login", value: aluno.ultimoLogin === 0 ? "Hoje" : `${aluno.ultimoLogin}d`, sub: aluno.ultimoLogin > 7 ? `Sem acesso desde ${aluno.ultimoLogin}d` : "Acesso recente", subColor: aluno.ultimoLogin > 7 ? "text-rose-400" : "text-slate-500", color: aluno.ultimoLogin > 14 ? "text-rose-400" : aluno.ultimoLogin > 7 ? "text-rose-400" : "text-emerald-400" },
                      { label: "Streak atual", value: String(aluno.streakAtual), sub: `Recorde: ${aluno.streakMax} dias`, subColor: "text-slate-500", color: aluno.streakAtual > 0 ? "text-emerald-400" : "text-slate-500" },
                    ].map((k, i) => (
                      <div key={i} className="rounded-xl p-3 bg-white/[0.03] border border-white/5 text-center">
                        <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
                        <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider mt-1">{k.label}</div>
                        <div className={`text-[9px] mt-0.5 ${k.subColor}`}>{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progresso do curso */}
                <div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Progresso no Curso</div>
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-white">{aluno.produto}</span>
                        <span className={`${aluno.modulosConcluidos === aluno.totalModulos ? "text-emerald-400" : "text-amber-400"}`}>
                          {Math.round((aluno.modulosConcluidos / aluno.totalModulos) * 100)}% — {aluno.modulosConcluidos}/{aluno.totalModulos} módulos
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{
                          width: `${(aluno.modulosConcluidos / aluno.totalModulos) * 100}%`,
                          background: aluno.modulosConcluidos === aluno.totalModulos
                            ? "linear-gradient(90deg,rgba(52,211,153,0.8),rgba(52,211,153,0.5))"
                            : "linear-gradient(90deg,rgba(251,191,36,0.8),rgba(251,191,36,0.5))"
                        }} />
                      </div>
                    </div>

                    {/* Module list */}
                    <div className="space-y-1.5">
                      {(ALUNO_MODULOS[aluno.id] || []).map((mod, i) => {
                        const showDetail = mod.status === "concluido" || mod.status === "progresso";
                        const remaining = (ALUNO_MODULOS[aluno.id] || []).filter(m => m.status === "bloqueado").length;
                        if (mod.status === "bloqueado" && i > 0 && (ALUNO_MODULOS[aluno.id] || [])[i - 1]?.status === "bloqueado") {
                          if (i === (ALUNO_MODULOS[aluno.id] || []).length - 1) {
                            return <div key={i} className="text-[10px] text-slate-600 pl-10 py-1">+ {remaining} módulos restantes bloqueados</div>;
                          }
                          return null;
                        }
                        return (
                          <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${mod.status === "progresso" ? "border-amber-400/20 bg-amber-400/[0.02]" : "border-white/5 bg-white/[0.02]"}`}>
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 ${mod.status === "concluido" ? "bg-emerald-400/15 text-emerald-400" : mod.status === "progresso" ? "bg-amber-400/15 text-amber-400" : "bg-white/[0.04] text-slate-600"}`}>
                              {mod.status === "concluido" ? "✓" : mod.status === "progresso" ? "▶" : "🔒"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-white">{mod.nome}</div>
                              <div className={`text-[9px] mt-0.5 ${mod.status === "progresso" ? "text-amber-400" : "text-slate-500"}`}>
                                {showDetail ? (
                                  mod.status === "concluido"
                                    ? `Concluído em ${mod.dataConclusao} · ${mod.tempoConsumido} · 100% das aulas`
                                    : `Em progresso · ${mod.aulasConcluidas}/${mod.aulasTotal} aulas · Parado há ${aluno.ultimoLogin} dias`
                                ) : (
                                  `Bloqueado · Disponível após concluir módulo anterior`
                                )}
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${mod.status === "concluido" ? "bg-emerald-400/10 text-emerald-400" : mod.status === "progresso" ? "bg-amber-400/10 text-amber-400" : "bg-white/[0.04] text-slate-600"}`}>
                              {mod.status === "concluido" ? "Concluído" : mod.status === "progresso" ? "Em progresso" : "Bloqueado"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Timeline da Jornada */}
                <div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">Timeline da Jornada</div>
                  <div className="relative pl-5">
                    <div className="absolute left-[5px] top-0 bottom-0 w-px bg-white/[0.06]" />
                    {(ALUNO_TIMELINE[aluno.id] || []).map((ev, i) => (
                      <div key={i} className="relative pb-5 pl-5 last:pb-0">
                        <div className={`absolute left-[-5px] top-[3px] w-2.5 h-2.5 rounded-full ${tlDotColor(ev.tipo)}`} />
                        <div className="text-[9px] text-slate-600 mb-0.5 tracking-wide">{ev.data}</div>
                        <div className={`text-xs font-bold ${tlTitleColor(ev.tipo)}`}>{ev.titulo}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{ev.descricao}</div>
                        {ev.tags.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-2">
                            {ev.tags.map((t, ti) => (
                              <span key={ti} className={`text-[8px] px-1.5 py-0.5 rounded border ${tagColor(t.color)}`}>{t.label}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {!(ALUNO_TIMELINE[aluno.id] || []).length && (
                      <div className="text-xs text-slate-600 py-4 text-center">Nenhum evento registrado ainda</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ABA FINANCEIRO ═══ */}
            {tab === "financeiro" && (
              <div className="space-y-5">
                {/* Score + situação */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5 flex items-center gap-4">
                    <svg viewBox="0 0 60 60" className="w-[60px] h-[60px] shrink-0">
                      <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="30" cy="30" r="24" fill="none" stroke={scoreStroke(aluno.score)} strokeWidth="6"
                        strokeDasharray={`${(aluno.score / 100) * 150.8} ${150.8 - (aluno.score / 100) * 150.8}`}
                        strokeDashoffset="-37.7" strokeLinecap="round" />
                      <text x="30" y="35" fontSize="14" fill="white" fontWeight="800" textAnchor="middle">{aluno.score}</text>
                    </svg>
                    <div>
                      <div className={`text-sm font-bold ${scoreColor(aluno.score)}`}>Saúde Financeira: {scoreLabel(aluno.score)}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        {pagas}/{totalParc} parcelas pagas · {emAtraso > 0 ? "1 em atraso" : "Nenhuma em atraso"}<br />
                        Última atividade há {aluno.ultimoLogin} dias<br />
                        Risco de churn: <span className={aluno.riscoChurn === "critico" ? "text-rose-400" : aluno.riscoChurn === "alto" ? "text-amber-400" : "text-emerald-400"}>{aluno.riscoChurn === "critico" ? "Crítico" : aluno.riscoChurn === "alto" ? "Alto" : aluno.riscoChurn === "medio" ? "Médio" : "Baixo"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-rose-400/15">
                    <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Situação atual</div>
                    <div className="space-y-1.5">
                      {[
                        { label: "Total do curso", value: `${fmtR(totalCurso)} (${totalParc}×${fmtR(valorParcela)})`, color: "text-white" },
                        { label: "Já pago", value: `${fmtR(valorPago)} (${pagas} parcelas)`, color: "text-emerald-400" },
                        ...(emAtraso > 0 ? [{ label: "Em atraso", value: `${fmtR(emAtraso)} (parc. ${pagas + 1})`, color: "text-rose-400" }] : []),
                        { label: "A vencer", value: `${fmtR(aVencer)} (${totalParc - pagas - (emAtraso > 0 ? 1 : 0)} parcelas)`, color: "text-slate-400" },
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-slate-500">{r.label}</span>
                          <span className={r.color}>{r.value}</span>
                        </div>
                      ))}
                      <div className="h-px bg-white/[0.06] my-1" />
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-white">Recuperação esperada</span>
                        <span className={scoreColor(aluno.score)}>{aluno.score}% · {fmtR(Math.round((aluno.score / 100) * (totalCurso - valorPago)))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grade de parcelas */}
                <div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Grade de parcelas — {totalParc} meses</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: totalParc }).map((_, i) => {
                      const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
                      const status = i < pagas ? "paga" : (aluno.status_pag === "atrasada" && i === pagas) ? "atrasada" : i === pagas ? "proxima" : "pendente";
                      return (
                        <div key={i} className={`w-8 h-8 rounded-md flex flex-col items-center justify-center text-[9px] font-bold border ${status === "paga" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : status === "atrasada" ? "bg-rose-500/15 text-rose-400 border-rose-500/20" : status === "proxima" ? "bg-amber-400/15 text-amber-400 border-amber-400/25" : "bg-white/[0.04] text-slate-600 border-white/5"}`}>
                          <span>P{i + 1}</span>
                          <span className="text-[6px] mt-px">{status === "atrasada" ? "⚠" : status === "proxima" ? "Próx" : meses[i % 12]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-2 text-[9px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-400/50" />Pago</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400/50" />Em atraso</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400/50" />Próxima</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/[0.06]" />A vencer</span>
                  </div>
                </div>

                {/* Histórico de cobranças */}
                {aluno.status_pag === "atrasada" && (ALUNO_CONTATOS[aluno.id] || []).length > 0 && (
                  <div>
                    <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Histórico de cobranças — Parcela {pagas + 1}</div>
                    <div className="rounded-xl border border-rose-400/15 overflow-hidden">
                      <div className="grid grid-cols-[80px_1fr_70px_70px] gap-0 px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
                        <span>Data</span><span>Mensagem</span><span>Canal</span><span>Resposta</span>
                      </div>
                      {(ALUNO_CONTATOS[aluno.id] || []).filter(c => c.agente.includes("Cobrança") || c.agente === "Humano").slice(0, 5).map((c, i) => (
                        <div key={i} className="grid grid-cols-[80px_1fr_70px_70px] gap-0 px-3 py-2 border-b border-white/[0.025] text-[10px] items-center">
                          <span className="text-slate-500">{c.data}</span>
                          <span className="text-slate-300 truncate pr-2">{c.mensagem.slice(0, 50)}...</span>
                          <span><Badge color={c.agente === "Humano" ? "amber" : "purple"}>{c.agente === "Humano" ? "Humano" : "IA"}</Badge></span>
                          <span className={c.statusResp === "Sem resposta" ? "text-rose-400" : c.statusResp === "Não visto" ? "text-slate-600" : c.statusResp === "Visto" ? "text-slate-500" : "text-emerald-400"}>{c.statusResp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ ABA HISTÓRICO ═══ */}
            {tab === "historico" && (
              <div className="space-y-4">
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Histórico de contatos — Agentes IA + Humanos</div>
                {(ALUNO_CONTATOS[aluno.id] || []).length > 0 ? (
                  <div className="space-y-2">
                    {(ALUNO_CONTATOS[aluno.id] || []).map((c, i) => (
                      <div key={i} className="rounded-xl p-3 bg-white/[0.02] border border-white/5 flex gap-3 items-start" style={{ animation: `animationIn 0.5s ease-out ${0.05 * i}s both` }}>
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 ${c.agente === "Humano" ? "bg-amber-400/15 text-amber-400" : "bg-purple-400/15 text-purple-400"}`}>
                          {c.agente === "Humano" ? "👤" : "🤖"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white">{c.agente}</span>
                            <span className="text-[9px] text-slate-600">{c.data}</span>
                            <Badge color={c.agente === "Humano" ? "amber" : "purple"}>{c.canal}</Badge>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">{c.mensagem}</div>
                          <div className="mt-1">
                            <span className={`text-[9px] font-bold ${c.statusResp === "Respondeu" ? "text-emerald-400" : c.statusResp === "Sem resposta" ? "text-rose-400" : c.statusResp === "Visto" ? "text-slate-500" : c.statusResp === "Não visto" ? "text-slate-600" : "text-cyan-400"}`}>
                              {c.statusResp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-2xl opacity-30 mb-2">💬</div>
                    <div className="text-xs text-slate-600">Nenhum contato registrado</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function TurmasScreen() {
  const [selTurma, setSelTurma] = useState<number | "nova" | null>(null);
  const [buscaAluno, setBuscaAluno] = useState("");
  const [espSelecionados, setEspSelecionados] = useState<number[]>([]);
  const [novaProduto, setNovaProduto] = useState("Formação Barber Pro");
  const [novaNome, setNovaNome] = useState(`Turma ${TURMAS.length + 51}`);
  const [novaLocal, setNovaLocal] = useState("São Paulo, SP");
  const [novaInicio, setNovaInicio] = useState("2026-08-11");
  const [novaFim, setNovaFim] = useState("2026-08-15");
  const [novaVagas, setNovaVagas] = useState("28");
  const [novaVagasBloq, setNovaVagasBloq] = useState("0");
  const [novaDias, setNovaDias] = useState([1, 2, 3, 4, 5]);

  const turma = typeof selTurma === "number" ? TURMAS.find(t => t.id === selTurma) : null;

  // Calendar helper
  const renderCalendario = (mesNum: number, anoNum: number, inicioStr: string, fimStr: string) => {
    const daysInMonth = new Date(anoNum, mesNum, 0).getDate();
    const firstDow = new Date(anoNum, mesNum - 1, 1).getDay(); // 0=Sun
    const [dI, mI, yI] = inicioStr.split("/").map(Number);
    const [dF, mF, yF] = fimStr.split("/").map(Number);
    const inicioDate = new Date(yI, mI - 1, dI);
    const fimDate = new Date(yF, mF - 1, dF);
    const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const cells: React.ReactNode[] = [];
    // Day of week headers
    for (const d of dias) cells.push(<div key={`h-${d}`} className="text-[8px] text-neutral-500 font-bold text-center py-1">{d}</div>);
    // Empty cells before first day
    for (let e = 0; e < firstDow; e++) cells.push(<div key={`e-${e}`} />);
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(anoNum, mesNum - 1, day);
      const isInTurma = date >= inicioDate && date <= fimDate;
      const isStart = date.getTime() === inicioDate.getTime();
      const isEnd = date.getTime() === fimDate.getTime();
      cells.push(
        <div key={day} className={`h-8 flex items-center justify-center text-xs rounded-md relative ${isInTurma ? "bg-emerald-400/20 text-emerald-400 font-bold border border-emerald-400/30" : "text-slate-500 bg-white/[0.02]"} ${isStart ? "rounded-l-lg" : ""} ${isEnd ? "rounded-r-lg" : ""}`}>
          {day}
          {isStart && <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          {isEnd && <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </div>
      );
    }
    return cells;
  };

  const calcCargaHoraria = (horarios: Array<{ dia: string; inicio: string; fim: string; tipo: string }>) => {
    return horarios.reduce((acc, h) => {
      const [hi, mi] = h.inicio.split(":").map(Number);
      const [hf, mf] = h.fim.split(":").map(Number);
      return acc + (hf - hi) + (mf - mi) / 60;
    }, 0);
  };

  const calcDiasRestantes = (inicioStr: string) => {
    const [d, m, y] = inicioStr.split("/").map(Number);
    const inicio = new Date(y, m - 1, d);
    const hoje = new Date();
    return Math.max(0, Math.ceil((inicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // ══════ ESTADO 2: Detalhe da Turma ══════
  if (turma) {
    const free = turma.total - turma.ocupadas - turma.bloqueadas;
    const conf = turma.ocupadas - turma.bloqueadas;
    const alunosTurma = ALUNOS.filter(a => a.turma.includes(turma.nome.split(" — ")[0]));
    const alunosFiltrados = alunosTurma.filter(a => !buscaAluno || a.nome.toLowerCase().includes(buscaAluno.toLowerCase()));
    const [, mI, yI] = turma.inicio.split("/").map(Number);
    const carga = calcCargaHoraria(turma.horarios);
    const diasRestantes = calcDiasRestantes(turma.inicio);
    const receitaEsperada = alunosTurma.reduce((s, a) => s + a.faturamento, 0);
    const receitaRecebida = alunosTurma.filter(a => a.status_pag === "paga").reduce((s, a) => s + a.faturamento, 0) + alunosTurma.filter(a => a.status_pag === "parcial").reduce((s, a) => { const p = parseInt(a.parcelas.split("/")[0]); const t = parseInt(a.parcelas.split("/")[1]); return s + Math.round(a.faturamento * (p / t)); }, 0);
    const emAtraso = alunosTurma.filter(a => a.status_pag === "atrasada").reduce((s, a) => { const t = parseInt(a.parcelas.split("/")[1]); return s + Math.round((a.faturamento / t)); }, 0);

    return (
      <div className="space-y-5" style={{ animation: "animationIn 0.4s ease-out both" }}>
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelTurma(null)} className="text-xs text-slate-500 hover:text-white transition-colors">← Turmas</button>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-sm font-bold text-white">{turma.nome}</span>
            <Badge color="green">Aberta</Badge>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/15 transition-colors">Editar Turma</button>
            <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-colors">Fechar Turma</button>
          </div>
        </div>

        {/* Detail grid */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 380px" }}>
          {/* Main */}
          <div className="space-y-5">
            {/* Mini KPIs */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Confirmados", value: conf, color: "text-amber-400" },
                { label: "Bloqueados", value: turma.bloqueadas, color: "text-slate-500" },
                { label: "Vagas Livres", value: free, color: "text-emerald-400" },
                { label: "Total Vagas", value: turma.total, color: "text-white" },
              ].map((k, i) => (
                <div key={i} className="rounded-xl p-3 bg-white/[0.03] border border-white/5 text-center">
                  <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-1">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">
                Calendário — {["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][mI]} {yI}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendario(mI, yI, turma.inicio, turma.fim)}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/30" />Turma em andamento</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Início</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Fim</span>
              </div>
            </div>

            {/* Horários */}
            <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06]">
              <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">Horários da Turma</div>
              <div className="space-y-1.5">
                {turma.horarios.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-xs font-bold text-amber-400 w-10">{h.dia}</span>
                    <span className="text-sm text-white">{h.inicio} – {h.fim}</span>
                    <span className="text-xs text-slate-500">{parseInt(h.fim) - parseInt(h.inicio)}h · {h.tipo}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-500 mt-3">Carga horária total: <b className="text-white">{carga}h</b> · {turma.horarios.length} dias · Local: {turma.local}</div>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
              <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                <span className="text-emerald-400">● Inscrições abertas</span>
                <span>Início: {turma.inicio}</span>
                <span>Fim: {turma.fim}</span>
                <span className="text-amber-400">{diasRestantes} dias restantes</span>
              </div>
              <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${Math.max(2, ((turma.ocupadas) / turma.total) * 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Sidebar: Alunos */}
          <div className="space-y-4">
            <div>
              <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Alunos Matriculados</div>
              <div className="text-2xl font-bold text-white mt-1">{conf} <span className="text-sm font-normal text-slate-500">confirmados</span></div>
            </div>

            <div className="rounded-xl p-0.5 border border-white/[0.08] bg-white/[0.02]">
              <input placeholder="Buscar aluno..." value={buscaAluno} onChange={e => setBuscaAluno(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-transparent outline-none text-slate-200 placeholder:text-slate-500" />
            </div>

            <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
              {alunosFiltrados.map(a => (
                <div key={a.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400/20 to-cyan-400/10 border border-purple-400/20 flex items-center justify-center text-[10px] font-bold text-white/70 shrink-0">
                    {a.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{a.nome}</div>
                    <div className="text-[10px] text-slate-500">{a.tel}</div>
                  </div>
                  <Badge color={pagBadgeColor(a.status_pag)}>{a.status_pag} {a.parcelas}</Badge>
                </div>
              ))}
              {alunosTurma.length > alunosFiltrados.length && (
                <div className="text-center text-[10px] text-slate-600 py-2">Mostrando {alunosFiltrados.length} de {alunosTurma.length}</div>
              )}
            </div>

            {/* Financeiro da turma */}
            <div className="rounded-xl p-4 bg-white/[0.03] border border-white/5">
              <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">Financeiro da Turma</div>
              <div className="space-y-1.5">
                {[
                  { label: "Receita total esperada", value: fmtR(receitaEsperada), color: "text-white" },
                  { label: "Já recebido", value: fmtR(receitaRecebida), color: "text-emerald-400" },
                  { label: "Em atraso", value: fmtR(emAtraso), color: "text-rose-400" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-slate-500">{r.label}</span>
                    <span className={r.color}>{r.value}</span>
                  </div>
                ))}
                <div className="h-px bg-white/[0.06] my-1" />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Inadimplência</span>
                  <span className="text-amber-400">{alunosTurma.length > 0 ? ((alunosTurma.filter(a => a.status_pag === "atrasada").length / alunosTurma.length) * 100).toFixed(1) : 0}% · {alunosTurma.filter(a => a.status_pag === "atrasada").length} aluno(s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════ ESTADO 3: Nova Turma ══════
  if (selTurma === "nova") {
    const espFiltrada = LISTA_ESPERA.filter(e => e.produto === novaProduto);
    const toggleEsp = (id: number) => setEspSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAll = () => {
      if (espSelecionados.length === espFiltrada.length) setEspSelecionados([]);
      else setEspSelecionados(espFiltrada.map(e => e.id));
    };

    return (
      <div className="space-y-5" style={{ animation: "animationIn 0.4s ease-out both" }}>
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelTurma(null)} className="text-xs text-slate-500 hover:text-white transition-colors">← Turmas</button>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-sm font-bold text-white">Nova Turma</span>
          </div>
          <span className="text-xs text-slate-500">Preencha os dados · Confirme a lista de espera</span>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 380px" }}>
          {/* Form */}
          <div className="space-y-4">
            <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06] space-y-4">
              {/* Produto */}
              <div>
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Produto</div>
                <select value={novaProduto} onChange={e => { setNovaProduto(e.target.value); setEspSelecionados([]); }}
                  className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none cursor-pointer appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "32px" }}>
                  <option value="Formação Barber Pro" className="bg-[#141414]">Formação Barber Pro (5 dias · R$4.800)</option>
                  <option value="Master Cut" className="bg-[#141414]">Master Cut (3 dias · R$2.400)</option>
                </select>
              </div>

              {/* Info básica */}
              <div>
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Informações Básicas</div>
                <div className="grid grid-cols-2 gap-3">
                  <input value={novaNome} onChange={e => setNovaNome(e.target.value)} className="px-4 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none focus:border-amber-400/30 transition-colors" placeholder="Nome da turma" />
                  <input value={novaLocal} onChange={e => setNovaLocal(e.target.value)} className="px-4 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none focus:border-amber-400/30 transition-colors" placeholder="Local" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-[9px] text-slate-600 mb-1">Data de início</div>
                    <input type="date" value={novaInicio} onChange={e => setNovaInicio(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none focus:border-amber-400/30 transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 mb-1">Data de fim</div>
                    <input type="date" value={novaFim} onChange={e => setNovaFim(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none focus:border-amber-400/30 transition-colors [color-scheme:dark]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-[9px] text-slate-600 mb-1">Total de vagas</div>
                    <input type="number" value={novaVagas} onChange={e => setNovaVagas(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none focus:border-amber-400/30 transition-colors" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 mb-1">Vagas bloqueadas</div>
                    <input type="number" value={novaVagasBloq} onChange={e => setNovaVagasBloq(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.08] text-slate-300 outline-none focus:border-amber-400/30 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Dias da semana */}
              <div>
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Dias de aula</div>
                <div className="flex gap-1.5">
                  {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d, i) => {
                    const on = novaDias.includes(i);
                    return <div key={d} onClick={() => setNovaDias(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold border cursor-pointer transition-colors ${on ? "bg-amber-400/15 text-amber-400 border-amber-400/25" : "bg-white/[0.03] text-slate-600 border-white/5"}`}>{d}</div>;
                  })}
                </div>
              </div>
            </div>

            {/* Criar button */}
            <button className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 hover:bg-emerald-400/20 transition-colors">
              ✓ Criar {novaNome} e notificar alunos em espera
            </button>
          </div>

          {/* Lista de espera */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Lista de Espera</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{novaProduto} · Atualiza ao mudar produto</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-400">{espFiltrada.length}</div>
                <div className="text-[10px] text-slate-500">aguardando vaga</div>
              </div>
            </div>

            <div className="rounded-xl p-3 bg-emerald-400/[0.04] border border-emerald-400/15 text-[10px] text-slate-400">
              ✓ Marque os alunos que receberão notificação automática ao criar a turma.
            </div>

            <button onClick={toggleAll} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-400/[0.04] border border-emerald-400/15 text-xs text-emerald-400 font-bold hover:bg-emerald-400/[0.08] transition-colors">
              <span>{espSelecionados.length === espFiltrada.length ? "Limpar seleção" : "Selecionar todos"}</span>
              <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border ${espSelecionados.length === espFiltrada.length ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : "border-white/10 text-transparent"}`}>✓</span>
            </button>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {espFiltrada.map((e, i) => {
                const checked = espSelecionados.includes(e.id);
                const initials = e.nome.split(" ").map(n => n[0]).join("").slice(0, 2);
                return (
                  <div key={e.id} onClick={() => toggleEsp(e.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${checked ? "bg-emerald-400/[0.04] border-emerald-400/15" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.03]"}`}>
                    <span className="text-[10px] text-slate-600 w-4 text-center">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400/20 to-cyan-400/10 border border-purple-400/20 flex items-center justify-center text-[10px] font-bold text-white/70 shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white">{e.nome}</div>
                      <div className="text-[10px] text-slate-500">Na fila desde {e.dataEntrada} · {e.canal}</div>
                    </div>
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] border ${checked ? "bg-emerald-400/20 border-emerald-400/40 text-emerald-400" : "border-white/10 text-transparent"}`}>✓</span>
                  </div>
                );
              })}
            </div>

            {/* Resumo */}
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/5">
              <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Ao criar a turma</div>
              <div className="space-y-1 text-[10px] text-slate-500">
                <div>✓ <span className="text-emerald-400">{espSelecionados.length} alunos</span> serão notificados automaticamente</div>
                <div>✓ Agente SDR envia mensagem de convite em até 2min</div>
                {espFiltrada.length - espSelecionados.length > 0 && <div className="text-slate-600">× {espFiltrada.length - espSelecionados.length} alunos não selecionados</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════ ESTADO 1: Lista de Turmas ══════
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard label="Turmas abertas" value={TURMAS.filter(t => t.status === "aberta").length} icon="calendar" idx={0} />
        <KpiCard label="Vagas livres" value={TURMAS.filter(t => t.status === "aberta").reduce((a, t) => a + t.total - t.ocupadas - t.bloqueadas, 0)} icon="chair" idx={1} />
        <KpiCard label="Vagas bloqueadas" value={TURMAS.reduce((a, t) => a + t.bloqueadas, 0)} icon="lock" idx={2} />
      </div>

      <div className="flex flex-col gap-4">
        {TURMAS.map((t, i) => {
          const free = t.total - t.ocupadas - t.bloqueadas;
          const diasRestantes = calcDiasRestantes(t.inicio);
          const diasColor = diasRestantes > 30 ? "text-emerald-400" : diasRestantes > 7 ? "text-amber-400" : "text-rose-400";
          return (
            <div key={t.id} onClick={() => setSelTurma(t.id)}
              className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-200"
              style={{ animation: `animationIn 0.8s ease-out ${0.25 + i * 0.05}s both` }}>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{t.nome}</span>
                    <Badge color={t.status === "aberta" ? "green" : "red"}>{t.status === "aberta" ? "Aberta" : "Lotada"}</Badge>
                    {free < 5 && free > 0 && <span className="text-[9px] text-amber-400 animate-pulse">Quase lotada!</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{t.produto} · {t.local} · {t.inicio} a {t.fim}</div>
                  <div className={`text-xs mt-1 ${diasColor}`}>Começa em {diasRestantes} dias</div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${free > 5 ? "text-emerald-400" : free > 0 ? "text-amber-400" : "text-rose-400"}`}>{free}</div>
                  <div className="text-[10px] text-slate-500">vagas livres</div>
                </div>
              </div>
              <div className="relative z-10">
                <OccBar total={t.total} ocupadas={t.ocupadas} bloqueadas={t.bloqueadas} />
              </div>
            </div>
          );
        })}

        {/* Nova Turma button */}
        <div onClick={() => { setSelTurma("nova"); setEspSelecionados([]); }}
          className="rounded-2xl p-6 border border-dashed border-emerald-400/20 bg-emerald-400/[0.02] cursor-pointer hover:border-emerald-400/30 hover:bg-emerald-400/[0.04] transition-all duration-200 flex items-center gap-4"
          style={{ animation: `animationIn 0.8s ease-out ${0.25 + TURMAS.length * 0.05}s both` }}>
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 text-lg font-bold">+</div>
          <div>
            <div className="text-sm font-bold text-white">Nova Turma</div>
            <div className="text-xs text-slate-500">Definir produto · datas · horários · vagas</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function AdministrativoPage() {
  const router = useRouter();
  const [page, setPage] = useState("home");

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto" style={{ background: "#0a0a0a" }}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <div className="h-[120vh] w-[120vh] rounded-full" style={{ background: "rgba(255, 177, 23, 0.15)", filter: "blur(140px)", animation: "orbPulse 5s ease-in-out infinite" }} />
      </div>
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <Image src="/seu_elias_logo_upscaled 1.png" alt="" fill className="opacity-[0.03] select-none object-contain p-8" draggable={false} />
      </div>

      <div className="relative min-h-screen" style={{ zIndex: 1 }}>
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 fixed top-0 left-0 right-0 border-b border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", zIndex: 30, animation: "animationIn 0.8s ease-out 0.1s both" }}>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => router.push("/escolha")} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-white/5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Dashboard Administrativo</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Painel de Gestão</p>
            </div>
          </div>
          <nav className="flex items-center justify-center gap-1 p-0.5 rounded-lg bg-white/[0.03] border border-white/5">
            {PAGES.map(p => {
              const isActive = page === p.key;
              const hasBadge = (p.key === "turmas" && 2) || (p.key === "financeiro" && 4);
              return (
                <button key={p.key} onClick={() => setPage(p.key)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-150 whitespace-nowrap border ${isActive ? "bg-amber-400/10 text-amber-400 border-amber-400/20" : "text-slate-500 hover:text-slate-400 border-transparent"}`}>
                  <span>{p.label}</span>
                  {hasBadge && (
                    <span className="bg-rose-500 text-white text-[8px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center">{hasBadge}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-black border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
              <Icon name="calendar" size={14} className="text-amber-400" />
              <span>{new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 bg-black border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
              <Icon name="clock" size={14} className="text-amber-400" />
              <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative px-6 pt-28 pb-28 space-y-6 text-slate-100">
          {page === "home" ? <HomeScreen setPage={setPage} />
           : page === "funil" ? <FunilScreen />
           : page === "financeiro" ? <FinanceiroScreen />

           : page === "agentes" ? <AgentesScreen />
           : page === "alunos" ? <AlunosScreen />
           : page === "turmas" ? <TurmasScreen />
           : null}
        </main>

        {/* Footer */}
        <footer className="fixed bottom-8 left-4 right-4 flex items-center justify-between rounded-xl px-8 py-3 bg-[#0a0a0a]/90 border border-white/[0.06]" style={{ backdropFilter: "blur(12px)", zIndex: 20, animation: "animationIn 0.8s ease-out 0.6s both" }}>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: "0 0 8px rgba(16,185,129,0.6)" }} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema Online — Dados em Tempo Real</span>
          </div>
          <span className="text-xs text-neutral-500">Atualizado às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </footer>
      </div>
    </div>
  );
}
