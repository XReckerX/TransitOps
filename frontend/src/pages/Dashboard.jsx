import { useEffect, useState } from "react"
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
import { api } from "@/lib/api"

const STATUS_VARIANT = {
  "On Trip": "info",
  Completed: "success",
  Dispatched: "info",
  Draft: "muted",
  Cancelled: "destructive"
}

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")

  const [kpis, setKpis] = useState([
    { label: "Active Vehicles", value: 0, tone: "text-foreground", key: "activeVehicles" },
    { label: "Available Vehicles", value: 0, tone: "text-emerald-400", key: "availableVehicles" },
    { label: "Vehicles In Maintenance", value: 0, tone: "text-amber-400", key: "vehiclesInMaintenance" },
    { label: "Active Trips", value: 0, tone: "text-blue-400", key: "activeTrips" },
    { label: "Pending Trips", value: 0, tone: "text-foreground", key: "pendingTrips" },
    { label: "Drivers On Duty", value: 0, tone: "text-foreground", key: "driversOnDuty" },
    { label: "Fleet Utilization", value: "0%", tone: "text-emerald-400", key: "fleetUtilization" },
  ])

  const [trips, setTrips] = useState([])
  const [vehicleStatus, setVehicleStatus] = useState([
    { label: "Available", count: 0, pct: 0, color: "bg-emerald-500", key: "Available" },
    { label: "On Trip", count: 0, pct: 0, color: "bg-blue-500", key: "On Trip" },
    { label: "In Shop", count: 0, pct: 0, color: "bg-amber-500", key: "In Shop" },
    { label: "Retired", count: 0, pct: 0, color: "bg-red-500", key: "Retired" },
  ])

  const [regions, setRegions] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Build query string
        let qParts = [];
        if (vehicleType !== 'all') qParts.push(`type=${vehicleType}`);
        if (statusFilter !== 'all') qParts.push(`status=${statusFilter}`);
        if (regionFilter !== 'all') qParts.push(`region=${regionFilter}`);
        const queryString = qParts.length > 0 ? `?${qParts.join('&')}` : '';

        // 1. Fetch KPIs
        const kpiRes = await api.get(`/dashboard${queryString}`);
        if (kpiRes.success) {
          setKpis(prev => prev.map(k => {
            const rawVal = kpiRes.data[k.key];
            return {
              ...k,
              value: rawVal !== undefined ? rawVal : 0
            };
          }));
        }

        // 2. Fetch Trips
        const tripsRes = await api.get('/trips');
        if (tripsRes.success) {
          setTrips(tripsRes.data.slice(0, 5)); // show top 5 recent
        }

        // 3. Fetch Vehicles to calculate counts & gather regions
        const vehiclesRes = await api.get('/vehicles');
        if (vehiclesRes.success) {
          const list = vehiclesRes.data;
          
          // Gather distinct regions
          const allRegions = [...new Set(list.map(v => v.region).filter(Boolean))];
          setRegions(allRegions);

          // Count vehicle statuses
          const counts = { Available: 0, "On Trip": 0, "In Shop": 0, Retired: 0 };
          list.forEach(v => {
            if (counts[v.status] !== undefined) {
              counts[v.status]++;
            }
          });

          const total = list.length || 1;
          setVehicleStatus(prev => prev.map(s => {
            const count = counts[s.key] || 0;
            return {
              ...s,
              count,
              pct: Math.round((count / total) * 100)
            };
          }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    }
    fetchData();
  }, [vehicleType, statusFilter, regionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={vehicleType} onValueChange={setVehicleType}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Vehicle Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Vehicle Type: All</SelectItem>
            <SelectItem value="Van">Van</SelectItem>
            <SelectItem value="Truck">Truck</SelectItem>
            <SelectItem value="Mini">Mini</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Region: All</SelectItem>
            {regions.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {kpis.map((k) => (
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
              <span>Trip ID</span><span>Vehicle</span><span>Driver</span><span>Status</span><span>Route</span>
            </div>
            {trips.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No recent trips found</div>
            ) : (
              trips.map((t) => (
                <div key={t._id} className="grid grid-cols-5 items-center gap-2 border-t border-border/60 py-2 text-sm">
                  <span className="text-muted-foreground font-mono">...{t._id.slice(-6).toUpperCase()}</span>
                  <span>{t.vehicle?.registrationNumber || "—"}</span>
                  <span>{t.driver?.name || "—"}</span>
                  <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                  <span className="text-muted-foreground text-xs truncate" title={`${t.source} → ${t.destination}`}>
                    {t.source} → {t.destination}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle Status</CardTitle></CardHeader>
          <CardContent className="space-y-3 px-3">
            {vehicleStatus.map((v) => (
              <div key={v.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{v.label} ({v.count})</span>
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
