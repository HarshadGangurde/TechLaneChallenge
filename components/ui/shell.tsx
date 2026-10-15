import { Wordmark } from "@/components/ui/wordmark";

export function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col px-4 sm:px-6" style={{ maxWidth: wide ? "56rem" : "40rem" }}>
      <header className="flex items-center justify-between py-4">
        <Wordmark />
        <span className="font-mono text-xs text-muted">GDG Nashik DevFest 2026</span>
      </header>
      <main id="main" className="flex-1 pb-10">
        {children}
      </main>
      <footer className="border-t border-line py-5 text-xs text-muted">
        Your Tech. Your Path. · The track suggestion is guidance, not a career prediction.
      </footer>
    </div>
  );
}
