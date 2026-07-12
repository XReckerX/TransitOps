import { useEffect, useState } from "react"
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
import { api } from "@/lib/api"

const STATUS_DISPLAY = {
  Active: "In Shop",
  Completed: "Completed"
}

const STATUS_VARIANT = {
  Active: "warning",
  Completed: "success"
}

export default function Maintenance() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])

  // Form states
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [cost, setCost] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const loadData = async () => {
    try {
      // 1. Fetch Maintenance logs
      const logsRes = await api.get('/maintenance');
      if (logsRes.success) {
        setLogs(logsRes.data);
      }

      // 2. Fetch Vehicles for drop down (only non-retired, available or on-trip)
      const vehRes = await api.get('/vehicles');
      if (vehRes.success) {
        const nonRetired = vehRes.data.filter(v => v.status !== 'Retired');
        setVehicles(nonRetired);
      }
    } catch (err) {
      console.error("Error loading maintenance data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedVehicleId || !serviceType || !cost) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    try {
      const payload = {
        vehicle: selectedVehicleId,
        serviceType,
        cost: Number(cost),
        date: new Date(date)
      };

      const res = await api.post('/maintenance', payload);
      if (res.success) {
        setSuccessMessage("Service logged and vehicle marked 'In Shop'!");
        setSelectedVehicleId("");
        setServiceType("");
        setCost("");
        loadData();
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to log maintenance record");
    }
  };

  const handleCloseMaintenance = async (id) => {
    if (!window.confirm("Close this maintenance service and mark the vehicle as available?")) return;
    try {
      const res = await api.put(`/maintenance/${id}/close`);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(`Failed to close service: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Log Service Record */}
      <Card>
        <CardHeader><CardTitle>Log Service Record</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-3">
          {errorMessage && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded p-2.5">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Vehicle</Label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
                required
              >
                <option value="">Select vehicle...</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} — {v.name} ({v.status})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Service Type</Label>
              <Input 
                className="h-8 text-xs" 
                placeholder="Oil Change, Engine Check..."
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Cost (₹)</Label>
              <Input 
                className="h-8 text-xs" 
                type="number"
                placeholder="Cost in INR"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input 
                className="h-8 text-xs" 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" size="sm" className="w-full">Save Service Record</Button>
          </form>
        </CardContent>
      </Card>

      {/* Service Log list */}
      <Card>
        <CardHeader><CardTitle>Service Logs History</CardTitle></CardHeader>
        <CardContent className="space-y-4 px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Cost (₹)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No service records logged.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((l) => (
                  <TableRow key={l._id}>
                    <TableCell className="font-medium font-mono">
                      {l.vehicle?.registrationNumber || "Deleted Vehicle"}
                    </TableCell>
                    <TableCell>{l.serviceType}</TableCell>
                    <TableCell>₹{l.cost.toLocaleString()}</TableCell>
                    <TableCell>{new Date(l.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[l.status]}>
                        {STATUS_DISPLAY[l.status] || l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {l.status === 'Active' && (
                        <Button 
                          size="xs" 
                          variant="success" 
                          className="h-6 text-[10px] py-0.5"
                          onClick={() => handleCloseMaintenance(l._id)}
                        >
                          Close Service
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
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
            <p className="text-xs text-muted-foreground font-medium">
              Rule: In-Shop vehicles are removed from the dispatch pool. Closing service returns them to Available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
