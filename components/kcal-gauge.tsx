// Half-circle gauge: the arc fills as calories are eaten; the centre shows what is left.
const ARC = "M 16 100 A 84 84 0 0 1 184 100";

export function KcalGauge({ eaten, goal }: { eaten: number; goal: number }) {
  const left = Math.round(goal - eaten);
  const over = left < 0;
  const pct = goal > 0 ? Math.min(1, Math.max(0, eaten / goal)) * 100 : 0;

  return (
    <div
      className="relative mx-auto w-full max-w-[230px]"
      role="img"
      aria-label={`${Math.round(eaten)} of ${Math.round(goal)} kcal eaten`}
    >
      <svg viewBox="0 0 200 108" className="w-full" aria-hidden="true">
        <path d={ARC} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="9" strokeLinecap="round" />
        {pct > 0 ? (
          <path
            d={ARC}
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${pct} 100`}
          />
        ) : null}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <div className="text-sm">{over ? "Kcal over" : "Kcal left"}</div>
        <div className="text-4xl leading-none font-semibold tabular-nums">{Math.abs(left)}</div>
      </div>
    </div>
  );
}
