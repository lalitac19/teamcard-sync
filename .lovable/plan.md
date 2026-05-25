## Goal
Move "Plans & Billing" from standalone sidebar/top-nav items into a tab inside Settings.

## Changes

**1. `src/components/AppSidebar.tsx`**
- Removed "Plans & Billing" from `adminBottomItems`.
- Removed unused `Sparkles` import.

**2. `src/components/TopNav.tsx`**
- Removed "Plans & Billing" from `adminItems`.
- Removed unused `Sparkles` import.

**3. `src/pages/Settings.tsx`**
- Added "Plans & Billing" tab (with `Sparkles` icon) alongside General, Roles & Permissions, and Integrations.
- Embedded `PlansBilling` component with subscription plan cards and billing history table, reusing the mock data and UI from the former standalone Plans page.
- Added required imports: `Check`, `Sparkles`, `Download`, table components, `formatCurrency`, `formatDate`.

## Out of scope
- The `/plans` route still exists for direct navigation; no redirect added.
