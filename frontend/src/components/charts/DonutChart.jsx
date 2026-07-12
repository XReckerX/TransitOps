import { useState } from "react"

const SIZE = 160
const STROKE = 22
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Fixed categorical order — never reassigned per render, never cycled arbitrarily.
const CATEGORICAL = ["#3987e5", "#199e70", "#c98500", "#9085e9", "#e66767"]

/**
 * data: [{ label, value }]
 */
export default function DonutChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  let cumulative = 0
  const segments = data.map((d, i) => {
    const fraction = d.value / total
    const dash = fraction * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dash
    const offset = -cumulative * CIRCUMFERENCE
    cumulative += fraction
    return {
      ...d,
      color: CATEGORICAL[i % CATEGORICAL.length],
      dash,
      gap,
      offset,
      pct: Math.round(fraction * 100),
    }
  })

  const active = hoverIndex !== null ? segments[hoverIndex] : null

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            className="text-muted/40"
            strokeWidth={STROKE}
          />
          {segments.map((s, i) => (
            <circle
              key={s.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={hoverIndex === i ? STROKE + 4 : STROKE}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              className="cursor-pointer transition-[stroke-width] duration-100"
              style={{
                filter: hoverIndex !== null && hoverIndex !== i ? "opacity(0.45)" : undefined,
              }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-foreground">{active ? active.value : total}</span>
          <span className="text-[10px] text-muted-foreground">{active ? active.label : "Total"}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-1 text-xs transition-colors"
            style={{ backgroundColor: hoverIndex === i ? "color-mix(in oklch, currentColor 6%, transparent)" : undefined }}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span className="flex items-center gap-1.5 text-foreground">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
            <span className="text-muted-foreground">
              {s.value} &middot; {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
