import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [totalOpCost, setTotalOpCost] = useState(0)

  // Modal control states
  const [isFuelOpen, setIsFuelOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)

  // Fuel form states
  const [fuelVehicleId, setFuelVehicleId] = useState("")
  const [fuelLiters, setFuelLiters] = useState("")
  const [fuelCost, setFuelCost] = useState("")
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0])
  const [fuelError, setFuelError] = useState("")

  // Expense form states
  const [expVehicleId, setExpVehicleId] = useState("")
  const [expType, setExpType] = useState("Toll")
  const [expAmount, setExpAmount] = useState("")
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0])
  const [expError, setExpError] = useState("")

  const loadData = async () => {
    try {
      // 1. Fetch fuel logs
      const fuelRes = await api.get('/fuel-expenses/fuel');
      if (fuelRes.success) {
        setFuelLogs(fuelRes.data);
      }

      // 2. Fetch expenses
      const expRes = await api.get('/fuel-expenses/expenses');
      if (expRes.success) {
        setExpenses(expRes.data);
      }

      // 3. Fetch vehicles for drop downs
      const vehRes = await api.get('/vehicles');
      if (vehRes.success) {
        setVehicles(vehRes.data);
      }

      // 4. Fetch analytics to show aggregate operational cost
      const reportsRes = await api.get('/reports/analytics');
      if (reportsRes.success) {
        const total = reportsRes.data.reduce((sum, item) => sum + (item.operationalCost || 0), 0);
        setTotalOpCost(total);
      }
    } catch (err) {
      console.error("Error loading fuel & expense data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setFuelError("");

    try {
      const payload = {
        vehicle: fuelVehicleId,
        liters: Number(fuelLiters),
        cost: Number(fuelCost),
        date: new Date(fuelDate)
      };

      const res = await api.post('/fuel-expenses/fuel', payload);
      if (res.success) {
        setFuelVehicleId("");
        setFuelLiters("");
        setFuelCost("");
        setIsFuelOpen(false);
        loadData();
      }
    } catch (err) {
      setFuelError(err.message || "Failed to log fuel entry");
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setExpError("");

    try {
      const payload = {
        vehicle: expVehicleId || undefined,
        type: expType,
        amount: Number(expAmount),
        date: new Date(expDate)
      };

      const res = await api.post('/fuel-expenses/expenses', payload);
      if (res.success) {
        setExpVehicleId("");
        setExpType("Toll");
        setExpAmount("");
        setIsExpenseOpen(false);
        loadData();
      }
    } catch (err) {
      setExpError(err.message || "Failed to log expense entry");
    }
  };

  return (
    <div className="space-y-4">
      {/* Fuel Logs Section */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Fuel Logs</CardTitle>
          <Button size="sm" onClick={() => setIsFuelOpen(true)}><Plus className="mr-1 size-3.5" /> Log Fuel</Button>
        </CardHeader>
        <CardContent className="px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Cost (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No fuel logs recorded.
                  </TableCell>
                </TableRow>
              ) : (
                fuelLogs.map((f) => (
                  <TableRow key={f._id}>
                    <TableCell className="font-medium font-mono">
                      {f.vehicle?.registrationNumber || "Deleted Vehicle"}
                    </TableCell>
                    <TableCell>{new Date(f.date).toLocaleDateString()}</TableCell>
                    <TableCell>{f.liters} L</TableCell>
                    <TableCell>₹{f.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Other Expenses (Toll / Misc)</CardTitle>
          <Button size="sm" onClick={() => setIsExpenseOpen(true)}><Plus className="mr-1 size-3.5" /> Add Expense</Button>
        </CardHeader>
        <CardContent className="space-y-2 px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Expense Type</TableHead>
                <TableHead>Amount (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No other expenses recorded.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">{e.vehicle?.registrationNumber || "General"}</TableCell>
                    <TableCell><Badge variant="muted">{e.type}</Badge></TableCell>
                    <TableCell>₹{e.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border/60 pt-2 text-sm">
            <span className="text-muted-foreground">Total Fleet Operational Cost (Auto: Fuel + Maintenance)</span>
            <span className="font-semibold text-orange-400 text-lg">₹{totalOpCost.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Fuel Modal */}
      {isFuelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsFuelOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Log Fuel Purchase</h2>
            
            {fuelError && (
              <div className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
                {fuelError}
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Vehicle</Label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
                  required
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Liters (L)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g. 45" 
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cost (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 3150" 
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input 
                  type="date" 
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsFuelOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Save Log</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsExpenseOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Add Expense Entry</h2>
            
            {expError && (
              <div className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
                {expError}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Associated Vehicle (Optional)</Label>
                <select
                  value={expVehicleId}
                  onChange={(e) => setExpVehicleId(e.target.value)}
                  className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
                >
                  <option value="">None (General Overhead)</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} — {v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Expense Type</Label>
                  <select 
                    value={expType}
                    onChange={(e) => setExpType(e.target.value)}
                    className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
                  >
                    <option value="Toll">Toll</option>
                    <option value="Misc">Misc</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount (₹)</Label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 150" 
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input 
                  type="date" 
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsExpenseOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
