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
  - `components/` — UI components:
    - `CloakDashboard.tsx` — Main dashboard
    - `PasswordGate.tsx` — Password entry (main + decoy)
    - `Fake404.tsx` — Gate/landing disguise
    - `FakeGoogle.tsx` — Google homepage replica
    - `FakeYouTube.tsx` — YouTube video page replica
    - `FakeGoogleDocs.tsx` — Google Docs editor replica
    - `BossKeyOverlay.tsx` — Alt+B full-screen cover overlay
    - `ProfileSection.tsx` — Profile, panic destination, boss key settings
    - `SecuritySection.tsx` — Security feature toggles
    - `StopwatchTimer.tsx` — Draggable stopwatch/timer widget
    - `UnitConverter.tsx` — Draggable unit converter widget
    - `EquationSolver.tsx` — Draggable equation solver widget
    - `GraphingCalculator.tsx` — Canvas-based graphing calculator widget
    - `PomodoroTimer.tsx` — Draggable Pomodoro focus timer widget
  - `components/ui/` — shadcn/ui base components
  - `hooks/` — Custom React hooks (useDraggable, use-toast, etc.)
  - `lib/` — Utility functions:
    - `profile.ts` — User profile with panic destination, boss key style
    - `security.ts` — Security feature runtime enable/disable functions
    - `tabCloak.ts` — Tab title/icon cloaking, built-in + custom presets
    - `themes.ts` — Theme management
- `public/` — Static assets

## App State Machine (Index.tsx)

States: `"gate" | "locked" | "unlocked" | "panic" | "decoy"`
- **gate** → shows Fake404 (click period to reveal login)
- **locked** → shows PasswordGate
- **unlocked** → shows CloakDashboard (+ optional BossKeyOverlay)
- **panic** → shows the configured panic destination page
- **decoy** → shows blank screen (triggered by secondary/decoy password)

## Running the App

The app runs via the "Start application" workflow which executes `npm run dev` on port 5000.

## Key Config

- `vite.config.ts` — Vite config with `host: "0.0.0.0"`, `port: 5000`, and `allowedHosts: true` for Replit compatibility
- `tailwind.config.ts` — Tailwind configuration
- `components.json` — shadcn/ui component registry config

## Security Features

### Runtime-activated (src/lib/security.ts)
- Block DevTools Shortcuts — blocks F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+J/C
- Disable Right-Click — prevents context menu (inspect element)
- Lock on Tab Switch — auto-locks when tab loses focus
- Panic on DevTools Detection — triggers panic when DevTools window-size detected
- Screenshot Protection, Clipboard Protection, Session Timeout

### Application-level
- Decoy Password — secondary password shows blank screen
- Emergency Data Wipe — clears all localStorage (with confirmation)

## Panic Destination (Profile)

Configurable: "404" (Broken Page), "google" (FakeGoogle), "youtube" (FakeYouTube), "docs" (FakeGoogleDocs), or "custom" (any URL redirect).

## Boss Key (Alt+B)

Instantly covers the screen with a full-screen fake page overlay without navigating away. Configurable style: Google, YouTube, Docs, 404, or custom URL. Double-click to dismiss.

## Tab Cloaking

Built-in presets + custom presets (user-created, stored in localStorage). Custom presets can be added/removed from the Tab Cloaking section in the dashboard.

## Quick Tools (Alt shortcuts)

- Alt+C — Calculator
- Alt+S — Stopwatch/Timer
- Alt+U — Unit Converter
- Alt+E — Equation Solver
- Alt+G — Graphing Calculator
- Alt+M — Pomodoro Timer
- Alt+B — Boss Key overlay
- Alt+P — Panic
- Alt+L — Lock
- Alt+I — Incognito mode
- Alt+T — Cycle theme
- Alt+/ — Show keyboard shortcuts

## Replit Migration Notes

- Removed `lovable-tagger` Lovable-specific dev dependency
- Updated Vite server config to bind to `0.0.0.0` and disable HMR overlay for Replit proxy compatibility
