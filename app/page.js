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

export default function Home() {
  const [fixtures, setFixtures] = useState([]);
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(null);       // null until mounted (avoids hydration mismatch)
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
    const t = setInterval(load, 8000); // poll every 8s for live tallies/results
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

  // World Cup master countdown
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
            <span className="tag">Vote · Predict · Burn</span>
          </div>
          <span className="supply-pill">
            Supply <b>1,000,000,000</b>
          </span>
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

        <div className="wc-countdown">
          <div className="wc-lbl">⚽ World Cup 2026 kicks off in</div>
          {!mounted ? (
            <div className="wc-cd">
              <div className="b"><div className="v">--</div><div className="u">DAYS</div></div>
              <div className="b"><div className="v">--</div><div className="u">HOURS</div></div>
              <div className="b"><div className="v">--</div><div className="u">MINS</div></div>
              <div className="b"><div className="v">--</div><div className="u">SECS</div></div>
            </div>
          ) : wcLive ? (
            <div className="wc-live">🔴 THE TOURNAMENT IS LIVE</div>
          ) : (
            <div className="wc-cd">
              <div className="b"><div className="v">{pad(wcD)}</div><div className="u">DAYS</div></div>
              <div className="b"><div className="v">{pad(wcH)}</div><div className="u">HOURS</div></div>
              <div className="b"><div className="v">{pad(wcM)}</div><div className="u">MINS</div></div>
              <div className="b"><div className="v">{pad(wcS)}</div><div className="u">SECS</div></div>
            </div>
          )}
        </div>

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
          {/* <span className="sub">Voting opens 24h before kickoff · closes at the whistle</span> */}
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