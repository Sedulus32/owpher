import { Link } from 'react-router-dom'

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#070a12] text-[#e8e6e1] relative overflow-hidden flex flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -10%, rgba(194,181,163,0.07), transparent 60%)' }} />
      <header className="relative w-full max-w-[860px] mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <Link to="/" className="text-[11px] tracking-[0.2em] uppercase text-[#8a95a8] hover:text-[#e8e6e1] transition-colors">← Back to Home</Link>
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#c2b5a3]">Guide</span>
      </header>
      <main className="relative w-full max-w-[860px] mx-auto px-6 sm:px-8 pb-12 flex flex-col gap-10">
        <div className="flex flex-col gap-5 pt-2">
          <h1 className="text-[34px] sm:text-[42px] font-light tracking-[-0.02em] leading-tight text-[#fefefe]">How Owpher works</h1>
          <div className="h-px w-12 bg-white/15" />
          <p className="text-[15px] leading-relaxed text-[#d6dbe3] max-w-[720px]">Owpher is a one-slip inbox. You do not get a long chat. You get one note. When a new note arrives, it replaces the old one. The key is the address. Anyone who has the key can leave a slip. Only the browser that created the key can open it.</p>
        </div>
        <div className="flex flex-col gap-8">
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 flex flex-col gap-4">
            <h2 className="text-[13px] tracking-[0.18em] uppercase text-[#c2b5a3] font-semibold">1 — Make an inbox</h2>
            <p className="text-[15px] leading-relaxed text-[#d6dbe3]">Areeb opens Owpher, clicks Get started, and generates an inbox key. The key looks like <span className="font-mono text-[#c2b5a3] bg-white/5 px-1.5 py-0.5 rounded text-sm">PWZXY6YFCAKX</span>. That key stays in his browser. He names it School. The name is only a label. The key is the real address.</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0f141f] px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-mono text-[#c2b5a3]">PWZXY6YFCAKX</span>
              <span className="text-xs text-[#8a95a8]">label: School</span>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 flex flex-col gap-4">
            <h2 className="text-[13px] tracking-[0.18em] uppercase text-[#c2b5a3] font-semibold">2 — Share the key, not a password</h2>
            <p className="text-[15px] leading-relaxed text-[#d6dbe3]">Areeb sends the key to Meera. He can copy it or read it out. He does not send a password. Meera adds that key in her contact list and names it Areeb. She still cannot open his inbox. She can only leave a slip there.</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0f141f] px-4 py-3 flex flex-col gap-1">
              <span className="text-xs text-[#6b7689] uppercase tracking-wide">Meera's contact</span>
              <span className="text-sm text-[#e8e6e1]">Areeb — PWZXY6YFCAKX <span className="text-[#6b7689]">· send only</span></span>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 flex flex-col gap-4">
            <h2 className="text-[13px] tracking-[0.18em] uppercase text-[#c2b5a3] font-semibold">3 — Send one slip</h2>
            <p className="text-[15px] leading-relaxed text-[#d6dbe3]">Meera types “Bring the maths notebook tomorrow” and sends it to PWZXY6YFCAKX. Owpher stores that one slip for that key. If she sends “Actually bring the blue one” before Areeb opens the first, the first line is gone. The inbox holds the latest slip only.</p>
            <div className="flex flex-col gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-[#070a12] px-4 py-3 text-sm text-[#8a95a8] line-through decoration-white/20">Bring the maths notebook tomorrow</div>
              <div className="rounded-xl border border-[#c2b5a3]/20 bg-[#c2b5a3]/10 px-4 py-3 text-sm text-[#e8e6e1]">Actually bring the blue one — <span className="text-[#c2b5a3]">kept</span></div>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 flex flex-col gap-4">
            <h2 className="text-[13px] tracking-[0.18em] uppercase text-[#c2b5a3] font-semibold">4 — Open it once</h2>
            <p className="text-[15px] leading-relaxed text-[#d6dbe3]">Areeb clicks the School inbox. The Reply box shows “Actually bring the blue one.” He does not need the Refresh button for a normal open. Refresh only checks again. The page must not reload. After he has read it, the next new slip replaces it.</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0f141f] px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-[#e8e6e1]">Reply box: “Actually bring the blue one.”</span>
              <span className="text-[11px] px-2 py-1 rounded-full border border-white/10 text-[#8a95a8]">Refresh ↻ only if needed</span>
            </div>
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 flex flex-col gap-4">
            <h2 className="text-[13px] tracking-[0.18em] uppercase text-[#c2b5a3] font-semibold">5 — Two people, two keys</h2>
            <p className="text-[15px] leading-relaxed text-[#d6dbe3]">Meera generates her own key and sends it to Areeb. Now there are two inboxes. Areeb writes to Meera's key. Meera writes to Areeb's key. Owpher is not a group chat. Each key has its own single slip.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#070a12] px-4 py-3 text-center"><div className="text-xs text-[#6b7689] uppercase tracking-wide">Areeb's inbox</div><div className="font-mono text-sm text-[#c2b5a3] mt-1">PWZXY6YFCAKX</div><div className="text-xs text-[#8a95a8] mt-1">Meera writes here</div></div>
              <div className="rounded-xl border border-white/[0.06] bg-[#070a12] px-4 py-3 text-center"><div className="text-xs text-[#6b7689] uppercase tracking-wide">Meera's inbox</div><div className="font-mono text-sm text-[#c2b5a3] mt-1">Q84KZ2MNPX1Y</div><div className="text-xs text-[#8a95a8] mt-1">Areeb writes here</div></div>
            </div>
          </section>
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 sm:p-7 flex flex-col gap-3">
            <h2 className="text-[13px] tracking-[0.18em] uppercase text-amber-200/80 font-semibold">6 — What not to send</h2>
            <p className="text-[15px] leading-relaxed text-[#d6dbe3]">Do not send passwords, exam answers, or anything you cannot lose. A slip can be replaced. The free server can also sleep, so the first send after a quiet period can take up to a minute.</p>
          </section>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-[#e8e6e1] text-[#0a0c14] px-8 py-3.5 text-sm font-semibold hover:bg-white transition-colors">Get started</Link>
          <Link to="/" className="inline-flex items-center justify-center rounded-full border border-white/15 text-[#e8e6e1] px-8 py-3.5 text-sm font-medium hover:border-white/25 hover:bg-white/[0.04] transition-colors">Back to home</Link>
        </div>
      </main>
      <footer className="relative w-full max-w-[860px] mx-auto px-6 sm:px-8 py-6 flex items-center justify-between border-t border-white/[0.06] mt-4">
        <span className="text-[11px] text-[#5a657a]">Owpher — one slip at a time</span>
        <Link to="/" className="text-[11px] text-[#8a95a8] hover:text-[#e8e6e1]">Home</Link>
      </footer>
    </div>
  )
}
