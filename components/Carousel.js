"use client";
import { useEffect, useState } from "react";

// PLACEHOLDER SLIDES — replace `img` paths with your own images later.
// 1. Drop your images into the  public/players/  folder.
// 2. Update each slide's `img`, `name`, and `tag` below.
// NOTE: use images you have rights to (official press kits, licensed, or original art).
const SLIDES = [
  { img: "/players/player1.jpg", name: "PLAYER ONE", tag: "Add image to /public/players/" },
  { img: "/players/player2.jpg", name: "PLAYER TWO", tag: "Add image to /public/players/" },
  { img: "/players/player3.jpg", name: "PLAYER THREE", tag: "Add image to /public/players/" },
  { img: "/players/player4.jpg", name: "PLAYER FOUR", tag: "Add image to /public/players/" },
  { img: "/players/player5.jpg", name: "PLAYER FIVE", tag: "Add image to /public/players/" },
];

export default function Carousel() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {SLIDES.map((s, idx) => (
          <div className="slide" key={idx}>
            {/* Image with graceful fallback if not added yet */}
            <img
              src={s.img}
              alt={s.name}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="slide-fallback">⚽</div>
            <div className="slide-cap">
              <div className="slide-name">{s.name}</div>
              <div className="slide-tag">{s.tag}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-dots">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={"dot" + (idx === i ? " on" : "")}
            onClick={() => setI(idx)}
            aria-label={"Slide " + (idx + 1)}
          />
        ))}
      </div>
    </div>
  );
}