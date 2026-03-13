import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ══════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════
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
  { sem: "S1", "Agente SDR": 6, "Camila": 5, "Lucas": 3, "Pedro": 2 },
  { sem: "S2", "Agente SDR": 8, "Camila": 7, "Lucas": 4, "Pedro": 1 },
  { sem: "S3", "Agente SDR": 7, "Camila": 6, "Lucas": 2, "Pedro": 2 },
  { sem: "S4", "Agente SDR": 9, "Camila": 8, "Lucas": 3, "Pedro": 1 },
  { sem: "S5", "Agente SDR": 11, "Camila": 7, "Lucas": 4, "Pedro": 3 },
  { sem: "S6", "Agente SDR": 10, "Camila": 9, "Lucas": 5, "Pedro": 2 },
];

const AGENTES = [
  { nome: "Enriquecimento", icon: "🔍", status: "online", exec24h: 47, sucesso: 97.8, tokens: 124000, custoMes: 62 },
  { nome: "SDR", icon: "💬", status: "online", exec24h: 189, sucesso: 91.2, tokens: 890000, custoMes: 445 },
  { nome: "Agendamento", icon: "📅", status: "online", exec24h: 23, sucesso: 95.6, tokens: 45000, custoMes: 22 },
  { nome: "Cobrança", icon: "💰", status: "degradado", exec24h: 56, sucesso: 87.3, tokens: 210000, custoMes: 105 },
  { nome: "Pós-venda", icon: "🤝", status: "online", exec24h: 34, sucesso: 98.1, tokens: 78000, custoMes: 39 },
];

const AGENT_EXEC_DIARIO = [
  { dia: "Seg", sucesso: 62, erro: 4 }, { dia: "Ter", sucesso: 58, erro: 7 },
  { dia: "Qua", sucesso: 71, erro: 3 }, { dia: "Qui", sucesso: 65, erro: 5 },
  { dia: "Sex", sucesso: 55, erro: 8 }, { dia: "Sáb", sucesso: 32, erro: 2 },
  { dia: "Dom", sucesso: 18, erro: 1 },
];

const ALUNOS = [
  { id: 1, nome: "Carlos Silva", tel: "(11) 98765-4321", email: "carlos@email.com", ig: "@carlosbarber", cidade: "São Paulo", estado: "SP", score: 87, produto: "Formação Barber Pro", status_pag: "paga", parcelas: "6/6", turma: "Turma 47 — Mai/2026", faturamento: 12000, segmento: "Barbearia", estado_civil: "Casado", socio: true },
  { id: 2, nome: "Marcos Oliveira", tel: "(11) 91234-5678", email: "marcos@email.com", ig: "@marcoscuts", cidade: "Campinas", estado: "SP", score: 72, produto: "Formação Barber Pro", status_pag: "parcial", parcelas: "4/12", turma: "Turma 47 — Mai/2026", faturamento: 8000, segmento: "Barbearia", estado_civil: "Solteiro", socio: false },
  { id: 3, nome: "Rafael Santos", tel: "(21) 99876-5432", email: "rafa@email.com", ig: "@rafabarber", cidade: "Rio de Janeiro", estado: "RJ", score: 64, produto: "Master Cut", status_pag: "atrasada", parcelas: "2/12", turma: "Turma 50 — Ago/2026", faturamento: 6000, segmento: "Salão", estado_civil: "Casado", socio: true },
  { id: 4, nome: "João Pedro Lima", tel: "(11) 97654-3210", email: "jp@email.com", ig: "@jpbarber", cidade: "São Paulo", estado: "SP", score: 93, produto: "Formação Barber Pro", status_pag: "paga", parcelas: "12/12", turma: "Turma 47 — Mai/2026", faturamento: 18000, segmento: "Barbearia Premium", estado_civil: "Solteiro", socio: false },
  { id: 5, nome: "Felipe Costa", tel: "(31) 98765-1234", email: "felipe@email.com", ig: "@felipecuts", cidade: "Belo Horizonte", estado: "MG", score: 78, produto: "Formação Barber Pro", status_pag: "parcial", parcelas: "3/6", turma: "Turma 48 — Jun/2026", faturamento: 10000, segmento: "Barbearia", estado_civil: "União estável", socio: true },
  { id: 6, nome: "André Souza", tel: "(11) 91111-2222", email: "andre@email.com", ig: "@andrebarber", cidade: "Guarulhos", estado: "SP", score: 55, produto: "Master Cut", status_pag: "parcial", parcelas: "2/12", turma: "Turma 48 — Jun/2026", faturamento: 5000, segmento: "Salão", estado_civil: "Solteiro", socio: false },
];

