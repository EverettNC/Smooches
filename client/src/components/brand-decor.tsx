// The Smooches look from Everett's art: glossy paint swooshes (red, yellow, electric
// blue and black) that swell and taper on a diagonal, and electric-blue lightning that
// forks as it cracks in from the edges. Drawn as shapes so they stay sharp at any size.
// The middle is kept clear so the words always read, and nothing here can be clicked.

type Variant = "hero" | "panel" | "page";

const PAINT = { red: "#e3170a", yellow: "#f5b60a", blue: "#1590d6", black: "#111111" };
const BOLT_GLOW = "#2fa8ff";
const BOLT_CORE = "#eef9ff";
// soft top and bottom edges, so a section never ends on a hard line through the paint
const FADE = "linear-gradient(to bottom, transparent 0%, black 6%, black 80%, transparent 100%)";

// Same picture every time: a small seeded random.
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = [number, number];

// A paint stroke: a wavy centre line whose width swells and pinches, closed into a shape.
function paintShape(x0: number, y0: number, x1: number, y1: number, width: number, waves: number, phase: number) {
  const n = 64;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const centre: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const wave = Math.sin(t * Math.PI * waves + phase) * width * 0.55;
    centre.push([x0 + dx * t + nx * wave, y0 + dy * t + ny * wave]);
  }
  const left: Pt[] = [], right: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ends = Math.sin(Math.PI * t) ** 0.6;                      // tapers to a point at both ends
    const swell = 0.45 + 0.55 * Math.abs(Math.sin(t * Math.PI * waves * 0.5 + phase)); // bulges like dripping paint
    const w = (width / 2) * ends * swell;
    const [cx, cy] = centre[i];
    left.push([cx + nx * w, cy + ny * w]);
    right.push([cx - nx * w, cy - ny * w]);
  }
  const pts = [...left, ...right.reverse()];
  const outline = "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ") + " Z";
  const shine = "M " + centre.slice(6, n - 6).map(([x, y]) => `${(x - nx * width * 0.18).toFixed(1)},${(y - ny * width * 0.18).toFixed(1)}`).join(" L ");
  return { outline, shine };
}

function Paint({ color, width, shape }: { color: string; width: number; shape: { outline: string; shine: string } }) {
  return (
    <g>
      <path d={shape.outline} fill="rgba(0,0,0,0.55)" transform="translate(4 6)" />
      <path d={shape.outline} fill={color} />
      <path d={shape.shine} stroke={color === PAINT.black ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.6)"}
            strokeWidth={Math.max(1.5, width * 0.12)} fill="none" strokeLinecap="round" />
    </g>
  );
}

// Lightning by repeated midpoint displacement, with forks.
function boltPath(rand: () => number, a: Pt, b: Pt, rough: number, depth: number): Pt[] {
  if (depth === 0) return [a, b];
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
  const off = (rand() - 0.5) * rough;
  const m: Pt = [mx + nx * off, my + ny * off];
  const left = boltPath(rand, a, m, rough / 2, depth - 1);
  return [...left.slice(0, -1), ...boltPath(rand, m, b, rough / 2, depth - 1)];
}

function Bolt({ seed, from, to, glowId }: { seed: number; from: Pt; to: Pt; glowId: string }) {
  const rand = seeded(seed);
  const main = boltPath(rand, from, to, Math.hypot(to[0] - from[0], to[1] - from[1]) * 0.35, 6);
  const forks: Pt[][] = [];
  for (let k = 0; k < 4; k++) {
    const i = 8 + Math.floor(rand() * (main.length - 20));
    const start = main[i];
    const dir = Math.atan2(to[1] - from[1], to[0] - from[0]) + (rand() - 0.5) * 1.6;
    const reach = 60 + rand() * 120;
    forks.push(boltPath(rand, start, [start[0] + Math.cos(dir) * reach, start[1] + Math.sin(dir) * reach], reach * 0.4, 4));
  }
  const d = (p: Pt[]) => "M " + p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  return (
    <g strokeLinejoin="round" strokeLinecap="round" fill="none">
      <g filter={`url(#${glowId})`}>
        <path d={d(main)} stroke={BOLT_GLOW} strokeWidth={7} opacity={0.75} />
        {forks.map((f, i) => <path key={i} d={d(f)} stroke={BOLT_GLOW} strokeWidth={4} opacity={0.6} />)}
      </g>
      <path d={d(main)} stroke={BOLT_CORE} strokeWidth={2.2} />
      {forks.map((f, i) => <path key={`c${i}`} d={d(f)} stroke={BOLT_CORE} strokeWidth={1.2} />)}
    </g>
  );
}

