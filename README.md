# 🚚 TransitOps - Smart Transport Operations Platform

## 🤝 Contributing

```bash
git clone https://github.com/XReckerX/TransitOps.git
cd TransitOps
git checkout -b your-name
# Make your changes
git add .
git commit -m "Short description of your changes"
git push -u origin your-name
```

Then, open the repository on GitHub and create a Pull Request (PR) from your branch to `main` for review.

## 📌 Overview

**TransitOps** is a full-stack Smart Transport Operations Platform designed to digitize and streamline fleet management operations for logistics organizations.

The platform replaces traditional spreadsheet and manual logbook-based transport management systems with a centralized solution for managing:

- 🚛 Vehicle lifecycle
- 👨‍✈️ Driver management
- 📦 Trip dispatching
- 🔧 Vehicle maintenance
- ⛽ Fuel and expense tracking
- 📊 Operational analytics

The goal is to provide logistics companies with better visibility, improved efficiency, reduced operational conflicts, and data-driven decision-making.

---

# 🎯 Problem Statement

Many logistics companies still depend on manual processes for managing transportation operations, leading to:

- Scheduling conflicts
- Vehicle under utilization
- Missed maintenance schedules
- Expired driver licenses
- Incorrect expense tracking
- Lack of operational insights

TransitOps solves these problems by providing an integrated fleet operation management system.

---

# 👥 Target Users

The system supports multiple user roles with Role-Based Access Control (RBAC):

| Role                 | Responsibilities                                         |
| -------------------- | -------------------------------------------------------- |
| 🚚 Fleet Manager     | Manage vehicles, maintenance, and fleet efficiency       |
| 👨‍✈️ Driver            | Create trips, manage assigned vehicles, track deliveries |
| 🛡️ Safety Officer    | Monitor driver compliance, licenses, and safety scores   |
| 💰 Financial Analyst | Analyze expenses, fuel consumption, and profitability    |

---

# ✨ Features

## 🔐 Authentication & Authorization

- Secure email/password authentication (JWT-based)
- Role-Based Access Control, enforced both in the UI (route/nav gating) and on every backend route
- Protected application routes
- Account lockout after 5 failed login attempts (15-minute cooldown, with a remaining-attempts hint on each failure)
- Forgot password / reset password flow via a time-limited emailed token

---

# 📊 Dashboard

Provides real-time operational insights:

### Key Performance Indicators (KPIs)

- Active Vehicles
- Available Vehicles
- Vehicles Under Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization Percentage

Additional features:

- Vehicle status filters
- Vehicle type filtering
- Region-based filtering

---

# 🚛 Vehicle Management

Maintain complete vehicle records:

### Vehicle Information

- Registration Number (Unique)
- Vehicle Model
- Vehicle Type
- Maximum Load Capacity
- Odometer Reading
- Acquisition Cost
- Current Status

### Vehicle Status

- Available
- On Trip
- In Shop
- Retired

---

# 👨‍✈️ Driver Management

Manage driver profiles:

### Driver Details

- Name
- License Number
- License Category
- License Expiry Date
- Contact Information
- Safety Score
- Driver Status

### Driver Status

- Available
- On Trip
- Off Duty
- Suspended

---

# 📦 Trip Management

Create and monitor transportation trips.

## Trip Creation Includes:

- Source location
- Destination
- Vehicle assignment
- Driver assignment
- Cargo weight
- Planned distance

## Trip Lifecycle

- Draft
- Dispatched
- Completed
- Cancelled

---

# 🔧 Maintenance Management

The maintenance module manages vehicle servicing.

Features:

- Create maintenance records
- Track service history
- Automatically mark vehicles as "In Shop"
- Remove unavailable vehicles from dispatch selection
- Restore vehicle availability after maintenance completion

---

# ⛽ Fuel & Expense Management

Track operational costs.

Supported records:

### Fuel Logs

- Fuel quantity (liters)
- Fuel cost
- Date

### Other Expenses

- Tolls
- Repairs
- Maintenance expenses

Automatically calculates:
Total Operational Cost = Fuel Cost + Maintenance Cost

---

# 📈 Reports & Analytics

TransitOps provides business intelligence through analytics.

Metrics:

## Fuel Efficiency

Fuel Efficiency = Distance / Fuel Consumed

## Fleet Utilization

Tracks how efficiently vehicles are being used.

## Vehicle ROI

ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost

Visualized with dependency-free SVG charts (line, bar, and donut), computed from real trip/vehicle data:

- **Monthly Revenue Trend** — line chart, from completed trips over the last 6 months
- **Fleet Utilization Trend** — line chart, dispatched trips per month vs. active fleet size
- **Vehicle Distribution by Type** — donut chart, live vehicle counts by type
- **Top Costliest Vehicles** — horizontal bar chart, ranked by operational cost

Exports supported:

- CSV Reports
- PDF Reports

---

# 🎁 Bonus Features Implemented

- 📊 **Charts & visual analytics** — custom SVG line/bar/donut charts (see Reports & Analytics above), no charting library dependency
- 📄 **PDF export** — in addition to CSV, analytics reports export as a formatted PDF
- 📧 **Email reminders for expiring licenses** — a daily cron job scans for driver licenses expiring within 7 days and emails Safety Officers
- 📁 **Vehicle document management** — upload and store vehicle documents (RC, insurance, etc.) via Cloudinary
- 🔍 **Search, filters, and sorting** — across Vehicles and Drivers (by registration/name, type, status), plus Dashboard filters by vehicle type/status/region
- 🌙 **Dark mode** — the entire application ships with a polished dark theme by default

---

# 🛠️ Tech Stack

**Frontend**: React (Vite), React Router, Tailwind CSS, shadcn/ui, lucide-react
**Backend**: Node.js, Express, MongoDB (Mongoose)
**Auth**: JWT, bcrypt
**Other**: node-cron (license expiry reminders), nodemailer (email), Cloudinary (document uploads), json2csv + pdfkit (report exports)

---

# 🚀 Getting Started

## Backend

```bash
cd backend
npm install
# Configure backend/.env — see backend/.env for required keys
# (MONGODB_URI, JWT_SECRET, SMTP_*, CLOUDINARY_*)
npm run dev   # nodemon, or `npm start` for plain node
```

Runs on `PORT` from `.env` (defaults to `5000`).

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5183` by default (Vite dev server). The frontend expects the backend API at the URL configured in `frontend/src/lib/api.js`.

---

# ⚙️ Business Rules

The platform enforces important operational rules:

✅ Vehicle registration numbers must be unique.

✅ Retired or maintenance vehicles cannot be dispatched.

✅ Drivers with expired licenses cannot be assigned.

✅ Suspended drivers cannot operate vehicles.

✅ Vehicles and drivers already on trips cannot be reassigned.

✅ Cargo weight cannot exceed vehicle capacity.

✅ Dispatching a trip automatically updates:

- Vehicle Status → On Trip
- Driver Status → On Trip

✅ Completing a trip restores:

- Vehicle Status → Available
- Driver Status → Available

---
