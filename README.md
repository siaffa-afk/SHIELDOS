# ShieldOS — Our Support Care (engineer-ready prototype)

Refactor of the two validated HTML prototypes into a modular, secure, testable codebase.
**All data is fictional.** The backend is mocked in-process, but authorization is real:
every request passes object-level + field-level permission checks and writes to a
hash-chained audit log.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

No Node handy? Open `dist-demo/index.html` — a self-contained build of the same app
(`npm run build:demo` regenerates it).

## Verify

```bash
npm test             # 43 tests: permissions, checklist gating, handoff, language, audit, search
npm run lint:lines   # no file >250 lines, no function >40 lines
npm run build        # production build
node scripts/walkthrough.mjs   # Playwright: full DSP shift at mobile size, screenshots to /tmp/shots
```

## What to try in the demo

1. Sign in as **Ayesha Bell (Direct Support)** → the guided shift: Start Shift → Review
   Plan → Support Residents → Finish Notes → Fix Missing Items → Send Handoff → Clock
   Out. Note: one step open at a time, green checks collapse, the handoff pre-fills from
   your notes, and clock-out is gated.
2. Sign in as **Sam Okoro (Billing/Admin)** → the *same facts* now read "Service line on
   hold until documentation is reviewed."
3. Sign in as **Jordan Lee (Auditor)** → window-scoped proof gaps + logged packet export.
4. Press **⌘K / Ctrl-K** — search results are permission-filtered by the mock backend
   (try "billing" as Ayesha vs Sam).
5. Tap **Emergency** — break-glass needs a reason, shows a red banner, and lands in the
   admin review queue.

## Docs

| File | Contents |
|---|---|
| `docs/AUDIT_REPORT.md` | Full audit of the old prototypes + where each problem is fixed |
| `docs/ARCHITECTURE.md` | Folder structure and what every file does |
| `docs/SECURITY.md` | Security architecture, API boundary, permissions, audit model |
| `docs/DATA_MODEL.md` | Backend-ready models |
| `docs/TESTING.md` | Current tests + production test plan |
| `docs/MIGRATION.md` | Path from the HTML demos to production |

## Ground rules for contributors

- UI components call `src/api/apiClient.js` — never `db.js`, mock data, or vendors.
- Files ≤250 lines, functions ≤40 (CI-checkable via `npm run lint:lines`).
- DSP-facing copy lives in `components/checklistCopy.js` / `services/roleService.js` and
  must pass the forbidden-terms test.
- This is **HIPAA-conscious design**, not certified compliance — see `docs/SECURITY.md`.
