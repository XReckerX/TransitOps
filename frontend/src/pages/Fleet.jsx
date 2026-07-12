import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, TriangleAlert } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const VEHICLES = [
  { reg: "GJ01AB4521", model: "VAN-05", type: "Van", capacity: "500 kg", odometer: "74,000", cost: "6,20,000", status: "Available" },
  { reg: "GJ01AB1991", model: "TRUCK-11", type: "Truck", capacity: "5 Ton", odometer: "182,000", cost: "24,50,000", status: "On Trip" },
  { reg: "GJ01AB1930", model: "MINI-03", type: "Mini", capacity: "1 Ton", odometer: "66,000", cost: "4,10,000", status: "In Shop" },
  { reg: "GJ01AB0097", model: "VAN-09", type: "Van", capacity: "950 kg", odometer: "214,900", cost: "5,40,000", status: "Retired" },
]

const STATUS_VARIANT = {
  Available: "success",
  "On Trip": "info",
  "In Shop": "warning",
  Retired: "destructive",
}

export default function Fleet() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search reg. no..." className="h-8 w-56 text-xs" />
        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Type: All</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="ml-auto"><Plus /> Add Vehicle</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reg. No / Owner</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Odometer</TableHead>
            <TableHead>Acq. Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {VEHICLES.map((v) => (
            <TableRow key={v.reg}>
              <TableCell>
                <div className="font-medium">{v.reg}</div>
                <div className="text-xs text-muted-foreground">{v.model}</div>
              </TableCell>
              <TableCell>{v.type}</TableCell>
              <TableCell>{v.capacity}</TableCell>
              <TableCell>{v.odometer}</TableCell>
              <TableCell>{v.cost}</TableCell>
              <TableCell><Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TriangleAlert className="size-3.5 text-orange-400" />
        Rule: Registration no. must be unique &middot; Retired/In-Shop vehicles are hidden from Trip Dispatcher
      </p>
    </div>
  )
}
