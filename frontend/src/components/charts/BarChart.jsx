import { useState } from "react"

// Fixed categorical order, matches DonutChart's slot 6 (red) down for "cost severity" framing.
const BAR_COLOR = "#e66767"

/**
 * Horizontal bar chart. data: [{ label, value }]
 */
export default function BarChart({ data, valueFormatter = (v) => v }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex flex-col gap-3">
      {data.map((d, i) => {
        const pct = Math.max((d.value / maxValue) * 100, 3)
        return (
          <div
            key={d.label}
            className="space-y-1"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-foreground">{d.label}</span>
              <span className="text-muted-foreground">{valueFormatter(d.value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{
                  width: `${pct}%`,
                  backgroundColor: BAR_COLOR,
                  opacity: hoverIndex === null || hoverIndex === i ? 1 : 0.55,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
