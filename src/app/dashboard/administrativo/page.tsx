"use client";

import { useRouter } from "next/navigation";
import NeonGridBackground from "@/components/ui/NeonGridBackground";

export default function AdministrativoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen text-neutral-100 antialiased relative">
      <NeonGridBackground />
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Back button */}
        <button
          onClick={() => router.push("/escolha")}
          className="absolute top-8 left-8 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Voltar
        </button>

        {/* Icon */}
        <div className="relative mb-8">
          <div className="size-24 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center shadow-xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
              <path d="M12 8V4H8"/>
              <rect width="16" height="12" x="4" y="8" rx="2"/>
              <path d="M2 14h2"/>
              <path d="M20 14h2"/>
              <path d="M15 13v2"/>
              <path d="M9 13v2"/>
            </svg>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl border border-amber-400/20 animate-ping" style={{ animationDuration: "2s" }} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Dashboard Administrativo
        </h1>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
          <div className="size-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Em Desenvolvimento</span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 text-center max-w-sm leading-relaxed">
          Esta área está sendo construída e estará disponível em breve com ferramentas de gestão administrativa completas.
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-64">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Progresso</span>
            <span className="text-[10px] text-amber-400 font-bold">35%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-gradient-to-r from-amber-600 to-amber-400 rounded-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full animate-pulse" style={{ animationDuration: "2s" }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
