import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const FUEL = [
  { vehicle: "VAN-05", date: "05 Jul 2026", liters: "42 L", cost: "3,150" },
  { vehicle: "TRUCK-11", date: "06 Jul 2026", liters: "110 L", cost: "8,400" },
  { vehicle: "MINI-03", date: "06 Jul 2026", liters: "28 L", cost: "2,050" },
]

const EXPENSES = [
  { trip: "TR001", vehicle: "VAN-05", toll: "120", other: "0", status: "Available" },
  { trip: "TR002", vehicle: "TRK-12", toll: "340", other: "150", status: "Completed" },
]

const STATUS_VARIANT = { Available: "success", Completed: "success" }

export default function FuelExpenses() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Fuel Logs</CardTitle>
          <Button size="sm"><Plus /> Log Fuel</Button>
        </CardHeader>
        <CardContent className="px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FUEL.map((f) => (
                <TableRow key={f.vehicle + f.date}>
                  <TableCell className="font-medium">{f.vehicle}</TableCell>
                  <TableCell>{f.date}</TableCell>
                  <TableCell>{f.liters}</TableCell>
                  <TableCell>{f.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Other Expenses (Toll / Misc)</CardTitle>
          <Button size="sm"><Plus /> Add Expense</Button>
        </CardHeader>
        <CardContent className="space-y-2 px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Toll</TableHead>
                <TableHead>Other</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EXPENSES.map((e) => (
                <TableRow key={e.trip}>
                  <TableCell>{e.trip}</TableCell>
                  <TableCell>{e.vehicle}</TableCell>
                  <TableCell>{e.toll}</TableCell>
                  <TableCell>{e.other}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm">
            <span className="text-muted-foreground">Total Operational Cost (Auto) = Fuel + Maintenance</span>
            <span className="font-semibold text-orange-400">34,070</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
