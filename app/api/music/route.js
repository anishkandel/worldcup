import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // audio uploads to Cloudinary live under resource_type "video"
    // put your mp3s in a folder named  goal-music  in your Cloudinary media library
    const result = await cloudinary.search
      .expression("folder:goal-music AND resource_type:video")
      .sort_by("public_id", "asc")
      .max_results(100)
      .execute();

    const tracks = (result.resources || []).map((r) => ({
      title: prettyName(r.public_id),
      src: r.secure_url,
    }));

    return NextResponse.json({ tracks });
  } catch (e) {
    return NextResponse.json({ tracks: [], error: "Could not load music" }, { status: 200 });
  }
}

function prettyName(publicId) {
  // turn "goal-music/my_track_01" -> "My Track 01"
  const base = publicId.split("/").pop() || publicId;
  return base.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}