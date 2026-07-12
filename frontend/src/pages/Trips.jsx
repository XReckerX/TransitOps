import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TriangleAlert, X } from "lucide-react"
import { api } from "@/lib/api"

const STAGES = ["Draft", "Dispatched", "Completed", "Cancelled"]

const STATUS_VARIANT = {
  Draft: "muted",
  Dispatched: "info",
  Completed: "success",
  Cancelled: "destructive"
}

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])

  // Create Trip states
  const [source, setSource] = useState("")
  const [destination, setDestination] = useState("")
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [cargoWeight, setCargoWeight] = useState("")
  const [plannedDistance, setPlannedDistance] = useState("")

  // Validation states
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [overweight, setOverweight] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Complete Trip modal states
  const [activeCompleteTrip, setActiveCompleteTrip] = useState(null)
  const [finalOdometer, setFinalOdometer] = useState("")
  const [fuelConsumed, setFuelConsumed] = useState("")
  const [actualDistance, setActualDistance] = useState("")
  const [completeError, setCompleteError] = useState("")
  
  // Trip details state
  const [selectedTrip, setSelectedTrip] = useState(null)

  const loadData = async () => {
    try {
      // Fetch all trips
      const tripsRes = await api.get('/trips');
      if (tripsRes.success) {
        setTrips(tripsRes.data);
      }

      // Fetch available vehicles & drivers for dropdowns
      const vehRes = await api.get('/vehicles?status=Available');
      if (vehRes.success) {
        setAvailableVehicles(vehRes.data);
      }

      const drvRes = await api.get('/drivers?status=Available');
      if (drvRes.success) {
        // Double check they have unexpired licenses
        const unexpired = drvRes.data.filter(d => new Date(d.licenseExpiryDate) >= new Date());
        setAvailableDrivers(unexpired);
      }
    } catch (err) {
      console.error("Error loading trips data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected vehicle capacity checks
  useEffect(() => {
    if (selectedVehicleId) {
      const veh = availableVehicles.find(v => v._id === selectedVehicleId);
      setSelectedVehicle(veh || null);
      if (veh && cargoWeight) {
        setOverweight(Number(cargoWeight) > veh.maxLoadCapacity);
      } else {
        setOverweight(false);
      }
    } else {
      setSelectedVehicle(null);
      setOverweight(false);
    }
  }, [selectedVehicleId, cargoWeight, availableVehicles]);

  const handleCreateAndDispatch = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedVehicleId || !selectedDriverId || !source || !destination || !cargoWeight || !plannedDistance) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    try {
      const payload = {
        source,
        destination,
        vehicle: selectedVehicleId,
        driver: selectedDriverId,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance)
      };

      // 1. Create trip (returns Draft status)
      const createRes = await api.post('/trips', payload);
      if (createRes.success) {
        const newTripId = createRes.data._id;
        
        // 2. Immediately dispatch the trip
        const dispatchRes = await api.put(`/trips/${newTripId}/dispatch`);
        if (dispatchRes.success) {
          setSuccessMessage(`Trip dispatched successfully under ID: ...${newTripId.slice(-6).toUpperCase()}`);
          
          // Clear inputs
          setSource("");
          setDestination("");
          setSelectedVehicleId("");
          setSelectedDriverId("");
          setCargoWeight("");
          setPlannedDistance("");
          
          loadData();
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to dispatch waybill");
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;
    try {
      const res = await api.put(`/trips/${tripId}/cancel`);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    }
  };

  const openCompleteModal = (trip) => {
    setActiveCompleteTrip(trip);
    // Pre-fill actual distance and final odometer
    const planned = trip.plannedDistance || 0;
    const currentOdo = trip.vehicle?.odometer || 0;
    setActualDistance(planned.toString());
    setFinalOdometer((currentOdo + planned).toString());
    setFuelConsumed("");
    setCompleteError("");
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setCompleteError("");

    try {
      const payload = {
        finalOdometer: Number(finalOdometer),
        fuelConsumed: Number(fuelConsumed),
        actualDistance: Number(actualDistance)
      };

      const res = await api.put(`/trips/${activeCompleteTrip._id}/complete`, payload);
      if (res.success) {
        setActiveCompleteTrip(null);
        loadData();
      }
    } catch (err) {
      setCompleteError(err.message || "Failed to complete trip");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
      {/* Create Trip Component */}
      <Card>
        <CardHeader><CardTitle>Create & Dispatch Trip</CardTitle></CardHeader>
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

          <div className="space-y-1">
            <Label className="text-xs">Source Location</Label>
            <Input 
              className="h-8 text-xs" 
              placeholder="e.g. Depot A"
              value={source} 
              onChange={(e) => setSource(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Destination Location</Label>
            <Input 
              className="h-8 text-xs" 
              placeholder="e.g. Depot B"
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Vehicle (Available Only)</Label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
            >
              <option value="">Select available vehicle...</option>
              {availableVehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.registrationNumber} — {v.name} ({v.maxLoadCapacity} kg capacity)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Driver (Available Only)</Label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 text-foreground"
            >
              <option value="">Select available driver...</option>
              {availableDrivers.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} (License category: {d.licenseCategory})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Cargo Weight (kg)</Label>
            <Input 
              className="h-8 text-xs" 
              type="number"
              placeholder="e.g. 450"
              value={cargoWeight} 
              onChange={(e) => setCargoWeight(e.target.value)} 
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Planned Distance (km)</Label>
            <Input 
              className="h-8 text-xs" 
              type="number"
              placeholder="e.g. 120"
              value={plannedDistance} 
              onChange={(e) => setPlannedDistance(e.target.value)} 
            />
          </div>

          {overweight && selectedVehicle && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in duration-200">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
              <div>
                <p className="font-medium">Capacity Exceeded</p>
                <p className="text-destructive/80">
                  Vehicle limit: {selectedVehicle.maxLoadCapacity} kg. Cargo: {cargoWeight} kg. Dispatch Blocked!
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button 
              size="sm" 
              className="flex-1" 
              disabled={overweight || !selectedVehicleId || !selectedDriverId}
              onClick={handleCreateAndDispatch}
            >
              Dispatch Waybill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Board Component */}
      <Card>
        <CardHeader><CardTitle>Live Dispatch Board</CardTitle></CardHeader>
        <CardContent className="space-y-3 px-3">
          <div className="flex items-center gap-2">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={"size-2.5 rounded-full " + (i === 1 ? "bg-orange-500" : "bg-muted")} />
                <span className="text-xs text-muted-foreground">{s}</span>
                {i < STAGES.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {trips.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-md">
                No active or dispatched trips on the board.
              </div>
            ) : (
              trips.map((t) => (
                <div 
                  key={t._id} 
                  onClick={() => setSelectedTrip(t)}
                  className="flex items-center justify-between rounded-md border border-border/60 p-3 bg-card/20 cursor-pointer hover:border-orange-500/40 hover:bg-card/40 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium font-mono text-foreground">
                      TR-{t._id.slice(-6).toUpperCase()} &nbsp; 
                      <span className="font-sans font-normal text-muted-foreground text-xs">{t.source} → {t.destination}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Vehicle: <span className="font-mono font-medium">{t.vehicle?.registrationNumber || "Unassigned"}</span> &nbsp;|&nbsp; 
                      Driver: <span className="font-medium">{t.driver?.name || "Unassigned"}</span> &nbsp;|&nbsp; 
                      Weight: <span className="font-medium">{t.cargoWeight} kg</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge variant={STATUS_VARIANT[t.status]}>{t.status}</Badge>
                      {t.status === 'Dispatched' && (
                        <p className="mt-1 text-[10px] text-orange-400 font-mono animate-pulse">On Road</p>
                      )}
                    </div>
                    
                    {/* Dispatched actions */}
                    {t.status === 'Dispatched' && (
                      <div className="flex gap-1.5 ml-2">
                        <Button 
                          size="xs" 
                          variant="success" 
                          className="h-7 text-[10px] py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCompleteModal(t);
                          }}
                        >
                          Complete
                        </Button>
                        <Button 
                          size="xs" 
                          variant="destructive" 
                          className="h-7 text-[10px] py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelTrip(t._id);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Trip Overlay Modal */}
      {activeCompleteTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setActiveCompleteTrip(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-semibold mb-1 text-foreground">Complete Trip</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Enter final trip parameters to restore driver and vehicle availability.
            </p>
            
            {completeError && (
              <div className="mb-4 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
                {completeError}
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="odo" className="text-xs">Final Odometer Reading (km)</Label>
                <Input 
                  id="odo" 
                  type="number"
                  placeholder={`Current vehicle odometer: ${activeCompleteTrip.vehicle?.odometer || 0} km`}
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dist" className="text-xs">Actual Distance Run (km)</Label>
                  <Input 
                    id="dist" 
                    type="number"
                    placeholder="e.g. 80"
                    value={actualDistance}
                    onChange={(e) => setActualDistance(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fuel" className="text-xs">Fuel Consumed (Liters)</Label>
                  <Input 
                    id="fuel" 
                    type="number"
                    placeholder="e.g. 12"
                    value={fuelConsumed}
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveCompleteTrip(null)}>Cancel</Button>
                <Button type="submit" size="sm">Submit Completion</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Trip/Waybill Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setSelectedTrip(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              Waybill Details: <span className="text-orange-500 font-mono">TR-{selectedTrip._id.slice(-6).toUpperCase()}</span>
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Trip stats */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-foreground border-b border-border pb-1 uppercase tracking-wider text-muted-foreground">Route & Planning</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Source Location</span>
                    <span className="text-sm font-medium">{selectedTrip.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Destination Location</span>
                    <span className="text-sm font-medium">{selectedTrip.destination}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Cargo Weight</span>
                      <span className="text-sm font-medium">{selectedTrip.cargoWeight} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Planned Dist.</span>
                      <span className="text-sm font-medium">{selectedTrip.plannedDistance} km</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Actual Dist.</span>
                      <span className="text-sm font-medium">{selectedTrip.actualDistance ? `${selectedTrip.actualDistance} km` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Fuel Consumed</span>
                      <span className="text-sm font-medium">{selectedTrip.fuelConsumed ? `${selectedTrip.fuelConsumed} L` : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignments & Logistics */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-foreground border-b border-border pb-1 uppercase tracking-wider text-muted-foreground">Assignments</h3>
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Assigned Vehicle</span>
                    {selectedTrip.vehicle ? (
                      <div>
                        <span className="text-sm font-medium block">{selectedTrip.vehicle.name}</span>
                        <span className="text-xs text-muted-foreground font-mono uppercase">{selectedTrip.vehicle.registrationNumber} ({selectedTrip.vehicle.model})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Assigned Driver</span>
                    {selectedTrip.driver ? (
                      <div>
                        <span className="text-sm font-medium block">{selectedTrip.driver.name}</span>
                        <span className="text-xs text-muted-foreground font-mono uppercase">{selectedTrip.driver.licenseNumber}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Unassigned</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Waybill Status</span>
                    <Badge variant={STATUS_VARIANT[selectedTrip.status]} className="mt-1">{selectedTrip.status}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Run logs */}
            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-xs space-y-1.5 mb-6">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Execution Timestamps</span>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dispatched At:</span>
                <span className="font-medium text-foreground">
                  {selectedTrip.dispatchedAt ? new Date(selectedTrip.dispatchedAt).toLocaleString() : 'Not dispatched yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed At:</span>
                <span className="font-medium text-foreground">
                  {selectedTrip.completedAt ? new Date(selectedTrip.completedAt).toLocaleString() : 'Active or draft status'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button size="sm" onClick={() => setSelectedTrip(null)}>Close Details</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
