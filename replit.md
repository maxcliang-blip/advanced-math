# Project Overview

A React + Vite + TypeScript frontend application with Tailwind CSS, shadcn/ui components, and React Router. Originally built on Lovable, migrated to Replit.

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

## Replit Migration Notes

- Removed `lovable-tagger` Lovable-specific dev dependency
- Updated Vite server config to bind to `0.0.0.0` and disable HMR overlay for Replit proxy compatibility
