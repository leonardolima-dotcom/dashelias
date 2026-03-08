"use client";

import { useRouter } from "next/navigation";
import { useRef, type MouseEvent } from "react";
import NeonGridBackground from "@/components/ui/NeonGridBackground";

const dashboards = [
  {
    id: "marketing",
    title: "Marketing",
    description: "Campanhas, leads e performance de marketing",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: "comercial",
    title: "Comercial",
    description: "Vendas, pipeline e metas comerciais",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "administrativo",
    title: "Administrativo",
    description: "Financeiro, RH e operacional",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

function TiltCard({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const cardRef = useRef<HTMLButtonElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col items-center gap-4 rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 p-8 shadow-xl cursor-pointer hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
      style={{ transition: "transform 0.15s ease-out, border-color 0.3s, box-shadow 0.3s", willChange: "transform" }}
    >
      {children}
    </button>
  );
}

export default function EscolhaPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen text-neutral-100 antialiased relative">
      <NeonGridBackground />

      <section className="relative flex flex-col items-center justify-center min-h-screen py-16 px-4" style={{ zIndex: 10 }}>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2 animate-fade-in">
          Escolha seu Dashboard
        </h1>
        <p className="text-neutral-400 text-sm mb-10 animate-fade-in">
          Selecione o painel que deseja acessar
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full animate-slide-up">
          {dashboards.map((dash) => (
            <TiltCard key={dash.id} onClick={() => router.push(`/dashboard/${dash.id}`)}>
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-neutral-950 text-amber-400 border border-neutral-800 group-hover:border-amber-500/40 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] transition-all duration-300">
                {dash.icon}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-neutral-50 group-hover:text-amber-400 transition-colors">
                  {dash.title}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  {dash.description}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>
    </main>
  );
}