function Layer({ id, w, h, strength, children, className }: {
  id: string; w: number; h: number; strength: number; children: React.ReactNode; className: string;
}) {
  return (
    <svg className={`absolute inset-0 w-full h-full ${className}`} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {/* keeps the middle clear for the words */}
        <radialGradient id={`${id}-clear`} cx="50%" cy="48%" r="60%">
          <stop offset="0%" stopColor="black" />
          <stop offset="45%" stopColor="black" />
          <stop offset="75%" stopColor="white" />
        </radialGradient>
        <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
          <rect x="0" y="0" width={w} height={h} fill={`url(#${id}-clear)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`} opacity={strength}>{children}</g>
    </svg>
  );
}

export function BrandDecor({ variant = "hero", className = "" }: { variant?: Variant; className?: string }) {
  const strength = variant === "page" ? 0.6 : variant === "panel" ? 0.75 : 0.95;
  const id = `smooches-decor-${variant}`;
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
         style={{ WebkitMaskImage: FADE, maskImage: FADE }}>
      {/* wide screens */}
      <Layer id={`${id}-wide`} w={1200} h={800} strength={strength} className="hidden md:block">
        {/* parallel paint swooshes on a slant, top-left to bottom-right, like the art */}
        <Paint color={PAINT.black} width={30} shape={paintShape(-120, -40, 620, 560, 30, 7, 0.2)} />
        <Paint color={PAINT.red} width={28} shape={paintShape(-140, 60, 560, 640, 28, 7, 1.1)} />
        <Paint color={PAINT.yellow} width={22} shape={paintShape(-140, 170, 500, 720, 22, 6, 2.0)} />
        <Paint color={PAINT.blue} width={36} shape={paintShape(-160, 280, 470, 830, 36, 6, 0.7)} />
        <Paint color={PAINT.red} width={20} shape={paintShape(-160, 420, 330, 880, 20, 5, 2.6)} />
        <Paint color={PAINT.blue} width={26} shape={paintShape(700, 330, 1320, 860, 26, 6, 1.4)} />
        <Paint color={PAINT.red} width={30} shape={paintShape(640, 440, 1300, 980, 30, 6, 0.3)} />
        <Paint color={PAINT.yellow} width={18} shape={paintShape(800, 260, 1340, 720, 18, 6, 2.2)} />
        <Paint color={PAINT.black} width={24} shape={paintShape(760, 560, 1300, 1020, 24, 5, 1.7)} />
        <Bolt seed={7} from={[1190, -20]} to={[930, 420]} glowId={`${id}-wide-glow`} />
        <Bolt seed={21} from={[1230, 140]} to={[1060, 360]} glowId={`${id}-wide-glow`} />
        <Bolt seed={42} from={[-30, 820]} to={[220, 560]} glowId={`${id}-wide-glow`} />
      </Layer>
      {/* phones: the same paint and lightning, laid out for a tall narrow screen */}
      <Layer id={`${id}-tall`} w={400} h={820} strength={strength} className="md:hidden">
        <Paint color={PAINT.red} width={16} shape={paintShape(-60, -60, 230, 210, 16, 5, 1.1)} />
        <Paint color={PAINT.yellow} width={12} shape={paintShape(-80, 0, 170, 240, 12, 5, 2.0)} />
        <Paint color={PAINT.blue} width={20} shape={paintShape(-90, 60, 140, 290, 20, 4, 0.7)} />
        <Paint color={PAINT.blue} width={16} shape={paintShape(200, 560, 470, 860, 16, 4, 1.4)} />
        <Paint color={PAINT.red} width={18} shape={paintShape(150, 610, 440, 900, 18, 4, 0.3)} />
        <Paint color={PAINT.yellow} width={11} shape={paintShape(260, 540, 480, 800, 11, 4, 2.2)} />
        <Paint color={PAINT.black} width={14} shape={paintShape(90, 660, 380, 940, 14, 4, 1.7)} />
        <Bolt seed={7} from={[420, -10]} to={[310, 230]} glowId={`${id}-tall-glow`} />
        <Bolt seed={42} from={[-20, 830]} to={[100, 620]} glowId={`${id}-tall-glow`} />
      </Layer>
    </div>
  );
}
