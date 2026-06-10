// World Cup 2026 fixtures — opening slate.
// kickoff is ISO UTC. Mexico City is CST (UTC-6); 3pm local = 21:00 UTC.
// Voting opens 24h before kickoff and closes at kickoff; result decided at full time.
// `fdId` = football-data.org match id (fill in when known) for live result mapping.

export const FIXTURES = [
  {
    id: 1,
    group: "A",
    home: { name: "Mexico", flag: "🇲🇽", code: "MEX" },
    away: { name: "South Africa", flag: "🇿🇦", code: "RSA" },
    venue: "Estadio Azteca, Mexico City",
    kickoff: "2026-06-11T21:00:00Z",
    note: "Opening match",
    fdId: null,
  },
  {
    id: 2,
    group: "A",
    home: { name: "South Korea", flag: "🇰🇷", code: "KOR" },
    away: { name: "Czechia", flag: "🇨🇿", code: "CZE" },
    venue: "Estadio Akron, Zapopan",
    kickoff: "2026-06-12T04:00:00Z",
    fdId: null,
  },
  {
    id: 3,
    group: "B",
    home: { name: "Canada", flag: "🇨🇦", code: "CAN" },
    away: { name: "Bosnia & Herzegovina", flag: "🇧🇦", code: "BIH" },
    venue: "BMO Field, Toronto",
    kickoff: "2026-06-12T19:00:00Z",
    fdId: null,
  },
  {
    id: 4,
    group: "D",
    home: { name: "USA", flag: "🇺🇸", code: "USA" },
    away: { name: "Paraguay", flag: "🇵🇾", code: "PAR" },
    venue: "SoFi Stadium, Inglewood",
    kickoff: "2026-06-13T01:00:00Z",
    fdId: null,
  },
  {
    id: 5,
    group: "B",
    home: { name: "Qatar", flag: "🇶🇦", code: "QAT" },
    away: { name: "Switzerland", flag: "🇨🇭", code: "SUI" },
    venue: "Levi's Stadium, Santa Clara",
    kickoff: "2026-06-13T19:00:00Z",
    fdId: null,
  },
  {
    id: 6,
    group: "C",
    home: { name: "Brazil", flag: "🇧🇷", code: "BRA" },
    away: { name: "Morocco", flag: "🇲🇦", code: "MAR" },
    venue: "MetLife Stadium, East Rutherford",
    kickoff: "2026-06-13T22:00:00Z",
    fdId: null,
  },
  {
    id: 7,
    group: "C",
    home: { name: "Haiti", flag: "🇭🇹", code: "HAI" },
    away: { name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO" },
    venue: "Gillette Stadium, Foxborough",
    kickoff: "2026-06-14T01:00:00Z",
    fdId: null,
  },
  {
    id: 8,
    group: "D",
    home: { name: "Australia", flag: "🇦🇺", code: "AUS" },
    away: { name: "Türkiye", flag: "🇹🇷", code: "TUR" },
    venue: "BC Place, Vancouver",
    kickoff: "2026-06-14T04:00:00Z",
    fdId: null,
  },
];

export const TOKEN = {
  symbol: process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "$GOAL",
  supply: Number(process.env.NEXT_PUBLIC_TOKEN_SUPPLY || 1_000_000_000),
  mint: process.env.NEXT_PUBLIC_TOKEN_MINT || "",
};

// Burn tiers: total votes -> multiplier on the 5% base burn.
export const BURN_TIERS = [
  { min: 0, mult: 1.0, name: "TIER 0" },
  { min: 500, mult: 1.5, name: "TIER 1" },
  { min: 2000, mult: 2.0, name: "TIER 2" },
  { min: 10000, mult: 3.0, name: "TIER 3" },
  { min: 50000, mult: 5.0, name: "TIER 4" },
];

export function burnFor(totalVotes) {
  let tier = BURN_TIERS[0];
  for (const t of BURN_TIERS) if (totalVotes >= t.min) tier = t;
  return { tier, tokens: Math.round(totalVotes * 0.05 * tier.mult) };
}