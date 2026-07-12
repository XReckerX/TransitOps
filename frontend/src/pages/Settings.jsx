import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Minus } from "lucide-react"

const ROLES = [
  { role: "Fleet Manager", fleet: true, dispatch: false, maint: true, trips: false, fuelExp: false, analytics: true },
  { role: "Dispatcher", fleet: "view", dispatch: true, maint: false, trips: true, fuelExp: false, analytics: false },
  { role: "Safety Officer", fleet: true, dispatch: false, maint: "view", trips: false, fuelExp: false, analytics: false },
  { role: "Financial Analyst", fleet: "view", dispatch: false, maint: false, trips: false, fuelExp: true, analytics: true },
]

const COLS = ["fleet", "dispatch", "maint", "trips", "fuelExp", "analytics"]
const HEADERS = { fleet: "Fleet", dispatch: "Dispatch", maint: "Maint.", trips: "Trips", fuelExp: "Fuel/Exp.", analytics: "Analytics" }

function Cell({ value }) {
  if (value === true) return <Check className="mx-auto size-3.5 text-emerald-400" />
  if (value === "view") return <span className="text-xs text-muted-foreground">View</span>
  return <Minus className="mx-auto size-3.5 text-muted-foreground/40" />
}

export default function Settings() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>General</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="space-y-1">
            <Label className="text-xs">Depot Name</Label>
            <Input className="h-8 text-xs" defaultValue="Sandbanger Depot 421" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Currency</Label>
            <Input className="h-8 text-xs" defaultValue="INR (₹)" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Distance Unit</Label>
            <Input className="h-8 text-xs" defaultValue="Kilometers" />
          </div>
          <Button size="sm" className="mt-2">Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Role-Based Access (RBAC)</CardTitle></CardHeader>
        <CardContent className="px-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1.5 text-left font-medium">Role</th>
                {COLS.map((c) => (
                  <th key={c} className="py-1.5 text-center font-medium">{HEADERS[c]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r.role} className="border-b border-border/60">
                  <td className="py-2 font-medium">{r.role}</td>
                  {COLS.map((c) => (
                    <td key={c} className="py-2 text-center"><Cell value={r[c]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
