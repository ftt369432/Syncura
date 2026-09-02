# 🧬 Syncura — Sovereign AI Medication Tracker & Senior Caregiver Swarm

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![FDA CDS Safe Harbor](https://img.shields.io/badge/FDA_21st_Century_Cures-§3060_Compliant-emerald.svg)](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)

> **Caring for aging parents shouldn't feel like an ICU shift.**  
> Syncura is an intelligent, zero-bloat medication management, computer-vision pill auditing, real-time caregiver coordination, and SMART on FHIR interoperability ecosystem. Built for family caregivers, seniors with complex polypharmacy, and mobile home health agencies.

---

## 🌟 Core Proprietary Moats & Key Features

### 1. 📷 60-Second Optical Bottle OCR & Instant Safety Interceptor
- **Point & Scan:** High-accuracy OCR extracts drug name, strength, frequency rules, refill counts, and dietary requirements directly from crumpled prescription labels.
- **Immediate Pre-Save Screening:** The split second a bottle is parsed, Syncura cross-checks:
  - 🚨 **Allergen Classes:** Beta-lactams, sulfonamides, NSAIDs, opioids, ACE inhibitors.
  - ⚡ **Drug-Drug Interactions (DDI):** Detects lethal combinations (e.g. daily Eliquis + Ibuprofen bleeding risk) against active cabinet scripts.
  - 🛡️ **Self-Calibrating Historical Memory:** Detects if a medication was previously discontinued due to patient intolerance (e.g. Lisinopril cough) to block accidental re-prescriptions.
  - ☕ **Food & Timing Guard:** Meal-anchored vs. empty stomach fasting rules.

### 2. 👆 1-Tap Quick Intake & 🎙️ Voice Health Intake Studio
- **Zero-Typing Quick Select:** Visual tactile toggle chips for the top 90% common allergens (`Penicillin`, `Sulfa`, `Aspirin`, `Codeine`, etc.) and chronic conditions (`Hypertension`, `Diabetes`, `AFib`, `Kidney Disease`, `Asthma`, etc.).
- **Spoken Voice Intake:** Seniors or busy caregivers tap a single microphone button to speak naturally (*"I'm allergic to penicillin and aspirin, and I have high blood pressure"*).
  - Live real-time speech transcription.
  - Clinical NLP automatically extracts recognized medical entities and auto-activates the corresponding chips on screen!
  - Stores audio memos and transcripts in the permanent medical profile for family and EMT review.

### 3. 🧠 Self-Calibrating Persistent Clinical Memory Graph
- **Auto-Adjusting Interaction Matrix:** When a medication is discontinued or switched, Syncura marks it inactive, instantly clearing past interaction warnings while logging an immutable entry into the patient's medical timeline.
- **Longitudinal Trajectory Tracker:** Tracks lab trends (HbA1c, eGFR Kidney Function), pacemaker interrogations, and adverse drug reactions over years.

### 4. 🍽️ Dynamic Floating Meal Routines
- Replaces stubborn, rigid 8:00 AM alarm clocks with meal-relative schedules.
- If breakfast is delayed by 45 minutes, morning medications float forward automatically without disrupting minimum hourly spacing required for bedtime doses.

### 5. 🔍 Physical Pill-Tray Computer Vision Audit
- Caregivers pour loose pills onto a napkin or plate.
- Syncura's client-side computer vision segments, highlights, and counts physical tablets in under 1 second, reconciling physical stock against the digital inventory ledger.

### 6. 🚨 Emergency ICE Pass & SMART on FHIR R4 Clinic Intake
- **Emergency ICE Pass:** Zero-authentication paramedic triage screen showing blood type, pacemaker details, critical blood thinners, and life-threatening allergies.
- **SMART Health Link (IPS QR):** Renders an International Patient Summary QR code that clinic receptionists can scan directly into Epic MyChart or Cerner.
- **1-Page Doctor Visit PDF:** Clean, color-coded adherence summary for geriatrician appointments.

---

## 🏗️ Architecture & Technology Stack

```
                               ┌──────────────────────────────────────────────┐
                               │             SYNCURA MOBILE / WEB             │
                               │  - Progressive Disclosure Viewport          │
                               │  - WebCrypto Hardware Enclave (AES-256-GCM) │
                               │  - Canvas Realtime Pill Segmentation        │
                               └───────┬──────────────┬──────────────┬────────┘
                                       │              │              │
                    ┌──────────────────┘              │              └──────────────────┐
                    ▼                                 ▼                                 ▼
    ┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────────────┐
    │     Zero-Knowledge Crypto    │  │   Vision AI & Tray Counter   │  │   Interoperability & FHIR    │
    │  - AES-256-GCM (WebCrypto)   │  │  - Bottle OCR + RxNorm API   │  │  - US Core FHIR R4 Adapter   │
    │  - Master KEK / Profile DEK  │  │  - Realtime Pill Segmentation│  │  - IPS QR (SMART Health Link)│
    │  - Emergency Tier 1 Split    │  │  - OpenFDA Interaction Engine│  │  - Public Triage NFC Pass    │
    └──────────────┬───────────────┘  └──────────────┬───────────────┘  └──────────────┬───────────────┘
                   │                                 │                                 │
                   └─────────────────────────────────┼─────────────────────────────────┘
                                                     │ HTTPS / WSS
                                                     ▼
                               ┌──────────────────────────────────────────────┐
                               │           SUPABASE POSTGRES BACKEND          │
                               │  - RLS Multi-Tenant Caregiver Isolation      │
                               │  - Realtime Dose Log Broadcast Channels      │
                               │  - Immutable Inventory Ledger & Refill Triggers│
                               │  - 3-Tier Storage (Legal/Markdown/FHIR JSON) │
                               └──────────────────────────────────────────────┘
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.7, Vite 6.2 |
| **Mobile Runtime** | Capacitor 7.0 (Native iOS & Android targets) |
| **Styling & Design System** | Tailwind CSS 3.4 (Accessible high-contrast dark/light mode for seniors) |
| **State Management** | Zustand 5.0 (Modular decoupled stores with persistent hydration) |
| **Cryptography** | WebCrypto API (`AES-256-GCM`, `PBKDF2-SHA256`, `@noble/ciphers`, `@noble/hashes`) |
| **Healthcare Standards** | HL7 FHIR R4, International Patient Summary (IPS), SMART Health Links |
| **Medical APIs** | NLM RxNorm REST API, OpenFDA Drug Label API |
| **Backend & Realtime** | Supabase (PostgreSQL with Row Level Security & WebSocket replication) |

---

## ⚖️ Regulatory & Legal Compliance Framework

Syncura is engineered strictly within the **Clinical Decision Support (CDS) Safe Harbor** outlined in the **21st Century Cures Act § 3060** and FDA CDS Guidance:
- **No Autonomous Prescribing or Altering Doses:** Syncura flags conflicts as precautionary alerts and directs users to consult their physician.
- **Evidence-Based References:** All alerts cite official FDA Black Box warnings, DailyMed contraindications, and NLM RxNorm databases.
- **Direct Physician Bridge:** Provides 1-tap dialer buttons directly to the patient's primary care physician (`Call Dr. Robert Chen`) or pharmacy.
- **HIPAA-Compliant Security:** Client-side zero-knowledge encryption ensures health records remain sovereign under user control.

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/syncura/syncura.git
cd syncura

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Automated Verification Suite
Run the internal clinical engine, RxNorm API, and FHIR validation suite:
```bash
npx tsx src/test/verifySyncura.ts
```

### Production Build
```bash
npm run build
```

---

## 📁 Repository Directory Structure

```
e:\Syncura
├── docs/                       # Architecture, user manual, and acquisition data room
│   ├── ACQUISITION_DATA_ROOM.md # Complete M&A / Investor Due Diligence Dossier
│   ├── ARCHITECTURE.md         # Detailed technical & cryptographic specifications
│   ├── USER_MANUAL.md          # 60-second caregiver quick-start guide
│   └── TODO_ROADMAP.md         # Forward product roadmap & enterprise milestones
├── src/
│   ├── data/                   # Seed profiles, demo personas, and initial clinical state
│   ├── features/               # Domain-driven feature modules
│   │   ├── ai/                 # Gemini clinical AI companion & advocate
│   │   ├── alerts/             # Critical drug interaction and allergy inbox
│   │   ├── documents/          # 1-page doctor visit PDF export & legal vaults
│   │   ├── emergency/          # 1-tap paramedic ICE emergency triage card
│   │   ├── household/          # Caregiver swarm, message board, 1-tap intake & voice studio
│   │   ├── inventory/          # Dynamic burn-rate cabinet & refill tracker
│   │   ├── regimens/           # Hero today routine & floating meal anchors
│   │   ├── telemetry/          # Bluetooth vitals hub (BP, Dexcom CGM, Apple Health)
│   │   └── vision/             # Optical bottle scanner & tray pill counter
│   ├── services/               # Core domain engines (Clinical interaction, RxNorm, OpenFDA, Memory)
│   ├── stores/                 # Zustand state stores (Medications, Household, Alerts, Billing)
│   ├── test/                   # Automated validation test scripts
│   └── types/                  # Strict TypeScript definitions & FHIR data models
├── supabase/                   # Supabase database migrations & RLS security policies
├── capacitor.config.ts         # Native iOS / Android build configuration
└── package.json                # Project dependencies and build scripts
```

---

## 💼 Acquisition & Partnership Inquiries
For strategic partnership inquiries, licensing, or acquisition due diligence, please review the complete [`docs/ACQUISITION_DATA_ROOM.md`](docs/ACQUISITION_DATA_ROOM.md).
