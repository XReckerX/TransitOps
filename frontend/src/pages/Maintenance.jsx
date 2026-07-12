import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const LOGS = [
  { vehicle: "VAN-05", service: "Oil Change", cost: "2,500", status: "In Shop" },
  { vehicle: "TRUCK-11", service: "Engine Repair", cost: "18,000", status: "Completed" },
  { vehicle: "MINI-03", service: "Tyre Replace", cost: "6,200", status: "In Shop" },
]

const STATUS_VARIANT = { "In Shop": "warning", Completed: "success" }

export default function Maintenance() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader><CardTitle>Log Service Record</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="space-y-1">
            <Label className="text-xs">Vehicle</Label>
            <Input className="h-8 text-xs" defaultValue="VAN-05" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Service Type</Label>
            <Input className="h-8 text-xs" defaultValue="Oil Change" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cost</Label>
            <Input className="h-8 text-xs" defaultValue="2500" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Date</Label>
            <Input className="h-8 text-xs" defaultValue="09/07/2026" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Input className="h-8 text-xs" defaultValue="Active" />
          </div>
          <Button size="sm" className="w-full">Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Service Log</CardTitle></CardHeader>
        <CardContent className="space-y-4 px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOGS.map((l) => (
                <TableRow key={l.vehicle + l.service}>
                  <TableCell className="font-medium">{l.vehicle}</TableCell>
                  <TableCell>{l.service}</TableCell>
                  <TableCell>{l.cost}</TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[l.status]}>{l.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-2 rounded-md border border-border/60 p-3">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="success">Available</Badge>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <Badge variant="warning">In Shop</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="warning">In Shop</Badge>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <Badge variant="success">Available</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Rule: In-Shop vehicles are removed from the dispatch pool
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
