"use client";
import { useEffect, useRef, useState } from "react";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [playlist, setPlaylist] = useState([]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);

  const track = playlist[i] || null;

  // fetch playlist from Cloudinary
  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((data) => { if (data.tracks?.length) setPlaylist(data.tracks); })
      .catch(() => {});
  }, []);

  // try to autoplay once tracks load
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    a.volume = 0.5;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [track]);

  // if browser blocked autoplay, start on first user interaction anywhere
  useEffect(() => {
    if (playing || !track) return;
    const start = () => {
      const a = audioRef.current;
      if (a) a.play().then(() => setPlaying(true)).catch(() => {});
      window.removeEventListener("click", start);
    };
    window.addEventListener("click", start);
    return () => window.removeEventListener("click", start);
  }, [playing, track]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function next() { setI((p) => (p + 1) % playlist.length); }
  function prev() { setI((p) => (p - 1 + playlist.length) % playlist.length); }

  return (
    <div className="music-dock">
      {track && (
        <audio ref={audioRef} src={track.src} onEnded={next} autoPlay />
      )}

      <button className="music-mini" onClick={prev} aria-label="Previous track" disabled={!track}>
        ⏮
      </button>

      <button
        className={"music-orb" + (playing ? " on" : "")}
        onClick={toggle}
        aria-label={playing ? "Mute music" : "Play music"}
        title={track ? track.title : "Music"}
      >
        <span className="music-eq"><span /><span /><span /></span>
      </button>

      <button className="music-mini" onClick={next} aria-label="Next track" disabled={!track}>
        ⏭
      </button>
    </div>
  );
}