const TURMAS = [
  { id: 1, nome: "Turma 47 — Mai/2026", produto: "Formação Barber Pro", inicio: "12/05/2026", fim: "16/05/2026", total: 28, ocupadas: 22, bloqueadas: 2, status: "aberta", local: "São Paulo, SP" },
  { id: 2, nome: "Turma 48 — Jun/2026", produto: "Formação Barber Pro", inicio: "09/06/2026", fim: "13/06/2026", total: 28, ocupadas: 14, bloqueadas: 0, status: "aberta", local: "São Paulo, SP" },
  { id: 3, nome: "Turma 49 — Jul/2026", produto: "Formação Barber Pro", inicio: "14/07/2026", fim: "18/07/2026", total: 28, ocupadas: 3, bloqueadas: 0, status: "aberta", local: "São Paulo, SP" },
  { id: 4, nome: "Turma 50 — Ago/2026", produto: "Master Cut", inicio: "04/08/2026", fim: "06/08/2026", total: 28, ocupadas: 8, bloqueadas: 1, status: "aberta", local: "Rio de Janeiro, RJ" },
];

const ORIGEM_DATA = [
  { origem: "Instagram Orgânico", leads: 142, vendas: 52, conversao: 36.6 },
  { origem: "Indicação", leads: 58, vendas: 27, conversao: 46.5 },
  { origem: "WhatsApp Direto", leads: 31, vendas: 8, conversao: 25.8 },
  { origem: "Outro", leads: 16, vendas: 2, conversao: 12.5 },
];

const HEATMAP_DATA = (() => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data = [];
  days.forEach((d, di) => {
    for (let h = 6; h <= 23; h++) {
      const base = di >= 1 && di <= 5 ? (h >= 9 && h <= 12 ? 8 : h >= 18 && h <= 21 ? 10 : 2) : (h >= 10 && h <= 14 ? 5 : 1);
      data.push({ day: d, hour: h, value: base + Math.floor(Math.random() * 4) });
    }
  });
  return data;
})();

const ATIVIDADE = [
  { icon: "🤖", text: "Agente SDR fechou venda com Thiago Almeida — R$ 2.400", tempo: "3 min" },
  { icon: "💰", text: "Parcela 4/12 de João Pedro paga via Pix", tempo: "12 min" },
  { icon: "📅", text: "Turma 48 agendada automaticamente para Ana Costa", tempo: "28 min" },
  { icon: "⚠️", text: "Lead Marcos Oliveira escalado para vendedor humano", tempo: "45 min" },
  { icon: "🔔", text: "Cobrança enviada para Rafael Santos — 5 dias de atraso", tempo: "1h" },
  { icon: "🔍", text: "Lead enriquecido: Felipe Costa — Score 78, Low Ticket", tempo: "1h20" },
  { icon: "🤖", text: "Agente SDR iniciou conversa com 3 novos leads", tempo: "2h" },
  { icon: "✅", text: "Camila Rocha fechou venda high ticket — R$ 4.800", tempo: "3h" },
];

const ALERTAS = [
  { text: "3 alunos inadimplentes há mais de 30 dias — R$ 4.200 em risco", type: "danger", tela: "financeiro" },
  { text: "Turma 47 com apenas 4 vagas restantes", type: "warning", tela: "turmas" },
  { text: "Agente de Cobrança com taxa de sucesso abaixo de 90%", type: "warning", tela: "agentes" },
];

// ══════════════════════════════════════════
// HELPERS & COMPONENTS
// ══════════════════════════════════════════
const fmt = (n) => n.toLocaleString("pt-BR");
const fmtR = (n) => `R$ ${fmt(n)}`;

const C = {
  bg: "#F7F8FA", sidebar: "#0C1222", sideHover: "#162033", accent: "#16A34A", accentLight: "#DCFCE7",
  accentDark: "#065F46", blue: "#2563EB", blueLight: "#DBEAFE", red: "#DC2626", redLight: "#FEE2E2",
  yellow: "#D97706", yellowLight: "#FEF3C7", purple: "#7C3AED", purpleLight: "#EDE9FE",
  text: "#111827", textSec: "#6B7280", textTer: "#9CA3AF", border: "#E5E7EB", card: "#FFFFFF",
};

function KPI({ label, value, sub, delta, deltaUp, accent = C.accent, icon }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden", flex: 1, minWidth: 0 }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "14px 0 0 14px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: C.textTer, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, marginTop: 4, fontFamily: "'Outfit', sans-serif" }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: C.textSec, marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          {icon && <span style={{ fontSize: 22, opacity: 0.7 }}>{icon}</span>}
          {delta && (
            <span style={{ fontSize: 11, fontWeight: 700, color: deltaUp ? C.accent : C.red, background: deltaUp ? C.accentLight : C.redLight, padding: "2px 8px", borderRadius: 6 }}>
              {deltaUp ? "↑" : "↓"} {delta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ children, bg, color }) {
  return <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 6, background: bg, color, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function OccBar({ total, ocupadas, bloqueadas }) {
  const conf = ocupadas - bloqueadas, free = total - ocupadas;
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 6, overflow: "hidden", background: "#F1F5F9" }}>
        <div style={{ width: `${(conf / total) * 100}%`, background: `linear-gradient(90deg, ${C.accent}, #34D399)` }} />
        {bloqueadas > 0 && <div style={{ width: `${(bloqueadas / total) * 100}%`, background: "repeating-linear-gradient(45deg,#FBBF24,#FBBF24 2px,#F59E0B 2px,#F59E0B 4px)" }} />}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 10, color: C.textTer }}>
        <span><b style={{ color: C.accent }}>{conf}</b> conf.</span>
        {bloqueadas > 0 && <span><b style={{ color: C.yellow }}>{bloqueadas}</b> bloq.</span>}
        <span><b style={{ color: C.textSec }}>{free}</b> livres</span>
      </div>
    </div>
  );
}

