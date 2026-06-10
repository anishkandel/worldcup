// Results source with fallback chain:
// 1) football-data.org (if FOOTBALL_DATA_API_KEY set) — reliable, slightly delayed
// 2) openfootball/worldcup.json — free, no key, updated ~daily by hand
//
// Returns a normalized result per match: { status, homeScore, awayScore, outcome }
// outcome: 'A' (home win) | 'B' (away win) | 'D' (draw) | null (not finished)

let cache = { at: 0, data: null };
const TTL = 30_000; // 30s cache to respect free rate limits

const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

function outcomeFrom(h, a) {
  if (h == null || a == null) return null;
  if (h > a) return "A";
  if (a > h) return "B";
  return "D";
}

async function fromFootballData() {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) return null;
  try {
    // WC competition code on football-data is "WC"
    const r = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
      headers: { "X-Auth-Token": key },
      next: { revalidate: 30 },
    });
    if (!r.ok) return null;
    const j = await r.json();
    const out = {};
    for (const m of j.matches || []) {
      const h = m.score?.fullTime?.home ?? null;
      const a = m.score?.fullTime?.away ?? null;
      out[`${m.homeTeam?.name}|${m.awayTeam?.name}`] = {
        status: m.status, // SCHEDULED | LIVE | IN_PLAY | PAUSED | FINISHED
        homeScore: h,
        awayScore: a,
        outcome: m.status === "FINISHED" ? outcomeFrom(h, a) : null,
      };
    }
    return out;
  } catch {
    return null;
  }
}

async function fromOpenFootball() {
  try {
    const r = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    const j = await r.json();
    const out = {};
    for (const round of j.rounds || []) {
      for (const m of round.matches || []) {
        const h = m.score?.ft?.[0] ?? null;
        const a = m.score?.ft?.[1] ?? null;
        const finished = h != null && a != null;
        out[`${m.team1?.name || m.team1}|${m.team2?.name || m.team2}`] = {
          status: finished ? "FINISHED" : "SCHEDULED",
          homeScore: h,
          awayScore: a,
          outcome: finished ? outcomeFrom(h, a) : null,
        };
      }
    }
    return out;
  } catch {
    return null;
  }
}

export async function getResults() {
  if (Date.now() - cache.at < TTL && cache.data) return cache.data;
  const data = (await fromFootballData()) || (await fromOpenFootball()) || {};
  cache = { at: Date.now(), data };
  return data;
}

// match a fixture against the results map by team names (loose)
export function resultForFixture(results, fx) {
  const tryKeys = [
    `${fx.home.name}|${fx.away.name}`,
    `${fx.away.name}|${fx.home.name}`,
  ];
  for (const k of tryKeys) {
    if (results[k]) {
      const r = results[k];
      // if matched reversed, flip outcome
      if (k === tryKeys[1] && r.outcome) {
        const flipped = r.outcome === "A" ? "B" : r.outcome === "B" ? "A" : "D";
        return { ...r, homeScore: r.awayScore, awayScore: r.homeScore, outcome: flipped };
      }
      return r;
    }
  }
  return { status: "SCHEDULED", homeScore: null, awayScore: null, outcome: null };
}