import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, TriangleAlert, X } from "lucide-react"
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
import { api } from "@/lib/api"
import { Label } from "@/components/ui/label"

const STATUS_VARIANT = {
  Available: "success",
  "On Trip": "info",
  "In Shop": "warning",
  Retired: "destructive",
}

export default function Fleet() {
  const [vehicles, setVehicles] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false)
  const [regNum, setRegNum] = useState("")
  const [name, setName] = useState("")
  const [model, setModel] = useState("")
  const [type, setType] = useState("Van")
  const [capacity, setCapacity] = useState("")
  const [odometer, setOdometer] = useState("")
  const [cost, setCost] = useState("")
  const [region, setRegion] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const fetchVehicles = async () => {
    try {
      let qParts = [];
      if (search) qParts.push(`search=${search}`);
      if (typeFilter !== 'all') qParts.push(`type=${typeFilter}`);
      if (statusFilter !== 'all') qParts.push(`status=${statusFilter}`);
      const query = qParts.length > 0 ? `?${qParts.join('&')}` : '';

      const res = await api.get(`/vehicles${query}`);
      if (res.success) {
        setVehicles(res.data);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, typeFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const payload = {
        registrationNumber: regNum,
        name,
        model,
        type,
        maxLoadCapacity: Number(capacity),
        odometer: Number(odometer),
        acquisitionCost: Number(cost),
        region
      };

      const res = await api.post('/vehicles', payload);
      if (res.success) {
        // Reset states
        setRegNum("");
        setName("");
        setModel("");
        setType("Van");
        setCapacity("");
        setOdometer("");
        setCost("");
        setRegion("");
        setIsOpen(false);
        fetchVehicles();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to create vehicle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input 
          placeholder="Search reg. no..." 
          className="h-8 w-56 text-xs" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Type: All</SelectItem>
            <SelectItem value="Van">Van</SelectItem>
            <SelectItem value="Truck">Truck</SelectItem>
            <SelectItem value="Mini">Mini</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => setIsOpen(true)}>
          <Plus className="mr-1 size-3.5" /> Add Vehicle
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reg. No / Model</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Odometer</TableHead>
            <TableHead>Acq. Cost / Region</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No vehicles registered in the fleet.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((v) => (
              <TableRow key={v._id}>
                <TableCell>
                  <div className="font-medium font-mono">{v.registrationNumber}</div>
                  <div className="text-xs text-muted-foreground">{v.name} ({v.model})</div>
                </TableCell>
                <TableCell>{v.type}</TableCell>
                <TableCell>{v.maxLoadCapacity} kg</TableCell>
                <TableCell>{v.odometer.toLocaleString()} km</TableCell>
                <TableCell>
                  <div>₹{v.acquisitionCost.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{v.region}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TriangleAlert className="size-3.5 text-orange-400" />
        Rule: Registration no. must be unique &middot; Retired/In-Shop vehicles are hidden from Trip Dispatcher
      </p>

      {/* Add Vehicle Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Add Fleet Vehicle</h2>
            
            {errorMsg && (
              <div className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="reg" className="text-xs">Reg. Number (Unique)</Label>
                  <Input 
                    id="reg" 
                    placeholder="e.g. VAN-05" 
                    value={regNum}
                    onChange={(e) => setRegNum(e.target.value)}
                    required
                    className="h-8 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Description Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Delivery Van 05" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="model" className="text-xs">Model</Label>
                  <Input 
                    id="model" 
                    placeholder="e.g. Ford Transit" 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="type" className="text-xs">Type</Label>
                  <select 
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini">Mini</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="capacity" className="text-xs">Max Capacity (kg)</Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="odometer" className="text-xs">Odometer (km)</Label>
                  <Input 
                    id="odometer" 
                    type="number" 
                    placeholder="e.g. 10000" 
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cost" className="text-xs">Acquisition Cost (₹)</Label>
                  <Input 
                    id="cost" 
                    type="number" 
                    placeholder="e.g. 620000" 
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="region" className="text-xs">Region</Label>
                  <Input 
                    id="region" 
                    placeholder="e.g. West-1" 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Save Vehicle</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
