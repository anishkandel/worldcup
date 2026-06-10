"use client";
import { useEffect, useRef, useState } from "react";

// PLACEHOLDER PLAYLIST — replace these with your own royalty-free tracks.
// 1. Download tracks (e.g. from Pixabay Music — free, no attribution, no DMCA).
// 2. Drop the .mp3 files into the  public/music/  folder.
// 3. List each filename + a display title below.
const PLAYLIST = [
  { title: "Track 01 — (add your mp3)", src: "/music/track1.mp3" },
  { title: "Track 02 — (add your mp3)", src: "/music/track2.mp3" },
  { title: "Track 03 — (add your mp3)", src: "/music/track3.mp3" },
];

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(true);

  const track = PLAYLIST[i];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing, i]);

  function next() { setI((p) => (p + 1) % PLAYLIST.length); }
  function prev() { setI((p) => (p - 1 + PLAYLIST.length) % PLAYLIST.length); }

  return (
    <div className={"player" + (open ? " open" : "")}>
      <audio ref={audioRef} src={track.src} onEnded={next} />
      <button className="player-toggle" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close player" : "Open player"}>
        {open ? "" : "♪"}
      </button>
      {open && (
        <div className="player-body">
          <div className="player-now">
            <div className="player-eq">
              <span style={{ animationPlayState: playing ? "running" : "paused" }} />
              <span style={{ animationPlayState: playing ? "running" : "paused" }} />
              <span style={{ animationPlayState: playing ? "running" : "paused" }} />
            </div>
            <div className="player-title">{track.title}</div>
          </div>
          <div className="player-ctrls">
            <button onClick={prev}>⏮</button>
            <button className="play" onClick={() => setPlaying((p) => !p)}>
              {playing ? "⏸" : "▶"}
            </button>
            <button onClick={next}>⏭</button>
          </div>
        </div>
      )}
    </div>
  );
}