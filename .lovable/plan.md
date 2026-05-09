## Goal
On the admin Wallet page, replace the "Quick actions" card and the existing "Top up wallet" dialog with a single flow that reveals the company's assigned IBAN / bank account details so the admin knows where to wire funds.

## Changes (src/pages/Wallet.tsx)

1. **Remove the "Quick actions" card** (right column with ACH transfer in / Wire instructions / Auto top-up rules buttons).
2. **Make the hero balance card span the full width** (`md:col-span-3` or remove the grid).
3. **Replace `TopUpDialog`** — keep the same "Top up wallet" button in the page header, but clicking it now opens a dialog titled "Top up wallet — bank transfer details" that displays the company's unique IBAN and supporting bank fields, instead of an amount form.

## Bank details shown in the dialog
Mock data, copy-to-clipboard on each field:
- Beneficiary name: `Peko Technologies Inc.`
- IBAN: `GB29 PEKO 0000 0012 3456 78` (unique per company)
- BIC / SWIFT: `PEKOGB2LXXX`
- Bank name: `Peko Banking Partner, London`
- Bank address: `1 Finsbury Avenue, London EC2M 2PP`
- Reference (must include): the company's account ID, e.g. `PEKO-CLIENT-00421` — note that admin must include this so the top-up is auto-matched.

Plus a short note: "Transfers usually settle in 1–2 business days. The wallet balance will update automatically once funds are received."

## Technical notes
- New small `<CopyField>` helper inside the file using `navigator.clipboard.writeText` + `toast.success("Copied")`, rendered as a row with label, monospaced value, and a `Copy` icon button (lucide-react).
- Drop unused imports (`ArrowDownLeft`, `ArrowUpRight`, `Banknote`, the `Input`/`Label` previously used for amount entry if no longer needed).
- No business-logic / data-model changes; mock IBAN values can live as constants at the top of `Wallet.tsx`.
- Hero card layout: change wrapping grid from `md:grid-cols-3` to a single full-width card so it doesn't look unbalanced after removing Quick actions.
