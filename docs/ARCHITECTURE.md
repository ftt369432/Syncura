# 🧬 Syncura: System Architecture & Technical Specifications

> **Syncura** is a sovereign, zero-knowledge medication adherence, caregiver coordination, Vision AI pill audit, and SMART on FHIR health ecosystem.

---

## 1. High-Level System Architecture

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

---

## 2. Zero-Knowledge Cryptography (ZK-EE)

### Cryptographic Stack:
- **Cipher:** `AES-256-GCM` with random 96-bit (12-byte) initialization vectors (IV) generated via `window.crypto.getRandomValues`.
- **Key Derivation:** `PBKDF2` with `SHA-256`, 100,000 iterations over user master passphrase + household salt.
- **Envelope Hierarchy:**
  1. **Master KEK (Key Encryption Key):** Derived from household passphrase, stored in local hardware keystore.
  2. **Profile DEK (Data Encryption Key):** Unique 256-bit symmetric key per family profile, wrapped by the KEK.
  3. **Emergency Tier 1 Token:** Public, zero-auth URL hash fragment (`#ice_key=...`) isolating critical triage data (blood type, life-threatening allergies, active critical meds) from full longitudinal medical history.

---

## 3. Database Schema & Dual Backend Architecture

Syncura is engineered with a **Universal Database Adapter Layer** (`src/services/databaseAdapter.ts`) supporting seamless switching between:
1. **Local Test Dataset:** Zero-latency offline hydration (`src/data/seedData.ts`) with multi-profile adherence history.
2. **Supabase / PostgreSQL:** Row-Level Security (RLS) policies and Realtime WebSocket replication (`supabase/migrations/`).
3. **Firebase / Firestore:** Hierarchical collections and security rules (`firebase/firestore.rules`).

### Supabase Migrations (`supabase/migrations/`):
- `20260831000001_core_schema.sql`: `households`, `profiles`, `medications`, `regimen_rules`, `dose_logs`, `family_messages`, `inventory_transactions`.
- `20260831000002_rls_policies.sql`: Multi-tenant caregiver isolation.
- `20260831000003_triggers_and_realtime.sql`: Automated inventory burn-rate deduction triggers.

## 5. Universal Health & Medical Device Telemetry Bridge

Syncura connects consumer wearables, implantable cardiac devices, continuous glucose monitors (CGMs), and Bluetooth medical hardware into a single unified telemetry engine:

### 1. Bluetooth Low Energy (BLE) Medical GATT Profiles (`src/services/webBluetoothHealthService.ts`):
- **Blood Pressure Profile (GATT 0x1810):** Direct streaming from Omron Evolv, Withings, and Welch Allyn cuffs (Systolic, Diastolic, MAP, Pulse).
- **Continuous Glucose / Meter (GATT 0x1808):** Dexcom G7, Abbott FreeStyle Libre, and Accu-Chek real-time glucose feeds.
- **Heart Rate Monitor (GATT 0x180D) & Pulse Oximetry (GATT 0x1822):** Polar, Garmin, Apple Watch, SpO2 fingertip meters.

### 2. Mobile Aggregators (`src/services/healthConnectBridgeService.ts`):
- **Apple Health & Samsung Health / Google Health Connect:** Steps, walking distance, sleep stages (Deep/REM), and resting heart rate.
- **Daily Hydration Tracker:** 1-tap logging (+250mL / +500mL) tracking daily fluid intake against 2,500mL targets.

### 3. Cardiac Implants & Pacemaker Interrogation:
- Parses standardized pacemaker/ICD telemetry feeds (Medtronic CareLink / Abbott Merlin / Boston Scientific Latitude) to monitor pacing capture percentages, battery longevity, and arrhythmia episodes.

### 4. Medication-Biometric Correlation Intelligence:
- Correlates medication adherence directly with physiological outcomes (e.g. *Blood pressure stability with Lisinopril*, *Post-prandial glucose stability with Metformin*).

- **NLM RxNorm REST API:** `https://rxnav.nlm.nih.gov/REST/` (Drug normalization, RxCUI resolution, drug-drug interaction detection).
- **OpenFDA Drug Label API:** `https://api.fda.gov/drug/label.json` (Official FDA black-box warnings, food interactions, contraindications).
- **HL7 FHIR R4 & IPS:** Standard US Core FHIR profiles (`Patient`, `MedicationStatement`, `AllergyIntolerance`, `Coverage`, `Condition`).
- **SMART Health Links (SHLink):** Tamper-evident, encrypted QR codes for instant clipboard-free clinic intake.
