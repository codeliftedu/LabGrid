# LabGrid — Institutional Resource & Safety Governance Network

> **Institutional resource sharing with built-in pre-booking safety compliance, explainable fair allocation, and photo-verified physical chain-of-custody.**

---

## 1. Problem Statement & Executive Overview

Ordinary scheduling tools (such as Google Calendar or Calendly) fail in university laboratories, fabrication foundries, bio-imaging cores, and research makerspaces because they treat a **$42,000 Class-4 CO₂ Laser Cutter** or a **$310,000 Confocal Microscope** the same as an office conference room.

In real institutional environments, unmanaged booking leads to three systemic failures:
1. **Unverified Access & Safety Hazards:** Untrained users book hazardous equipment without verified Environmental Health & Safety (EH&S) credentials or Standard Operating Procedure (SOP) sign-offs.
2. **Resource Monopolization:** A handful of users hoard peak daytime hours on high-demand machines via raw "first-come, first-served" booking, locking out students with urgent academic or capstone deadlines.
3. **Broken Chain-of-Custody & Unreported Damage:** When a machine lens is cracked or a build plate is gouged, lab directors have no verifiable before-and-after visual record to determine when the anomaly occurred or whether the tool is safe for the next researcher.

**LabGrid** solves this by wrapping every reservation around **three mandatory governance pillars**:
- **Pillar 1 — Pre-Booking Compliance:** Automated 4-point verification of safety badges, supervision rules, and rolling weekly quotas, paired with assistive AI certificate pre-screening.
- **Pillar 2 — Explainable Fair Allocation:** Anti-monopolization priority scoring and transparent waitlist ranking instead of opaque or first-come hoarding.
- **Pillar 3 — Physical Chain-of-Custody & Immutable Audit Ledger:** QR-verified check-in, mandatory pre-flight safety checklists, side-by-side Before/After condition photo verification, automated critical damage lockouts, and an append-only hash-chained transaction log.

---

## 2. Target Personas & Judge Evaluation Mode

To allow judges and evaluators to test the complete 10-step lifecycle without authentication friction, LabGrid includes a **Judge Persona Switcher** bar at the top of the workspace and a **Guided 90-Second Judge Tour** checklist widget in the bottom-right corner.

| Persona | Role | Department | Core Capabilities in LabGrid |
| :--- | :--- | :--- | :--- |
| **Maya Lin** | `USER` (*Student Researcher*) | Mechatronics & Autonomous Systems | Discovers equipment via AI Natural Language Search, inspects live Eligibility Readiness Scorecards, uploads safety certificates for AI pre-screening, submits purpose-weighted bookings, completes QR + photo check-in/out, requests `+30m` extensions, and reports equipment issues. |
| **Dr. Aris Thorne** | `MANAGER` (*FabLab Director*) | Central Engineering Foundry | Lists new resources via the Guided 3-Step Creation Wizard, defines safety badge gates and weekly fair-use caps, reviews AI-pre-screened certificates (Human-in-the-Loop sign-off), resolves competing requests in the Fair-Allocation Triage Queue, and clears hardware safety lockouts. |
| **Elena Vance** | `ADMIN` (*System Auditor*) | Office of EH&S & Research Integrity | Inspects the append-only hash-chained Audit Ledger, monitors institutional quota utilization across departments, and audits non-deletable Before/After condition photo evidence. |

---

## 3. Complete 10-Step Lifecycle Mapping

Every step of the institutional resource lifecycle is mapped to a dedicated workflow and state transition:

### Step 1: Resource Listing & Condition Definition (`Owner Command` $\rightarrow$ `List New Resource`)
- Guided 3-step creation drawer: **1. Asset Details** $\rightarrow$ **2. Safety Gates** $\rightarrow$ **3. Fair-Use Quotas**.
- Configures category, serial ID, replacement value, required safety badge code (e.g., `LASER-SAFETY-L2`), mandatory SOP summary, supervision mode (`Autonomous Access`, `Staff Supervision Required`, or `Manager Approval Mandatory`), and weekly peak-hour cap.

### Step 2: Discovery & Live Eligibility Check (`Explore & Match`)
- **AI Natural Language Matcher:** Users describe their technical task in plain English (e.g., *"I need to cut 6mm acrylic sheet this Thursday afternoon"*). The backend matches the appropriate equipment and cross-checks the user's verified safety badges.
- **Smart Compliance Filters:** Instant one-click filters for *"Eligible for Me Now"*, *"No Supervision Needed"*, and *"Available Today"*, plus department category tabs.
- **Live Eligibility Gate Status:** Every resource card displays real-time green checkmarks for verified credentials and amber lock indicators for missing or pending sign-offs.

