# AGENTS.md - Advanced Math Project Guide

## Overview

This is a Vite + React + TypeScript project using shadcn/ui components, Tailwind CSS, and Vitest for testing. The app provides a "cloaking" system to disguise a browser tab with fake pages (Google, YouTube, etc.) with security features like panic keys, auto-cloak, and various lock mechanisms.

## Build / Lint / Test Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5000

# Build
npm run build            # Production build to dist/
npm run build:dev        # Build in development mode

# Linting
npm run lint             # Run ESLint on all .ts/.tsx files

# Testing
npm run test             # Run all tests once (Vitest)
npm run test:watch       # Run tests in watch mode

# Run a single test file
npx vitest run src/test/example.test.ts

# Run tests matching a pattern
npx vitest run -t "should pass"

# Preview production build
npm run preview
```

## Path Aliases

- `@` maps to `./src` (e.g., `import Button from "@/components/ui/button"`)

## Code Style Guidelines

### General

- Use TypeScript for all files (`.ts` or `.tsx`)
- Prefer functional components with hooks over class components
- Use `const` by default, `let` only when mutation is necessary

### Imports

- Use path alias `@/` for src-relative imports
- Group imports: external libs → internal components/hooks → styles
- Use `type` keyword for type-only imports: `import { type Foo } from "..."`

```typescript
// Good
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/profile";

// React import for JSX
import * as React from "react";
```

### Naming Conventions

- **Components**: PascalCase (`CloakDashboard`, `Button`)
- **Files**: PascalCase for components (`Button.tsx`), camelCase otherwise (`utils.ts`, `profile.ts`)
- **Functions**: camelCase (`loadProfile`, `handlePanic`)
- **Interfaces/Types**: PascalCase (`UserProfile`, `SecuritySettings`)
- **Constants**: SCREAMING_SNAKE_CASE for config values, camelCase otherwise

### Component Structure

Use this template for UI components:

```typescript
import * as React from "react";
import { someRadixComponent } from "@radix-ui/react-some-package";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const componentVariants = cva("", {
  variants: {
    variant: { default: "", secondary: "" },
    size: { default: "", sm: "", lg: "" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return <Comp className={cn(componentVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Component.displayName = "Component";

export { Component, componentVariants };
```

### Tailwind CSS

- Use Tailwind utility classes for all styling
- Use `cn()` utility to merge Tailwind classes with component props
- Follow shadcn/ui color patterns (`bg-primary`, `text-destructive`, etc.)
- Custom colors are defined in `tailwind.config.ts`

### Types

- Define interfaces for all data structures
- Use `type` for unions, aliases, and primitives
- Export types when used across modules
- Use `satisfies` for config objects

```typescript
// Good
export interface UserProfile {
  displayName: string;
  panicKey: string;
}

type AppState = "gate" | "locked" | "unlocked" | "panic";

// Config with satisfies
export default { ... } satisfies Config;
```

### Error Handling

- Use try/catch for operations that may fail
- Return sensible defaults on error rather than throwing
- Log errors appropriately for debugging

```typescript
// Good - return defaults on failure
export function loadProfile(): UserProfile {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}
```

### State Management

- Use React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- Use `@tanstack/react-query` for server state
- Use local state for component-specific UI state

### Forms & Validation

- Use `react-hook-form` with `zod` for form validation
- Follow the pattern in existing form components

### Testing

- Place tests in `src/test/` directory
- Test files: `*.test.{ts,tsx}` or `*.spec.{ts,tsx}`
- Vitest is configured with jsdom environment
- Use `@testing-library/react` for component tests

```typescript
import { describe, it, expect } from "vitest";

describe("module name", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### ESLint Configuration

- Located in `eslint.config.js`
- Extends TypeScript ESLint recommended rules
- React hooks plugin is configured
- React refresh plugin enabled for HMR

### Key Dependencies

- **UI**: shadcn/ui (Radix UI primitives), Lucide icons
- **Styling**: Tailwind CSS, class-variance-authority, tailwind-merge
- **Forms**: react-hook-form, zod, @hookform/resolvers
- **Data**: @tanstack/react-query
- **Routing**: react-router-dom
- **Charts**: recharts
- **Testing**: vitest, @testing-library/react, jsdom
