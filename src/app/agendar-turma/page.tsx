"use client";

import { useState } from "react";
import Image from "next/image";

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */

// Simula o aluno logado — produto que ele comprou + status de pagamento
const ALUNO_LOGADO = {
  id: 2,
  nome: "Marcos Oliveira",
  produto: "Formação Barber Pro",
  parcelasPagas: 3,
  parcelasTotal: 12,
};

const TURMAS = [
  { id: 1, nome: "Turma 47", periodo: "Mai/2026", produto: "Formação Barber Pro", inicio: "12/05/2026", fim: "16/05/2026", total: 28, ocupadas: 22, bloqueadas: 2, status: "aberta", local: "São Paulo, SP", parcelasMinimas: 3, horarios: [
    { dia: "Seg", inicio: "08:00", fim: "12:00", tipo: "Teórico" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qui", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Sex", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
  { id: 2, nome: "Turma 48", periodo: "Jun/2026", produto: "Formação Barber Pro", inicio: "09/06/2026", fim: "13/06/2026", total: 28, ocupadas: 14, bloqueadas: 0, status: "aberta", local: "São Paulo, SP", parcelasMinimas: 5, horarios: [
    { dia: "Seg", inicio: "08:00", fim: "12:00", tipo: "Teórico" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qui", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Sex", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
  { id: 3, nome: "Turma 49", periodo: "Jul/2026", produto: "Formação Barber Pro", inicio: "14/07/2026", fim: "18/07/2026", total: 28, ocupadas: 3, bloqueadas: 0, status: "aberta", local: "São Paulo, SP", parcelasMinimas: 7, horarios: [
    { dia: "Seg", inicio: "08:00", fim: "12:00", tipo: "Teórico" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qui", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Sex", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
  { id: 4, nome: "Turma 50", periodo: "Ago/2026", produto: "Master Cut", inicio: "04/08/2026", fim: "06/08/2026", total: 28, ocupadas: 8, bloqueadas: 1, status: "aberta", local: "Rio de Janeiro, RJ", parcelasMinimas: 4, horarios: [
    { dia: "Seg", inicio: "08:00", fim: "18:00", tipo: "Teórico + Prático" },
    { dia: "Ter", inicio: "08:00", fim: "18:00", tipo: "Prático" },
    { dia: "Qua", inicio: "08:00", fim: "17:00", tipo: "Avaliação" },
  ]},
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function Icon({ name, size = 14, className = "" }: { name: string; size?: number; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || icons.info}
    </svg>
  );
}

function Badge({ children, color = "amber" }: { children: React.ReactNode; color?: string }) {
  const styles: Record<string, string> = {
    amber: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    green: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    red: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${styles[color] || styles.amber}`}>{children}</span>;
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function AgendarTurmaPage() {
  const [selId, setSelId] = useState<number | null>(null);
  const [confirmado, setConfirmado] = useState(false);

  // Filtra turmas pelo produto do aluno
  const turmasDoProduto = TURMAS.filter(t => t.produto === ALUNO_LOGADO.produto && t.status === "aberta");
  // Separa desbloqueadas e bloqueadas por parcelas
  const turmasDisponiveis = turmasDoProduto.filter(t => ALUNO_LOGADO.parcelasPagas >= t.parcelasMinimas);
  const turmasBloqueadas = turmasDoProduto.filter(t => ALUNO_LOGADO.parcelasPagas < t.parcelasMinimas);
  const turmaSel = selId !== null ? turmasDisponiveis.find(t => t.id === selId) : null;

  const calcDiasRestantes = (inicioStr: string) => {
    const [d, m, y] = inicioStr.split("/").map(Number);
    const inicio = new Date(y, m - 1, d);
    return Math.max(0, Math.ceil((inicio.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  };

  const calcCargaHoraria = (horarios: Array<{ dia: string; inicio: string; fim: string; tipo: string }>) => {
    return horarios.reduce((acc, h) => {
      const [hi] = h.inicio.split(":").map(Number);
      const [hf] = h.fim.split(":").map(Number);
      return acc + (hf - hi);
    }, 0);
  };

  const renderCalendario = (mesNum: number, anoNum: number, inicioStr: string, fimStr: string) => {
    const daysInMonth = new Date(anoNum, mesNum, 0).getDate();
    const firstDow = new Date(anoNum, mesNum - 1, 1).getDay();
    const [dI, mI, yI] = inicioStr.split("/").map(Number);
    const [dF, mF, yF] = fimStr.split("/").map(Number);
    const inicioDate = new Date(yI, mI - 1, dI);
    const fimDate = new Date(yF, mF - 1, dF);
    const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const cells: React.ReactNode[] = [];
    for (const d of dias) cells.push(<div key={`h-${d}`} className="text-[8px] text-neutral-500 font-bold text-center py-1">{d}</div>);
    for (let e = 0; e < firstDow; e++) cells.push(<div key={`e-${e}`} />);
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

  // ══════ ESTADO 3: Confirmação ══════
  if (confirmado && turmaSel) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" style={{ animation: "animationIn 0.5s ease-out both" }}>
          <div className="w-20 h-20 rounded-full bg-emerald-400/15 border-2 border-emerald-400/30 flex items-center justify-center mb-6">
            <Icon name="check" size={36} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Inscrição Confirmada!</h2>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Você está inscrito na <b className="text-white">{turmaSel.nome} — {turmaSel.periodo}</b>.<br />
            Período: {turmaSel.inicio} a {turmaSel.fim} · {turmaSel.local}
          </p>
          <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06] max-w-md w-full text-left space-y-3 mb-8">
            <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Resumo da sua turma</div>
            <div className="space-y-1.5">
              {turmaSel.horarios.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs font-bold text-amber-400 w-10">{h.dia}</span>
                  <span className="text-white">{h.inicio} – {h.fim}</span>
                  <span className="text-xs text-slate-500">{h.tipo}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Icon name="pin" size={12} className="text-amber-400" />
              {turmaSel.local}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setConfirmado(false); setSelId(null); }} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 bg-white/[0.04] border border-white/5 hover:bg-white/[0.08] transition-colors">
              Voltar às turmas
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ══════ ESTADO 2: Turma selecionada — detalhes + confirmar ══════
  if (turmaSel) {
    const free = turmaSel.total - turmaSel.ocupadas - turmaSel.bloqueadas;
    const [, mI, yI] = turmaSel.inicio.split("/").map(Number);
    const carga = calcCargaHoraria(turmaSel.horarios);
    const diasRestantes = calcDiasRestantes(turmaSel.inicio);

    return (
      <Shell>
        <div className="space-y-5 max-w-4xl mx-auto" style={{ animation: "animationIn 0.4s ease-out both" }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelId(null)} className="text-xs text-slate-500 hover:text-white transition-colors">← Turmas disponíveis</button>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-sm font-bold text-white">{turmaSel.nome} — {turmaSel.periodo}</span>
            <Badge color="green">{free} vagas</Badge>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Vagas disponíveis", value: free, color: "text-emerald-400" },
              { label: "Carga horária", value: `${carga}h`, color: "text-amber-400" },
              { label: "Duração", value: `${turmaSel.horarios.length} dias`, color: "text-white" },
              { label: "Começa em", value: `${diasRestantes} dias`, color: diasRestantes > 30 ? "text-emerald-400" : diasRestantes > 7 ? "text-amber-400" : "text-rose-400" },
            ].map((k, i) => (
              <div key={i} className="rounded-xl p-4 bg-white/[0.03] border border-white/5 text-center">
                <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-[1fr_340px]">
            {/* Left: Calendar + horários */}
            <div className="space-y-5">
              {/* Calendar */}
              <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">
                  Calendário — {["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][mI]} {yI}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendario(mI, yI, turmaSel.inicio, turmaSel.fim)}
                </div>
                <div className="flex gap-4 mt-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/30" />Dias de aula</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Início</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Fim</span>
                </div>
              </div>

              {/* Horários */}
              <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider mb-3">Horários</div>
                <div className="space-y-1.5">
                  {turmaSel.horarios.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-bold text-amber-400 w-10">{h.dia}</span>
                      <span className="text-sm text-white">{h.inicio} – {h.fim}</span>
                      <span className="text-xs text-slate-500 ml-auto">{parseInt(h.fim) - parseInt(h.inicio)}h · {h.tipo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Resumo + confirmar */}
            <div className="space-y-4">
              <div className="rounded-xl p-5 bg-white/[0.02] border border-white/[0.06] space-y-4">
                <div className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Detalhes da turma</div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon name="calendar" size={14} className="text-amber-400/60" />
                    <div>
                      <div className="text-[10px] text-slate-500">Período</div>
                      <div className="text-sm text-white">{turmaSel.inicio} a {turmaSel.fim}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="pin" size={14} className="text-amber-400/60" />
                    <div>
                      <div className="text-[10px] text-slate-500">Local</div>
                      <div className="text-sm text-white">{turmaSel.local}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="clock" size={14} className="text-amber-400/60" />
                    <div>
                      <div className="text-[10px] text-slate-500">Carga horária total</div>
                      <div className="text-sm text-white">{carga}h em {turmaSel.horarios.length} dias</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="users" size={14} className="text-amber-400/60" />
                    <div>
                      <div className="text-[10px] text-slate-500">Vagas</div>
                      <div className="text-sm text-white"><span className="text-emerald-400">{free}</span> disponíveis de {turmaSel.total}</div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Occupancy bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                    <span>Ocupação</span>
                    <span>{Math.round((turmaSel.ocupadas / turmaSel.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(turmaSel.ocupadas / turmaSel.total) * 100}%` }} />
                  </div>
                  {free <= 5 && <div className="text-[10px] text-amber-400 mt-1.5 animate-pulse">Poucas vagas restantes!</div>}
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={() => setConfirmado(true)}
                className="w-full py-3.5 rounded-xl text-sm font-bold bg-emerald-400/15 text-emerald-400 border border-emerald-400/25 hover:bg-emerald-400/25 hover:border-emerald-400/40 transition-all duration-200 active:scale-[0.98]">
                Confirmar inscrição nesta turma
              </button>

              <p className="text-[10px] text-slate-600 text-center">
                Ao confirmar, sua vaga será reservada automaticamente.
              </p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // ══════ ESTADO 1: Lista de turmas disponíveis ══════
  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome */}
        <div className="text-center pt-4 md:pt-2" style={{ animation: "animationIn 0.8s ease-out 0.1s both" }}>
          <h3 className="text-lg font-bold text-white">Olá, {ALUNO_LOGADO.nome}!</h3>
          <p className="text-sm text-slate-400 mt-1">
            Escolha uma turma disponível para o seu curso <b className="text-amber-400">{ALUNO_LOGADO.produto}</b>.
          </p>
        </div>

        {/* Payment status */}
        <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06] flex items-center gap-4" style={{ animation: "animationIn 0.8s ease-out 0.12s both" }}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pagamento</span>
              <span className="text-xs text-white font-bold">{ALUNO_LOGADO.parcelasPagas}/{ALUNO_LOGADO.parcelasTotal} parcelas pagas</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${(ALUNO_LOGADO.parcelasPagas / ALUNO_LOGADO.parcelasTotal) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className="rounded-xl p-4 bg-amber-400/[0.04] border border-amber-400/15 flex items-center gap-3 text-center justify-center" style={{ animation: "animationIn 0.8s ease-out 0.15s both" }}>
          <Icon name="info" size={16} className="text-amber-400 shrink-0" />
          <p className="text-xs text-slate-400">
            Selecione a turma que melhor se encaixa na sua agenda. Confira os dias, horários e local antes de confirmar sua inscrição.
          </p>
        </div>

        {/* Turma cards */}
        <div className="flex flex-col gap-4">
          {turmasDisponiveis.map((t, i) => {
            const free = t.total - t.ocupadas - t.bloqueadas;
            const diasRestantes = calcDiasRestantes(t.inicio);
            const diasColor = diasRestantes > 30 ? "text-emerald-400" : diasRestantes > 7 ? "text-amber-400" : "text-rose-400";
            const carga = calcCargaHoraria(t.horarios);

            return (
              <div
                key={t.id}
                onClick={() => free > 0 && setSelId(t.id)}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${free > 0 ? "border-white/[0.06] bg-white/[0.02] cursor-pointer hover:border-amber-400/20 hover:bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.01] opacity-50 cursor-not-allowed"}`}
                style={{ animation: `animationIn 0.8s ease-out ${0.2 + i * 0.06}s both` }}>

                {/* Header */}
                <div className="px-5 pt-5 pb-4 md:px-6 md:pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base md:text-lg font-bold text-white">{t.nome} — {t.periodo}</span>
                        {free > 0 ? (
                          <Badge color={free <= 5 ? "amber" : "green"}>{free} vagas</Badge>
                        ) : (
                          <Badge color="red">Lotada</Badge>
                        )}
                        {free > 0 && free <= 5 && <span className="text-[9px] text-amber-400 opacity-70">Últimas vagas!</span>}
                      </div>
                      <div className={`text-xs mt-1 ${diasColor}`}>Começa em {diasRestantes} dias</div>
                    </div>
                    {free > 0 && (
                      <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0 ml-3 hidden md:block">
                        Selecionar
                      </div>
                    )}
                  </div>
                </div>

                {/* Info grid — 2x2 with dividers */}
                <div className="grid grid-cols-2 border-t border-white/[0.06]">
                  <div className="px-5 py-3 md:px-6 md:py-4 border-r border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="calendar" size={12} className="text-amber-400/50" />
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Período</span>
                    </div>
                    <div className="text-sm text-white font-medium whitespace-nowrap">{t.inicio.slice(0, 5)} a {t.fim.slice(0, 5)}</div>
                  </div>
                  <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="pin" size={12} className="text-amber-400/50" />
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Local</span>
                    </div>
                    <div className="text-sm text-white font-medium">{t.local}</div>
                  </div>
                  <div className="px-5 py-3 md:px-6 md:py-4 border-r border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="clock" size={12} className="text-amber-400/50" />
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Carga horária</span>
                    </div>
                    <div className="text-sm text-white font-medium">{carga}h em {t.horarios.length} dias</div>
                  </div>
                  <div className="px-5 py-3 md:px-6 md:py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="users" size={12} className="text-amber-400/50" />
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Vagas</span>
                    </div>
                    <div className="text-sm text-white font-medium"><span className={free > 5 ? "text-emerald-400" : free > 0 ? "text-amber-400" : "text-rose-400"}>{free}</span> / {t.total}</div>
                  </div>
                </div>

                {/* Horários — structured list */}
                <div className="border-t border-white/[0.06]">
                  <div className="px-5 pt-3 pb-1 md:px-6">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Horários</span>
                  </div>
                  <div className="px-5 pb-3 md:px-6 space-y-1">
                    {t.horarios.map((h, j) => (
                      <div key={j} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <span className="font-bold text-amber-400 text-xs w-8">{h.dia}</span>
                        <span className="text-sm text-white flex-1">{h.inicio} – {h.fim}</span>
                        <span className="text-xs text-slate-400">{h.tipo}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Occupancy bar + mobile CTA */}
                <div className="px-5 pb-5 md:px-6 md:pb-6">
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: `${(t.ocupadas / t.total) * 100}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-slate-400">
                    <span>{t.ocupadas} inscritos</span>
                    <span className="text-emerald-400/70">{free} vagas livres</span>
                  </div>
                  {free > 0 && (
                    <div className="mt-3 md:hidden w-full py-2.5 rounded-lg text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 text-center">
                      Selecionar esta turma
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {turmasDisponiveis.length === 0 && turmasBloqueadas.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-sm">Nenhuma turma disponível para o seu curso no momento.</p>
            <p className="text-xs mt-1 text-slate-600">Novas turmas serão abertas em breve.</p>
          </div>
        )}

        {/* Turmas bloqueadas */}
        {turmasBloqueadas.length > 0 && (
          <div className="space-y-4" style={{ animation: "animationIn 0.8s ease-out 0.4s both" }}>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <div className="flex items-center gap-2 text-slate-500">
                <Icon name="lock" size={14} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Turmas bloqueadas</span>
              </div>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>

            <div className="flex flex-col gap-4">
              {turmasBloqueadas.map((t, i) => {
                const free = t.total - t.ocupadas - t.bloqueadas;
                const parcelasFaltam = t.parcelasMinimas - ALUNO_LOGADO.parcelasPagas;
                const carga = calcCargaHoraria(t.horarios);

                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden opacity-60 relative"
                    style={{ animation: `animationIn 0.8s ease-out ${0.45 + i * 0.06}s both` }}>

                    {/* Lock overlay */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/[0.08]">
                        <Icon name="lock" size={28} className="text-amber-400/80" />
                        <span className="text-sm font-bold text-white">Pague mais {parcelasFaltam} parcela{parcelasFaltam > 1 ? "s" : ""}</span>
                        <span className="text-[10px] text-slate-400">para desbloquear esta turma</span>
                      </div>
                    </div>

                    {/* Header */}
                    <div className="px-5 pt-5 pb-4 md:px-6 md:pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base md:text-lg font-bold text-white">{t.nome} — {t.periodo}</span>
                            <Badge color="red">Bloqueada</Badge>
                          </div>
                          <div className="text-xs mt-1 text-slate-500">Mínimo {t.parcelasMinimas} parcelas pagas</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.04] text-slate-500 border border-white/[0.06] shrink-0 ml-3 hidden md:flex items-center gap-1.5">
                          <Icon name="lock" size={10} />
                          Bloqueada
                        </div>
                      </div>
                    </div>

                    {/* Info grid — 2x2 with dividers */}
                    <div className="grid grid-cols-2 border-t border-white/[0.06]">
                      <div className="px-5 py-3 md:px-6 md:py-4 border-r border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="calendar" size={12} className="text-slate-500" />
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Período</span>
                        </div>
                        <div className="text-sm text-slate-300 font-medium whitespace-nowrap">{t.inicio.slice(0, 5)} a {t.fim.slice(0, 5)}</div>
                      </div>
                      <div className="px-5 py-3 md:px-6 md:py-4 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="pin" size={12} className="text-slate-500" />
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Local</span>
                        </div>
                        <div className="text-sm text-slate-300 font-medium">{t.local}</div>
                      </div>
                      <div className="px-5 py-3 md:px-6 md:py-4 border-r border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="clock" size={12} className="text-slate-500" />
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Carga horária</span>
                        </div>
                        <div className="text-sm text-slate-300 font-medium">{carga}h em {t.horarios.length} dias</div>
                      </div>
                      <div className="px-5 py-3 md:px-6 md:py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="users" size={12} className="text-slate-500" />
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Vagas</span>
                        </div>
                        <div className="text-sm text-slate-300 font-medium">{free} / {t.total}</div>
                      </div>
                    </div>

                    {/* Parcelas progress */}
                    <div className="px-5 pb-5 md:px-6 md:pb-6 pt-3 border-t border-white/[0.06]">
                      <div className="flex justify-between mb-1.5 text-[10px]">
                        <span className="text-slate-500">Progresso para desbloquear</span>
                        <span className="text-amber-400/70 font-bold">{ALUNO_LOGADO.parcelasPagas}/{t.parcelasMinimas} parcelas</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/60" style={{ width: `${(ALUNO_LOGADO.parcelasPagas / t.parcelasMinimas) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════
   SHELL LAYOUT
   ═══════════════════════════════════════════ */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto" style={{ background: "#0a0a0a" }}>
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <div className="h-[120vh] w-[120vh] rounded-full" style={{ background: "rgba(255, 177, 23, 0.06)", filter: "blur(140px)", animation: "orbPulse 8s ease-in-out infinite" }} />
      </div>
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center" style={{ zIndex: 0 }}>
        <Image src="/seu_elias_logo_upscaled 1.png" alt="" fill className="opacity-[0.006] select-none object-contain p-8" draggable={false} />
      </div>

      <div className="relative min-h-screen" style={{ zIndex: 1 }}>
        {/* Header */}
        <header className="flex items-center justify-center px-4 md:px-8 py-3 md:py-4 fixed top-0 left-0 right-0 border-b border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)", backdropFilter: "blur(16px) saturate(150%)", WebkitBackdropFilter: "blur(16px) saturate(150%)", zIndex: 30, animation: "animationIn 0.8s ease-out 0.1s both" }}>
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Agendar Turma</h2>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">Escolha sua turma presencial</p>
          </div>
        </header>

        {/* Content */}
        <main className="relative px-4 md:px-6 pt-20 md:pt-24 pb-8 md:pb-12 text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}
