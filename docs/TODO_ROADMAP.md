# Syncura — Production Roadmap & Commercial Strategy

## 🚀 Commercial Market Strategy

Syncura serves two explosive healthcare markets with a unified core codebase:

1. **B2C Family & Caregiver Swarm ($9.99 - $24.99/mo per household)**
   * Target: Adult children managing aging parents, seniors living independently, chronic disease patients.
   * Key hooks: 60s bottle scanning, zero-touch Bluetooth vitals auto-sync, 1-tap voice memos, clinic intake QR.

2. **B2B Enterprise Home Health, Recovery & Assisted Living eMAR ($149 - $499/mo + $15/nurse seat)**
   * Target: Home healthcare agencies, recovery/rehab centers, residential assisted living facilities (RCFE), mobile visiting nurses.
   * Key hooks: 
     * **CMS Electronic Visit Verification (EVV):** GPS-timestamped check-in/check-out to satisfy Medicare/Medicaid billing mandates.
     * **5-Rights Barcode Wristband Scan:** Scans patient wristband/door tag before unlocking med administration.
     * **Multi-Resident Census Roster:** Shift-based med pass queue across dozens of residents.
     * **Controlled Substance Dual-Witness Signoff:** Schedule II narcotic audit tracking.

---

## ⏱️ Time-To-Market Breakdown

| Phase | Scope | Timeline | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1: Core Engine & Consumer PWA** | Dynamic meal regimens, PRN lockouts, bottle OCR, pill counter, zero-touch vitals, family feed, FHIR exports | **Immediate** | **100% COMPLETE & LIVE** |
| **Phase 2: Enterprise Agency eMAR & EVV** | Nurse census roster, GPS visit check-in/out, 5-rights wristband verification, narcotic witness | **Immediate** | **100% COMPLETE & LIVE** |
| **Phase 3: Native App Packaging (Capacitor/iOS/Android)** | iOS App Store & Google Play Store release | **2–3 Days** | Ready to package |
| **Phase 4: Cloud DB & Auth Production Deployment** | Live Supabase/Firebase Auth, multi-tenant billing (Stripe) | **2–4 Days** | Schemas ready |

---

## 📦 Feature Matrix

- [x] Zero-Knowledge AES-256-GCM PHI Envelope Encryption
- [x] Meal-Relative Dynamic Anchor Scheduling
- [x] PRN Lockout Engine with Daily Toxicity Ceiling
- [x] 60-Second Optical Label OCR + Live NLM RxNorm Concept Match
- [x] Physical Pill Tray Contour Computer Vision Counter
- [x] Zero-Touch Ambient Bluetooth & Wi-Fi Vitals Sync (Omron, Dexcom, Apple/Samsung)
- [x] Interactive Vitals History & Timestamps Detail Logs
- [x] 1-Tap Family Voice Check-In Push-to-Talk Memo
- [x] SMART Health Link Clinic Intake QR & HL7 FHIR R4 Bundle Generator
- [x] 1-Page Printable Doctor Visit Summary PDF + CSV Exporter
- [x] Enterprise Mobile Nurse Census Roster & Shift Queue
- [x] Electronic Visit Verification (EVV) with GPS Geofencing
- [x] 5-Rights Barcode Wristband Verification Scanner
- [x] Dual-Theme Engine (Crisp High-Contrast Light Mode & Dark Mode)
