# 🚚 TransitOps

**Smart Transport Operations Platform** — a full-stack fleet management system that digitizes vehicle, driver, dispatch, maintenance, and expense tracking with enforced business rules and live operational analytics.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Target Users](#target-users)
- [Features](#features)
  - [Authentication & Authorization](#authentication--authorization)
  - [Dashboard](#dashboard)
  - [Vehicle Registry](#vehicle-registry)
  - [Driver Management](#driver-management)
  - [Trip Management](#trip-management)
  - [Maintenance](#maintenance)
  - [Fuel & Expense Management](#fuel--expense-management)
  - [Reports & Analytics](#reports--analytics)
- [Business Rules](#business-rules)
- [Bonus Features](#bonus-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Contributing](#contributing)

---

## Overview

**TransitOps** replaces spreadsheet-and-logbook fleet operations with a centralized platform covering the full lifecycle of a transport business:

| | |
|---|---|
| 🚛 | Vehicle lifecycle management |
| 👨‍✈️ | Driver management & compliance |
| 📦 | Trip dispatching |
| 🔧 | Vehicle maintenance workflows |
| ⛽ | Fuel & expense tracking |
| 📊 | Operational analytics & reporting |

The goal: better visibility, fewer scheduling conflicts, higher vehicle utilization, and data-driven decisions.

## Problem Statement

Manual, spreadsheet-driven fleet operations commonly lead to:

- Scheduling conflicts (double-booked vehicles/drivers)
- Underutilized vehicles
- Missed maintenance windows
- Expired driver licenses going unnoticed
- Inaccurate or untracked expenses
- No real operational visibility

TransitOps addresses each of these with a single system of record and rules that are enforced automatically, not just documented.

## Target Users

Access is scoped by role via RBAC — each role sees only what's relevant to their job:

| Role | Responsibilities | Primary Access |
|---|---|---|
| 🚚 **Fleet Manager** | Fleet assets, maintenance, vehicle lifecycle, operational efficiency | Full access |
| 👨‍✈️ **Driver** | Create trips, assign vehicles/drivers, monitor deliveries | Dashboard, Trips, Fuel & Expenses |
| 🛡️ **Safety Officer** | Driver compliance, license validity, safety scores | Drivers, Analytics |
| 💰 **Financial Analyst** | Operational expenses, fuel consumption, profitability | Fuel & Expenses, Analytics |

---

## Features

### Authentication & Authorization

- Email/password authentication with JWT sessions
- Role-Based Access Control — enforced in the UI (route/nav gating) **and** on every backend route (defense in depth)
- Account lockout after 5 failed login attempts (15-minute cooldown, with a remaining-attempts hint on each failure)
- Forgot password / reset password flow via a time-limited, single-use emailed token

### Dashboard

Real-time operational snapshot:

- **KPIs**: Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization %
- Filters: vehicle type, status, region

### Vehicle Registry

Master list of fleet assets:

- Registration Number (unique), Name/Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status
- Status lifecycle: `Available` → `On Trip` → `In Shop` → `Retired`
- Search, filter, and sort
- Document uploads (RC, insurance, etc.)

### Driver Management

Driver profiles and compliance tracking:

- Name, License Number, License Category, License Expiry Date, Contact, Safety Score, Status
- Status lifecycle: `Available` → `On Trip` → `Off Duty` → `Suspended`
- Search, filter, and sort

### Trip Management

Full trip lifecycle with validation at every transition:

- Create: source, destination, available vehicle, available driver, cargo weight, planned distance
- Lifecycle: `Draft` → `Dispatched` → `Completed` / `Cancelled`
- Dispatch and completion automatically flip vehicle/driver status (see [Business Rules](#business-rules))

### Maintenance

- Create maintenance/service records per vehicle
- Opening a maintenance record automatically sets the vehicle to `In Shop`, removing it from trip dispatch
- Closing the record restores the vehicle to `Available` (unless retired)

### Fuel & Expense Management

- Fuel logs: liters, cost, date
- Other expenses: tolls, misc, repairs
- **Total Operational Cost** auto-computed per vehicle as `Fuel + Maintenance` (per the spec formula — toll/misc expenses are tracked separately, not folded into this total)

### Reports & Analytics

Business intelligence, computed from real trip/vehicle data — no hardcoded chart data:

- **Fuel Efficiency** = Distance / Fuel Consumed
- **Fleet Utilization** = dispatched trips ÷ active fleet size
- **Vehicle ROI** = `(Revenue − (Maintenance + Fuel)) / Acquisition Cost`
- Custom, dependency-free **SVG charts**:
  - Monthly Revenue Trend (line)
  - Fleet Utilization Trend (line)
  - Vehicle Distribution by Type (donut)
  - Top Costliest Vehicles (bar)
- Export to **CSV** and **PDF**

---

## Business Rules

Enforced server-side, not just in the UI:

- ✅ Vehicle registration numbers must be unique
- ✅ Retired or In Shop vehicles never appear in dispatch selection
- ✅ Drivers with expired licenses or `Suspended` status cannot be assigned to trips
- ✅ A vehicle or driver already `On Trip` cannot be assigned to another trip
- ✅ Cargo weight cannot exceed the vehicle's max load capacity
- ✅ Dispatching a trip sets both vehicle and driver to `On Trip`
- ✅ Completing a trip restores both to `Available`
- ✅ Cancelling a dispatched trip restores both to `Available`
- ✅ Creating an active maintenance record sets the vehicle to `In Shop`
- ✅ Closing maintenance restores the vehicle to `Available` (unless retired)

---

## Bonus Features

- 📊 **Charts & visual analytics** — custom SVG line/bar/donut charts, no charting library dependency
- 📄 **PDF export** — in addition to CSV, analytics reports export as a formatted PDF
- 📧 **License expiry email reminders** — a daily cron job scans for licenses expiring within 7 days and emails Safety Officers
- 📁 **Vehicle document management** — uploads via Cloudinary
- 🔍 **Search, filter, and sort** — across Vehicles and Drivers, plus Dashboard filters by type/status/region
- 🌙 **Dark mode** — polished dark theme throughout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, shadcn/ui, lucide-react |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth | JWT, bcrypt |
| Jobs & Email | node-cron, nodemailer |
| File Storage | Cloudinary |
| Reporting | json2csv, pdfkit |

---

## Project Structure

```
TransitOps/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/          # DB, Cloudinary
│       ├── controllers/     # Route handlers per resource
│       ├── middlewares/     # Auth, RBAC, error handling, validation
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # Status engine, analytics, export, email
│       └── jobs/            # Cron jobs (license expiry)
└── frontend/
    └── src/
        ├── components/      # Shared UI (layout, auth pages, shadcn primitives, charts)
        ├── pages/            # One page per feature area
        └── lib/              # API client
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
# Configure backend/.env — see Environment Variables below
npm run dev     # nodemon (auto-restart), or `npm start` for plain node
```

Runs on `PORT` from `.env` (defaults to `5000`).

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5183` by default. The frontend talks to the backend API at the URL configured in `frontend/src/lib/api.js`.

### Environment Variables

Set these in `backend/.env`:

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens — set a real random value |
| `JWT_EXPIRE` | Token lifetime (e.g. `30d`) |
| `CLIENT_URL` | Frontend origin, used to build password-reset links |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Vehicle document uploads |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `FROM_EMAIL` | Outgoing email (password reset, license expiry reminders) |

> `.env` should never be committed with real credentials — use `.env.example` as a template and keep secrets local or in your deployment platform's secret manager.

---

## Contributing

```bash
git clone https://github.com/XReckerX/TransitOps.git
cd TransitOps
git checkout -b your-name
# Make your changes
git add .
git commit -m "Short description of your changes"
git push -u origin your-name
```

Then open a Pull Request from your branch to `main` on GitHub for review.
