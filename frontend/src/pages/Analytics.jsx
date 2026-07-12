import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Download } from "lucide-react"

export default function Analytics() {
  const [reportData, setReportData] = useState([])
  const [kpis, setKpis] = useState([
    { label: "Fuel Efficiency", value: "0 km/l" },
    { label: "Fleet Utilization", value: "0%" },
    { label: "Operational Cost", value: "₹0" },
    { label: "Average Vehicle ROI", value: "0%" },
  ])
  const [costliestVehicles, setCostliestVehicles] = useState([])

  const loadData = async () => {
    try {
      // 1. Fetch dashboard to get fleet utilization
      let utilization = "0%";
      const dashRes = await api.get('/dashboard');
      if (dashRes.success) {
        utilization = dashRes.data.fleetUtilization || "0%";
      }

      // 2. Fetch reports data
      const reportsRes = await api.get('/reports/analytics');
      if (reportsRes.success) {
        const list = reportsRes.data;
        setReportData(list);

        // Compute averages and sums
        const totalVehicles = list.length || 1;
        const totalDistance = list.reduce((sum, item) => sum + (item.totalDistance || 0), 0);
        const totalFuel = list.reduce((sum, item) => sum + (item.totalFuelLiters || 0), 0);
        const avgFuelEff = totalFuel > 0 ? (totalDistance / totalFuel) : 0;

        const totalOpCost = list.reduce((sum, item) => sum + (item.operationalCost || 0), 0);
        const avgRoi = list.reduce((sum, item) => sum + (item.roi || 0), 0) / totalVehicles;

        setKpis([
          { label: "Avg Fuel Efficiency", value: `${avgFuelEff.toFixed(1)} km/l` },
          { label: "Fleet Utilization", value: utilization },
          { label: "Total Operational Cost", value: `₹${totalOpCost.toLocaleString()}` },
          { label: "Average Vehicle ROI", value: `${avgRoi.toFixed(1)}%` },
        ]);

        // Compute top costliest vehicles
        const sorted = [...list].sort((a, b) => b.operationalCost - a.operationalCost);
        const maxCost = sorted[0]?.operationalCost || 1;

        const topCostliest = sorted.slice(0, 3).map((v, i) => {
          const pct = Math.round((v.operationalCost / maxCost) * 100);
          const colors = ["bg-red-500", "bg-amber-500", "bg-blue-500"];
          return {
            name: v.registrationNumber,
            cost: v.operationalCost,
            pct: pct || 10,
            color: colors[i] || "bg-muted"
          };
        });
        setCostliestVehicles(topCostliest);
      }
    } catch (err) {
      console.error("Error loading analytics data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadCSV = async () => {
    try {
      const csvText = await api.get('/reports/export?format=csv');
      const blob = new Blob([csvText], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fleet_analytics_report.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to download report: ${err.message}`);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfText = await api.get('/reports/export?format=pdf');
      const blob = new Blob([pdfText], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fleet_analytics_report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Failed to download report: ${err.message}`);
    }
  };

  // Helper values for mock charts
  const revenueTrend = [40, 55, 48, 70, 62, 78, 66, 58];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Fleet Operational Intelligence</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-1 size-3.5" /> PDF
          </Button>
          <Button size="sm" onClick={handleDownloadCSV}>
            <Download className="mr-1 size-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} size="sm">
            <CardContent className="space-y-1 px-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="text-xl font-semibold text-foreground">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <p className="text-[10px] text-muted-foreground">
        * Vehicle ROI Formula = (Revenue - (Maintenance + Fuel)) / Acquisition Cost. Revenue is calculated dynamically per completed trip distance & weight parameters.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly Revenue Trend</CardTitle></CardHeader>
          <CardContent className="px-3">
            <div className="flex h-40 items-end gap-2">
              {revenueTrend.map((v, i) => (
                <div key={i} className="flex-1 rounded-t bg-blue-500/80" style={{ height: `${v}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Costliest Vehicles</CardTitle></CardHeader>
          <CardContent className="space-y-4 px-3">
            {costliestVehicles.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No cost metrics found. Log fuel/maintenance first.
              </div>
            ) : (
              costliestVehicles.map((v) => (
                <div key={v.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono">{v.name}</span>
                    <span className="text-muted-foreground">₹{v.cost.toLocaleString()}</span>
                  </div>
                  <Progress value={v.pct} barClassName={v.color} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
