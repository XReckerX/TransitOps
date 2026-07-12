# 🚚 TransitOps - Smart Transport Operations Platform

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
- Vehicle underutilization
- Missed maintenance schedules
- Expired driver licenses
- Incorrect expense tracking
- Lack of operational insights

TransitOps solves these problems by providing an integrated fleet operation management system.

---

# 👥 Target Users

The system supports multiple user roles with Role-Based Access Control (RBAC):

| Role | Responsibilities |
|------|------------------|
| 🚚 Fleet Manager | Manage vehicles, maintenance, and fleet efficiency |
| 👨‍✈️ Driver | Create trips, manage assigned vehicles, track deliveries |
| 🛡️ Safety Officer | Monitor driver compliance, licenses, and safety scores |
| 💰 Financial Analyst | Analyze expenses, fuel consumption, and profitability |

---

# ✨ Features

## 🔐 Authentication & Authorization

- Secure email/password authentication
- Role-Based Access Control
- Protected application routes
- User permission management

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

Exports supported:

- CSV Reports
- PDF Reports

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

