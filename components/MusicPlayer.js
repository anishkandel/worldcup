"use client";
import { useEffect, useRef, useState } from "react";

const FALLBACK = [
  { title: "Loading tracks…", src: "" },
];

export default function MusicPlayer() {
  const audioRef           = useRef(null);
  const [playlist, setPlaylist] = useState(FALLBACK);
  const [i, setI]          = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen]    = useState(true);
  const [loading, setLoading] = useState(true);

  // ── fetch playlist from Cloudinary via our API route ──
  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((data) => {
        if (data.tracks?.length) {
          setPlaylist(data.tracks);
        } else {
          setPlaylist([{ title: "No tracks found — add mp3s to Cloudinary goal-music folder", src: "" }]);
        }
      })
      .catch(() => {
        setPlaylist([{ title: "Could not load tracks", src: "" }]);
      })
      .finally(() => setLoading(false));
  }, []);

  const track = playlist[i] ?? playlist[0];

  // ── play / pause ──
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track.src) return;
    if (playing) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [playing, i, playlist]);

  // ── when track changes, reload audio src ──
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track.src) return;
    a.load();
    if (playing) a.play().catch(() => setPlaying(false));
  }, [i, playlist]);

  function next() { setI((p) => (p + 1) % playlist.length); }
  function prev() { setI((p) => (p - 1 + playlist.length) % playlist.length); }

  return (
    <div className={"player" + (open ? " open" : "")}>
      <audio ref={audioRef} src={track.src || ""} onEnded={next} />

      <button
        className="player-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close player" : "Open player"}
      >
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
            <div className="player-title">
              {loading ? "Loading playlist…" : track.title}
            </div>
          </div>

          {/* track counter */}
          {!loading && playlist.length > 1 && (
            <div className="player-count">
              {i + 1} / {playlist.length}
            </div>
          )}

          <div className="player-ctrls">
            <button onClick={prev} disabled={loading || !track.src}>⏮</button>
            <button
              className="play"
              onClick={() => setPlaying((p) => !p)}
              disabled={loading || !track.src}
            >
              {playing ? "⏸" : "▶"}
            </button>
            <button onClick={next} disabled={loading || !track.src}>⏭</button>
          </div>
        </div>
      )}
    </div>
  );
}