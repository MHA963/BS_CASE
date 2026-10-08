# 🎨 BESTSELLER Recolour Case — Studio Digital Asset Workflow

This repository contains the technical solution and case files for the **BESTSELLER Recolour Studio Case**.

---

## 📌 Project Overview & Business Context

At **BESTSELLER**, photographing every garment colorway in a physical photo studio is costly and time-consuming. Instead, base reference garments are photographed in standard studio angles (`_001` front, `_002` back, `_007` detail), and **Recolour Work Orders** are issued to digital retouching partners (e.g. Pixelz, RetouchPro) to digitally recolour garments to target Pantone solids or All-Over Prints (AOP), while strictly preserving clipping paths.

---

## 📋 Core Case Requirements

1. **Recolour Ticket Creation**: Interactive form to create work orders with photo ID, style number, priority, and partner assignment.
2. **Ticket Queue**: Dynamic workflow list/Kanban tracking ticket lifecycle statuses (`Pending`, `Sent`, `In Progress`, `Completed`, `Rejected`) with multi-faceted filtering.
3. **Partner Integration**: Simulation engine dispatching tickets to retouching partners and tracking SLA turnaround.
4. **Approval & Quality Control (QC)**: Interactive Before/After split inspection view allowing Studio Operators/Managers to **Approve** assets to the *Approved Library* or **Reject** with feedback.
5. **Approved Digital Asset Library**: High-resolution asset repository for approved product imagery by style and colorway.
6. **Navigation & Dashboard**: Responsive sidebar navigation, role-based access views (Operator vs. Manager), and KPI performance metrics.

---

## 📂 Case Mock Data & Guidelines Summary

| Ticket | Base Style ID | Shots / Angles | Target Pantone / AOP Colorways | Pattern Reference | Special Instructions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ticket 1** | `15377489` | `_001`, `_002`, `_007` | • **Granita** (Solid)<br>• **Fuchsia Fedora** (AOP Block Libre) | `Block Libre.jpg` | Keep 1 clipping path for all pictures |
| **Ticket 2** | `15377486` | `_001`, `_002`, `_007` | • **Night Sky** (AOP White Dots)<br>• **Hedge Green** (Solid)<br>• **Navy Blazer** (Solid) | `DOTS CLOUD DANCER.jpg` (Night Sky background) | Keep 1 clipping path for all pictures |
| **Ticket 3** | `15377488` | `_001`, `_002`, `_007` | • **Hedge Green** (Solid)<br>• **Navy Blazer** (Solid)<br>• **Night Sky** (AOP White Dots) | `DOTS CLOUD DANCER.jpg` (Night Sky background) | Keep 1 clipping path for all pictures |
| **Ticket 4** | `15377522` | `_001`, `_002`, `_007` | • **Granita** (Solid)<br>• **Fuchsia Fedora** (AOP Block Libre) | `Block Libre.jpg` | Keep 1 clipping path for all pictures |

---

## 🛠️ Technology Stack

- **Frontend**: Vue 3 (Composition API, `<script setup>`), Vite, Tailwind CSS, Pinia, Vue Router, Lucide Icons.
- **Backend**: Express.js (Node.js REST API), Multer (Image asset handling), CORS.
