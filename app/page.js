"use client";

import { useRef, useState } from "react";

const TOTAL_HITS = 6;

// 8 fileiras intercaladas; cor derivada do índice para o HTML do servidor e do cliente coincidirem
const ROWS = Array.from({ length: 8 }, (_, r) =>
  (r % 2 === 0 ? [2, 2, 2, 2] : [1, 2, 2, 2, 1]).map((size, c) => {
    const n = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
    return { size, color: `hsl(${20 + n * 15}, ${8 + n * 8}%, ${42 + ((n * 7) % 1) * 16}%)` };
  })
);

export default function Page() {
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const game = useRef({ launched: 0, hits: 0 });
  const hero = useRef(null);
  const hand = useRef(null);
  const wall = useRef(null);
  const flash = useRef(null);

  const aliveBricks = () => [...wall.current.querySelectorAll(".brick:not([data-gone])")];

  function replay(el, className) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  function cast() {
    if (game.current.launched >= TOTAL_HITS) return;
    game.current.launched++;
    setStarted(true);
    replay(hero.current, "cast");

    const from = hand.current.getBoundingClientRect();
    const wallBox = wall.current.getBoundingClientRect();
    const top = Math.min(wallBox.bottom, ...aliveBricks().map((b) => b.getBoundingClientRect().top));
    const x0 = from.left + from.width / 2;
    const y0 = from.top + from.height / 2;
    const x1 = wallBox.left + 12;
    const y1 = top + (wallBox.bottom - top) * (0.25 + Math.random() * 0.4);

    const orb = document.createElement("div");
    orb.className = "orb";
    document.body.appendChild(orb);
    orb
      .animate(
        [
          { transform: `translate(${x0}px, ${y0}px) scale(0.4)` },
          { transform: `translate(${x1}px, ${y1}px) scale(1.2)` },
        ],
        { duration: 420, easing: "ease-in" }
      )
      .finished.then(() => {
        orb.remove();
        impact();
      });
  }

  function impact() {
    const hits = ++game.current.hits;
    const alive = aliveBricks();
    const count = hits >= TOTAL_HITS ? alive.length : Math.ceil(alive.length / (TOTAL_HITS - hits + 1));

    // derruba de cima para baixo, com um pouco de acaso
    alive
      .map((b) => ({ b, k: Number(b.dataset.row) + Math.random() * 1.8 }))
      .sort((a, c) => a.k - c.k)
      .slice(0, count)
      .forEach(({ b }) => {
        b.dataset.gone = "1";
        const dx = 60 + Math.random() * 260;
        const dy = -120 + Math.random() * 380;
        const rot = (Math.random() - 0.3) * 720;
        b.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: `translate(${dx * 0.6}px, ${Math.min(dy, 0) - 40}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.4 },
            { transform: `translate(${dx}px, ${dy + 200}px) rotate(${rot}deg)`, opacity: 0 },
          ],
          { duration: 700 + Math.random() * 400, easing: "ease-out", fill: "forwards" }
        );
      });

    replay(wall.current, "shake");
    flash.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350 });

    if (hits >= TOTAL_HITS) setTimeout(() => setDone(true), 800);
  }

  function reset() {
    game.current = { launched: 0, hits: 0 };
    setRound((n) => n + 1); // remonta a muralha
    setStarted(false);
    setDone(false);
  }

  return (
    <main className={`stage${done ? " done" : ""}`}>
      <div className="hero-side">
        <p className={`hint${started ? " hidden" : ""}`}>
          Clique na heroína para lançar o poder!<span>▼</span>
        </p>

        <button
          className="hero"
          ref={hero}
          onClick={cast}
          aria-label="Feiticeira LEGO: clique para lançar o poder na muralha"
        >
          <svg viewBox="0 0 240 270" aria-hidden="true">
            <defs>
              <radialGradient id="magic">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.35" stopColor="#ff8fa6" />
                <stop offset="0.7" stopColor="#ff2d55" stopOpacity="0.8" />
                <stop offset="1" stopColor="#ff2d55" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* capa */}
            <path d="M62 96 L138 96 L168 252 L32 252 Z" fill="#7a0c1c" />
            {/* cabelo (trás) */}
            <rect x="50" y="20" width="100" height="104" rx="30" fill="#8a3b1f" />

            {/* braço esquerdo */}
            <g transform="rotate(15 56 104)">
              <rect x="42" y="100" width="20" height="58" rx="9" fill="#c8102e" />
              <circle cx="52" cy="166" r="10" fill="#ffcf3f" />
            </g>

            {/* pernas */}
            <rect x="56" y="180" width="88" height="16" fill="#4f0812" />
            <rect x="56" y="194" width="42" height="66" rx="3" fill="#7a0c1c" />
            <rect x="102" y="194" width="42" height="66" rx="3" fill="#7a0c1c" />
            <rect x="56" y="246" width="42" height="14" rx="3" fill="#4f0812" />
            <rect x="102" y="246" width="42" height="14" rx="3" fill="#4f0812" />

            {/* tronco */}
            <path d="M62 96 L138 96 L146 182 L54 182 Z" fill="#c8102e" />
            <path d="M86 96 L100 114 L114 96 Z" fill="#ffcf3f" />
            <path d="M78 120 L100 132 L122 120 L118 176 L82 176 Z" fill="#7a0c1c" />
            <path
              d="M100 132 V176 M88 140 L112 150 M112 140 L88 150 M88 156 L112 166 M112 156 L88 166"
              stroke="#c8102e"
              strokeWidth="2.5"
              fill="none"
            />

            {/* pescoço e cabeça */}
            <rect x="88" y="84" width="24" height="12" fill="#e3b02a" />
            <rect x="68" y="30" width="64" height="56" rx="14" fill="#ffcf3f" />

            {/* cabelo (frente) */}
            <path d="M60 70 Q56 18 100 16 Q144 18 140 70 L132 70 Q132 40 100 34 Q68 40 68 70 Z" fill="#8a3b1f" />
            {/* tiara */}
            <path
              d="M70 30 Q76 42 86 43 L100 52 L114 43 Q124 42 130 30 Q129 50 114 51 L100 60 L86 51 Q71 50 70 30 Z"
              fill="#c8102e"
              stroke="#7a0c1c"
              strokeWidth="1.5"
            />

            {/* rosto */}
            <circle cx="87" cy="67" r="4.2" fill="#1a1a1a" />
            <circle cx="113" cy="67" r="4.2" fill="#1a1a1a" />
            <circle cx="88.4" cy="65.6" r="1.3" fill="#fff" />
            <circle cx="114.4" cy="65.6" r="1.3" fill="#fff" />
            <path d="M81 62 L84 64 M119 62 L116 64" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M90 76 Q100 83 110 76" stroke="#a3122a" strokeWidth="2.6" fill="none" strokeLinecap="round" />

            {/* braço direito (apontando para a muralha) */}
            <g transform="rotate(-100 144 104)">
              <rect x="138" y="100" width="20" height="58" rx="9" fill="#c8102e" />
              <circle cx="148" cy="166" r="10" fill="#ffcf3f" />
            </g>
            <circle ref={hand} className="hand-glow" cx="204" cy="89" r="20" fill="url(#magic)" />
          </svg>
        </button>
      </div>

      <div className="wall" ref={wall} key={round} role="img" aria-label="Muralha de blocos">
        {ROWS.map((row, r) => (
          <div className="row" key={r}>
            {row.map(({ size, color }, c) => (
              <div
                key={c}
                className={`brick${size === 1 ? " half" : ""}`}
                style={{ background: color }}
                data-row={r}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flash" ref={flash} />

      <section className="finale" aria-live="polite">
        <h1 className="neon big">Família é para sempre!</h1>
        <p className="neon small">Matheus, Ruth e Dora.</p>
        <button className="again" onClick={reset}>
          Jogar de novo
        </button>
      </section>
    </main>
  );
}
