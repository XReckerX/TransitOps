import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "@/components/LoginPage"
import ForgotPasswordPage from "@/components/ForgotPasswordPage"
import ResetPasswordPage from "@/components/ResetPasswordPage"
import AppLayout from "@/components/AppLayout"
import Dashboard from "@/pages/Dashboard"
import Fleet from "@/pages/Fleet"
import Drivers from "@/pages/Drivers"
import Trips from "@/pages/Trips"
import Maintenance from "@/pages/Maintenance"
import FuelExpenses from "@/pages/FuelExpenses"
import Analytics from "@/pages/Analytics"
import Settings from "@/pages/Settings"

function withLayout(Page) {
  return (
    <AppLayout>
      <Page />
    </AppLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={withLayout(Dashboard)} />
        <Route path="/fleet" element={withLayout(Fleet)} />
        <Route path="/drivers" element={withLayout(Drivers)} />
        <Route path="/trips" element={withLayout(Trips)} />
        <Route path="/maintenance" element={withLayout(Maintenance)} />
        <Route path="/fuel-expenses" element={withLayout(FuelExpenses)} />
        <Route path="/analytics" element={withLayout(Analytics)} />
        <Route path="/settings" element={withLayout(Settings)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
