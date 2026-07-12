import { NavLink, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
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
  LogOut,
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

const ROLE_ACCESS = {
  FleetManager: ["/dashboard", "/fleet", "/drivers", "/trips", "/maintenance", "/fuel-expenses", "/analytics", "/settings"],
  Driver: ["/dashboard", "/trips", "/fuel-expenses"],
  SafetyOfficer: ["/drivers", "/analytics"],
  FinancialAnalyst: ["/fuel-expenses", "/analytics"]
};

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "User", role: "Driver" });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      localStorage.clear();
      navigate("/");
    } else {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Enforce path restriction
        const allowedPaths = ROLE_ACCESS[parsedUser.role] || [];
        const currentPath = window.location.pathname;
        if (currentPath !== "/" && !allowedPaths.includes(currentPath)) {
          if (allowedPaths.length > 0) {
            navigate(allowedPaths[0]);
          } else {
            localStorage.clear();
            navigate("/");
          }
        }
      } catch (e) {
        localStorage.clear();
        navigate("/");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const visibleNav = NAV.filter(item => {
    const allowed = ROLE_ACCESS[user.role] || [];
    return allowed.includes(item.to);
  });

  const initials = (user.name || "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="dark flex min-h-svh bg-background text-foreground">
      <aside className="flex w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4">
        <div className="mb-7 flex items-center gap-2.5 px-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/25">
            <Truck className="size-4 text-neutral-900" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight">TransitOps</span>
            <p className="text-[10px] leading-none text-muted-foreground">Fleet Operations</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-all duration-150 " +
                (isActive
                  ? "bg-gradient-to-r from-orange-500/15 to-orange-500/0 text-orange-400 shadow-[inset_2px_0_0_0_theme(colors.orange.500)]"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground")
              }
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm">
          <div className="relative w-72 max-w-[40vw]">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="h-7 border-transparent bg-muted/60 pl-8 text-xs focus-visible:border-ring focus-visible:bg-card" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-[10px] font-semibold text-neutral-900">
                {initials}
              </div>
              <span className="text-xs text-muted-foreground">{user.name}</span>
              <Badge variant="info">{user.role}</Badge>
            </div>
            <button
              onClick={handleLogout}
              className="flex size-6 items-center justify-center rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}
