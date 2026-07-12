import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Truck, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLES = [
  {
    value: "fleet-manager",
    label: "Fleet Manager",
    access: "Fleet, Maintenance",
  },
  {
    value: "dispatcher",
    label: "Dispatcher",
    access: "Dashboard, Trips",
  },
  {
    value: "safety-officer",
    label: "Safety Officer",
    access: "Drivers, Compliance",
  },
  {
    value: "financial-analyst",
    label: "Financial Analyst",
    access: "Fuel & Expenses, Analytics",
  },
]

export default function LoginPage() {
  const [role, setRole] = useState("dispatcher")
  const [showError, setShowError] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left brand panel — light */}
      <div className="relative hidden flex-col bg-neutral-100 p-10 text-neutral-900 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
            <Truck className="size-5 text-neutral-900" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">TransitOps</p>
            <p className="text-xs text-neutral-500">Smart Transport Operations Platform</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <div className="w-full max-w-md space-y-3">
            <p className="text-sm font-medium text-neutral-500">One login, four roles</p>
            <div className="flex items-center justify-center gap-2">
              {ROLES.map((r) => (
                <span
                  key={r.value}
                  className={
                    "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                    (r.value === role
                      ? "border-orange-500 bg-orange-500/10 text-orange-600"
                      : "border-neutral-200 bg-white text-neutral-500")
                  }
                >
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-400">
          TransitOps &copy; 2026 &middot; RBAC enabled
        </p>
      </div>

      {/* Right form panel — dark */}
      <div className="dark flex items-center justify-center bg-background p-6 text-foreground lg:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          {showError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">Invalid credentials</p>
                <p className="text-destructive/80">
                  Account locked after 5 failed attempts.
                </p>
              </div>
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              setShowError(false)
              navigate("/dashboard")
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@transitops.io"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role (RBAC)</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" defaultChecked />
                <Label htmlFor="remember" className="font-normal text-muted-foreground">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