const pagBadge = (s) => {
  const m = { paga: [C.accentLight, C.accentDark], parcial: [C.yellowLight, "#92400E"], atrasada: [C.redLight, "#991B1B"] };
  const [bg, c] = m[s] || m.parcial;
  return <Badge bg={bg} color={c}>{s}</Badge>;
};

const chartTT = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: "#FFF", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" && p.value > 999 ? fmtR(p.value) : p.value}</div>)}
    </div>
  );
};

// ══════════════════════════════════════════
// SCREENS
// ══════════════════════════════════════════

function HomeScreen({ setPage }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <KPI label="Receita do mês" value={fmtR(43200)} sub="Projetada: R$ 81.600" delta="12%" deltaUp icon="💵" />
        <KPI label="Vendas fechadas" value="89" sub="Ticket médio: R$ 2.580" delta="8%" deltaUp accent={C.blue} icon="🛒" />
        <KPI label="Taxa de conversão" value="36%" sub="89 de 247 leads" delta="3pp" deltaUp accent={C.purple} icon="📈" />
        <KPI label="Inadimplência ativa" value={fmtR(12400)} sub="8 alunos · 4.2% da carteira" delta="1.1%" deltaUp={false} accent={C.red} icon="⚠️" />
      </div>

      {ALERTAS.length > 0 && (
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {ALERTAS.map((a, i) => (
            <div key={i} onClick={() => setPage(a.tela)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: a.type === "danger" ? "#991B1B" : "#92400E", cursor: "pointer" }}>
              <span>{a.type === "danger" ? "🔴" : "🟡"}</span>
              <span style={{ fontWeight: 500 }}>{a.text}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: C.textTer }}>→</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <SectionTitle sub="Últimos 6 meses">Receita Mensal</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RECEITA_MENSAL} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.textTer }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip content={chartTT} />
              <Bar dataKey="realizada" name="Realizada" fill={C.accent} radius={[4,4,0,0]} />
              <Bar dataKey="projetada" name="Projetada" fill="#BBF7D0" radius={[4,4,0,0]} />
              <Bar dataKey="recuperada" name="Recuperada" fill="#FBBF24" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <SectionTitle sub="Março 2026">Mini Funil</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {FUNIL_DATA.slice(0, 5).map((f, i) => {
              const w = f.pct;
              const colors = [C.textSec, C.blue, C.purple, C.yellow, C.accent];
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: C.textSec, fontWeight: 500 }}>{f.etapa}</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{f.valor}</span>
                  </div>
                  <div style={{ height: 22, background: "#F1F5F9", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: `${w}%`, background: colors[i], borderRadius: 6, transition: "width 0.6s", opacity: 0.85 }} />
                    {i < 4 && <span style={{ position: "absolute", right: 8, top: 4, fontSize: 9, color: C.textTer, fontWeight: 600 }}>{i < 4 ? `${Math.round(FUNIL_DATA[i+1].valor / f.valor * 100)}%` : ""}</span>}
                  </div>
                </div>
              );
            })}
            <div style={{ textAlign: "center", marginTop: 4, fontSize: 11, color: C.red, fontWeight: 600 }}>
              ⚠ {FUNIL_DATA[5].valor} leads perdidos ({FUNIL_DATA[5].pct}%)
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <SectionTitle>Próximas Turmas</SectionTitle>
          {TURMAS.filter(t => t.status === "aberta").slice(0, 3).map(t => (
            <div key={t.id} style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.nome}</span>
                  <span style={{ fontSize: 11, color: C.textTer, marginLeft: 8 }}>{t.local}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: (t.total - t.ocupadas) > 5 ? C.accent : C.yellow }}>{t.total - t.ocupadas - t.bloqueadas}</span>
              </div>
              <OccBar total={t.total} ocupadas={t.ocupadas} bloqueadas={t.bloqueadas} />
            </div>
          ))}
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "20px 22px" }}>
          <SectionTitle>Atividade Recente</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 260, overflowY: "auto" }}>
            {ATIVIDADE.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>{a.text}</div>
                </div>
                <span style={{ fontSize: 10, color: C.textTer, flexShrink: 0, whiteSpace: "nowrap" }}>há {a.tempo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FunilScreen() {
  const [etapaSel, setEtapaSel] = useState(null);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle sub="Clique em uma etapa para ver os leads">Funil de Vendas — Março 2026</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FUNIL_DATA.slice(0, 5).map((f, i) => {
              const colors = ["#94A3B8", C.blue, C.purple, C.yellow, C.accent];
              const isLoss = i === 3;
              return (
                <div key={i} onClick={() => setEtapaSel(f.etapa)} style={{ cursor: "pointer", padding: "10px 14px", borderRadius: 10, border: `2px solid ${etapaSel === f.etapa ? colors[i] : "transparent"}`, background: etapaSel === f.etapa ? colors[i] + "08" : "transparent", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: `${f.pct}%`, minWidth: 40, height: 36, background: `linear-gradient(90deg, ${colors[i]}CC, ${colors[i]}88)`, borderRadius: 8, display: "flex", alignItems: "center", paddingLeft: 12, transition: "width 0.6s" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#FFF" }}>{f.valor}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.etapa}</span>
                      {i > 0 && i < 5 && (
                        <span style={{ fontSize: 11, color: isLoss && (FUNIL_DATA[i].valor / FUNIL_DATA[i-1].valor) < 0.7 ? C.red : C.textTer, marginLeft: 8, fontWeight: 600 }}>
                          {Math.round(f.valor / FUNIL_DATA[i-1].valor * 100)}% da etapa anterior
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#991B1B" }}>❌ {FUNIL_DATA[5].valor} Perdidos</span>
              <span style={{ fontSize: 11, color: "#B91C1C", marginLeft: 8 }}>Maior gargalo: Qualificado → Negociação (perda de 37%)</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Tempo médio de conversão", value: "4.2 dias", delta: "↓ 0.8d", up: true },
            { label: "Primeiro atendimento", value: "47 seg", delta: "Meta: < 5min ✅", up: true },
            { label: "Perda principal", value: "Sem resposta", delta: "62% das perdas", up: false },
          ].map((m, i) => (
            <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, color: C.textTer, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginTop: 4 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: m.up ? C.accent : C.yellow, fontWeight: 600, marginTop: 2 }}>{m.delta}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
        <SectionTitle sub="Leads por dia nos últimos 30 dias">Evolução do Funil</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={FUNIL_EVOLUCAO}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} />
            <Tooltip content={chartTT} />
            <Area type="monotone" dataKey="captados" name="Captados" stroke="#94A3B8" fill="#94A3B822" strokeWidth={2} />
            <Area type="monotone" dataKey="qualificados" name="Qualificados" stroke={C.purple} fill={C.purple + "22"} strokeWidth={2} />
            <Area type="monotone" dataKey="fechados" name="Fechados" stroke={C.accent} fill={C.accent + "22"} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FinanceiroScreen() {
  const inadPorAluno = [
    { nome: "Rafael Santos", turma: "Turma 50", atraso: "R$ 3.200", dias: 34, tentativas: 5, status: "Sem resposta" },
    { nome: "Marcos Oliveira", turma: "Turma 47", atraso: "R$ 4.800", dias: 12, tentativas: 2, status: "Prometeu pagar" },
    { nome: "André Souza", turma: "Turma 48", atraso: "R$ 2.400", dias: 8, tentativas: 1, status: "Negociando" },
    { nome: "Bruno Lima", turma: "Turma 47", atraso: "R$ 2.000", dias: 45, tentativas: 8, status: "Escalado" },
  ];
  const formaPag = [
    { forma: "Cartão de crédito", vendas: 31, inadimplencia: "2.1%", ticket: "R$ 2.800" },
    { forma: "Pix à vista", vendas: 12, inadimplencia: "0%", ticket: "R$ 2.200" },
    { forma: "Pix 6x", vendas: 24, inadimplencia: "8.3%", ticket: "R$ 2.400" },
    { forma: "Pix 12x", vendas: 22, inadimplencia: "18.2%", ticket: "R$ 2.600" },
  ];
  const pieData = [{ name: "Cartão", value: 31 }, { name: "Pix à vista", value: 12 }, { name: "Pix 6x", value: 24 }, { name: "Pix 12x", value: 22 }];
  const PCOL = [C.blue, C.accent, C.yellow, C.red];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <KPI label="Receita realizada" value={fmtR(43200)} delta="12%" deltaUp icon="💵" accent={C.accent} />
        <KPI label="Receita projetada (3 meses)" value={fmtR(124800)} sub="Abr: R$42k · Mai: R$44k · Jun: R$38k" icon="📊" accent={C.blue} />
        <KPI label="Inadimplência total" value={fmtR(12400)} sub="4.2% da carteira · 8 alunos" delta="1.1%" deltaUp={false} icon="⚠️" accent={C.red} />
        <KPI label="Receita recuperada" value={fmtR(3800)} sub="Pelo agente de cobrança" delta="22%" deltaUp icon="🔄" accent={C.yellow} />
        <KPI label="Ticket médio" value={fmtR(2580)} sub="Low: R$2.400 · High: R$4.800" icon="🎫" accent={C.purple} />
        <KPI label="Custo por venda" value="R$ 283" sub="Equipe: R$18.4k + IA: R$673" icon="💳" accent={C.textSec} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle sub="Receita vs Inadimplência vs Recuperada">Últimos 6 Meses</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RECEITA_MENSAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: C.textTer }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip content={chartTT} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="realizada" name="Realizada" fill={C.accent} radius={[4,4,0,0]} />
              <Bar dataKey="recuperada" name="Recuperada" fill="#FBBF24" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle>Formas de Pagamento</SectionTitle>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <PieChart width={160} height={140}>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={36} outerRadius={60} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PCOL[i]} />)}
              </Pie>
            </PieChart>
          </div>
          {formaPag.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: PCOL[i] }} />{f.forma}</span>
              <span style={{ color: C.textSec }}>{f.vendas} vendas</span>
              <span style={{ color: parseFloat(f.inadimplencia) > 10 ? C.red : C.textSec, fontWeight: 600 }}>{f.inadimplencia}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
        <SectionTitle sub="Ordenado por valor em atraso">Inadimplência por Aluno</SectionTitle>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>{["Aluno", "Turma", "Valor em atraso", "Dias", "Tentativas", "Status"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: C.textTer, fontWeight: 600, fontSize: 10, textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {inadPorAluno.map((a, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: C.text }}>{a.nome}</td>
                <td style={{ padding: "10px 12px", color: C.textSec }}>{a.turma}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: C.red }}>{a.atraso}</td>
                <td style={{ padding: "10px 12px" }}><Badge bg={a.dias > 30 ? C.redLight : C.yellowLight} color={a.dias > 30 ? "#991B1B" : "#92400E"}>{a.dias}d</Badge></td>
                <td style={{ padding: "10px 12px", color: C.textSec }}>{a.tentativas}</td>
                <td style={{ padding: "10px 12px" }}><Badge bg={a.status === "Sem resposta" || a.status === "Escalado" ? C.redLight : C.yellowLight} color={a.status === "Sem resposta" || a.status === "Escalado" ? "#991B1B" : "#92400E"}>{a.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EquipeScreen() {
  return (
    <div>
      <SectionTitle sub="Ordenado por receita gerada no período">Ranking de Vendedores</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {VENDEDORES.map((v, i) => (
          <div key={i} style={{ background: C.card, borderRadius: 14, border: `1px solid ${i === 0 ? "#FBBF24" : C.border}`, padding: "16px 22px", display: "flex", alignItems: "center", gap: 18, boxShadow: i === 0 ? "0 0 0 1px #FBBF2444" : "none" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: v.tipo === "ia" ? C.purpleLight : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {v.tipo === "ia" ? "🤖" : ["👩","👨","👨","👩","👨"][i]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{v.nome}</span>
                <Badge bg={v.tipo === "ia" ? C.purpleLight : "#F1F5F9"} color={v.tipo === "ia" ? C.purple : C.textSec}>{v.tipo === "ia" ? "IA" : "Humano"}</Badge>
                {i === 0 && <Badge bg="#FEF3C7" color="#92400E">🏆 Top</Badge>}
              </div>
              <div style={{ fontSize: 11, color: C.textTer, marginTop: 3 }}>Tempo de resposta: {v.tempoResp} · Custo mensal: {fmtR(v.custo)}</div>
            </div>
            <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
              {[
                { label: "Vendas", value: v.vendas },
                { label: "Receita", value: fmtR(v.receita) },
                { label: "Conversão", value: `${v.conversao}%` },
                { label: "Ticket", value: fmtR(v.ticket) },
                { label: "Custo/venda", value: fmtR(Math.round(v.custo / v.vendas)) },
              ].map((m, j) => (
                <div key={j} style={{ textAlign: "center", minWidth: 65 }}>
                  <div style={{ fontSize: 10, color: C.textTer }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle>Comparativo: IA vs Humanos</SectionTitle>
          {[
            { label: "Custo por venda", ia: "R$ 12", humano: "R$ 247", winner: "ia" },
            { label: "Tempo de resposta", ia: "12 segundos", humano: "1h48min (média)", winner: "ia" },
            { label: "Taxa de conversão", ia: "41%", humano: "24% (média)", winner: "ia" },
            { label: "Ticket médio", ia: "R$ 2.300", humano: "R$ 2.830", winner: "humano" },
            { label: "Disponibilidade", ia: "24/7", humano: "9h-18h seg-sex", winner: "ia" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}`, gap: 12 }}>
              <span style={{ fontSize: 11, color: C.textSec, fontWeight: 500, width: 130, flexShrink: 0 }}>{c.label}</span>
              <div style={{ flex: 1, textAlign: "center", padding: "4px 8px", borderRadius: 6, background: c.winner === "ia" ? C.accentLight : "transparent" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.winner === "ia" ? C.accentDark : C.text }}>🤖 {c.ia}</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "4px 8px", borderRadius: 6, background: c.winner === "humano" ? C.blueLight : "transparent" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.winner === "humano" ? C.blue : C.text }}>👥 {c.humano}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle sub="Vendas por semana">Performance ao Longo do Tempo</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={PERF_SEMANAL}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="sem" tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} />
              <Tooltip content={chartTT} />
              <Line type="monotone" dataKey="Agente SDR" stroke={C.purple} strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Camila" stroke={C.accent} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Lucas" stroke={C.blue} strokeWidth={1.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Pedro" stroke={C.yellow} strokeWidth={1.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AgentesScreen() {
  const [selAgent, setSelAgent] = useState(null);
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto" }}>
        {AGENTES.map((a, i) => {
          const sColor = a.status === "online" ? C.accent : a.status === "degradado" ? C.yellow : C.red;
          return (
            <div key={i} onClick={() => setSelAgent(selAgent === i ? null : i)}
              style={{ background: C.card, borderRadius: 14, border: `2px solid ${selAgent === i ? sColor : C.border}`, padding: "16px 18px", minWidth: 165, flex: 1, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{a.nome}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: sColor, boxShadow: `0 0 6px ${sColor}66` }} />
                <span style={{ fontSize: 10, color: sColor, fontWeight: 600, textTransform: "capitalize" }}>{a.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10 }}>
                <div><span style={{ color: C.textTer }}>24h:</span> <span style={{ fontWeight: 700, color: C.text }}>{a.exec24h}</span></div>
                <div><span style={{ color: C.textTer }}>Sucesso:</span> <span style={{ fontWeight: 700, color: a.sucesso >= 95 ? C.accent : a.sucesso >= 90 ? C.yellow : C.red }}>{a.sucesso}%</span></div>
                <div><span style={{ color: C.textTer }}>Tokens:</span> <span style={{ fontWeight: 700, color: C.text }}>{(a.tokens/1000).toFixed(0)}k</span></div>
                <div><span style={{ color: C.textTer }}>Custo:</span> <span style={{ fontWeight: 700, color: C.text }}>R${a.custoMes}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.textTer, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Deflexão Geral</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.accent, marginTop: 8, fontFamily: "'Outfit', sans-serif" }}>73%</div>
          <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>das interações resolvidas sem humano</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 16, fontSize: 11 }}>
            <span><b style={{ color: C.accent }}>256</b> <span style={{ color: C.textTer }}>pela IA</span></span>
            <span><b style={{ color: C.blue }}>95</b> <span style={{ color: C.textTer }}>escaladas</span></span>
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "#F8FAFC", fontSize: 11, color: C.textSec }}>
            Equivalente a <b style={{ color: C.text }}>~2 vendedores</b> (economia de R$ 9.200/mês)
          </div>
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle sub="Sucesso vs Erro por dia da semana">Execuções dos Agentes</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={AGENT_EXEC_DIARIO}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: C.textTer }} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} />
              <Tooltip content={chartTT} />
              <Bar dataKey="sucesso" name="Sucesso" fill={C.accent} radius={[4,4,0,0]} stackId="a" />
              <Bar dataKey="erro" name="Erro" fill={C.red} radius={[4,4,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
        <SectionTitle>Custo Mensal por Agente vs Humano</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1 }}>
            {AGENTES.map((a, i) => {
              const maxCost = 4600;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, width: 24 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, color: C.textSec, width: 100 }}>{a.nome}</span>
                  <div style={{ flex: 1, height: 16, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(a.custoMes / maxCost) * 100}%`, background: C.accent, borderRadius: 4, minWidth: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text, width: 60, textAlign: "right" }}>R$ {a.custoMes}</span>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, padding: "8px 0", borderTop: `1px dashed ${C.border}` }}>
              <span style={{ fontSize: 14, width: 24 }}>👤</span>
              <span style={{ fontSize: 11, color: C.textSec, width: 100 }}>Vendedor humano</span>
              <div style={{ flex: 1, height: 16, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "100%", background: C.red + "88", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.red, width: 60, textAlign: "right" }}>R$ 4.600</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: C.textSec }}>
              Total IA: <b style={{ color: C.accent }}>R$ {AGENTES.reduce((a, b) => a + b.custoMes, 0)}/mês</b> — equivalente a <b>{(AGENTES.reduce((a, b) => a + b.custoMes, 0) / 4600 * 100).toFixed(0)}%</b> de um vendedor
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlunosScreen() {
  const [sel, setSel] = useState(null);
  const [busca, setBusca] = useState("");
  const filtered = ALUNOS.filter(a => !busca || a.nome.toLowerCase().includes(busca.toLowerCase()) || a.tel.includes(busca));
  const aluno = sel !== null ? ALUNOS.find(a => a.id === sel) : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: aluno ? "340px 1fr" : "1fr", gap: 16 }}>
      <div>
        <input placeholder="Buscar por nome ou telefone..." value={busca} onChange={e => setBusca(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12, marginBottom: 12, background: C.card, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(a => (
            <div key={a.id} onClick={() => setSel(a.id)}
              style={{ background: C.card, borderRadius: 12, border: `2px solid ${sel === a.id ? C.blue : C.border}`, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.nome}</div>
                  <div style={{ fontSize: 11, color: C.textTer, marginTop: 2 }}>{a.tel} · {a.produto}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {pagBadge(a.status_pag)}
                  <span style={{ fontSize: 10, color: C.textTer }}>{a.parcelas}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {aluno && (
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "24px", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{aluno.nome}</div>
              <div style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>{aluno.tel} · {aluno.email} · {aluno.ig}</div>
              <div style={{ fontSize: 12, color: C.textTer, marginTop: 2 }}>{aluno.cidade}, {aluno.estado} · {aluno.segmento}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>📱 WhatsApp</button>
              <button style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: C.blue, color: "#FFF", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>📅 Reagendar</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.textTer, fontWeight: 600, textTransform: "uppercase" }}>Score</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: aluno.score >= 80 ? C.accent : aluno.score >= 60 ? C.yellow : C.red }}>{aluno.score}</div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.textTer, fontWeight: 600, textTransform: "uppercase" }}>Faturamento</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{fmtR(aluno.faturamento)}/mês</div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.textTer, fontWeight: 600, textTransform: "uppercase" }}>Estado civil</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{aluno.estado_civil} {aluno.socio ? "· Com sócio" : ""}</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Compra</div>
            <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{aluno.produto}</div>
                <div style={{ fontSize: 11, color: C.textTer, marginTop: 2 }}>Parcelas: {aluno.parcelas}</div>
              </div>
              {pagBadge(aluno.status_pag)}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Turma Agendada</div>
            <div style={{ background: C.accentLight, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.accentDark }}>{aluno.turma}</div>
              <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>Agendado pela IA automaticamente</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Parcelas</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
              {Array.from({ length: parseInt(aluno.parcelas.split("/")[1]) }).map((_, i) => {
                const pagas = parseInt(aluno.parcelas.split("/")[0]);
                const status = i < pagas ? "paga" : aluno.status_pag === "atrasada" && i === pagas ? "atrasada" : "pendente";
                const bg = status === "paga" ? C.accent : status === "atrasada" ? C.red : "#E2E8F0";
                return (
                  <div key={i} style={{ height: 32, borderRadius: 6, background: bg + (status === "pendente" ? "" : "CC"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: status === "pendente" ? C.textTer : "#FFF" }}>
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TurmasScreen() {
  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <KPI label="Turmas abertas" value={TURMAS.filter(t => t.status === "aberta").length} accent={C.accent} icon="📋" />
        <KPI label="Vagas livres" value={TURMAS.filter(t => t.status === "aberta").reduce((a, t) => a + t.total - t.ocupadas - t.bloqueadas, 0)} accent={C.blue} icon="🪑" />
        <KPI label="Vagas bloqueadas" value={TURMAS.reduce((a, t) => a + t.bloqueadas, 0)} accent={C.red} icon="🔒" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TURMAS.map(t => {
          const free = t.total - t.ocupadas - t.bloqueadas;
          return (
            <div key={t.id} style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{t.nome}</span>
                    <Badge bg={t.status === "aberta" ? C.accentLight : C.redLight} color={t.status === "aberta" ? C.accentDark : "#991B1B"}>{t.status === "aberta" ? "Aberta" : "Lotada"}</Badge>
                  </div>
                  <div style={{ fontSize: 11, color: C.textTer, marginTop: 3 }}>{t.produto} · {t.local} · {t.inicio} a {t.fim}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: free > 5 ? C.accent : free > 0 ? C.yellow : C.red }}>{free}</div>
                  <div style={{ fontSize: 10, color: C.textTer }}>vagas livres</div>
                </div>
              </div>
              <OccBar total={t.total} ocupadas={t.ocupadas} bloqueadas={t.bloqueadas} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketingScreen() {
  const totalLeads = ORIGEM_DATA.reduce((a, b) => a + b.leads, 0);
  const totalVendas = ORIGEM_DATA.reduce((a, b) => a + b.vendas, 0);
  const pieOrig = ORIGEM_DATA.map(o => ({ name: o.origem, value: o.leads }));
  const OCOL = [C.purple, C.accent, C.blue, C.textTer];
  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        <KPI label="Total de leads" value={totalLeads} sub="100% orgânico" accent={C.purple} icon="📥" />
        <KPI label="Custo por lead" value="R$ 0" sub="Sem tráfego pago ativo" accent={C.accent} icon="💸" />
        <KPI label="Conversão geral" value={`${(totalVendas / totalLeads * 100).toFixed(1)}%`} sub={`${totalVendas} vendas`} accent={C.blue} icon="🎯" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle sub="Volume e conversão por canal">Leads por Origem</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ORIGEM_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: C.textTer }} axisLine={false} />
              <YAxis type="category" dataKey="origem" tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} width={120} />
              <Tooltip content={chartTT} />
              <Bar dataKey="leads" name="Leads" fill={C.purple + "88"} radius={[0,4,4,0]} />
              <Bar dataKey="vendas" name="Vendas" fill={C.accent} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
          <SectionTitle>Distribuição</SectionTitle>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <PieChart width={180} height={160}>
              <Pie data={pieOrig} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {pieOrig.map((_, i) => <Cell key={i} fill={OCOL[i]} />)}
              </Pie>
            </PieChart>
          </div>
          {ORIGEM_DATA.map((o, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: OCOL[i] }} />{o.origem}</span>
              <span style={{ fontWeight: 700, color: C.text }}>{o.conversao}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px" }}>
        <SectionTitle sub="Concentração de leads por dia e hora">Heatmap de Captação</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px repeat(18, 1fr)", gap: 2, fontSize: 9 }}>
            <div />
            {Array.from({ length: 18 }).map((_, i) => <div key={i} style={{ textAlign: "center", color: C.textTer, fontWeight: 500 }}>{i + 6}h</div>)}
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, di) => (
              <>
                <div key={d} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8, color: C.textSec, fontWeight: 600 }}>{d}</div>
                {Array.from({ length: 18 }).map((_, hi) => {
                  const val = HEATMAP_DATA.find(h => h.day === d && h.hour === hi + 6)?.value || 0;
                  const maxV = 14;
                  const opacity = Math.max(0.08, val / maxV);
                  return <div key={`${d}-${hi}`} style={{ height: 22, borderRadius: 3, background: C.accent, opacity, transition: "opacity 0.2s" }} title={`${d} ${hi+6}h: ${val} leads`} />;
                })}
              </>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: C.textTer }}>Menos</span>
          {[0.1, 0.3, 0.5, 0.7, 1].map((o, i) => <div key={i} style={{ width: 14, height: 10, borderRadius: 2, background: C.accent, opacity: o }} />)}
          <span style={{ fontSize: 9, color: C.textTer }}>Mais</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════
const PAGES = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "funil", label: "Funil de Vendas", icon: "🔄" },
  { key: "financeiro", label: "Financeiro", icon: "💰" },
  { key: "equipe", label: "Equipe Comercial", icon: "👥" },
  { key: "agentes", label: "Agentes IA", icon: "🤖" },
  { key: "alunos", label: "Base de Alunos", icon: "🎓" },
  { key: "turmas", label: "Turmas", icon: "📅" },
  { key: "marketing", label: "Marketing", icon: "📣" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [periodo, setPeriodo] = useState("30d");

  const titles = { home: "Visão Geral", funil: "Funil de Vendas", financeiro: "Financeiro", equipe: "Equipe Comercial", agentes: "Performance dos Agentes IA", alunos: "Base de Alunos", turmas: "Gestão de Turmas", marketing: "Marketing & Origem" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Outfit', 'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: collapsed ? 64 : 220, background: C.sidebar, display: "flex", flexDirection: "column", transition: "width 0.2s", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: collapsed ? "20px 12px" : "20px 18px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1E293B" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #16A34A, #065F46)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✂️</div>
          {!collapsed && <div style={{ overflow: "hidden" }}><div style={{ fontSize: 15, fontWeight: 800, color: "#FFF", whiteSpace: "nowrap" }}>Seu Elias</div><div style={{ fontSize: 10, color: "#64748B" }}>Painel Administrativo</div></div>}
        </div>

        <div style={{ padding: "12px 8px", flex: 1 }}>
          {PAGES.map(p => {
            const isActive = page === p.key;
            const hasBadge = (p.key === "turmas" && 2) || (p.key === "financeiro" && 4);
            return (
              <button key={p.key} onClick={() => setPage(p.key)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: collapsed ? "10px 0" : "10px 12px", borderRadius: 10, border: "none",
                  background: isActive ? "#162033" : "transparent", color: isActive ? "#FFF" : "#94A3B8",
                  fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontFamily: "inherit",
                  marginBottom: 2, transition: "all 0.15s", justifyContent: collapsed ? "center" : "flex-start", position: "relative"
                }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
                {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.label}</span>}
                {hasBadge && !collapsed && <span style={{ marginLeft: "auto", background: C.red, color: "#FFF", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{hasBadge}</span>}
                {isActive && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 2, background: C.accent }} />}
              </button>
            );
          })}
        </div>

        <button onClick={() => setCollapsed(!collapsed)} style={{ margin: "8px", padding: "8px", borderRadius: 8, border: "1px solid #1E293B", background: "transparent", color: "#64748B", fontSize: 14, cursor: "pointer" }}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{titles[page]}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 2, background: "#F1F5F9", borderRadius: 8, padding: 2 }}>
              {["hoje", "7d", "30d", "90d"].map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: periodo === p ? "#FFF" : "transparent", color: periodo === p ? C.text : C.textTer, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: periodo === p ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>
                  {p}
                </button>
              ))}
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", position: "relative" }}>
              🔔
              <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: C.red, color: "#FFF", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {page === "home" && <HomeScreen setPage={setPage} />}
          {page === "funil" && <FunilScreen />}
          {page === "financeiro" && <FinanceiroScreen />}
          {page === "equipe" && <EquipeScreen />}
          {page === "agentes" && <AgentesScreen />}
          {page === "alunos" && <AlunosScreen />}
          {page === "turmas" && <TurmasScreen />}
          {page === "marketing" && <MarketingScreen />}
        </div>
      </div>
    </div>
  );
}
