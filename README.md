# 🎨 BESTSELLER Recolour Case — Studio Digital Asset Workflow

This repository contains the complete full-stack technical solution for the **BESTSELLER Recolour Studio Case**.

---

## 📌 Project Overview & Business Context

At **BESTSELLER**, photographing every garment colorway in a physical photo studio is costly and time-consuming. Instead, base reference garments are photographed in standard studio angles (`_001` front, `_002` back, `_007` detail), and **Recolour Work Orders** are issued to digital retouching partners (e.g. Pixelz, RetouchPro) to digitally recolour garments to target Pantone solids or All-Over Prints (AOP), while strictly preserving clipping paths.

---

## ⚡ Quick Start (Run Locally)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Both Server & Client
```bash
npm run dev
```

- **Frontend (Vue 3 + Vite)**: [http://localhost:5173](http://localhost:5173)
- **Backend API (Express.js)**: [http://localhost:3001](http://localhost:3001)

*(To run individually: `npm run dev:server` or `npm run dev:client`)*

---

## 📋 Features & Case Requirement Alignment

| Feature Requirement | Implementation Details |
| :--- | :--- |
| **1. Recolour Ticket Creation** | Interactive form with photo ID, style number, brand, season, priority (`High`, `Medium`, `Low`), partner selection, shot multi-selection (`_001`, `_002`, `_007`), Pantone solid swatches, AOP attachments, and 1-click dispatch. |
| **2. Ticket Queue & Workflow** | Dual-mode view: **Visual Kanban Board** & **Data Table**. Multi-faceted filtering by Partner, Status (`Pending`, `Sent`, `In Progress`, `Awaiting Review`, `Completed`, `Rejected`), Priority, and Search. |
| **3. Partner Integration Simulator** | Real-time dispatch simulator, live SLA tracking counters, and interactive callback triggers for partner delivery webhooks. |
| **4. Approval & QC Studio** | **Interactive Before/After Split Curtain Slider** with zoom controls (100%, 150%, 200%), single clipping path verification outline, Pantone spec card, and instant **Approve** (commits to library) or **Reject** (with reason modal returning ticket to queue). |
| **5. Approved Asset Library** | High-resolution grid of production-ready digital assets categorized by style, season, and colorway with 1-click batch ZIP export and hi-res image download. |
| **6. Role-Based Views (Bonus)** | Interactive **Role Switcher** in the sidebar toggling between **Studio Operator** (create & dispatch orders) and **Studio Production Manager** (sign-off and approve QC assets). |
| **7. KPI Dashboard (Bonus)** | High-density metric cards (*Active Tickets, Awaiting QC, Partner SLA Rate, Turnaround Time, Reshoot Cost Savings*), weekly throughput velocity bar chart, and partner workload distribution. |

---

## 📂 Case Mock Data & Guidelines Summary

The application is pre-seeded with the exact 4 real case tickets, photo assets, and Pantone specifications:

| Ticket | Base Style ID | Shots / Angles | Target Pantone / AOP Colorways | Pattern Reference | Special Instructions |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **Ticket 1** | `15377489` | `_001`, `_002`, `_007` | • **Granita** (Solid - `#8B263E`)<br>• **Fuchsia Fedora** (AOP Block Libre - `#D94F70`) | `Block Libre.jpg` | Keep 1 clipping path for all pictures |
| **Ticket 2** | `15377486` | `_001`, `_002`, `_007` | • **Night Sky** (AOP White Dots - `#1F2937`)<br>• **Hedge Green** (Solid - `#556B2F`)<br>• **Navy Blazer** (Solid - `#1B263B`) | `DOTS CLOUD DANCER.jpg` (Night Sky background) | Keep 1 clipping path for all pictures |
| **Ticket 3** | `15377488` | `_001`, `_002`, `_007` | • **Hedge Green** (Solid - `#556B2F`)<br>• **Navy Blazer** (Solid - `#1B263B`)<br>• **Night Sky** (AOP White Dots - `#1F2937`) | `DOTS CLOUD DANCER.jpg` (Night Sky background) | Keep 1 clipping path for all pictures |
| **Ticket 4** | `15377522` | `_001`, `_002`, `_007` | • **Granita** (Solid - `#8B263E`)<br>• **Fuchsia Fedora** (AOP Block Libre - `#D94F70`) | `Block Libre.jpg` | Keep 1 clipping path for all pictures |

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: **Vue 3** (Composition API, `<script setup>`), **Vite**, **Tailwind CSS**, **Pinia** (State Management), **Vue Router 4**, **Lucide Vue Next** (Icons).
- **Backend**: **Node.js** + **Express.js**, **Multer** (File handling), **CORS**, local JSON database with instant seed reset.
- **Assets**: Serves original high-resolution studio photos directly from `recolour-case/` folders.
