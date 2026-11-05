"use client";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import {
  observe,
  reading,
  volume,
  type EdtaState,
  type EdtaCommand,
} from "@/lib/simulation/edta";

type Item =
  | "flask"
  | "pipette"
  | "sample"
  | "buffer"
  | "indicator"
  | "edta"
  | "wash";
type Point = { x: number; y: number };
const initialPositions: Record<Item, Point> = {
  flask: { x: 490, y: 510 },
  pipette: { x: 640, y: 400 },
  sample: { x: 170, y: 510 },
  buffer: { x: 260, y: 510 },
  indicator: { x: 330, y: 510 },
  edta: { x: 730, y: 510 },
  wash: { x: 820, y: 510 },
};
const names: Record<Item, string> = {
  flask: "Conical flask",
  pipette: "Pipette",
  sample: "Water sample",
  buffer: "Buffer bottle",
  indicator: "EBT dropper",
  edta: "EDTA bottle",
  wash: "Wash bottle",
};
export function HandsOnBench({
  s,
  send,
  select,
}: {
  s: EdtaState;
  send: (c: EdtaCommand) => void;
  select: (
    tool: "bench" | "burette" | "pipette" | "buffer" | "indicator" | "flask",
  ) => void;
}) {
  const [positions, setPositions] = useState(initialPositions);
  const [selected, setSelected] = useState<Item>("pipette");
  const [angle, setAngle] = useState(0);
  const [message, setMessage] = useState(
    "Drag the actual glassware. Dip the pipette in the sample; place bottles over the flask and tilt to pour.",
  );
  const [purpose, setPurpose] = useState<"rinse" | "fill">("rinse");
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ item: Item; start: Point; origin: Point } | null>(null);
  const o = observe(s);
  useEffect(() => {
    if (s.positioned)
      setPositions((old) => ({ ...old, flask: initialPositions.flask }));
  }, [s.positioned]);
  const point = (e: PointerEvent<SVGElement>): Point => {
    const matrix = svg.current?.getScreenCTM();
    return matrix
      ? new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse())
      : { x: 0, y: 0 };
  };
  const near = (a: Point, b: Point, d = 85) =>
    Math.hypot(a.x - b.x, a.y - b.y) < d;
  const move = (item: Item, p: Point) => {
    const next = {
      x: Math.max(45, Math.min(850, p.x)),
      y: Math.max(130, Math.min(535, p.y)),
    };
    setPositions((old) => ({ ...old, [item]: next }));
    return next;
  };
  const choose = (item: Item) => {
    setSelected(item);
    setAngle(0);
    if (item === "sample") select("pipette");
    else if (item === "edta") select("burette");
    else if (item === "wash") select("flask");
    else select(item);
  };
  const settled = (item: Item, p: Point) => {
    if (item === "flask") {
      const aligned = near(p, initialPositions.flask, 50);
      send({ type: "position", underBurette: aligned });
      setMessage(
        aligned
          ? "Flask aligned under the burette."
          : near(p, { x: 120, y: 340 }, 100)
            ? "Flask at waste. Tilt to empty and rinse with water."
            : "Flask moved off the stirrer. Flow and stirring are stopped.",
      );
    }
    if (item === "pipette" && near(p, positions.sample, 105)) {
      send(
        purpose === "rinse"
          ? { type: "rinse", vessel: "pipette" }
          : { type: "transfer", from: s.sample, to: "pipette", volumeMl: 20 },
      );
      setMessage(
        purpose === "rinse"
          ? "Pipette conditioned with sample water."
          : "Pipette filled to the 20 mL graduation mark.",
      );
    }
    if (item === "edta" && near(p, { x: 490, y: 80 }, 100)) {
      send(
        purpose === "rinse"
          ? { type: "rinse", vessel: "burette" }
          : {
              type: "transfer",
              from: "edta",
              to: "burette",
              volumeMl: 50 - volume(s.vessels.burette),
            },
      );
      setMessage(
        purpose === "rinse"
          ? "Burette conditioned with EDTA titrant."
          : "Burette filled to the 0.00 mL mark.",
      );
    }
  };
  const down = (item: Item, e: PointerEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    choose(item);
    drag.current = { item, start: point(e), origin: positions[item] };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    if (item === "flask") send({ type: "position", underBurette: false });
  };
  const moving = (e: PointerEvent<SVGElement>) => {
    const d = drag.current;
    if (!d) return;
    e.preventDefault();
    const p = point(e);
    move(d.item, {
      x: d.origin.x + p.x - d.start.x,
      y: d.origin.y + p.y - d.start.y,
    });
  };
  const up = (e: PointerEvent<SVGElement>) => {
    const d = drag.current;
    if (!d) return;
    e.preventDefault();
    const p = point(e);
    const end = move(d.item, {
      x: d.origin.x + p.x - d.start.x,
      y: d.origin.y + p.y - d.start.y,
    });
    drag.current = null;
    settled(d.item, end);
  };
  const keyboard = (item: Item, e: KeyboardEvent<SVGGElement>) => {
    const step = e.shiftKey ? 30 : 10;
    const p = positions[item];
    let next: Point | null = null;
    if (e.key === "ArrowLeft") next = { x: p.x - step, y: p.y };
    if (e.key === "ArrowRight") next = { x: p.x + step, y: p.y };
    if (e.key === "ArrowUp") next = { x: p.x, y: p.y - step };
    if (e.key === "ArrowDown") next = { x: p.x, y: p.y + step };
    if (next) {
      e.preventDefault();
      const actual = move(item, next);
      settled(item, actual);
    }
    if (e.key === "Enter") choose(item);
  };
  const pour = (nextAngle: number) => {
    setAngle(nextAngle);
    if (nextAngle < 45) return;
    const p = positions[selected];
    const f = positions.flask;
    if (selected === "flask") {
      if (near(p, { x: 120, y: 340 }, 105)) {
        send({ type: "discard" });
        setMessage("Flask contents emptied into laboratory waste.");
      } else {
        setMessage(
          "Move the flask over the waste sink before tilting to empty.",
        );
      }
      return;
    }
    if (selected === "wash") {
      if (!near(f, { x: 120, y: 340 }, 105) || !near(p, f, 110)) {
        setMessage(
          "Move the flask to waste and bring the wash bottle over it.",
        );
        return;
      }
      send({ type: "clean" });
      setMessage("Flask rinsed with water at waste.");
      return;
    }
    if (!near(p, { x: f.x, y: f.y - 85 }, 115)) {
      setMessage(
        "Bring the selected vessel over the flask opening before pouring.",
      );
      return;
    }
    if (selected === "sample") {
      setMessage(
        "Use the 20 mL pipette to measure the sample; do not pour directly from the bottle.",
      );
      return;
    }
    send({
      type: "transfer",
      from: selected,
      to: "flask",
      volumeMl: selected === "pipette" ? 20 : selected === "buffer" ? 4 : 0.05,
    });
    setMessage(
      selected === "indicator"
        ? "One EBT drop added. Return upright before the next drop."
        : "Measured liquid transferred to the flask. Return the vessel upright when finished.",
    );
  };
  const props = (item: Item) => ({
    role: "button",
    tabIndex: 0,
    "aria-label":
      item === "pipette"
        ? "Select pipette"
        : item === "buffer"
          ? "Buffer"
          : item === "indicator"
            ? "EBT"
            : `Move ${names[item]}`,
    "data-apparatus": item,
    transform: `translate(${positions[item].x} ${positions[item].y}) rotate(${selected === item ? angle : 0})`,
    onPointerDown: (e: PointerEvent<SVGGElement>) => down(item, e),
    onPointerMove: moving,
    onPointerUp: up,
    onPointerCancel: up,
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => keyboard(item, e),
    onFocus: () => choose(item),
    style: { touchAction: "none" as const },
    className: "edta-movable cursor-grab active:cursor-grabbing",
  });
  return (
    <section
      className="edta-stage edta-hands-on"
      aria-label="Movable laboratory bench"
      style={{ touchAction: "none" }}
    >
      <div className="edta-hand-toolbar flex items-center justify-between p-3 bg-bench-900/90 border-b border-bench-800 text-xs font-mono text-enamel-300">
        <strong className="text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-instrument-sky" />
          Tactile Glassware Bench • Grab, Move & Tilt
        </strong>
        <label className="flex items-center gap-2 text-enamel-400">
          Operation:{" "}
          <select
            aria-label="Rinse or fill"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as "rinse" | "fill")}
            className="bg-bench-950 border border-bench-700 rounded px-2 py-1 text-white text-xs"
          >
            <option value="rinse">Rinse</option>
            <option value="fill">Fill</option>
          </select>
        </label>
      </div>
      <svg
        ref={svg}
        viewBox="0 0 900 630"
        className="edta-scene"
        aria-label="Drag apparatus on this bench"
        onPointerMove={moving}
        onPointerUp={up}
        style={{ touchAction: "none" }}
      >
        <defs>
          <linearGradient id="hand-room" x2=".8" y2="1">
            <stop stopColor="#141824" />
            <stop offset="1" stopColor="#0c0e14" />
          </linearGradient>
          <linearGradient id="hand-glass">
            <stop stopColor="#ffffff" stopOpacity=".8" />
            <stop offset=".35" stopColor="#38bdf8" stopOpacity=".15" />
            <stop offset="1" stopColor="#1e293b" stopOpacity=".6" />
          </linearGradient>
          <clipPath id="hand-flask">
            <path d="M-14 -146H14V-105L67 -11Q71 0 57 3H-57Q-71 0 -67 -11L-14 -105Z" />
          </clipPath>
          <radialGradient id="sink-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#090b10" />
            <stop offset="85%" stopColor="#1e2638" />
            <stop offset="100%" stopColor="#2e384d" />
          </radialGradient>
        </defs>
        <rect width="900" height="630" fill="url(#hand-room)" />
        <path d="M40 0H340L680 450H160Z" fill="#38bdf8" opacity=".03" />

        {/* Bench Surface */}
        <path d="M0 450H900V630H0Z" fill="#131722" />
        <path d="M0 450H900" stroke="#222b3d" strokeWidth="2" />
        <path d="M0 580H900" stroke="#1c2230" strokeWidth="2" />

        {/* Waste sink */}
        <rect
          x="35"
          y="280"
          width="170"
          height="115"
          rx="22"
          fill="url(#sink-gradient)"
          stroke="#334155"
          strokeWidth="3"
        />
        <ellipse cx="120" cy="340" rx="65" ry="33" fill="#090c12" stroke="#1e293b" />
        <circle cx="120" cy="350" r="14" fill="#05070a" />
        <text
          x="120"
          y="420"
          textAnchor="middle"
          fill="#64748b"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          fontWeight="bold"
        >
          WASTE / RINSE SINK
        </text>

        {/* Stand Rod */}
        <rect x="375" y="60" width="12" height="480" rx="6" fill="#334155" stroke="#475569" />
        <rect x="375" y="145" width="110" height="10" rx="5" fill="#1e293b" stroke="#475569" />

        {/* Burette Tube */}
        <rect
          x="475"
          y="65"
          width="30"
          height="260"
          rx="5"
          fill="url(#hand-glass)"
          stroke="#475569"
          strokeWidth="2"
        />
        <rect
          x="480"
          y={70 + reading(s) * 4.8}
          width="20"
          height={volume(s.vessels.burette) * 4.8}
          fill="#38bdf8"
          opacity=".75"
        />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <path d={`M476 ${70 + i * 24}h12`} stroke="#cbd5e1" strokeWidth="1.5" />
            <text
              x="514"
              y={74 + i * 24}
              fontSize="10"
              fill="#94a3b8"
              fontFamily="var(--font-mono), monospace"
            >
              {i * 5}
            </text>
          </g>
        ))}
        <path
          d="M485 325V348L490 359L495 348V325"
          fill="url(#hand-glass)"
          stroke="#475569"
        />
        <rect
          x="462"
          y="321"
          width="56"
          height="12"
          rx="6"
          fill="#d97706"
          stroke="#f59e0b"
          strokeWidth="1.5"
          transform={`rotate(${s.valve * 90} 490 326)`}
        />
        {s.valve > 0 && s.positioned && (
          <path
            className="edta-stream"
            d="M490 359V450"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="4 8"
          />
        )}
        <g
          role="button"
          tabIndex={0}
          aria-label="Select burette"
          onClick={() => select("burette")}
          onKeyDown={(e) => {
            if (e.key === "Enter") select("burette");
          }}
          className="edta-movable cursor-pointer"
        >
          <rect
            x="550"
            y="180"
            width="115"
            height="52"
            rx="8"
            fill="#121622"
            stroke="#334155"
            strokeWidth="1.5"
          />
          <text
            x="607"
            y="200"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontFamily="var(--font-mono), monospace"
          >
            Burette
          </text>
          <text
            x="607"
            y="221"
            textAnchor="middle"
            fill="#22c55e"
            fontSize="15"
            fontWeight="bold"
            fontFamily="var(--font-mono), monospace"
          >
            {reading(s).toFixed(2)} mL
          </text>
        </g>

        {/* Magnetic Stirrer Base */}
        <rect x="405" y="520" width="170" height="42" rx="8" fill="#1e293b" stroke="#334155" />
        <circle cx="550" cy="541" r="5" fill={s.stirring ? "#22c55e" : "#475569"} />
        <text
          x="485"
          y="545"
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          fontWeight="bold"
        >
          MAGNETIC STIRRER
        </text>

        {/* Flask */}
        <g {...props("flask")}>
          <path
            d="M-14 -146H14V-105L67 -11Q71 0 57 3H-57Q-71 0 -67 -11L-14 -105Z"
            fill="url(#hand-glass)"
            stroke="#64748b"
            strokeWidth="2"
          />
          <g clipPath="url(#hand-flask)">
            <rect
              x="-70"
              y={-Math.min(volume(s.vessels.flask) * 1.2, 140)}
              width="140"
              height="150"
              fill={o.colourHex}
              opacity={volume(s.vessels.flask) > 0 ? 0.88 : 0}
            />
            <path
              d="M-48 -20L-6 -110V-140"
              stroke="white"
              strokeWidth="5"
              opacity=".5"
            />
          </g>
          <text
            x="0"
            y="-50"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="13"
            fontWeight="bold"
            fontFamily="var(--font-mono), monospace"
          >
            250 mL
          </text>
          <rect x="-54" y="7" width="108" height="28" rx="6" fill="#1e293b" stroke="#334155" />
          <text
            x="0"
            y="26"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="12"
            fontWeight="bold"
            fontFamily="var(--font-mono), monospace"
          >
            Conical flask
          </text>
        </g>

        {/* Reagent bottles */}
        {(["sample", "buffer", "indicator", "edta", "wash"] as const).map(
          (item) => (
            <g key={item} {...props(item)}>
              <rect
                x="-27"
                y="-100"
                width="54"
                height="100"
                rx="8"
                fill={
                  item === "indicator"
                    ? "#4c0519"
                    : item === "buffer"
                      ? "#78350f"
                      : item === "edta"
                        ? "#1e3a8a"
                        : "#1e293b"
                }
                stroke="#475569"
                strokeWidth="2"
              />
              <rect
                x="-18"
                y="-119"
                width="36"
                height="24"
                rx="4"
                fill={item === "indicator" ? "#881337" : "#0f172a"}
              />
              <rect
                x="-24"
                y="-65"
                width="48"
                height="46"
                rx="4"
                fill="#0f172a"
                stroke="#334155"
              />
              <text
                x="0"
                y="-46"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="10"
                fontWeight="bold"
                fontFamily="var(--font-mono), monospace"
              >
                {item === "sample"
                  ? s.sample === "standard"
                    ? "STANDARD"
                    : "UNKNOWN"
                  : item === "wash"
                    ? "WATER"
                    : item.toUpperCase()}
              </text>
              <text
                x="0"
                y="-30"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="10"
                fontFamily="var(--font-mono), monospace"
              >
                {item === "buffer"
                  ? "pH 10"
                  : item === "indicator"
                    ? "3 drops"
                    : ""}
              </text>
              <text
                x="0"
                y="22"
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="12"
                fontFamily="var(--font-mono), monospace"
              >
                {names[item]}
              </text>
            </g>
          ),
        )}

        {/* Pipette */}
        <g {...props("pipette")}>
          <rect x="-24" y="-105" width="48" height="220" fill="transparent" />
          <ellipse cx="0" cy="-90" rx="17" ry="24" fill="#b45309" />
          <path
            d="M-4 -65V-15Q-16 -8 -13 17Q-12 29 -4 34V110L0 127L4 110V34Q12 29 13 17Q16 -8 4 -15V-65Z"
            fill="url(#hand-glass)"
            stroke="#64748b"
            strokeWidth="2"
          />
          {volume(s.vessels.pipette) > 0 && (
            <path
              d="M-2 -15Q-13 -6 -11 16Q-10 26 -2 33V108H2V33Q10 26 11 16Q13 -6 2 -15Z"
              fill="#38bdf8"
            />
          )}
          <rect x="-45" y="132" width="90" height="28" rx="6" fill="#1e293b" stroke="#334155" />
          <text
            x="0"
            y="151"
            textAnchor="middle"
            fill="#f8fafc"
            fontSize="12"
            fontWeight="bold"
            fontFamily="var(--font-mono), monospace"
          >
            Pipette {volume(s.vessels.pipette).toFixed(0)} mL
          </text>
        </g>
      </svg>
      <div className="edta-hand-controls p-3 bg-bench-900 border-t border-bench-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <label className="flex items-center gap-3 text-enamel-300">
          <span className="font-bold text-white">{names[selected]} Tilt:</span>
          <input
            aria-label="Tilt selected apparatus"
            type="range"
            min="0"
            max="90"
            step="5"
            value={angle}
            onChange={(e) => pour(Number(e.target.value))}
            className="w-32 accent-instrument-amber cursor-pointer"
          />
          <output className="text-instrument-amber font-bold">{angle}°</output>
        </label>
        <p role="status" className="text-instrument-sky font-medium truncate max-w-md">
          {s.warning ?? message}
        </p>
      </div>
      <div className="edta-observation">
        <span className="edta-swatch" style={{ background: o.colourHex }} />
        <span data-testid="colour">{o.colour}</span>
        <span>{volume(s.vessels.flask).toFixed(2)} mL in flask</span>
        <span>{s.stirring ? "Mixing" : "Stirrer off"}</span>
      </div>
    </section>
  );
}
