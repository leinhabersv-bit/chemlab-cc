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
  "flask" | "pipette" | "sample" | "buffer" | "indicator" | "edta" | "wash";
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
          ? "Pipette rinsed with the sample. Select Fill and dip again to aspirate 20 mL."
          : "20 mL sample drawn into the pipette. Move the pipette over the flask and tilt to drain.",
      );
    }
  };
  const down = (item: Item, e: PointerEvent<SVGGElement>) => {
    e.preventDefault();
    e.stopPropagation();
    choose(item);
    drag.current = { item, start: point(e), origin: positions[item] };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (item === "flask") send({ type: "position", underBurette: false });
  };
  const moving = (e: PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = point(e);
    move(d.item, {
      x: d.origin.x + p.x - d.start.x,
      y: d.origin.y + p.y - d.start.y,
    });
  };
  const up = (e: PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = point(e);
    const end = move(d.item, {
      x: d.origin.x + p.x - d.start.x,
      y: d.origin.y + p.y - d.start.y,
    });
    drag.current = null;
    settled(d.item, end);
  };
  const keyboard = (item: Item, e: KeyboardEvent<SVGGElement>) => {
    const delta: Record<string, Point> = {
      ArrowLeft: { x: -15, y: 0 },
      ArrowRight: { x: 15, y: 0 },
      ArrowUp: { x: 0, y: -15 },
      ArrowDown: { x: 0, y: 15 },
    };
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(item);
      settled(item, positions[item]);
    }
    if (delta[e.key]) {
      e.preventDefault();
      choose(item);
      const p = move(item, {
        x: positions[item].x + delta[e.key].x,
        y: positions[item].y + delta[e.key].y,
      });
      settled(item, p);
    }
  };
  const pour = (degrees: number) => {
    const crossed = angle < 45 && degrees >= 45;
    setAngle(degrees);
    if (!crossed) return;
    const p = positions[selected],
      f = positions.flask;
    if (selected === "flask") {
      if (!near(p, { x: 120, y: 340 }, 105)) {
        setMessage("Move the flask into the waste area before emptying.");
        return;
      }
      // Emptying and washing are separate actions.
      send({ type: "discard" });
      setMessage(
        "Flask emptied. Move the wash bottle over it and tilt to rinse.",
      );
      return;
    }
    if (selected === "edta") {
      if (!near(p, { x: 490, y: 160 }, 100)) {
        setMessage("Move the EDTA bottle to the burette mouth before tilting.");
        return;
      }
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
          ? "Burette rinsed with EDTA. Return upright, choose Fill, then tilt again."
          : "Burette filled with EDTA. Clear the tip and record the initial meniscus.",
      );
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
    onPointerCancel: () => {
      drag.current = null;
    },
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => keyboard(item, e),
    onFocus: () => choose(item),
    className: "edta-movable",
  });
  return (
    <section
      className="edta-stage edta-hands-on"
      aria-label="Movable laboratory bench"
    >
      <div className="edta-hand-toolbar">
        <strong>Grab • move • tilt</strong>
        <label>
          Conditioning / filling{" "}
          <select
            aria-label="Rinse or fill"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as "rinse" | "fill")}
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
      >
        <defs>
          <linearGradient id="hand-room" x2=".8" y2="1">
            <stop stopColor="#f6f4e9" />
            <stop offset="1" stopColor="#d8e1d7" />
          </linearGradient>
          <linearGradient id="hand-glass">
            <stop stopColor="#fff" stopOpacity=".75" />
            <stop offset=".4" stopColor="#d3eeee" stopOpacity=".15" />
            <stop offset="1" stopColor="#779f9c" stopOpacity=".55" />
          </linearGradient>
          <clipPath id="hand-flask">
            <path d="M-14 -146H14V-105L67 -11Q71 0 57 3H-57Q-71 0 -67 -11L-14 -105Z" />
          </clipPath>
        </defs>
        <rect width="900" height="630" fill="url(#hand-room)" />
        <path d="M40 0H340L680 450H160Z" fill="#fffdf2" opacity=".6" />
        <path
          d="M60 40H340V270H60Z"
          fill="#e4ebe0"
          stroke="#c1cfc1"
          strokeWidth="5"
        />
        <path d="M200 40V270M60 155H340" stroke="#f8faf2" strokeWidth="8" />
        <path d="M0 450H900V630H0Z" fill="#ccd8ca" />
        <path d="M0 580H900" stroke="#f7fbef" strokeWidth="3" />
        <rect
          x="35"
          y="280"
          width="170"
          height="115"
          rx="22"
          fill="#b8c6bf"
          stroke="#6e8c80"
          strokeWidth="3"
        />
        <ellipse cx="120" cy="340" rx="65" ry="33" fill="#849e92" />
        <circle cx="120" cy="350" r="14" fill="#425f51" />
        <text x="120" y="420" textAnchor="middle" fill="#254a39" fontSize="13">
          WASTE / RINSE AREA
        </text>
        <rect x="375" y="60" width="12" height="480" rx="6" fill="#a2b8a7" />
        <rect x="375" y="145" width="110" height="10" rx="5" fill="#829b8a" />
        <rect
          x="475"
          y="65"
          width="30"
          height="260"
          rx="5"
          fill="url(#hand-glass)"
          stroke="#75988a"
          strokeWidth="2"
        />
        <rect
          x="480"
          y={70 + reading(s) * 4.8}
          width="20"
          height={volume(s.vessels.burette) * 4.8}
          fill="#92cbd0"
          opacity=".7"
        />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <path d={`M476 ${70 + i * 24}h12`} stroke="#4f7461" />
            <text x="512" y={74 + i * 24} fontSize="10" fill="#39594f">
              {i * 5}
            </text>
          </g>
        ))}
        <path
          d="M485 325V348L490 359L495 348V325"
          fill="url(#hand-glass)"
          stroke="#6b9080"
        />
        <rect
          x="462"
          y="321"
          width="56"
          height="11"
          rx="5"
          fill="#ac754e"
          transform={`rotate(${s.valve * 90} 490 326)`}
        />
        {s.valve > 0 && s.positioned && (
          <path
            className="edta-stream"
            d="M490 359V450"
            stroke="#73b8c3"
            strokeWidth="4"
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
          className="edta-movable"
        >
          <rect
            x="550"
            y="180"
            width="105"
            height="50"
            rx="6"
            fill="#faffee"
            stroke="#9ab59c"
          />
          <text
            x="602"
            y="200"
            textAnchor="middle"
            fill="#254a39"
            fontSize="12"
          >
            Burette
          </text>
          <text
            x="602"
            y="218"
            textAnchor="middle"
            fill="#254a39"
            fontSize="14"
          >
            {reading(s).toFixed(2)} mL
          </text>
        </g>
        <rect x="405" y="520" width="170" height="42" rx="8" fill="#28594b" />
        <text x="490" y="546" textAnchor="middle" fill="#f7f5df" fontSize="12">
          STIRRER / FLASK POSITION
        </text>
        <g {...props("flask")}>
          <path
            d="M-14 -146H14V-105L67 -11Q71 0 57 3H-57Q-71 0 -67 -11L-14 -105Z"
            fill="url(#hand-glass)"
            stroke="#648a7b"
            strokeWidth="2"
          />
          <g clipPath="url(#hand-flask)">
            <rect
              x="-70"
              y={-Math.min(volume(s.vessels.flask) * 1.2, 140)}
              width="140"
              height="150"
              fill={o.colourHex}
              opacity={volume(s.vessels.flask) > 0 ? 0.8 : 0}
            />
            <path
              d="M-48 -20L-6 -110V-140"
              stroke="white"
              strokeWidth="5"
              opacity=".65"
            />
          </g>
          <text x="0" y="-50" textAnchor="middle" fill="#244d3c" fontSize="12">
            250 mL
          </text>
          <rect x="-54" y="7" width="108" height="28" rx="5" fill="#f8fceb" />
          <text x="0" y="26" textAnchor="middle" fill="#244d3c" fontSize="12">
            Conical flask
          </text>
        </g>
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
                    ? "#83504a"
                    : item === "buffer"
                      ? "#b4935f"
                      : "#8bb1a5"
                }
                stroke="#678d78"
                strokeWidth="2"
              />
              <rect
                x="-18"
                y="-119"
                width="36"
                height="24"
                rx="4"
                fill={item === "indicator" ? "#393d39" : "#335d4b"}
              />
              <rect
                x="-24"
                y="-65"
                width="48"
                height="46"
                rx="3"
                fill="#f8f1dc"
              />
              <text
                x="0"
                y="-46"
                textAnchor="middle"
                fill="#284d3c"
                fontSize="10"
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
                fill="#284d3c"
                fontSize="10"
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
                fill="#284d3c"
                fontSize="12"
              >
                {names[item]}
              </text>
            </g>
          ),
        )}
        <g {...props("pipette")}>
          <rect x="-24" y="-105" width="48" height="220" fill="transparent" />
          <ellipse cx="0" cy="-90" rx="17" ry="24" fill="#b26245" />
          <path
            d="M-4 -65V-15Q-16 -8 -13 17Q-12 29 -4 34V110L0 127L4 110V34Q12 29 13 17Q16 -8 4 -15V-65Z"
            fill="url(#hand-glass)"
            stroke="#699380"
            strokeWidth="2"
          />
          {volume(s.vessels.pipette) > 0 && (
            <path
              d="M-2 -15Q-13 -6 -11 16Q-10 26 -2 33V108H2V33Q10 26 11 16Q13 -6 2 -15Z"
              fill="#6cb6c4"
            />
          )}
          <rect x="-45" y="132" width="90" height="28" rx="4" fill="#f7fbe9" />
          <text x="0" y="151" textAnchor="middle" fill="#244d3c" fontSize="12">
            Pipette {volume(s.vessels.pipette).toFixed(0)} mL
          </text>
        </g>
      </svg>
      <div className="edta-hand-controls">
        <label>
          {names[selected]} tilt{" "}
          <input
            aria-label="Tilt selected apparatus"
            type="range"
            min="0"
            max="90"
            step="5"
            value={angle}
            onChange={(e) => pour(Number(e.target.value))}
          />
          <output>{angle}°</output>
        </label>
        <p role="status">{s.warning ?? message}</p>
        <small>
          Move with mouse/touch, or focus an object and use arrow keys. Enter
          selects it. Tilt past 45° to pour; return upright before repeating.
        </small>
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
