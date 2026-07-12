import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const KPIS = [
  { label: "Fuel Efficiency", value: "8.4 km/l" },
  { label: "Fleet Utilization", value: "81%" },
  { label: "Operational Cost", value: "34,070" },
  { label: "Vehicle ROI", value: "14.2%" },
]

const REVENUE = [40, 55, 48, 70, 62, 78, 66, 58]

const TOP_COSTLIEST = [
  { name: "TRUCK-11", pct: 90, color: "bg-red-500" },
  { name: "MINI-03", pct: 55, color: "bg-amber-500" },
  { name: "VAN-05", pct: 25, color: "bg-blue-500" },
]

export default function Analytics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} size="sm">
            <CardContent className="space-y-1 px-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-xl font-semibold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        ROI = Revenue + Uniqueness - Fuel - Acquisition Cost
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
          <CardContent className="px-3">
            <div className="flex h-40 items-end gap-2">
              {REVENUE.map((v, i) => (
                <div key={i} className="flex-1 rounded-t bg-blue-500/80" style={{ height: `${v}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Costliest Vehicles</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-3">
            {TOP_COSTLIEST.map((v) => (
              <div key={v.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{v.name}</span>
                </div>
                <Progress value={v.pct} barClassName={v.color} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
