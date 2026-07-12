import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Download } from "lucide-react"
import LineChart from "@/components/charts/LineChart"
import DonutChart from "@/components/charts/DonutChart"
import BarChart from "@/components/charts/BarChart"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const REVENUE_RATE_PER_KG_PER_KM = 0.025 // matches backend analyticsService estimate

export default function Analytics() {
  const [reportData, setReportData] = useState([])
  const [kpis, setKpis] = useState([
    { label: "Fuel Efficiency", value: "0 km/l" },
    { label: "Fleet Utilization", value: "0%" },
    { label: "Operational Cost", value: "₹0" },
    { label: "Average Vehicle ROI", value: "0%" },
  ])
  const [costliestVehicles, setCostliestVehicles] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [utilizationTrend, setUtilizationTrend] = useState([])
  const [vehicleTypeSplit, setVehicleTypeSplit] = useState([])

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
        const topCostliest = sorted.slice(0, 5).map((v) => ({
          label: v.registrationNumber,
          value: v.operationalCost || 0,
        }));
        setCostliestVehicles(topCostliest);
      }

      // 3. Fetch vehicles for type distribution donut
      const vehiclesRes = await api.get('/vehicles');
      if (vehiclesRes.success) {
        const byType = {};
        vehiclesRes.data.forEach((v) => {
          byType[v.type] = (byType[v.type] || 0) + 1;
        });
        setVehicleTypeSplit(Object.entries(byType).map(([label, value]) => ({ label, value })));
      }

      // 4. Fetch trips to derive monthly revenue + utilization trend from real completed/dispatched trips
      const tripsRes = await api.get('/trips');
      if (tripsRes.success) {
        const now = new Date();
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()] };
        });

        const revenueByMonth = Object.fromEntries(last6Months.map((m) => [m.key, 0]));
        const dispatchedByMonth = Object.fromEntries(last6Months.map((m) => [m.key, 0]));

        tripsRes.data.forEach((trip) => {
          if (trip.status === 'Completed' && trip.completedAt) {
            const d = new Date(trip.completedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (key in revenueByMonth) {
              revenueByMonth[key] += (trip.cargoWeight || 0) * (trip.actualDistance || 0) * REVENUE_RATE_PER_KG_PER_KM;
            }
          }
          if ((trip.status === 'Dispatched' || trip.status === 'Completed') && trip.dispatchedAt) {
            const d = new Date(trip.dispatchedAt);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (key in dispatchedByMonth) {
              dispatchedByMonth[key] += 1;
            }
          }
        });

        setRevenueTrend(last6Months.map((m) => ({ label: m.label, value: Math.round(revenueByMonth[m.key]) })));

        const vehicleCount = vehiclesRes.success ? vehiclesRes.data.filter((v) => v.status !== 'Retired').length || 1 : 1;
        setUtilizationTrend(
          last6Months.map((m) => ({
            label: m.label,
            value: Math.round((dispatchedByMonth[m.key] / vehicleCount) * 100),
          }))
        );
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
            {revenueTrend.every((d) => d.value === 0) ? (
              <div className="flex h-40 items-center justify-center text-center text-xs text-muted-foreground">
                No completed trips in the last 6 months yet.
              </div>
            ) : (
              <LineChart data={revenueTrend} valueFormatter={(v) => `₹${v.toLocaleString()}`} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Vehicle Distribution by Type</CardTitle></CardHeader>
          <CardContent className="px-3">
            {vehicleTypeSplit.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-center text-xs text-muted-foreground">
                No vehicles registered yet.
              </div>
            ) : (
              <DonutChart data={vehicleTypeSplit} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Fleet Utilization Trend</CardTitle></CardHeader>
          <CardContent className="px-3">
            {utilizationTrend.every((d) => d.value === 0) ? (
              <div className="flex h-40 items-center justify-center text-center text-xs text-muted-foreground">
                No dispatched trips in the last 6 months yet.
              </div>
            ) : (
              <LineChart data={utilizationTrend} valueFormatter={(v) => `${v}%`} color="#3987e5" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Costliest Vehicles</CardTitle></CardHeader>
          <CardContent className="px-3">
            {costliestVehicles.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-center text-xs text-muted-foreground">
                No cost metrics found. Log fuel/maintenance first.
              </div>
            ) : (
              <BarChart data={costliestVehicles} valueFormatter={(v) => `₹${v.toLocaleString()}`} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
