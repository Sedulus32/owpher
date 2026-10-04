import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070a12] text-[#e8e6e1] relative overflow-hidden flex flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(194,181,163,0.08), transparent 60%), radial-gradient(ellipse 70% 50% at 90% 90%, rgba(120,130,150,0.06), transparent 70%)' }} />
      <header className="relative w-full max-w-[1100px] mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.28em] font-medium text-[#c2b5a3] uppercase">Owpher — One slip</span>
        <Link to="/how" className="text-xs tracking-wide text-[#8a95a8] hover:text-[#e8e6e1] transition-colors border border-white/10 rounded-full px-4 py-1.5">How it works</Link>
      </header>
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-10 sm:py-16">
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-[56px] sm:text-[72px] lg:text-[88px] font-extralight tracking-[-0.04em] leading-[0.9] text-[#fefefe]">Owpher</h1>
              <p className="text-[15px] sm:text-[16px] tracking-[0.18em] uppercase text-[#c2b5a3] font-medium">One slip. Next message replaces it.</p>
              <div className="h-px w-12 bg-white/15 mt-2" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-[#e8e6e1] text-[#0a0c14] px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-white transition-colors">Get started</Link>
              <Link to="/how" className="inline-flex items-center justify-center rounded-full border border-white/15 text-[#e8e6e1] px-8 py-3.5 text-sm font-medium tracking-wide hover:border-white/25 hover:bg-white/[0.04] transition-colors">How it works</Link>
            </div>
            <p className="text-xs text-[#6b7689] max-w-[420px] leading-relaxed">Anonymous. No chat history. No profiles. A key is an address — keep it, share it, one slip at a time.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="relative rounded-[20px] border border-white/10 bg-white/[0.02] backdrop-blur p-[1px] overflow-hidden">
              <div className="rounded-[19px] bg-[#0f141f]/90 p-7 sm:p-8 flex flex-col gap-6">
                <div className="relative h-[112px] rounded-xl border border-white/[0.06] bg-[#070a12] overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 320 112" className="w-full h-full" fill="none" aria-hidden>
                    <rect x="0.5" y="0.5" width="319" height="111" rx="11" stroke="white" strokeOpacity="0.06" />
                    <path d="M 24 72 C 70 36, 130 96, 180 62 S 260 48, 296 72" stroke="#c2b5a3" strokeOpacity="0.55" strokeWidth="1.1" />
                    <path d="M 24 84 C 80 52, 150 108, 210 74 S 270 60, 296 84" stroke="white" strokeOpacity="0.10" strokeWidth="1" />
                    <circle cx="74" cy="58" r="18" stroke="white" strokeOpacity="0.09" strokeWidth="1" />
                    <circle cx="244" cy="62" r="26" stroke="white" strokeOpacity="0.07" strokeWidth="1" />
                    <rect x="132" y="36" width="52" height="44" rx="6" stroke="#c2b5a3" strokeOpacity="0.18" strokeWidth="1" />
                    <line x1="132" y1="58" x2="184" y2="58" stroke="white" strokeOpacity="0.06" strokeWidth="1" />
                    <circle cx="158" cy="58" r="2.5" fill="#c2b5a3" fillOpacity="0.9" />
                  </svg>
                  <span className="absolute bottom-2 right-3 text-[9px] tracking-[0.2em] uppercase text-white/30">one slip • one key</span>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#c2b5a3] font-medium">A private one-slip inbox</p>
                  <p className="text-[15px] leading-relaxed text-[#d6dbe3]">You share a key. The next message replaces the last one.</p>
                  <p className="text-sm leading-relaxed text-[#8a95a8]">No threads, no history. Only the latest slip remains — quiet by design.</p>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="flex items-center gap-3 text-[11px] text-[#6b7689]">
                  <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#c2b5a3]" /> E2E encrypted</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span>Auto-clears after reading</span>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#5a657a] px-1">
              <span className="w-6 h-px bg-white/10" />
              <span>Dark • anonymous • ephemeral</span>
            </div>
          </div>
        </div>
      </main>
      <footer className="relative w-full max-w-[1100px] mx-auto px-6 sm:px-8 py-6 flex items-center justify-between border-t border-white/[0.06]">
        <span className="text-[11px] text-[#5a657a]">© Owpher — one slip at a time</span>
        <span className="text-[11px] tracking-wide text-[#5a657a]">Key is the address</span>
      </footer>
    </div>
  )
}
