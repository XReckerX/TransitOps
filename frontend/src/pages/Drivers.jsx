import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, TriangleAlert, X } from "lucide-react"
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
  Suspended: "destructive",
  "On Trip": "info",
  "Off Duty": "muted",
}

const LEGEND = ["Available", "On Trip", "Off Duty", "Suspended"]

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [search, setSearch] = useState("")
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [licenseCategory, setLicenseCategory] = useState("")
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [safetyScore, setSafetyScore] = useState("100")
  const [errorMsg, setErrorMsg] = useState("")

  const fetchDrivers = async () => {
    try {
      let url = '/drivers';
      if (search) {
        url += `?search=${search}`;
      }
      const res = await api.get(url);
      if (res.success) {
        setDrivers(res.data);
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const payload = {
        name,
        licenseNumber,
        licenseCategory,
        licenseExpiryDate,
        contactNumber,
        safetyScore: Number(safetyScore)
      };

      const res = await api.post('/drivers', payload);
      if (res.success) {
        // Reset states
        setName("");
        setLicenseNumber("");
        setLicenseCategory("");
        setLicenseExpiryDate("");
        setContactNumber("");
        setSafetyScore("100");
        setIsOpen(false);
        fetchDrivers();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to add driver");
    }
  };

  const isExpired = (expiryStr) => {
    return new Date(expiryStr) < new Date();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input 
          placeholder="Search driver name..." 
          className="h-8 w-56 text-xs" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button size="sm" className="ml-auto" onClick={() => setIsOpen(true)}>
          <Plus className="mr-1 size-3.5" /> Add Driver
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver Name</TableHead>
            <TableHead>License No.</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>License Expiry</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Safety Score</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No drivers registered.
              </TableCell>
            </TableRow>
          ) : (
            drivers.map((d) => {
              const expired = isExpired(d.licenseExpiryDate);
              return (
                <TableRow key={d._id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="font-mono">{d.licenseNumber}</TableCell>
                  <TableCell>{d.licenseCategory}</TableCell>
                  <TableCell className={expired ? "text-red-400 font-medium" : ""}>
                    {new Date(d.licenseExpiryDate).toLocaleDateString()} 
                    {expired && " (EXPIRED)"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.contactNumber}</TableCell>
                  <TableCell>{d.safetyScore}%</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[d.status]}>{d.status}</Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
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

      {/* Add Driver Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Register Driver Profile</h2>
            
            {errorMsg && (
              <div className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Driver Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Alex" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="lic" className="text-xs">License Number</Label>
                  <Input 
                    id="lic" 
                    placeholder="e.g. DL-99215" 
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    className="h-8 text-xs font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cat" className="text-xs">License Category</Label>
                  <Input 
                    id="cat" 
                    placeholder="e.g. HMV" 
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="expiry" className="text-xs">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    type="date" 
                    value={licenseExpiryDate}
                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="safety" className="text-xs">Safety Score (%)</Label>
                  <Input 
                    id="safety" 
                    type="number" 
                    min="0"
                    max="100"
                    placeholder="e.g. 100" 
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="contact" className="text-xs">Contact Number</Label>
                <Input 
                  id="contact" 
                  placeholder="e.g. 98765xxxxx" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Save Profile</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
