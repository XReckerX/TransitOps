import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Truck, TriangleAlert, Lock, Eye, EyeOff, ArrowRight, Package, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

import { api } from "@/lib/api"

const ROLE_MAP = {
  "fleet-manager": "FleetManager",
  "dispatcher": "Driver",
  "safety-officer": "SafetyOfficer",
  "financial-analyst": "FinancialAnalyst"
};

export default function LoginPage() {
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [transportCompany, setTransportCompany] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("Invalid credentials")
  const [isLocked, setIsLocked] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setIsLocked(false);

    try {
      if (isRegister) {
        const payload = {
          name,
          email,
          password,
          role: ROLE_MAP[role],
          transportCompany,
        };
        const res = await api.post('/auth/register', payload);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate("/dashboard");
      } else {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err.message || "Authentication failed";
      setErrorMessage(message);
      setIsLocked(/locked/i.test(message));
      setShowError(true);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-neutral-100 p-4 lg:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
        {/* Left brand panel — dark */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950 p-8 text-white lg:flex">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
                <Truck className="size-4.5 text-neutral-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">TRANSITOPS</span>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-orange-400">
              <span className="size-1.5 rounded-sm bg-orange-400" />
              Smart Transport Operations
            </div>
            <h1 className="mt-2 text-3xl font-bold leading-tight">
              Dispatch <span className="text-orange-400">Smarter.</span>
              <br />
              Operate <span className="text-orange-400">Safer.</span>
            </h1>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Manage vehicles, drivers, trips, and maintenance from a single
              role-aware operations console.
            </p>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="space-y-2">
              <div className="h-2.5 w-1/3 rounded bg-orange-400/70" />
              <div className="grid grid-cols-3 gap-2">
                {["bg-emerald-500/60", "bg-blue-500/60", "bg-amber-500/60"].map((c, i) => (
                  <div key={i} className="rounded-lg bg-white/5 p-2">
                    <div className={`mb-1.5 h-1.5 w-1/2 rounded ${c}`} />
                    <div className="h-4 w-2/3 rounded bg-white/20" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5 pt-1">
                {[80, 55, 68].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-orange-500/70" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex size-7 items-center justify-center rounded-lg bg-white/10">
                <Package className="size-3.5 text-orange-400" />
              </div>
              <p className="text-xs font-semibold">Trip Dispatch</p>
              <p className="mt-0.5 text-[11px] leading-snug text-white/50">
                Assign vehicles and drivers with live capacity checks.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 flex size-7 items-center justify-center rounded-lg bg-white/10">
                <Users className="size-3.5 text-orange-400" />
              </div>
              <p className="text-xs font-semibold">Driver Safety</p>
              <p className="mt-0.5 text-[11px] leading-snug text-white/50">
                Track license expiry and safety scores automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Right form panel — light */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-sm">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              {isRegister ? "Create your account" : "Welcome back!"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {isRegister
                ? "Register with your work details to get started."
                : "Please enter your details to sign in."}
            </p>

            {showError && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {isLocked ? (
                  <Lock className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{isLocked ? "Account locked" : "Invalid credentials"}</p>
                  <p className="text-red-600/80">{errorMessage}</p>
                </div>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {isRegister && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold text-neutral-700">
                      Full name
                    </Label>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      className="w-full rounded-lg border-0 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="transportCompany" className="text-xs font-semibold text-neutral-700">
                      Transport Company Name
                    </Label>
                    <input
                      id="transportCompany"
                      type="text"
                      placeholder="e.g. SafeTransit Logistics"
                      value={transportCompany}
                      onChange={(e) => setTransportCompany(e.target.value)}
                      required
                      className="w-full rounded-lg border-0 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-neutral-700">
                  Work email
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@transitops.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border-0 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-neutral-700">
                  Password
                </Label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isRegister ? 6 : undefined}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    className="w-full rounded-lg border-0 bg-neutral-100 px-3.5 py-2.5 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent text-neutral-400 hover:text-neutral-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {isRegister && (
                  <p className="text-xs text-neutral-400">Use at least 6 characters.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold text-neutral-700">
                  Role (RBAC)
                </Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger
                    id="role"
                    className="w-full rounded-lg border-0 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900 ring-1 ring-transparent focus:bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {role && (
                  <p className="text-xs text-neutral-400">
                    Access: {ROLES.find((r) => r.value === role)?.access}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-neutral-500">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-3.5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                  />
                  Remember me
                </label>
                {!isRegister && (
                  <Link to="/forgot-password" className="text-xs font-semibold text-orange-600 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700"
              >
                {isRegister ? "Register" : "Sign in"}
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-500">
              {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="cursor-pointer border-0 bg-transparent font-semibold text-orange-600 hover:underline"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
