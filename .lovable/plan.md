## Replace card — reasons for virtual card replacement

Since the replacement is always a **virtual card** (issued with a fresh card number, expiry, and CVV), the existing reasons (Lost / Stolen / Damaged / Other) don't all fit. Lost/Stolen/Damaged describe physical events.

### New reason list

Replace the dropdown options in `src/pages/Cards.tsx` (Lifecycle tab → Replace card section) with reasons that make sense for re-issuing a virtual card:

1. **Card details compromised** — number, CVV, or expiry was exposed (phishing, data breach, accidental sharing).
2. **Suspected fraud** — unrecognized authorizations or fraud alert on the current card.
3. **Merchant data breach** — vendor that stored the card disclosed a breach.
4. **Recurring charges out of control** — too many subscriptions tied to the card; user wants a clean number.
5. **Other** — free-text reason captured in the existing Notes field.

### Behavior

- The `replaceReason` state type updates from `"lost" | "stolen" | "damaged" | "other"` to the new union.
- Default selection: `compromised`.
- Toast on submit keeps the same shape: `Replacement virtual card requested (<reason label>)`.
- Notes textarea remains for additional context (especially useful when "Other" is picked).

No other parts of the dialog change. Files touched: `src/pages/Cards.tsx` only.