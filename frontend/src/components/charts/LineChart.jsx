import { useId, useState } from "react"

const WIDTH = 600
const HEIGHT = 220
const PAD_LEFT = 40
const PAD_RIGHT = 12
const PAD_TOP = 16
const PAD_BOTTOM = 28

/**
 * Single-series SVG line/area chart with gridlines, hover crosshair + tooltip.
 * data: [{ label, value }]
 */
export default function LineChart({ data, valueFormatter = (v) => v, color = "#f97316" }) {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState(null)

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values, 1)
  const minValue = Math.min(...values, 0)
  const range = maxValue - minValue || 1

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM

  const xFor = (i) => PAD_LEFT + (data.length === 1 ? plotWidth / 2 : (i / (data.length - 1)) * plotWidth)
  const yFor = (v) => PAD_TOP + plotHeight - ((v - minValue) / range) * plotHeight

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.value)}`)
    .join(" ")

  const areaPath =
    `M ${xFor(0)} ${PAD_TOP + plotHeight} ` +
    data.map((d, i) => `L ${xFor(i)} ${yFor(d.value)}`).join(" ") +
    ` L ${xFor(data.length - 1)} ${PAD_TOP + plotHeight} Z`

  const gridLines = 4
  const gridValues = Array.from({ length: gridLines + 1 }, (_, i) => minValue + (range * i) / gridLines)

  const handleMove = (e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    let closest = 0
    let closestDist = Infinity
    data.forEach((_, i) => {
      const dist = Math.abs(xFor(i) - x)
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridValues.map((gv, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yFor(gv)}
              y2={yFor(gv)}
              stroke="currentColor"
              className="text-muted-foreground/15"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 8}
              y={yFor(gv)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {valueFormatter(Math.round(gv))}
            </text>
          </g>
        ))}

        {data.map((d, i) => (
          <text
            key={d.label}
            x={xFor(i)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {d.label}
          </text>
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) => (
          <circle
            key={d.label}
            cx={xFor(i)}
            cy={yFor(d.value)}
            r={hoverIndex === i ? 4 : 2.5}
            fill={color}
            stroke="var(--card)"
            strokeWidth="1.5"
            className="transition-[r] duration-100"
          />
        ))}

        {hoverIndex !== null && (
          <line
            x1={xFor(hoverIndex)}
            x2={xFor(hoverIndex)}
            y1={PAD_TOP}
            y2={PAD_TOP + plotHeight}
            stroke="currentColor"
            className="text-muted-foreground/30"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-lg"
          style={{
            left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
          }}
        >
          <p className="font-medium text-popover-foreground">{hovered.label}</p>
          <p className="text-muted-foreground">{valueFormatter(hovered.value)}</p>
        </div>
      )}
    </div>
  )
}
