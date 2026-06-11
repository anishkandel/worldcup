"use client";
import { useEffect, useState, useCallback } from "react";
import MatchCard from "../components/MatchCard";
import MusicPlayer from "../components/MusicPlayer";

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

const WC_KICKOFF = new Date("2026-06-11T21:00:00Z").getTime(); // opening match

// Original WC26 + $GOAL logo graphic (trophy + 26 + token badge). No FIFA marks.
function Logo26() {
  return (
    <svg className="logo26" viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg" aria-label="World Cup 26 · $GOAL">
      <defs>
        <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.5" stopColor="#ffd24a" />
          <stop offset="1" stopColor="#e0962a" />
        </linearGradient>
        <linearGradient id="greenG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fffd6" />
          <stop offset="1" stopColor="#00ff88" />
        </linearGradient>
      </defs>

      {/* original trophy silhouette */}
      <g fill="url(#goldG)" filter="drop-shadow(0 0 6px rgba(255,210,74,.5))">
        <path d="M24 12 h28 q5 20 -2 33 q-4 9 -12 12 v18 h11 v9 h-33 v-9 h11 v-18 q-8 -3 -12 -12 q-7 -13 -2 -33 z" />
        <rect x="22" y="86" width="32" height="8" rx="2" />
        <rect x="17" y="96" width="42" height="10" rx="2" />
      </g>

      {/* big 26 */}
      <text x="78" y="104" fontFamily="'Bebas Neue',sans-serif" fontSize="126"
        fill="url(#greenG)" letterSpacing="-5" filter="drop-shadow(0 0 10px rgba(0,255,136,.35))">26</text>

      {/* $GOAL token badge (your brand, where FIFA's mark would be) */}
      <g transform="translate(208,80)">
        <rect width="64" height="28" rx="7" fill="url(#greenG)" />
        <text x="32" y="20" fontFamily="'Bebas Neue',sans-serif" fontSize="19"
          fill="#04140c" textAnchor="middle" letterSpacing="1">$GOAL</text>
      </g>
    </svg>
  );
}

export default function Home() {
  const [fixtures, setFixtures] = useState([]);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(null);
  const [mounted, setMounted] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/fixtures", { cache: "no-store" });
      const j = await r.json();
      setFixtures(j.fixtures || []);
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((msg, err) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const totalVotes = fixtures.reduce((a, f) => a + f.total, 0);
  const totalBurn = fixtures.reduce((a, f) => a + f.burn.tokens, 0);
  const liveCount = fixtures.filter((f) => f.result?.status === "FINISHED").length;

  const wcDiff = WC_KICKOFF - (now ?? WC_KICKOFF);
  const wcLive = now != null && wcDiff <= 0;
  const wcD = Math.max(0, Math.floor(wcDiff / 864e5));
  const wcH = Math.max(0, Math.floor((wcDiff % 864e5) / 36e5));
  const wcM = Math.max(0, Math.floor((wcDiff % 36e5) / 6e4));
  const wcS = Math.max(0, Math.floor((wcDiff % 6e4) / 1e3));
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="mark">$GOAL</span>
            <span className="ver">v1</span>
            <span className="tag">Vote · Predict · Burn</span>
          </div>
          <span className="supply-pill">Supply <b>1,000,000,000</b></span>
        </div>
      </nav>

      <section className="hero">
        {/* <img className="hero-player left" src="/players/left.png" alt=""
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        <img className="hero-player right" src="/players/right.png" alt=""
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} /> */}
        <div className="embers" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, n) => (
            <span key={n} className="ember" style={{
              left: (5 + n * 6.5) + "%",
              animationDuration: (5 + (n % 5)) + "s",
              animationDelay: (n * 0.7) + "s",
            }} />
          ))}
        </div>

        <h1>EVERY MATCH<br />FEEDS THE <span className="fire">BURN</span></h1>

        {/* WC26 hype graphic + countdown */}
        {mounted && wcLive ? (
          <div className="wc26 live">
            <Logo26 />
            <div className="live-title">THE TOURNAMENT <span>IS LIVE</span> 🔴</div>
          </div>
        ) : (
          <div className="wc26">
            <Logo26 />
            <div className="wc-right">
              <div className="wc-lbl"><span className="ball">⚽</span> WORLD CUP 2026 KICKS OFF IN</div>
              <div className="wc-cd big">
                <div className="b"><div className="v">{mounted ? pad(wcD) : "--"}</div><div className="u">DAYS</div></div>
                <div className="sep">:</div>
                <div className="b"><div className="v">{mounted ? pad(wcH) : "--"}</div><div className="u">HRS</div></div>
                <div className="sep">:</div>
                <div className="b"><div className="v">{mounted ? pad(wcM) : "--"}</div><div className="u">MIN</div></div>
                <div className="sep">:</div>
                <div className="b"><div className="v">{mounted ? pad(wcS) : "--"}</div><div className="u">SEC</div></div>
              </div>
            </div>
          </div>
        )}

        <div className="strip">
          <div className="stat"><div className="n">{fmt(totalVotes)}</div><div className="l">Total votes cast</div></div>
          <div className="stat"><div className="n fire">{fmt(totalBurn)}</div><div className="l">$GOAL queued to burn</div></div>
          <div className="stat"><div className="n">{fixtures.length}</div><div className="l">Matches live</div></div>
          <div className="stat"><div className="n">{liveCount}</div><div className="l">Results final</div></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>The Fixtures</h2>
          <span className="sub">Vote anytime before kickoff · burns at full time</span>
        </div>
        <div className="grid">
          {fixtures.map((fx) => (
            <MatchCard key={fx.id} fx={fx} onToast={showToast} />
          ))}
          {fixtures.length === 0 && (
            <div style={{ color: "var(--dim)" }}>Loading fixtures…</div>
          )}
        </div>
      </section>

      <footer>
        Burns are community-voted and executed manually on Solana after full time.
        Each verified burn transaction is posted on completion.
        $GOAL has a fixed supply of <b>1,000,000,000</b>; every burn is permanent.
        <br />Not financial advice. Predictions are for entertainment.
      </footer>

      {toast && <div className={"toast show" + (toast.err ? " err" : "")}>{toast.msg}</div>}
      <MusicPlayer />
    </>
  );
}