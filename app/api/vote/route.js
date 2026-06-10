import { NextResponse } from "next/server";
import { FIXTURES, burnFor } from "../../../data/fixtures";
import { castVote, rateLimited } from "../../../lib/voteStore";
import { getIp, voterKey } from "../../../lib/voter";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const ip = getIp(req);
  if (await rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  let body;
  try { body = await req.json(); } catch { return bad("Invalid body"); }
  const { matchId, choice, fingerprint } = body || {};

  const fx = FIXTURES.find((f) => f.id === matchId);
  if (!fx) return bad("Unknown match");
  if (!["A", "D", "B"].includes(choice)) return bad("Invalid choice");

  const key = voterKey(ip, fingerprint);
  const res = await castVote(matchId, key, choice);
  const tally = res.tally;
  const total = tally.A + tally.D + tally.B;
  return NextResponse.json({
    ok: true,
    tally,
    total,
    burn: burnFor(total),
    your: res.choice,
    already: res.already,   // true if they had already voted (locked)
  });
}

function bad(msg) {
  return NextResponse.json({ error: msg }, { status: 400 });
}