### Step 3: Booking Request & Purpose Declaration (`Resource Detail Drawer`)
- Demand-aware time slot selector (`Off-Peak` vs. `Peak Window`).
- Structured **Purpose of Use** declaration (`Capstone Project`, `Academic Research`, `Safety-Critical Testing`, or `Personal Prototype`) and technical project description.
- Live preview of the user's **Explainable Fair-Allocation Score (0–100 pts)** before submitting.

### Step 4: Automated 4-Point Verification & AI Certificate Pre-Check (`Resource Detail Drawer`)
Upon request or certificate upload, LabGrid runs a deterministic **4-Point Verification Engine**:
1. **Badge/Training Match:** Verifies whether the user holds active, non-expired required credentials.
2. **Rolling Quota Check:** Confirms `weeklyQuotaUsed + durationHours <= weeklyQuotaCap` and resource weekly cap.
3. **Slot Contention Check:** Detects overlapping requests on the same date and time window.
4. **AI Document Pre-Verifier (Assistive):** Extracts holder name, training course, and completion date from uploaded certificates, attaching a confidence score and a mandatory `AI Pre-Screened • Requires Authorised Manager Sign-off` guardrail badge.

### Steps 5 & 6: Manager Review, Fair Allocation & Smart Waitlist Engine (`Owner Command`)
- **Anti-Monopolization Priority Formula:**
  $$\text{Priority Score} = \text{Base Fairness } (50) - \text{Recent Usage Penalty } (5 \times \text{Hours Used This Week}) + \text{Purpose Weight } (+20 \text{ or } +5) + \text{Reliability Bonus } (+10)$$
- **Concrete Example in Seed Data (Contested Thursday 14:00 Laser Cutter Slot):**
  - **Maya Lin (Capstone Project, 6h used this week, 98% reliability):**
    $$50 - (5 \times 6) + 20 + 10 = \mathbf{50\text{ pts}}$$
  - **Liam Vance-Kerr (Personal Prototype, 11h used this week, 88% reliability):**
    $$50 - (5 \times 11) + 5 + 0 = \mathbf{0 \rightarrow \text{clamped to } 10\text{ pts}}$$
- **Manager Actions:** One-click **Sign Off Badge & Approve**, **Place on Smart Waitlist**, or **Reject with Mandatory Reason Code**.
- **User Explainability Banner:** Every booking displays the exact mathematical breakdown and reason code explaining why it was approved, waitlisted, or rejected.

### Step 7: QR Check-In & Baseline Condition Documentation (`Active Session Hub`)
- Unlocks via cryptographic QR challenge-response (**"Simulate QR Scan"** button included for judges).
- Requires completing the **3-Item Safety Pre-Flight Checklist** specific to that instrument.
- Captures/logs a **"Before Use" Baseline Photo** and baseline condition rating (`Mint`, `Minor Wear`, or `Pre-existing Issue`), transitioning the booking to `ACTIVE_IN_USE`.

### Step 8: Guided Check-Out & Visual Condition Diff (`Active Session Hub`)
- Displays a live session countdown timer.
- Captures an **"After Use" Return Photo** and renders both a **Side-by-Side Comparison** and an **Interactive Draggable Condition Diff Slider** to inspect surface or optical discrepancies.
- Records the return state (`Returned Clean & Operational`, `Consumables Low`, or `Issue / Damage Occurred`) and transitions status to `COMPLETED` (or `FLAGGED_FOR_REVIEW`).

### Step 9: Delay, Damage & Automatic Lockout Engine (`Active Session Hub` & `Owner Command`)
- **Running Late (`+30m` Extension):** Automatically checks if a downstream booking exists on that resource. If a conflict is detected, it escalates an alert to the Lab Manager and next queued user.
- **Structured Damage & Safety Incident Report:** Users select severity (`Minor Cosmetic`, `Calibration Needed`, or `Unsafe / Out of Commission`).
- **Automatic Hardware Lockout:** Reporting an `Unsafe / Out of Commission` fault immediately transitions the resource to `MAINTENANCE_LOCKED`, pauses future bookings, generates an AI Triage Summary for the Lab Manager, and requires explicit manager sign-off (`Clear Lockout & Restore Operational`) to unlock.

### Step 10: Immutable Cryptographic Audit & Fairness Ledger (`Audit Ledger`)
- Append-only, hash-chained ledger (`hash` + `prevHash`) recording every state transition across `BOOKING`, `CREDENTIAL`, `RESOURCE`, and `INCIDENT` entities.
- Logs `Actor ID`, `Role`, `UTC Timestamp`, `Action Type`, `Before -> After State`, and `Justification Note`.
- Includes an **Institutional Quota Fairness Distribution** view and a **Non-Repudiable Visual Condition Evidence Archive** where neither users nor managers can delete historical condition photos or rejection reasons.

