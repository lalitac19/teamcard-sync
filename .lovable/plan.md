## Goal
Turn the existing (non-functional) bell icon in `TopNav` into a working notifications button shown across every interface (admin + member).

## Changes

**1. New component `src/components/NotificationsPopover.tsx`**
- Trigger: bell icon button with a small red unread-count dot.
- Popover (shadcn `Popover`) anchored to the bell, width ~360px, scrollable.
- Header: "Notifications" + "Mark all as read" link.
- List of notifications: icon, title, short description, relative time, unread indicator. Clicking an item marks it read and (optionally) navigates to its target route via `react-router-dom`.
- Empty state: "You're all caught up."
- Footer: "View all" link (placeholder, no new page).
- State is local (prototype, no backend), seeded from a mock list scoped by role.

**2. Mock notifications source `src/lib/mockNotifications.ts`**
- Export `getNotificationsForUser(user)` returning a role-aware list:
  - **Admin/accountant**: new approval requests, low wallet balance, card-issuance request, vendor invoice awaiting approval, accounting export ready.
  - **Member**: card request approved, reimbursement reimbursed, receipt missing reminder, OTP-protected card reveal confirmation, limit-increase status.
- Each item: `{ id, title, description, time, unread, icon, href? }`.

**3. `src/components/TopNav.tsx`**
- Replace the current static `<Button><Bell/></Button>` with `<NotificationsPopover />`.
- No other changes to nav items.

## Out of scope
- No backend, no real notification delivery — pure UI with local state.
- No new dedicated `/notifications` page.
- No changes to layout, sidebar, or routes.
