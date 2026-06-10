// Persistent vote store backed by Upstash Redis.
// Votes survive restarts and are shared across all server instances.
//
// Redis keys:
//   tally:<matchId>          -> hash { A, D, B }
//   voter:<matchId>:<key>    -> the choice that voterKey made (for change/dedup)
//   rate:<ip>                -> rolling counter for rate limiting

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv(); // reads UPSTASH_REDIS_REST_URL + _TOKEN from env

// ---- rate limiting: max 5 actions / 10s per IP ----
export async function rateLimited(ip) {
  const key = "rate:" + ip;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 10); // 10s window
  return count > 5;
}

// ---- read a match tally ----
export async function getTally(matchId) {
  const t = await redis.hgetall("tally:" + matchId);
  return {
    A: Number(t?.A || 0),
    D: Number(t?.D || 0),
    B: Number(t?.B || 0),
  };
}

// ---- read tallies for many matches at once ----
export async function getTallies(matchIds) {
  const out = {};
  await Promise.all(
    matchIds.map(async (id) => { out[id] = await getTally(id); })
  );
  return out;
}

// ---- cast / change a vote ----
export async function castVote(matchId, voterKey, choice) {
  if (!["A", "D", "B"].includes(choice)) throw new Error("bad choice");
  const vKey = `voter:${matchId}:${voterKey}`;
  const prev = await redis.get(vKey);

  // LOCKED: if they already voted on this match, reject any further vote
  if (prev) {
    const tally = await getTally(matchId);
    return { tally, already: true, choice: prev };
  }

  await redis.hincrby("tally:" + matchId, choice, 1);
  await redis.set(vKey, choice);
  const tally = await getTally(matchId);
  return { tally, already: false, choice };
}

export async function getVoterChoice(matchId, voterKey) {
  return (await redis.get(`voter:${matchId}:${voterKey}`)) || null;
}