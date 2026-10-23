# OPD Saathi (ओपीडी साथी) - City District Hospital

**OPD Saathi** is an accessible, human-centered hackathon prototype web app built for the fictional **City District Hospital** (a 3-floor government hospital). It helps patients register for an Out-Patient Department (OPD) consultation, receive an OPD slip with a token, see their queue position, navigate accessible hospital routes with ramps and elevators, and know when to enter the doctor's room.

---

## 👵 Focus Persona: Kamla (62)
- Visiting the hospital alone, reads limited Hindi.
- Basic Android smartphone with 360px viewport.
- Walks slowly with knee pain, strictly avoids stairs.
- Needs clear guidance, reassuring tone, high contrast, audio read-aloud (`speechSynthesis`), and zero medical jargon.

---

## 🚨 Safety Rules (Highest Priority)
1. **Always-On Emergency Button:** Visible on every screen (linking to `/emergency`). Instructs patients to go immediately to Casualty (Ground Floor Room E1), and provides one-tap dials for **112** and **108**.
2. **Zero Automated Triage:** The app NEVER decides whether a condition is an emergency and NEVER asks an urgent case to wait or take a token.
3. **"I Need Urgent Help" Broadcast Flag:** Sounds an audible alarm and flashes a red banner across all staff dashboards until acknowledged.
4. **Privacy:** Strictly NO real Aadhaar or ABHA numbers collected.

---

## 🛠 Tech Stack
- **Framework:** React 18 + Vite (Plain JavaScript, No TypeScript)
- **Styling:** Tailwind CSS with WCAG AA compliance (minimum 18px body text, 56px touch targets, high contrast)
- **Routing:** React Router v6 (`react-router-dom`)
- **State & Sync:** Shared state in `localStorage` synchronized in real-time across open browser tabs via `BroadcastChannel`
- **Graphics:** Crisp inline SVGs for 3-floor architectural maps, icons, and barcode graphics (zero image downloads)
- **Audio:** Web Speech API (`speechSynthesis`) and Web Audio API synthesizer for hospital chimes and alerts

---

## 🧭 Application Routes
| Route | Description |
| :--- | :--- |
| `/` | **Home:** 4 big icon+word buttons (Register, I have my slip, Find a place, Emergency) and plain definitions. |
| `/register` | **Registration:** Simple 3-step form (Name, Age, Department, Avoid Stairs preference). |
| `/slip/:token` | **OPD Slip:** High-contrast printable slip with token code, room, doctor, QR code, and wait estimate. |
| `/turn/:token` | **Live Queue Tracker:** Real-time token position, waiting count, doctor availability, and voice announcements. |
| `/have-slip` | **Slip Lookup:** Search by token code or tap quick demo cards (e.g. Kamla `ORTHO-14`). |
| `/find` | **Hospital Map:** Interactive 3-floor map with Dijkstra routing avoiding stairs. |
| `/emergency` | **Emergency / Casualty:** Direct directions to Ground Floor Room E1 and emergency contacts. |
| `/settings` | **Accessibility Settings:** Language (Hindi / English), 3-step text size (18/22/26px), high contrast, read aloud, avoid stairs, and assisted mode. |
| `/staff` | **Staff Desk:** Hospital triage overview and urgent assistance monitor. |
| `/staff/counter` | **Doctor Counter Console:** Next Patient caller, recall chime, and absence skip controls. |
| `/board` | **Waiting Hall TV Board:** Lobby monitor display with large numbers and digital clock. |

---

## 🚀 Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
