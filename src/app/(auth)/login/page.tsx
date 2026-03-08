"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NeonGridBackground from "@/components/ui/NeonGridBackground";

/* ───────────────────────────── SVG Icon Components ───────────────────────────── */

function LogoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-7 h-7"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        fill="#fbbf24"
        opacity=".5"
      />
      <path
        d="M3 13h8V3H3v10zm2-8h4v4H5V5zm8-2v6h8V3h-8zm2 2h4v2h-4V5zM3 21h8v-6H3v6zm2-4h4v2H5v-2zm10 4h8V11h-8v10zm2-8h4v6h-4v-2z"
        fill="#fbbf24"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-neutral-500 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 5a3 3 0 1 1-6 0a3 3 0 0 1 6 0"
        fill="currentColor"
      />
      <path
        d="M15.612 2.038C14.59 2 13.399 2 12 2C7.286 2 4.929 2 3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12c0-1.399 0-2.59-.038-3.612a4.5 4.5 0 0 1-6.35-6.35"
        fill="currentColor"
        opacity=".5"
      />
      <path
        d="M3.465 20.536C4.929 22 7.286 22 12 22s7.072 0 8.536-1.465C21.893 19.179 21.993 17.056 22 13h-3.16c-.905 0-1.358 0-1.755.183c-.398.183-.693.527-1.282 1.214l-.605.706c-.59.687-.884 1.031-1.282 1.214s-.85.183-1.755.183h-.321c-.905 0-1.358 0-1.756-.183s-.692-.527-1.281-1.214l-.606-.706c-.589-.687-.883-1.031-1.281-1.214S6.066 13 5.16 13H2c.007 4.055.107 6.179 1.465 7.535"
        fill="currentColor"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16"
        fill="#737373"
        opacity=".5"
      />
      <path
        d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"
        fill="#737373"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-6 h-6"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          d="M12 5a7 7 0 1 0 6.93 8H13a1 1 0 1 1 0-2h7a1 1 0 0 1 1 1a9 9 0 1 1-2.654-6.381a1 1 0 0 1-1.41 1.418A6.98 6.98 0 0 0 12 5"
          fill="#fbbf24"
        />
      </g>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-6 h-6"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          d="m13.064 6.685l.745-.306c.605-.24 1.387-.485 2.31-.33c1.891.318 3.195 1.339 3.972 2.693c.3.522.058 1.21-.502 1.429a2.501 2.501 0 0 0 .133 4.706c.518.17.81.745.64 1.263c-.442 1.342-1.078 2.581-1.831 3.581c-.744.988-1.652 1.808-2.663 2.209c-.672.266-1.39.16-2.078-.013l-.408-.11l-.585-.163l-.319-.079a2.3 2.3 0 0 0-.478-.067c-.13 0-.285.024-.478.067l-.32.08l-.787.218c-.748.203-1.544.36-2.283.067c-1.273-.504-2.396-1.68-3.245-3.067a13.5 13.5 0 0 1-1.784-4.986c-.227-1.554-.104-3.299.615-4.775c.74-1.521 2.096-2.705 4.163-3.053c.84-.141 1.562.048 2.14.265l.331.13l.584.241c.4.157.715.249 1.064.249c.348 0 .664-.092 1.064-.249M10.19 8.542l-.348-.143c-.731-.306-1.138-.46-1.63-.378c-1.392.235-2.221.982-2.696 1.957c-.496 1.018-.62 2.332-.434 3.61c.228 1.558.789 3.05 1.511 4.232c.738 1.205 1.571 1.972 2.275 2.25c.24.095.585.02.905-.078l.443-.146l.122-.038l.433-.12c.386-.1.821-.19 1.229-.19c.407 0 .843.09 1.229.19l.433.12l.122.038l.443.146c.32.098.665.173.905.078c.547-.216 1.183-.732 1.8-1.552c.46-.61.88-1.352 1.223-2.177A4.5 4.5 0 0 1 16 12.5c0-1.447.682-2.732 1.74-3.555c-.473-.45-1.107-.781-1.952-.924c-.443-.074-.817.043-1.42.291l-.21.087c-.541.227-1.276.535-2.158.535c-.705 0-1.317-.197-1.81-.392m1.578-5.774c.976-.977 2.475-1.061 2.828-.707c.354.353.27 1.852-.707 2.828c-.976.976-2.475 1.06-2.828.707c-.354-.353-.27-1.852.707-2.828"
          fill="#fbbf24"
        />
      </g>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-6 h-6"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 3h8.5v8.5H3V3z" fill="#fbbf24" opacity=".7" />
      <path d="M12.5 3H21v8.5h-8.5V3z" fill="#fbbf24" />
      <path d="M3 12.5h8.5V21H3v-8.5z" fill="#fbbf24" opacity=".5" />
      <path d="M12.5 12.5H21V21h-8.5v-8.5z" fill="#fbbf24" opacity=".8" />
    </svg>
  );
}

/* ───────────────────────────── Circuit Node (decorative) ───────────────────────────── */

