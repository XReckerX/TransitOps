import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, TriangleAlert } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const DRIVERS = [
  { name: "Alex", license: "DL-99215", cat: "LMV", expiry: "12/2028", contact: "98765xxxxx", trips: 167, safety: "96%", status: "Available" },
  { name: "John", license: "DL-44510", cat: "HMV", expiry: "05/2025 EXPIRED", contact: "98220xxxxx", trips: 87, safety: "81%", status: "Suspended" },
  { name: "Priya", license: "DL-77031", cat: "LMV", expiry: "09/2027", contact: "99110xxxxx", trips: 145, safety: "99%", status: "On Trip" },
  { name: "Suresh", license: "DL-10045", cat: "HMV", expiry: "01/2027", contact: "97440xxxxx", trips: 88, safety: "88%", status: "Off Duty" },
]

const STATUS_VARIANT = {
  Available: "success",
  Suspended: "destructive",
  "On Trip": "info",
  "Off Duty": "muted",
}

const LEGEND = ["Available", "On Trip", "Off Duty", "Suspended"]

export default function Drivers() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search..." className="h-8 w-56 text-xs" />
        <Button size="sm" className="ml-auto"><Plus /> Add Driver</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead>License No.</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Trip Compl.</TableHead>
            <TableHead>Safety</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DRIVERS.map((d) => (
            <TableRow key={d.name}>
              <TableCell className="font-medium">{d.name}</TableCell>
              <TableCell>{d.license}</TableCell>
              <TableCell>{d.cat}</TableCell>
              <TableCell className={d.expiry.includes("EXPIRED") ? "text-red-400" : ""}>{d.expiry}</TableCell>
              <TableCell className="text-muted-foreground">{d.contact}</TableCell>
              <TableCell>{d.trips}</TableCell>
              <TableCell>{d.safety}</TableCell>
              <TableCell><Badge variant={STATUS_VARIANT[d.status]}>{d.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center gap-2">
        {LEGEND.map((s) => (
          <Badge key={s} variant={STATUS_VARIANT[s]}>{s}</Badge>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TriangleAlert className="size-3.5 text-orange-400" />
        Rule: Expired license or Suspended status → blocked from trip assignment
      </p>
    </div>
  )
}
