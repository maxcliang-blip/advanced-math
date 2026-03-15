# AI_RULES.md — Development Guidelines for CLOAK

## Tech Stack

- **React 18 + TypeScript** — Component-based UI with static typing
- **Vite** — Fast build tool and dev server with HMR
- **Tailwind CSS** — Utility-first CSS framework
- **shadcn/ui** — Pre-built accessible UI components (Radix UI primitives)
- **React Router v6** — Client-side routing
- **TanStack React Query** — Server state management, caching, and synchronization
- **React Hook Form + Zod** — Form handling and validation
- **Lucide React** — Consistent icon library
- **Vitest + Testing Library** — Unit and component testing
- **ESLint** — Code quality and consistency

## Library Usage Rules

### 1. UI Components
- **Always** use shadcn/ui components when available. They are built on Radix UI and provide accessibility out of the box.
- Import from `@/components/ui/` (e.g., `import { Button } from "@/components/ui/button"`).
- Do **not** edit files in `@/components/ui/` directly. Create wrapper components if you need to customize behavior.

### 2. Styling
- Use **Tailwind CSS utility classes** exclusively. No plain CSS files or inline styles (except dynamic values).
- Use the `cn()` utility from `@/lib/utils` to merge conditional classes.
- Follow shadcn/ui color patterns: `bg-primary`, `text-destructive`, `border-border`, etc.
- Custom CSS variables (like `--glow`) are defined in `src/index.css` and `tailwind.config.ts`.

### 3. Routing
- Use **React Router v6**. All routes are defined in `src/App.tsx`.
- Use the `NavLink` component from `@/components/NavLink.tsx` for navigation links to get automatic active states.
- Never use `<a>` tags for internal navigation; always use `NavLink` or `Link`.

### 4. State Management
- **Local state**: Use `useState`, `useEffect`, `useCallback`, `useMemo` for component-specific state.
- **Server state**: Use TanStack React Query (`useQuery`, `useMutation`) for data fetching, caching, and background updates.
- **Global state**: Lift state up to a common ancestor or use React context. Avoid prop drilling through many layers.

### 5. Forms
- Use **React Hook Form** with **Zod** for validation.
- Define schemas with Zod and use `@hookform/resolvers/zod`.
- Follow the pattern in existing form components: `useForm`, `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`.

### 6. Icons
- Use **Lucide React** icons exclusively. Import from `lucide-react`.
- Icons should be sized consistently (usually `h-4 w-4` or `h-3 w-3` for small UI elements).

### 7. Testing
- Place tests in `src/test/` directory.
- Use **Vitest** as the test runner and `@testing-library/react` for component tests.
- Test files: `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`.
- Use `describe`, `it`, `expect` from `vitest`.
- Mock browser APIs (like `matchMedia`) in `src/test/setup.ts`.

### 8. Code Structure
```
src/
  pages/          # Route-level page components (Index, NotFound)
  components/     # UI components (reusable, presentational)
    ui/           # shadcn/ui base components (do not edit)
  hooks/          # Custom React hooks
  lib/            # Utility functions, config, helpers
  test/           # Test files
```
- Use the `@` path alias for src-relative imports (e.g., `import Button from "@/components/ui/button"`).

### 9. TypeScript
- Use TypeScript for **all** files (`.ts` or `.tsx`).
- Define interfaces for data structures. Use `type` for unions, aliases, and primitives.
- Export types when they are used across modules.
- Use `satisfies` for config objects to ensure type safety.

### 10. Imports
Group imports in this order:
1. External libraries (React, third-party packages)
2. Internal components, hooks, utilities
3. Styles (if any)

Use the `type` keyword for type-only imports:
```typescript
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/profile";
```

### 11. Component Design
- Keep components **small and focused** (ideally <100 lines).
- Extract reusable logic into custom hooks (e.g., `useDraggable`).
- Use the component template from `AGENTS.md` for UI components with CVA (class-variance-authority).
- Always forward refs properly with `React.forwardRef`.

### 12. Error Handling
- Use `try/catch` for operations that may fail (API calls, localStorage, parsing).
- Return sensible defaults on error rather than throwing, unless the error should propagate.
- Log errors appropriately for debugging (but never log sensitive data).

### 13. Performance
- Use `useCallback` for event handlers passed to child components.
- Use `useMemo` for expensive calculations.
- Avoid unnecessary re-renders by memoizing values and callbacks.
- Use `React.memo` for pure components that re-render often.

### 14. Accessibility
- Use semantic HTML elements (`button`, `nav`, `main`, etc.).
- Add ARIA attributes when needed.
- Leverage Radix UI's built-in accessibility features (keyboard navigation, focus management).
- Ensure color contrast meets WCAG guidelines (Tailwind's default palette is designed for this).

### 15. Security
- Never expose API keys or secrets in client code. Use environment variables via Vite's `import.meta.env`.
- Sanitize user input before rendering (XSS prevention).
- Use HTTPS for all external requests.
- Be cautious with `dangerouslySetInnerHTML`; avoid it if possible.

### 16. Naming Conventions
- **Components**: PascalCase (`CloakDashboard`, `PasswordGate`)
- **Files**: PascalCase for components (`Button.tsx`), camelCase otherwise (`utils.ts`, `profile.ts`)
- **Functions**: camelCase (`loadProfile`, `handlePanic`)
- **Interfaces/Types**: PascalCase (`UserProfile`, `SecuritySettings`)
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase otherwise

### 17. Git Workflow
- Make small, focused commits with clear messages.
- Test your changes locally before pushing.
- Follow the existing code style and conventions.

---

**Remember**: This app is a security tool. Prioritize reliability, clarity, and maintainability. When in doubt, keep it simple and follow the existing patterns.