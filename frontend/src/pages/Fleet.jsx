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

  // Details modal states
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [vehicleTrips, setVehicleTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(false)
  
  // Upload states
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docName, setDocName] = useState("")
  const [docFile, setDocFile] = useState(null)

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

  const handleRowClick = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setLoadingTrips(true);
    // Reset upload fields
    setDocName("");
    setDocFile(null);
    
    try {
      const res = await api.get(`/trips?vehicle=${vehicle._id}`);
      if (res.success) {
        setVehicleTrips(res.data.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching vehicle trips:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docFile || !selectedVehicle) return;
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('name', docName || docFile.name);
      
      const res = await api.post(`/vehicles/${selectedVehicle._id}/documents`, formData);
      if (res.success) {
        setSelectedVehicle(res.data);
        setDocName("");
        setDocFile(null);
        fetchVehicles();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingDoc(false);
    }
  };

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
              <TableRow 
                key={v._id} 
                onClick={() => handleRowClick(v)}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
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

      {/* Selected Vehicle Details Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-3xl rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              Vehicle Profile: <span className="text-orange-500 font-mono">{selectedVehicle.registrationNumber}</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-muted/30 p-4 rounded-lg border border-border/50">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Name / Description</span>
                <span className="text-sm font-semibold">{selectedVehicle.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Model</span>
                <span className="text-sm font-semibold">{selectedVehicle.model}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Type</span>
                <span className="text-sm font-semibold">{selectedVehicle.type}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Capacity</span>
                <span className="text-sm font-semibold">{selectedVehicle.maxLoadCapacity} kg</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Odometer</span>
                <span className="text-sm font-semibold">{selectedVehicle.odometer.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Acquisition Cost</span>
                <span className="text-sm font-semibold">₹{selectedVehicle.acquisitionCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Region</span>
                <span className="text-sm font-semibold">{selectedVehicle.region}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Status</span>
                <div>
                  <Badge variant={STATUS_VARIANT[selectedVehicle.status]} className="mt-1">{selectedVehicle.status}</Badge>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Documents Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Document Management</h3>
                
                {/* Upload Form */}
                <form onSubmit={handleUpload} className="bg-muted/20 border border-border/40 rounded-lg p-3 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="docName" className="text-[10px] uppercase">Document Title</Label>
                    <Input 
                      id="docName"
                      placeholder="e.g. Insurance 2026"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="h-7 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="docFile" className="text-[10px] uppercase">Select File</Label>
                    <Input 
                      id="docFile"
                      type="file"
                      onChange={(e) => setDocFile(e.target.files[0])}
                      className="h-8 text-xs cursor-pointer bg-background"
                      required
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full h-7 text-xs" disabled={uploadingDoc}>
                    {uploadingDoc ? "Uploading..." : "Upload Document"}
                  </Button>
                </form>

                {/* Uploaded Documents List */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Uploaded Files</span>
                  {selectedVehicle.documents && selectedVehicle.documents.length > 0 ? (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                      {selectedVehicle.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border/50 text-xs">
                          <span className="font-medium truncate max-w-[70%]">{doc.name}</span>
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-orange-500 hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View File
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No documents uploaded.</p>
                  )}
                </div>
              </div>

              {/* Trips Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Last 5 Trips</h3>
                {loadingTrips ? (
                  <p className="text-xs text-muted-foreground animate-pulse py-4 text-center">Loading trips history...</p>
                ) : vehicleTrips.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">No trips recorded for this vehicle.</p>
                ) : (
                  <div className="overflow-hidden rounded-md border border-border">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="py-2 text-[10px] uppercase">Route</TableHead>
                          <TableHead className="py-2 text-[10px] uppercase">Date</TableHead>
                          <TableHead className="py-2 text-[10px] uppercase">Distance</TableHead>
                          <TableHead className="py-2 text-[10px] uppercase">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicleTrips.map((t) => (
                          <TableRow key={t._id} className="hover:bg-muted/20">
                            <TableCell className="py-2 text-xs font-medium truncate max-w-[120px]">
                              {t.source} &rarr; {t.destination}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-2 text-xs">
                              {t.actualDistance ? `${t.actualDistance} km` : `${t.plannedDistance} km`}
                            </TableCell>
                            <TableCell className="py-2 text-xs">
                              <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Dispatched' ? 'info' : 'muted'} className="text-[10px] px-1 py-0 h-4">
                                {t.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-3 border-t border-border">
              <Button size="sm" onClick={() => setSelectedVehicle(null)}>Close Profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