---

## 4. Human-in-the-Loop AI Architecture (Rule #12 Compliance)

LabGrid uses the `@google/genai` SDK on the Express backend (`server.ts`) for three targeted assistive workflows while keeping all safety, access, and lockout authority strictly in human hands:

| Endpoint | Purpose | Human-in-the-Loop Guardrail |
| :--- | :--- | :--- |
| `POST /api/ai/match-resources` | Converts natural language project descriptions into matched equipment IDs and checks badge requirements. | Advisory discovery only; booking still passes through the deterministic 4-Point Verification Engine. |
| `POST /api/ai/verify-certificate` | Extracts applicant name, course code, and completion date from uploaded safety training certificates. | Sets credential status to `PENDING` with badge `AI Pre-Screened • Requires Authorised Manager Sign-off`. Only Dr. Aris Thorne (`MANAGER`) can sign off `VERIFIED` status. |
| `POST /api/ai/summarize-incident` | Summarizes physical fault descriptions and recommends lockout/calibration actions. | Critical safety lockouts require an explicit human Lab Manager inspection and resolution note to clear. |

*Resilience Note:* Every AI endpoint in `server.ts` includes a deterministic fallback engine so that all features remain 100% responsive even in offline or rate-limited evaluation environments.

---

## 5. Pre-Populated Institutional Fleet

The application seeds 6 realistic university resources across 4 departments:

1. **`FAB-X1C-042` — Bambu Lab X1C Carbon CoreXY 3D Printer** (*Fabrication · Autonomous Access · `FAB-3DP-L2`*)
2. **`FAB-LSR-108` — Epilog Fusion Pro 48 120W CO₂ Laser Cutter** (*Fabrication · Manager Approval Mandatory · `LASER-SAFETY-L2`*)
3. **`ELEC-MSO-604` — Keysight InfiniiVision 6GHz Mixed Domain Oscilloscope** (*Precision Electronics · Autonomous Access · `ELEC-ESD-L1`*)
4. **`BIO-LSM-980` — Anatolian Bio-Imaging Darkroom (Zeiss LSM 980 Confocal)** (*Optics & Bio-Imaging · Staff Supervision Required · `BIO-OPTICS-L3`, `LASER-SAFETY-L2`*)
5. **`MED-FX6-009` — Sony FX6 Full-Frame Cinema Rig + Cooke Mini S4/i Kit** (*Media & Acoustics · Autonomous Access · `MEDIA-CINE-L1`*)
6. **`ACOU-ISO-001` — Hemi-Anechoic Chamber & 64-Ch Spherical Mic Array** (*Media & Acoustics · Manager Approval Mandatory · `ELEC-ESD-L1`*)

---

## 6. Project Structure & Tech Stack

```text
├── server.ts                              # Express full-stack server + Gemini AI endpoints + Vite middleware
├── src/
│   ├── App.tsx                            # Main workspace shell, Judge Switcher, Explore & Match marketplace
│   ├── types/
│   │   └── labgrid.ts                     # Core TypeScript domain interfaces for all 10 steps
│   ├── data/
│   │   └── seedData.ts                    # Institutional seed dataset & deterministic Priority Score engine
│   ├── utils/
│   │   └── inspectionArtwork.ts           # High-contrast SVG CAD schematics & condition photo generators
│   └── components/
│       ├── ResourceDetailDrawer.tsx       # Steps 2, 3 & 4: Eligibility Scorecard, AI Cert Pre-Check & Booking
│       ├── ActiveSessionHub.tsx           # Steps 7, 8 & 9: QR Check-In, Visual Diff Slider, Extensions & Lockouts
│       ├── ManagerCommandCenter.tsx       # Steps 1, 5, 6 & 9: Triage Queue, Badge Sign-Off & 3-Step Creation Wizard
│       ├── AuditFairnessLedger.tsx        # Step 10: Hash-chained immutable ledger & quota fairness telemetry
│       └── JudgeTourWidget.tsx            # Interactive 90-second guided evaluation checklist
```

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Typography:** `Plus Jakarta Sans` (UI & headings) + `JetBrains Mono` with `tabular-nums` (serial IDs, audit hashes, scores, and timestamps)
- **Backend:** Node.js, Express, `@google/genai` SDK (`gemini-3.8-flash`)

---

## 7. Local Development & Build Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables (`.env`):**
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   ```

3. **Start the full-stack development server (Port 3000):**
   ```bash
   npm run dev
   ```

4. **Type-check & build for production:**
   ```bash
   npm run lint
   npm run build
   npm start
   ```
