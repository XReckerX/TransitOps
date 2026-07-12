import { NavLink } from "react-router-dom"
import {
  Truck,
  LayoutDashboard,
  Car,
  Users,
  Route as RouteIcon,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fleet", label: "Fleet", icon: Car },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/trips", label: "Trips", icon: RouteIcon },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/fuel-expenses", label: "Fuel & Expenses", icon: Fuel },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
]

export default function AppLayout({ children }) {
  return (
    <div className="dark flex min-h-svh bg-background text-foreground">
      <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-card/40 px-3 py-4">
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500">
            <Truck className="size-4 text-neutral-900" />
          </div>
          <span className="text-sm font-semibold">TransitOps</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors " +
                (isActive
                  ? "bg-orange-500/15 text-orange-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="relative w-72 max-w-[40vw]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="h-7 pl-8 text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Vihar K.</span>
            <Badge variant="info">Dispatcher</Badge>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
