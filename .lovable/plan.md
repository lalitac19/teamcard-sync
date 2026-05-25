## Goal
Remove admin Settings from the member portal and replace it with a member-scoped Profile & Preferences page.

## Changes

**1. New page `src/pages/member/MyProfile.tsx`**
Sections:
- **Profile** — name, email, phone (used for OTP), avatar/initials, department (read-only, set by admin)
- **Security** — change password, OTP device (phone for card-reveal OTP), active sessions list with "sign out", "sign out everywhere"
- **Notifications** — toggles for: transaction alerts (email/push), receipt reminders, approval status updates, weekly spend summary
- **Preferences** — language, timezone, theme (light/dark/system)
- **Linked devices** — list of devices currently signed in to the mobile app / browser

All controls are local UI state (prototype), no backend wiring.

**2. `src/App.tsx`**
Add route `/me/profile` → `MyProfile`. Keep `/settings` route (admin-only page unchanged).

**3. `src/components/AppSidebar.tsx`**
- Remove `Settings` from the shared `bottomItems` so it no longer renders for members.
- Render bottom items conditionally: admins get `Plans & Billing` + `Settings`; members get `My Profile` (icon: `UserCog`) only.

**4. `src/components/TopNav.tsx`**
- `memberItems`: replace the `Settings` entry with `My Profile` → `/me/profile` (icon `UserCog`).
- `adminItems`: unchanged.

## Out of scope
- No changes to the admin `Settings.tsx` page.
- No backend, no auth wiring — UI only, consistent with the rest of the prototype.
