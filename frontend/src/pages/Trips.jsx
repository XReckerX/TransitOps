import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TriangleAlert } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STAGES = ["Draft", "Dispatched", "Completed", "Cancelled"]

const BOARD = [
  { id: "TR001", route: "Sandbanger Depot → Ahmedabad Hub", meta: "VAN-05 / ALEX", status: "Dispatched", note: "45 min" },
  { id: "TR004", route: "Vatva Industrial Area → Sanand Warehouse", meta: "TRUCK-04 / SURESH", status: "Draft", note: "Awaiting driver" },
  { id: "TR006", route: "Mansa → Kalol Depot", meta: "Unassigned", status: "Cancelled", note: "Vehicle sent to shop" },
]

const STATUS_VARIANT = { Draft: "muted", Dispatched: "info", Completed: "success", Cancelled: "destructive" }

export default function Trips() {
  const [overweight, setOverweight] = useState(true)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader><CardTitle>Create Trip</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="space-y-1">
            <Label className="text-xs">Source</Label>
            <Input className="h-8 text-xs" defaultValue="Sandbanger Depot" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Destination</Label>
            <Input className="h-8 text-xs" defaultValue="Ahmedabad Hub" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Vehicle (Available Only)</Label>
            <Select defaultValue="van05">
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="van05">VAN-05 — 500 kg capacity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Driver (Available Only)</Label>
            <Select defaultValue="alex">
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alex">Alex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cargo Weight (kg)</Label>
            <Input className="h-8 text-xs" defaultValue="700" onChange={() => setOverweight(true)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Planned Distance (km)</Label>
            <Input className="h-8 text-xs" defaultValue="58" />
          </div>

          {overweight && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              <div>
                <p className="font-medium">Vehicle Capacity 500 kg, Cargo Weight 700 kg</p>
                <p className="text-destructive/80">Capacity exceeded by 200 kg — dispatch blocked</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button size="sm" className="flex-1" disabled={overweight}>Dispatch Waybill</Button>
            <Button size="sm" variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Live Board</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="flex items-center gap-2">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={"size-2.5 rounded-full " + (i === 1 ? "bg-orange-500" : "bg-muted")} />
                <span className="text-xs text-muted-foreground">{s}</span>
                {i < STAGES.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>

          {BOARD.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">{t.id} &nbsp; {t.route}</p>
                <p className="text-xs text-muted-foreground">{t.meta}</p>
              </div>
              <div className="text-right">
                <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
