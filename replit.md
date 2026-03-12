# Project Overview

A React + Vite + TypeScript frontend application — a browser-disguising "CLOAK" tool. Originally built on Lovable, migrated to Replit.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui (Radix UI)
- **Routing**: React Router v6
- **State/Data**: TanStack React Query
- **Forms**: React Hook Form + Zod

## Project Structure

- `src/` — All application source code
  - `pages/` — Route-level page components (Index, NotFound)
  - `components/` — UI components (CloakDashboard, EquationSolver, Fake404, PasswordGate, ProfileSection, SecuritySection, StopwatchTimer, UnitConverter, NavLink)
  - `components/ui/` — shadcn/ui base components
  - `hooks/` — Custom React hooks
  - `lib/` — Utility functions and helpers (profile, security, tabCloak, themes)
- `public/` — Static assets

## Running the App

The app runs via the "Start application" workflow which executes `npm run dev` on port 5000.

## Key Config

- `vite.config.ts` — Vite config with `host: "0.0.0.0"`, `port: 5000`, and `allowedHosts: true` for Replit compatibility
- `tailwind.config.ts` — Tailwind configuration
- `components.json` — shadcn/ui component registry config

## Security Features (src/lib/security.ts + src/components/SecuritySection.tsx)

### Existing
- Safe Mode — extra security checks
- Activity Monitor — DevTools/suspicious activity detection
- Screenshot Protection — blocks PrintScreen key
- Clipboard Protection — intercepts copy events
- Trusted Device Only — restricts access to fingerprinted device
- Session Timeout — auto-lock after inactivity
- Require Re-authentication — password prompt before sensitive actions
- Failed attempt tracking + lockout

### Added
- **Block DevTools Shortcuts** — blocks F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+J/C
- **Disable Right-Click** — prevents context menu (inspect element)
- **Lock on Tab Switch** — auto-locks when tab loses focus (visibilitychange)
- **Panic on DevTools Detection** — triggers panic mode when DevTools window size detected
- **Decoy Password** — a second password that shows a blank screen instead of the dashboard
- **Emergency Data Wipe** — one-tap clear of all localStorage data (with confirmation)

## Replit Migration Notes

- Removed `lovable-tagger` Lovable-specific dev dependency
- Updated Vite server config to bind to `0.0.0.0` and disable HMR overlay for Replit proxy compatibility
