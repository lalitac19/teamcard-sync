## Goal
Transform the Dashboard from a mostly static summary into an actionable operations cockpit. Today it has placeholder deltas ("+3 this week", "$108.40 pending"), no trend chart, no visibility into approvals, and no drill-down. We'll wire everything to real mock data and add high-signal modules.

## What changes (file: `src/pages/Dashboard.tsx`)

### 1. Hero (kept, but smarter)
- Keep main wallet hero, but compute **pending top-ups** from `walletTopUps` (status `processing`) instead of hardcoded `$30,000`.
- Add a small **runway indicator**: `walletBalance / avg monthly spend` → "≈ X months of runway".

### 2. Real KPIs (replace hardcoded values)
Compute from mock data, each clickable to its destination page:
- **Active cards** → real count, delta = cards created in last 7 days. Links to `/cards`.
- **Verified members** → `verified / total`, delta = pending KYC count. Links to `/members`.
- **Pending reimbursements** → real count + `formatCurrency(sum)` from `reimbursements` where status=`pending`. Links to `/reimbursements`.
- **Pending approvals** (NEW, replaces "Unmapped txns") → total of pending across `txnApprovals`, `cardRequests`, `limitRequests`, `walletTransfers`, `invoices`, `reimbursements`. Links to `/approvals`.

### 3. NEW: 30-day spend trend (line/area chart)
- Use `recharts` via existing `@/components/ui/chart` (`ChartContainer`, `ChartTooltip`).
- Bucket `transactions` by day for the last 30 days, plot daily spend as an area chart.
- Show this-month total, vs last-month total, computed % delta (replaces the hardcoded "12.4%").
- Place beside or above "Spend by category".

### 4. Spend by category (kept, improved)
- Show top 5 only, with category share % beside the amount.
- Each row is a `Link` to `/transactions` (filter by category later).

### 5. NEW: Card utilization (top 5)
- For each active card: `spent / spendLimit` as a `Progress` bar, with cardholder name + last4.
- Sort by utilization desc; flag cards >80% with a destructive badge ("Near limit").
- Helps admins spot cards that need a limit increase or are about to be blocked.

### 6. NEW: Top spenders this period
- Aggregate `transactions` by `memberId`, top 5 with avatar, name, total spent, % of org spend.
- Links to `/transactions`.

### 7. Recent activity (kept, improved)
- Already good; add transaction status pill (posted/pending) and a small category tag.

### 8. NEW: Action center strip (top of page, dismissible look)
A compact row of pill-shaped alerts that only render when the underlying count > 0:
- "X transactions need approval" → `/approvals`
- "X card requests pending" → `/approvals`
- "X members pending KYC" → `/members`
- "X invoices awaiting payment" → `/invoices`
- "X cards over 80% utilization" → `/cards`

This gives the admin a one-glance "what needs me right now" view.

## Layout (top → bottom)
1. Action center strip (only shows when items exist)
2. Hero (wallet) + This-month spend with real % vs last month
3. KPI row (4 cards, all clickable)
4. 30-day spend trend (2/3 width) + Top spenders (1/3)
5. Spend by category (1/2) + Card utilization (1/2)
6. Recent activity (full width or 1/3 alongside something else)

## Implementation notes
- All computations done inline with `useMemo` for clarity (small dataset, no perf concern).
- Use existing `@/components/ui/{card,badge,progress,button}` and `chart.tsx` for the area chart — no new deps.
- Use existing icons from `lucide-react` (`AlertCircle`, `Clock`, `Wallet`, `Receipt`, etc.).
- Keep the existing color tokens (`primary`, `accent`, `success`, `destructive`, `muted-foreground`) — no design system changes.
- All new sections degrade gracefully when their list is empty (hide the section or show "All caught up").

## Files touched
- `src/pages/Dashboard.tsx` — full rewrite of the page body, `KpiCard` helper kept and extended with optional `to` prop for linking.

No data model changes, no routing changes, no other files touched.