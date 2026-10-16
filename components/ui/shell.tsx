import { Wordmark } from "@/components/ui/wordmark";

export function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col px-4 sm:px-6" style={{ maxWidth: wide ? "56rem" : "40rem" }}>
      <header className="flex items-center justify-between gap-3 py-4">
        <Wordmark />
        <span className="nb-shadow-sm rounded-full border-2 border-ink bg-white px-3 py-1 whitespace-nowrap font-mono text-[11px] font-bold uppercase tracking-wider">
          DevFest 2026
        </span>
      </header>
      <main id="main" className="flex-1 pb-10">
        {children}
      </main>
      <footer className="border-t-2 border-dashed border-ink/30 py-5 font-mono text-xs text-muted">
        Your Tech. Your Path. · The track suggestion is guidance, not a career prediction.
      </footer>
    </div>
  );
}
