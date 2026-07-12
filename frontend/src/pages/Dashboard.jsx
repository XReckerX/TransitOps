import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const KPIS = [
  { label: "Active Vehicles", value: 53, tone: "text-foreground" },
  { label: "Available Vehicles", value: 42, tone: "text-emerald-400" },
  { label: "Vehicles In Maintenance", value: "05", tone: "text-amber-400" },
  { label: "Active Trips", value: 18, tone: "text-blue-400" },
  { label: "Pending Trips", value: "09", tone: "text-foreground" },
  { label: "Drivers On Duty", value: 26, tone: "text-foreground" },
  { label: "Fleet Utilization", value: "81%", tone: "text-emerald-400" },
]

const TRIPS = [
  { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
  { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "—" },
  { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "1h 10m" },
  { id: "TR006", vehicle: "—", driver: "—", status: "Draft", eta: "Awaiting vehicle" },
]

const STATUS_VARIANT = {
  "On Trip": "info",
  Completed: "success",
  Dispatched: "info",
  Draft: "muted",
}

const VEHICLE_STATUS = [
  { label: "Available", pct: 79, color: "bg-emerald-500" },
  { label: "On Trip", pct: 34, color: "bg-blue-500" },
  { label: "In Shop", pct: 9, color: "bg-amber-500" },
  { label: "Retired", pct: 4, color: "bg-red-500" },
]

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vehicle Type: All</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="mini">Mini</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on-trip">On Trip</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Region: All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {KPIS.map((k) => (
          <Card key={k.label} size="sm">
            <CardContent className="space-y-1 px-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-xl font-semibold ${k.tone}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent Trips</CardTitle></CardHeader>
          <CardContent className="space-y-2 px-3">
            <div className="grid grid-cols-5 gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Trip</span><span>Vehicle</span><span>Driver</span><span>Status</span><span>ETA</span>
            </div>
            {TRIPS.map((t) => (
              <div key={t.id} className="grid grid-cols-5 items-center gap-2 border-t border-border/60 py-2 text-sm">
                <span className="text-muted-foreground">{t.id}</span>
                <span>{t.vehicle}</span>
                <span>{t.driver}</span>
                <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                <span className="text-muted-foreground">{t.eta}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle Status</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-3">
            {VEHICLE_STATUS.map((v) => (
              <div key={v.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{v.label}</span>
                  <span>{v.pct}%</span>
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
