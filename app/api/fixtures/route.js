import { NextResponse } from "next/server";
import { FIXTURES, burnFor } from "../../../data/fixtures";
import { getTally } from "../../../lib/voteStore";
import { getResults, resultForFixture } from "../../../lib/results";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = await getResults();
  const data = await Promise.all(
    FIXTURES.map(async (fx) => {
      const tally = await getTally(fx.id);
      const total = tally.A + tally.D + tally.B;
      const burn = burnFor(total);
      const result = resultForFixture(results, fx);
      return { ...fx, tally, total, burn, result };
    })
  );
  return NextResponse.json({ fixtures: data, now: Date.now() });
}