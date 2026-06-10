"use client";
import { useEffect, useMemo, useRef, useState } from "react";

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}
function pad(n) { return String(n).padStart(2, "0"); }

// simple device fingerprint (no libs): screen + tz + ua hash
function deviceFingerprint() {
  if (typeof window === "undefined") return "";
  const s = [
    navigator.userAgent, screen.width, screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.language,
  ].join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return "fp" + Math.abs(h);
}

const OPT_LABELS = (fx) => ({
  A: { ol: fx.home.code, sub: "WIN" },
  D: { ol: "DRAW", sub: "TIE" },
  B: { ol: fx.away.code, sub: "WIN" },
});

export default function MatchCard({ fx, onToast }) {
  const ko = new Date(fx.kickoff).getTime();

  const [now, setNow] = useState(null);
  const [tally, setTally] = useState(fx.tally);
  const [burn, setBurn] = useState(fx.burn);
  const [mine, setMine] = useState(null);
  const [busy, setBusy] = useState(false);
  const fp = useRef("");

  useEffect(() => { fp.current = deviceFingerprint(); }, []);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // restore a previous vote for this match (survives refresh)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("voted_" + fx.id);
      if (saved) setMine(saved);
    } catch {}
  }, [fx.id]);

  // sync from server poll (passed-in fx updates)
  useEffect(() => { setTally(fx.tally); setBurn(fx.burn); }, [fx.tally, fx.burn]);

  const total = tally.A + tally.D + tally.B;
  const result = fx.result || { status: "SCHEDULED", outcome: null };

  // status logic — voting always open until the match starts
  const phase = useMemo(() => {
    if (result.status === "FINISHED") return "ft";
    if (now != null && now >= ko) return "live";
    return "open";
  }, [now, ko, result.status]);

  const diff = ko - (now ?? ko);
  const d = Math.max(0, Math.floor(diff / 864e5));
  const h = Math.max(0, Math.floor((diff % 864e5) / 36e5));
  const m = Math.max(0, Math.floor((diff % 36e5) / 6e4));
  const s = Math.max(0, Math.floor((diff % 6e4) / 1e3));

  async function vote(choice) {
    if (phase === "ft" || busy || mine) return; // locked after one vote
    setBusy(true);
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: fx.id, choice, fingerprint: fp.current }),
      });
      const j = await r.json();
      if (!r.ok) { onToast?.(j.error || "Vote failed", true); return; }
      setTally(j.tally); setBurn(j.burn); setMine(j.your);
      try { localStorage.setItem("voted_" + fx.id, j.your); } catch {}
      if (j.already) onToast?.("You already voted — " + OPT_LABELS(fx)[j.your].ol, true);
      else onToast?.("Vote locked " + OPT_LABELS(fx)[j.your].ol);
    } catch {
      onToast?.("Network error", true);
    } finally { setBusy(false); }
  }

  const labels = OPT_LABELS(fx);
  const pct = (k) => (total ? Math.round((tally[k] / total) * 100) : 0);

  const statusText = { open: "VOTING OPEN", live: "LIVE", ft: "FULL TIME" }[phase];
  const cdLabel = phase === "open" ? "KICKOFF IN" : null;

  return (
    <div className="match">
      <div className="topbar">
        <span className="gameno">GAME {String(fx.id).padStart(2, "0")}</span>
        <span>GROUP {fx.group}</span>
        <span className={"status " + phase}>{statusText}</span>
      </div>

      <div className="teams">
        <div className="team">
          <span className="flag">{fx.home.flag}</span>
          <div className="nm">{fx.home.name}</div>
        </div>
        {phase === "ft" || phase === "live" ? (
          <div className="score">
            {result.homeScore ?? 0}<span className="x">:</span>{result.awayScore ?? 0}
          </div>
        ) : (
          <div className="vs">VS</div>
        )}
        <div className="team">
          <span className="flag">{fx.away.flag}</span>
          <div className="nm">{fx.away.name}</div>
        </div>
      </div>
      <div className="venue">{fx.venue}{fx.note ? " · " + fx.note : ""}</div>

      {cdLabel && (
        <>
          <div className="pool-h">{cdLabel}</div>
          <div className="cd">
            <div className="box"><div className="v">{now == null ? "--" : pad(d)}</div><div className="u">DAYS</div></div>
            <div className="box"><div className="v">{now == null ? "--" : pad(h)}</div><div className="u">HRS</div></div>
            <div className="box"><div className="v">{now == null ? "--" : pad(m)}</div><div className="u">MIN</div></div>
            <div className="box"><div className="v">{now == null ? "--" : pad(s)}</div><div className="u">SEC</div></div>
          </div>
        </>
      )}

      <div className="pool">
        <div className="pool-h">Prediction Pool</div>
        <div className="opts">
          {["A", "D", "B"].map((k) => (
            <button
              key={k}
              className={"opt" + (mine === k ? " picked" : "") + (k === "D" ? " draw" : "")}
              onClick={() => vote(k)}
              disabled={phase === "ft" || busy || (mine && mine !== k)}
            >
              <div className="opt-fill" style={{ height: pct(k) + "%" }} />
              <div className="opt-inner">
                <div className="ol">{labels[k].ol}</div>
                <div className="osub">{labels[k].sub}</div>
                <div className="op">{pct(k)}%</div>
                <div className="ocount">{fmt(tally[k])} votes</div>
              </div>
              {mine === k && <div className="opt-check">✓</div>}
            </button>
          ))}
        </div>
        <div className="poolmeta">
          <span>Total votes: <b>{fmt(total)}</b></span>
          <span>{mine ? "✓ You voted" : phase === "ft" ? "Result in" : phase === "live" ? "In play" : "Open now"}</span>
        </div>
      </div>

      <div className="burn">
        <div className="row">
          <div>
            <div className="lbl">{phase === "ft" ? "Burned at full time" : "Burn at full time"}</div>
            <div className="tier">{burn.tier.name} · {burn.tier.mult.toFixed(1)}× · 5% of votes</div>
          </div>
          <div className="amt"><span className="flame">🔥</span> {fmt(burn.tokens)}</div>
        </div>
      </div>

      {phase === "ft" && (
        <div className="resultban">
          <div className="ft">FULL TIME · {result.homeScore}–{result.awayScore}</div>
          <div className="won">
            Winning prediction:{" "}
            <b>{result.outcome === "A" ? fx.home.name + " win"
              : result.outcome === "B" ? fx.away.name + " win"
              : "Draw"}</b>
          </div>
        </div>
      )}
    </div>
  );
}