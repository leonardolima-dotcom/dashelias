"use client";

import { useEffect, useRef } from "react";

export default function NeonGridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load UnicornStudio script
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.34/dist/unicornStudio.umd.js";
    script.onload = () => {
      // @ts-expect-error UnicornStudio is loaded from CDN
      if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
        // @ts-expect-error UnicornStudio is loaded from CDN
        window.UnicornStudio.init();
        // @ts-expect-error UnicornStudio is loaded from CDN
        window.UnicornStudio.isInitialized = true;
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: try to destroy UnicornStudio instance
      try {
        // @ts-expect-error UnicornStudio is loaded from CDN
        if (window.UnicornStudio?.destroy) {
          // @ts-expect-error UnicornStudio is loaded from CDN
          window.UnicornStudio.destroy();
        }
      } catch {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 w-full h-screen saturate-0 brightness-[0.35] pointer-events-none"
      style={{
        zIndex: 0,
        maskImage:
          "linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)",
      }}
    >
      <div
        className="absolute w-full h-full left-0 top-0"
        data-us-project="bmaMERjX2VZDtPrh4Zwx"
      />
    </div>
  );
}