function CircuitNodes() {
  return (
    <div className="pointer-events-none hidden md:block absolute -inset-x-24 -inset-y-8 overflow-visible">
      {/* Left upper — line goes from node into card left edge */}
      <div className="absolute -left-2 top-1/4 flex items-center gap-0">
        <div className="relative h-9 w-16 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
          <div className="h-1 w-10 rounded-full bg-neutral-700" />
          <span className="absolute -left-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)] animate-pulse" />
        </div>
        <div className="h-px w-10 bg-neutral-800" />
      </div>

      {/* Left bottom */}
      <div className="absolute -left-4 bottom-[20%] flex items-center gap-0">
        <div className="relative h-9 w-20 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
          <div className="flex gap-1">
            <span className="h-1 w-2 rounded bg-neutral-700" />
            <span className="h-1 w-2 rounded bg-neutral-700/60" />
            <span className="h-1 w-2 rounded bg-neutral-700/40" />
          </div>
          <span className="absolute -left-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)] animate-pulse" />
        </div>
        <div className="h-px w-8 bg-neutral-800" />
      </div>

      {/* Right upper */}
      <div className="absolute -right-2 top-[20%] flex items-center gap-0">
        <div className="h-px w-10 bg-neutral-800" />
        <div className="relative h-9 w-20 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
          <span className="h-1 w-6 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)]" />
          <span className="absolute -right-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)] animate-pulse" />
        </div>
      </div>

      {/* Right bottom */}
      <div className="absolute -right-4 bottom-[15%] flex items-center gap-0">
        <div className="h-px w-8 bg-neutral-800" />
        <div className="relative h-9 w-16 rounded-xl bg-neutral-900/80 shadow-[0_0_0_1px_rgba(82,82,91,0.4)] flex items-center justify-center">
          <div className="h-1 w-8 rounded-full bg-neutral-700" />
          <span className="absolute -right-1 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── Login Page ───────────────────────────── */

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // Simula autenticação — será substituído por lógica real
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push("/escolha");
  }

  return (
    <main className="min-h-screen text-neutral-100 antialiased relative">
      <NeonGridBackground />
      <section className="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
          {/* ── Card ── */}
          <div className="sm:px-10 sm:py-10 bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 max-w-md border-neutral-800 border rounded-3xl mx-auto pt-8 pr-6 pb-8 pl-6 relative shadow-xl animate-slide-up overflow-visible">
            <CircuitNodes />
            {/* Top glow bars */}
            <div className="absolute left-10 top-5 hidden h-1.5 w-16 rounded-full bg-neutral-700/60 sm:block" />
            <div className="absolute right-10 top-5 hidden h-1.5 w-10 rounded-full bg-neutral-700/30 sm:block" />

            {/* ── Logo ── */}
            <div className="flex justify-center">
              <Image
                src="/logo seu elias.png"
                alt="Seu Elias"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>

            {/* ── Heading ── */}
            <div className="mt-6 text-center">
              <h1 className="text-[22px] leading-tight tracking-tight font-semibold text-neutral-50">
                Acesse sua conta
              </h1>
              <p className="mt-2 text-sm font-normal text-neutral-400">
                Novo por aqui?{" "}
                <a
                  className="font-medium text-amber-400 hover:text-amber-300 transition"
                  href="#"
                >
                  Crie uma conta
                </a>
              </p>
            </div>

            {/* ── Form ── */}
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-400"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2.5 text-sm text-neutral-100 shadow-inner shadow-black/40 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/70 transition">
                  <EmailIcon />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="ml-3 flex-1 bg-transparent text-sm font-normal text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
                    placeholder="voce@empresa.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-xs font-medium uppercase tracking-[0.16em] text-neutral-400"
                    htmlFor="password"
                  >
                    Senha
                  </label>
                  <a
                    className="text-xs font-medium text-neutral-400 hover:text-neutral-100 transition"
                    href="#"
                  >
                    Esqueceu?
                  </a>
                </div>
                <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2.5 text-sm text-neutral-100 shadow-inner shadow-black/40 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/70 transition">
                  <LockIcon />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="ml-3 flex-1 bg-transparent text-sm font-normal text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 rounded-full px-2 py-1 text-[11px] font-medium text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-100 transition"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Primary Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-[0_14px_35px_rgba(245,158,11,0.55)] hover:bg-amber-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="h-px flex-1 bg-neutral-800/80" />
                <span className="font-medium">OU</span>
                <div className="h-px flex-1 bg-neutral-800/80" />
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-2 py-2.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80 transition"
                >
                  <GoogleIcon />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-2 py-2.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80 transition"
                >
                  <AppleIcon />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-2 py-2.5 text-xs font-medium text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80 transition"
                >
                  <MicrosoftIcon />
                </button>
              </div>

              {/* Terms */}
              <p className="pt-1 text-[11px] leading-relaxed text-neutral-500">
                Ao continuar, voce concorda com os{" "}
                <a
                  className="font-medium text-neutral-200 hover:text-amber-400 transition"
                  href="#"
                >
                  Termos de Uso
                </a>{" "}
                e a{" "}
                <a
                  className="font-medium text-neutral-200 hover:text-amber-400 transition"
                  href="#"
                >
                  Politica de Privacidade
                </a>
                .
              </p>
            </form>
          </div>
      </section>
    </main>
  );
}
