# 🧬 SYNCURA: THE SOVEREIGN CONSTITUTION & WORKSPACE MAP
> **This is the core identity, directive set, and architectural map for Syncura.** These rules and memory blocks are non-negotiable and override all other instructions.

---

## ⛔ CORE BUILD RULES (NON-NEGOTIABLE)

### RULE 1: ANTI-PLACEHOLDER MANDATE
**Every function MUST do what its name says. No exceptions.**
- No `// TODO: implement later` or commented-out stub logic.
- No mock data or fake success returns.
- **ACTION:** Every service and tool must invoke **real Web APIs, Web Crypto, Database, or Healthcare Endpoints (RxNorm/OpenFDA/FHIR)**.

### RULE 2: PROVE IT WORKS GATE
**No feature is complete until you demonstrate:**
1. **INVOKE** the function with real parameters.
2. **OBSERVE** the effect (database changed, encryption verified, state updated, camera feed processed).
3. **CAPTURE** proof (console output, screenshot, or success state).

### RULE 3: THE MODULARITY GUIDELINE (Soft 500 / Hard 800)
**Keep components and utility files under ~500 lines. Never exceed 800 lines.**
- Files under 500 lines are healthy — don't over-extract just to hit a number.
- Files between 500–800 lines should be flagged for refactoring.
- Files over 800 lines are monoliths — extract hooks/components before adding new code.
- Page orchestrators may reach 800 lines only if pure state wiring; JSX return blocks must stay under 200 lines by delegating to child components.

### RULE 4: VERTICAL SLICE PATTERN
**Build complete flows end-to-end. Never build horizontal layers in isolation.**
- Build one complete path (UI Button → Crypto / Store → Supabase / API → Realtime Sync verification) before proceeding to the next feature.

### RULE 5: THE "CLEAN AS YOU GO" PROTOCOL
**The repository must remain pristine.**
- If you rewrite a function or component and the old one is no longer used, **DELETE IT**. Do not comment it out.
- Do not leave terminal outputs, logs, or error dumps as `.txt` files in the root directory.

### RULE 6: STATE MANAGEMENT DISCIPLINE
**Global state must be intentional and centralized.**
- Use domain-scoped **Zustand** stores (`useHouseholdStore`, `useMedicationStore`, `useRegimenStore`, `useAuthStore`).
- Do not create fragmented Context Providers for minor features.

### RULE 7: ZERO-KNOWLEDGE & PHI SAFETY MANDATE
- All Protected Health Information (PHI) must be encrypted client-side using **AES-256-GCM** with a profile-specific Data Encryption Key (DEK).
- Unencrypted data on the server is limited strictly to non-identifying relational metadata (UUIDs, timestamps, opaque schedule tokens).
- Public Emergency / Triage data is isolated to Tier 1 payloads with URL-hash-fragment keys (`#ice_key=...`).

### RULE 8: AI PAIR-PROGRAMMING TOKEN PROTOCOL
- Targeted reading: Use `grep_search` or specific line slices.
- Surgical edits: Use `replace_file_content` or `multi_replace_file_content` for patching.

---

## 🗺️ SYSTEM ARCHITECTURE & DOMAIN MAP

### 🔐 1. Zero-Knowledge Crypto Layer (`src/features/crypto/`)
- Client-side AES-256-GCM envelope encryption using Web Crypto API.
- Argon2id / PBKDF2 key derivation for master keys.
- X25519 / ECDH key exchange for secure household caregiver key sharing.

### 👥 2. Household & Multi-Profile Core (`src/features/household/`)
- Unified household management (Primary Admin, Caregiver Full, Caregiver Log-Only, Dependent).
- Realtime caregiver sync with optimistic locking and dose idempotency keys.
- **Family Message Board & Audio Check-In:** Live family activity stream with 1-tap status announcements ("Took morning meds", "Ate breakfast at 9:15 AM") and 5-second voice notes.
- Instant 6-digit household pairing code & QR invite generation.

### ⏰ 4. Dynamic Context & Regimen Engine (`src/features/regimens/`)
- Floating meal-relative triggers (e.g. Breakfast + 15m).
- Empty-stomach / Fasting lead-up buffers (e.g. Levothyroxine 30-60m before breakfast).
- PRN sliding-window lockout countdowns (preventing accidental redosing).
- Missed-dose escalation alerts (SMS/push notification to secondary caregiver if unacknowledged after 45m).

### 📦 5. Inventory & Predictive Burn-Rate (`src/features/inventory/`)
- Live burn-rate calculation based on actual consumption.
- Dynamic runout horizon and proactive refill reminders.
- Discrepancy reconciliation ledger.

### 🏥 6. Health Interoperability & Emergency Triage (`src/features/fhir/` & `src/features/emergency/`)
- SMART on FHIR R4 universal client adapter (Epic, Cerner, Athena).
- SMART Health Links (SHLink) & International Patient Summary (IPS) QR/PDF intake generation.
- Zero-auth Emergency Lock-Screen / NFC Triage pass.
