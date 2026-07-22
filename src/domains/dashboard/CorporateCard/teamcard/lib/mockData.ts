// Centralized mock data for the corporate card portal

export type CardType = "virtual" | "physical" | "single-use";
export type CardStatus = "active" | "frozen" | "expired" | "terminated";

export type MemberRole = "admin" | "accountant" | "external_auditor" | "team_member";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  department: string;
  avatar: string;
  kycStatus: "verified" | "pending" | "not_started";
  joinedAt: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leadId: string;
  memberIds: string[];
  createdAt: string;
}

export interface RolePermissions {
  role: MemberRole | "team_lead";
  label: string;
  description: string;
  permissions: Record<string, boolean>;
}

export const permissionCatalog: { key: string; label: string; group: string }[] = [
  { key: "view_dashboard", label: "View dashboard", group: "General" },
  { key: "manage_members", label: "Invite & remove people", group: "People" },
  { key: "assign_roles", label: "Assign roles to people", group: "People" },
  { key: "manage_teams", label: "Create & edit teams", group: "People" },
  { key: "issue_cards", label: "Issue new cards", group: "Cards" },
  { key: "freeze_cards", label: "Freeze / unfreeze cards", group: "Cards" },
  { key: "set_card_limits", label: "Set card spend limits", group: "Cards" },
  { key: "approve_transactions", label: "Approve card transactions", group: "Approvals" },
  
  { key: "approve_card_requests", label: "Approve card issuance requests", group: "Approvals" },
  { key: "approve_topup_requests", label: "Approve card fund requests", group: "Approvals" },
  { key: "view_wallet", label: "View Corporate Account & Available Limits", group: "Corporate Account" },
  { key: "topup_wallet", label: "Fund Account", group: "Corporate Account" },
  { key: "view_accounting", label: "View accounting export", group: "Accounting" },
  { key: "map_export", label: "Map & export to accounting software", group: "Accounting" },
  { key: "view_audit_logs", label: "View audit logs (read-only)", group: "Audit" },
];

export const defaultRolePermissions: RolePermissions[] = [
  {
    role: "admin",
    label: "Admin",
    description: "Full access to every part of the workspace.",
    permissions: Object.fromEntries(permissionCatalog.map((p) => [p.key, true])),
  },
  {
    role: "accountant",
    label: "Accountant",
    description: "Manages bookkeeping, mapping, and exports.",
    permissions: Object.fromEntries(
      permissionCatalog.map((p) => [
        p.key,
        ["view_dashboard", "view_wallet", "view_accounting", "map_export", "view_audit_logs"].includes(p.key),
      ]),
    ),
  },
  {
    role: "external_auditor",
    label: "External Auditor",
    description: "Read-only access to financial data for audits.",
    permissions: Object.fromEntries(
      permissionCatalog.map((p) => [
        p.key,
        ["view_dashboard", "view_wallet", "view_accounting", "view_audit_logs"].includes(p.key),
      ]),
    ),
  },
  {
    role: "team_member",
    label: "Team Member",
    description: "Standard cardholder.",
    permissions: Object.fromEntries(
      permissionCatalog.map((p) => [p.key, ["view_dashboard"].includes(p.key)]),
    ),
  },
  {
    role: "team_lead",
    label: "Team Lead",
    description: "Team-scoped approvals and visibility.",
    permissions: Object.fromEntries(
      permissionCatalog.map((p) => [
        p.key,
        ["view_dashboard", "set_card_limits"].includes(p.key),
      ]),
    ),
  },
];

export interface Card {
  id: string;
  memberId: string;
  type: CardType;
  status: CardStatus;
  last4: string;
  /** Name printed on the card. Falls back to member name if omitted. */
  cardName?: string;
  /**
   * Allocated spending limit for the period. Funds equal to this limit are
   * locked in the wallet and reserved exclusively for this card until an
   * admin reallocates them.
   */
  spendLimit: number;
  /** Maximum amount allowed for a single transaction on this card. */
  txnLimit?: number;
  /** Optional daily ATM withdrawal limit. Capped at 20% of the daily-equivalent spending limit. */
  atmDailyLimit?: number;
  spent: number;
  /** Cards do not hold a balance — they spend against their allocated wallet limit. */
  balance: number;
  limitPeriod: "daily" | "weekly" | "monthly" | "per-transaction";
  merchantCategories?: string[];
  createdAt: string;
}

export type TransferDirection = "wallet_to_card" | "card_to_wallet";

export interface WalletTransfer {
  id: string;
  date: string;
  direction: TransferDirection;
  amount: number;
  fromCardId?: string; // present for card_to_wallet
  toCardId?: string;   // present for wallet_to_card
  requestedBy: string; // memberId
  reason?: string;
  status: "pending" | "approved" | "rejected";
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  cardId?: string;
  memberId: string;
  status: "posted" | "pending" | "declined";
  receipt?: boolean;
  vatRate?: number;
  debitAccount?: string;
  vendor?: string;
  country?: string;
  exported?: boolean;
  /** Fees charged on top of the merchant amount (FX, processing, etc.). */
  fee?: number;
  /** Original transaction amount in the merchant's currency (if not AED). */
  originalAmount?: number;
  /** ISO 4217 code of the merchant currency (e.g. "USD", "EUR"). Omitted when AED. */
  originalCurrency?: string;
}

export interface Reimbursement {
  id: string;
  date: string;
  memberId: string;
  merchant: string;
  category: string;
  amount: number;
  status: "approved" | "pending" | "rejected";
  receipt: boolean;
  description: string;
  country?: string;
  debitAccount?: string;
  vatRate?: number;
  exported?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  vendor: string;
  amount: number;
  uploadedBy: string;
  status: "approved" | "pending" | "rejected";
  country?: string;
  debitAccount?: string;
  vatRate?: number;
  exported?: boolean;
}

export interface TxnApproval {
  id: string;
  txnId: string;
  date: string;
  memberId: string;
  cardId: string;
  merchant: string;
  amount: number;
  policyReason: string; // why it requires approval (per card / cardholder policy)
  status: "pending" | "approved" | "rejected";
}

export interface CardRequest {
  id: string;
  date: string;
  memberId: string;
  type: CardType;
  requestedLimit: number;
  limitPeriod?: "daily" | "weekly" | "monthly" | "per-transaction";
  /** Optional daily ATM withdrawal limit requested by the member. */
  atmDailyLimit?: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface TopUpRequest {
  id: string;
  date: string;
  memberId: string;
  cardId: string;
  currentBalance: number;
  requestedAmount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  /** Set when approved: indicates whether the wallet had enough funds to complete the transfer. */
  fundingStatus?: "funded" | "insufficient_funds";
}

export interface WalletTopUp {
  id: string;
  date: string;
  amount: number;
  reference: string;
  source: string;
  status: "completed" | "processing";
  debitAccount?: string;
  exported?: boolean;
}

// Chart of Accounts (mocked from QuickBooks)
export const chartOfAccounts = [
  { code: "5010", name: "Travel & Transportation", type: "Expense" },
  { code: "5020", name: "Meals & Entertainment", type: "Expense" },
  { code: "5030", name: "Office Supplies", type: "Expense" },
  { code: "5040", name: "Software & Subscriptions", type: "Expense" },
  { code: "5050", name: "Marketing & Advertising", type: "Expense" },
  { code: "5060", name: "Professional Services", type: "Expense" },
  { code: "5070", name: "Utilities", type: "Expense" },
  { code: "5080", name: "Equipment & Hardware", type: "Expense" },
  { code: "5090", name: "Bank & Card Fees", type: "Expense" },
  { code: "1010", name: "Cash — Corporate Account", type: "Asset" },
  { code: "1020", name: "Bank Account — Operating", type: "Asset" },
  { code: "2010", name: "Accounts Payable", type: "Liability" },
  { code: "2020", name: "Employee Reimbursements Payable", type: "Liability" },
  { code: "2030", name: "Credit Card Clearing", type: "Liability" },
];

export const vatRates = [
  { code: "STD_5", rate: 5, label: "Standard Rated — 5%", reverseCharge: false },
  { code: "ZERO_0", rate: 0, label: "Zero Rated — 0%", reverseCharge: false },
  { code: "STD_5_RC", rate: 5, label: "Standard Rated — 5% (Reverse Charge)", reverseCharge: true },
  { code: "ZERO_0_RC", rate: 0, label: "Zero Rated — 0% (Reverse Charge)", reverseCharge: true },
];

export const members: Member[] = [
  { id: "m1", name: "Sarah Chen", email: "sarah@northwind.co", role: "admin", department: "Finance", avatar: "SC", kycStatus: "verified", joinedAt: "2024-01-12", teamId: "tm1" },
  { id: "m2", name: "Marcus Patel", email: "marcus@northwind.co", role: "team_member", department: "Sales", avatar: "MP", kycStatus: "verified", joinedAt: "2024-02-03", teamId: "tm2" },
  { id: "m3", name: "Elena Rodriguez", email: "elena@northwind.co", role: "team_member", department: "Marketing", avatar: "ER", kycStatus: "verified", joinedAt: "2024-02-18", teamId: "tm3" },
  { id: "m4", name: "James O'Connor", email: "james@northwind.co", role: "team_member", department: "Engineering", avatar: "JO", kycStatus: "verified", joinedAt: "2024-03-04", teamId: "tm4" },
  { id: "m5", name: "Aiko Tanaka", email: "aiko@northwind.co", role: "team_member", department: "Operations", avatar: "AT", kycStatus: "verified", joinedAt: "2024-03-22" },
  { id: "m6", name: "David Kim", email: "david@northwind.co", role: "team_member", department: "Engineering", avatar: "DK", kycStatus: "pending", joinedAt: "2024-09-15", teamId: "tm4" },
  { id: "m7", name: "Priya Shah", email: "priya@northwind.co", role: "accountant", department: "Finance", avatar: "PS", kycStatus: "not_started", joinedAt: "2024-10-02", teamId: "tm1" },
];

export const teams: Team[] = [
  { id: "tm1", name: "Finance", description: "Bookkeeping & treasury", leadId: "m1", memberIds: ["m1", "m7"], createdAt: "2024-01-15" },
  { id: "tm2", name: "Sales", description: "Revenue team", leadId: "m2", memberIds: ["m2"], createdAt: "2024-02-05" },
  { id: "tm3", name: "Marketing", description: "Brand & growth", leadId: "m3", memberIds: ["m3"], createdAt: "2024-02-20" },
  { id: "tm4", name: "Engineering", description: "Product & infra", leadId: "m4", memberIds: ["m4", "m6"], createdAt: "2024-03-08" },
];

export const cards: Card[] = [
  // All cards spend against their allocated limit, which locks funds in the wallet.
  { id: "c2", memberId: "m2", type: "physical", status: "active", last4: "9012", spendLimit: 15000, txnLimit: 2500, spent: 11200, balance: 0, limitPeriod: "monthly", createdAt: "2024-02-05" },
  { id: "c3", memberId: "m2", type: "virtual", status: "active", last4: "3344", spendLimit: 5000, txnLimit: 1000, spent: 1280, balance: 0, limitPeriod: "monthly", merchantCategories: ["Software"], createdAt: "2024-04-10" },
  { id: "c4", memberId: "m3", type: "virtual", status: "active", last4: "5566", spendLimit: 8000, txnLimit: 2000, spent: 6450, balance: 0, limitPeriod: "monthly", merchantCategories: ["Marketing"], createdAt: "2024-02-20" },
  { id: "c5", memberId: "m4", type: "virtual", status: "active", last4: "7788", spendLimit: 3000, txnLimit: 800, spent: 980, balance: 0, limitPeriod: "monthly", merchantCategories: ["Software"], createdAt: "2024-03-08" },
  { id: "c6", memberId: "m5", type: "physical", status: "frozen", last4: "1199", spendLimit: 1500, txnLimit: 500, spent: 0, balance: 0, limitPeriod: "monthly", createdAt: "2024-03-25" },
  { id: "c7", memberId: "m3", type: "single-use", status: "active", last4: "2255", spendLimit: 1200, txnLimit: 1200, spent: 0, balance: 0, limitPeriod: "per-transaction", createdAt: "2024-10-20" },
];

export const transactions: Transaction[] = [
  { id: "t1", date: "2024-10-22", merchant: "United Airlines", category: "Travel", amount: 1240.50, fee: 18.60, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "United Airlines Inc.", country: "United States", originalAmount: 337.75, originalCurrency: "USD" },
  { id: "t2", date: "2024-10-22", merchant: "Figma Inc.", category: "Software", amount: 144.00, fee: 2.16, cardId: "c3", memberId: "m2", status: "posted", receipt: true, vendor: "Figma Inc.", country: "United States", originalAmount: 39.20, originalCurrency: "USD" },
  { id: "t3", date: "2024-10-21", merchant: "WeWork", category: "Office", amount: 890.00, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "WeWork Companies", country: "United Kingdom", originalAmount: 191.00, originalCurrency: "GBP" },
  { id: "t4", date: "2024-10-21", merchant: "Google Ads", category: "Marketing", amount: 2400.00, fee: 36.00, cardId: "c4", memberId: "m3", status: "posted", receipt: true, vendor: "Google LLC", country: "Ireland", originalAmount: 600.00, originalCurrency: "EUR" },
  { id: "t5", date: "2024-10-20", merchant: "Uber", category: "Travel", amount: 38.20, cardId: "c2", memberId: "m2", status: "posted", receipt: false, vendor: "Uber Technologies", country: "United States" },
  { id: "t6", date: "2024-10-20", merchant: "Sweetgreen", category: "Meals", amount: 64.80, cardId: "c2", memberId: "m2", status: "posted", receipt: true, vendor: "Sweetgreen Inc.", country: "United States" },
  { id: "t7", date: "2024-10-19", merchant: "AWS", category: "Software", amount: 1820.00, fee: 27.30, cardId: "c5", memberId: "m4", status: "posted", receipt: true, vendor: "Amazon Web Services", country: "United States", originalAmount: 495.50, originalCurrency: "USD" },
  { id: "t8", date: "2024-10-19", merchant: "LinkedIn Ads", category: "Marketing", amount: 760.00, fee: 11.40, cardId: "c4", memberId: "m3", status: "posted", receipt: true, vendor: "LinkedIn Corp.", country: "United States", originalAmount: 207.00, originalCurrency: "USD" },
  { id: "t9", date: "2024-10-18", merchant: "Hilton Hotels", category: "Travel", amount: 412.00, fee: 6.18, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "Hilton Worldwide", country: "Germany", originalAmount: 103.00, originalCurrency: "EUR" },
  { id: "t10", date: "2024-10-18", merchant: "Notion Labs", category: "Software", amount: 96.00, fee: 1.44, cardId: "c3", memberId: "m2", status: "posted", receipt: true, vendor: "Notion Labs Inc.", country: "United States", originalAmount: 26.00, originalCurrency: "USD" },
  { id: "t11", date: "2024-10-17", merchant: "Lyft", category: "Travel", amount: 24.50, cardId: "c2", memberId: "m2", status: "pending", receipt: false, vendor: "Lyft Inc.", country: "United States" },
  { id: "t12", date: "2024-10-17", merchant: "Staples", category: "Office", amount: 156.30, fee: 2.34, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "Staples Inc.", country: "Canada", originalAmount: 58.00, originalCurrency: "CAD" },
];

export const reimbursements: Reimbursement[] = [
  { id: "r1", date: "2024-10-21", memberId: "m4", merchant: "Local Taxi", category: "Travel", amount: 42.00, status: "approved", receipt: true, description: "Client meeting transport", country: "United States" },
  { id: "r2", date: "2024-10-20", memberId: "m3", merchant: "Print Shop", category: "Office", amount: 88.50, status: "approved", receipt: true, description: "Conference materials", country: "France" },
  { id: "r3", date: "2024-10-19", memberId: "m5", merchant: "Restaurant Daniel", category: "Meals", amount: 215.00, status: "approved", receipt: true, description: "Client dinner", country: "United States" },
  { id: "r4", date: "2024-10-22", memberId: "m4", merchant: "Coffee Bean", category: "Meals", amount: 18.40, status: "pending", receipt: true, description: "Team coffee", country: "United States" },
  { id: "r5", date: "2024-10-18", memberId: "m2", merchant: "Parking Garage", category: "Travel", amount: 35.00, status: "approved", receipt: true, description: "Off-site meeting parking", country: "United Kingdom" },
];

export const invoices: Invoice[] = [
  { id: "i1", invoiceNumber: "INV-2024-1042", date: "2024-10-15", dueDate: "2024-11-14", vendor: "Acme Legal LLP", amount: 4500.00, uploadedBy: "m1", status: "approved", country: "United States" },
  { id: "i2", invoiceNumber: "INV-90234", date: "2024-10-12", dueDate: "2024-11-11", vendor: "BrightDesign Studio", amount: 6800.00, uploadedBy: "m3", status: "approved", country: "United Kingdom" },
  { id: "i3", invoiceNumber: "2024-1098", date: "2024-10-18", dueDate: "2024-11-17", vendor: "Cloudflare Enterprise", amount: 2400.00, uploadedBy: "m4", status: "approved", country: "United States" },
  { id: "i4", invoiceNumber: "INV-7711", date: "2024-10-22", dueDate: "2024-11-21", vendor: "FreshClean Office Co.", amount: 320.00, uploadedBy: "m5", status: "pending", country: "Germany" },
];

export const walletTopUps: WalletTopUp[] = [
  { id: "w1", date: "2024-10-01", amount: 50000, reference: "WIRE-OCT-001", source: "Operating Bank ****4521", status: "completed" },
  { id: "w2", date: "2024-09-15", amount: 25000, reference: "WIRE-SEP-002", source: "Operating Bank ****4521", status: "completed" },
  { id: "w3", date: "2024-09-01", amount: 50000, reference: "WIRE-SEP-001", source: "Operating Bank ****4521", status: "completed" },
  { id: "w4", date: "2024-10-22", amount: 30000, reference: "WIRE-OCT-002", source: "Operating Bank ****4521", status: "processing" },
];

export const txnApprovals: TxnApproval[] = [
  { id: "ta1", txnId: "t4", date: "2024-10-21", memberId: "m3", cardId: "c4", merchant: "Google Ads", amount: 2400.00, policyReason: "Exceeds AED 2,000 single-txn policy", status: "pending" },
  { id: "ta2", txnId: "t7", date: "2024-10-19", memberId: "m4", cardId: "c5", merchant: "AWS", amount: 1820.00, policyReason: "Cardholder requires manager review", status: "pending" },
  { id: "ta3", txnId: "t1", date: "2024-10-22", memberId: "m1", cardId: "c1", merchant: "United Airlines", amount: 1240.50, policyReason: "Travel category > AED 1,000", status: "approved" },
  { id: "ta4", txnId: "t9", date: "2024-10-18", memberId: "m1", cardId: "c1", merchant: "Hilton Hotels", amount: 412.00, policyReason: "Lodging requires tag review", status: "rejected" },
];

export const cardRequests: CardRequest[] = [
  { id: "cr1", date: "2024-10-22", memberId: "m6", type: "virtual", requestedLimit: 2000, limitPeriod: "monthly", reason: "Need card for SaaS subscriptions", status: "pending" },
  { id: "cr2", date: "2024-10-21", memberId: "m4", type: "single-use", requestedLimit: 800, limitPeriod: "per-transaction", reason: "One-off vendor payment", status: "pending" },
  { id: "cr3", date: "2024-10-15", memberId: "m3", type: "physical", requestedLimit: 5000, limitPeriod: "monthly", reason: "Field marketing travel", status: "approved" },
];

export const topUpRequests: TopUpRequest[] = [
  { id: "tr1", date: "2024-10-22", memberId: "m2", cardId: "c2", currentBalance: 1800, requestedAmount: 2500, reason: "End of quarter client entertainment", status: "pending" },
  { id: "tr2", date: "2024-10-20", memberId: "m3", cardId: "c4", currentBalance: 2550, requestedAmount: 4000, reason: "Holiday ad campaign", status: "pending" },
  { id: "tr3", date: "2024-10-10", memberId: "m4", cardId: "c5", currentBalance: 1020, requestedAmount: 800, reason: "Fund for AWS usage", status: "approved", fundingStatus: "funded" },
];

export const walletTransfers: WalletTransfer[] = [
  { id: "wt1", date: "2024-10-22", direction: "wallet_to_card", amount: 2000, toCardId: "c1", requestedBy: "m1", reason: "Fund for travel week", status: "pending" },
  { id: "wt2", date: "2024-10-21", direction: "card_to_wallet", amount: 500, fromCardId: "c5", requestedBy: "m1", reason: "Reallocate unused SaaS budget", status: "pending" },
  { id: "wt3", date: "2024-10-20", direction: "card_to_wallet", amount: 1500, fromCardId: "c6", requestedBy: "m1", reason: "Card frozen — return funds", status: "approved" },
  { id: "wt4", date: "2024-10-18", direction: "wallet_to_card", amount: 3000, toCardId: "c4", requestedBy: "m1", reason: "Q4 ad spend", status: "approved" },
];

export const walletBalance = 60000;
export const walletReserved = 12400.00;

// =====================================================================
// Corporate credit model (admin-only visibility)
// ---------------------------------------------------------------------
// The corporate's FIRST funding after onboarding permanently sets the
// Corporate Credit Limit. From that point on:
//   • The limit can only DECREASE — it shrinks by any unpaid amount
//     that remains past a bill's due date (limit -= unpaid).
//   • Subsequent funding NEVER raises the limit. Any amount funded
//     beyond what was needed to settle the latest bill is held as
//     surplus funds and added on top of the credit limit when
//     calculating the Available Limit.
//
// Available Limit = Corporate Credit Limit + Surplus Funds
//                   − current cycle accrual − unpaid bills
//
// Cycle: 26th of month → 25th of next month. Bill issued on the 26th,
// due by the last day of that bill month.
//
// Cascade to card spend limits
// ----------------------------
//   • Limit INCREASES (surplus → credit limit): existing card spend
//     limits are NEVER changed automatically. An admin must manually
//     raise individual card limits to use the new headroom.
//   • Limit DECREASES (unpaid/partial bill): every card whose spend
//     limit is greater than the new Corporate Credit Limit is capped
//     at the new corporate limit. Cards already under the new limit
//     are not touched.
//   • Each cardholder whose card was capped receives a notification
//     telling them their card limit was reduced and the new value.
//
// Example: Corp 1,000 → 700.
//   Card A (1,000) → 700 (capped, cardholder notified)
//   Card B (500)   → 500 (unchanged, no notification)
// If Corp then drops to 300, both cards are capped to 300 and both
// cardholders are notified.
// =====================================================================


/** Set by the corporate's first funding after onboarding. Only decreases (via unpaid bills). */
export const corporateDeposit = 500000;
/** Semantic alias — this is the Corporate Credit Limit. */
export const corporateCreditLimit = corporateDeposit;
/** Funds received in excess of what was required to settle bills. Sits on top of the credit limit. */
export const surplusFunds = 150000;

export interface Bill {
  id: string;
  cycleStart: string;
  cycleEnd: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "paid" | "partial" | "due" | "overdue";
  paidAmount?: number;
  paidDate?: string;
}

export const bills: Bill[] = [
  { id: "bl1", cycleStart: "2024-06-26", cycleEnd: "2024-07-25", issueDate: "2024-07-26", dueDate: "2024-07-31", amount: 41280, status: "paid", paidAmount: 41280, paidDate: "2024-07-30" },
  { id: "bl2", cycleStart: "2024-07-26", cycleEnd: "2024-08-25", issueDate: "2024-08-26", dueDate: "2024-08-31", amount: 38420, status: "paid", paidAmount: 38420, paidDate: "2024-08-29" },
  { id: "bl3", cycleStart: "2024-08-26", cycleEnd: "2024-09-25", issueDate: "2024-09-26", dueDate: "2024-09-30", amount: 52180, status: "paid", paidAmount: 52180, paidDate: "2024-09-30" },
];

/** History of every change to the Corporate Credit Limit. */
export type CreditLimitEventType = "initial" | "increase" | "decrease";
export interface CreditLimitEvent {
  id: string;
  date: string;
  type: CreditLimitEventType;
  delta: number; // signed change to the limit
  resultingLimit: number;
  reason: string;
  reference?: string;
}

export const creditLimitHistory: CreditLimitEvent[] = [
  {
    id: "cl1",
    date: "2024-06-12",
    type: "initial",
    delta: 500000,
    resultingLimit: 500000,
    reason: "Corporate Credit Limit set at first funding",
    reference: "FUND-INIT-0612",
  },
  {
    id: "cl2",
    date: "2024-07-15",
    type: "increase",
    delta: 50000,
    resultingLimit: 550000,
    reason: "Surplus converted to Corporate Credit Limit",
    reference: "CONV-0715-001",
  },
  {
    id: "cl3",
    date: "2024-08-01",
    type: "decrease",
    delta: -13420,
    resultingLimit: 536580,
    reason: "Unpaid bill from Jul cycle — limit reduced automatically",
    reference: "BILL-JUL-13420",
  },
  {
    id: "cl4",
    date: "2024-08-20",
    type: "increase",
    delta: 25000,
    resultingLimit: 561580,
    reason: "Surplus converted to Corporate Credit Limit",
    reference: "CONV-0820-002",
  },
  {
    id: "cl5",
    date: "2024-09-05",
    type: "increase",
    delta: 75000,
    resultingLimit: 636580,
    reason: "Surplus converted to Corporate Credit Limit",
    reference: "CONV-0905-003",
  },
  {
    id: "cl6",
    date: "2024-09-30",
    type: "decrease",
    delta: -8500,
    resultingLimit: 628080,
    reason: "Unpaid bill from Aug cycle — limit reduced automatically",
    reference: "BILL-AUG-08500",
  },
  {
    id: "cl7",
    date: "2024-10-10",
    type: "increase",
    delta: 40000,
    resultingLimit: 668080,
    reason: "Surplus converted to Corporate Credit Limit",
    reference: "CONV-1010-004",
  },
];

/**
 * Notification sent to a cardholder when their card spend limit was
 * automatically reduced because the Corporate Credit Limit dropped
 * below their previous card limit.
 */
export interface CardLimitNotification {
  id: string;
  date: string;
  cardId: string;
  memberId: string;
  oldLimit: number;
  newLimit: number;
  corporateLimitAfter: number;
  triggerEventId: string; // CreditLimitEvent.id that caused it
  message: string;
}

export const cardLimitNotifications: CardLimitNotification[] = [];

/**
 * Apply the corporate-limit cascade rule to a set of cards.
 * Returns the updated cards and the notifications that should be sent.
 * Only DECREASES cascade; increases never auto-raise card limits.
 */
export function applyCorporateLimitCap<T extends { id: string; memberId: string; spendLimit: number }>(
  newCorporateLimit: number,
  cardsList: T[],
  triggerEventId: string,
  when: string = new Date().toISOString().slice(0, 10),
): { updatedCards: T[]; notifications: CardLimitNotification[] } {
  const notifications: CardLimitNotification[] = [];
  const updatedCards = cardsList.map((c) => {
    if (c.spendLimit > newCorporateLimit) {
      notifications.push({
        id: `cln-${triggerEventId}-${c.id}`,
        date: when,
        cardId: c.id,
        memberId: c.memberId,
        oldLimit: c.spendLimit,
        newLimit: newCorporateLimit,
        corporateLimitAfter: newCorporateLimit,
        triggerEventId,
        message:
          `Your card spend limit has been reduced from ${c.spendLimit.toLocaleString()} to ${newCorporateLimit.toLocaleString()} ` +
          `because the company's Corporate Credit Limit dropped to ${newCorporateLimit.toLocaleString()}.`,
      });
      return { ...c, spendLimit: newCorporateLimit };
    }
    return c;
  });
  return { updatedCards, notifications };
}


/** Current open cycle window. */
export const currentCycle = (anchor: Date = new Date("2024-10-22")) => {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const d = anchor.getDate();
  const startMonth = d >= 26 ? m : m - 1;
  const start = new Date(y, startMonth, 26);
  const end = new Date(y, startMonth + 1, 25);
  const issue = new Date(y, startMonth + 1, 26);
  const due = new Date(y, startMonth + 2, 0);
  return { start, end, issue, due };
};

/** Sum of transactions falling inside the current open cycle window. */
export const currentCycleAccrual = (): number => {
  const { start, end } = currentCycle();
  return transactions.reduce((s, t) => {
    const d = new Date(t.date);
    return d >= start && d <= end ? s + t.amount : s;
  }, 0);
};

/** Outstanding balance on bills not fully paid. Locks against the limit. */
export const unpaidBillsTotal = (): number =>
  bills
    .filter((b) => b.status !== "paid")
    .reduce((s, b) => s + Math.max(0, b.amount - (b.paidAmount ?? 0)), 0);

/**
 * Available Limit = Corporate Credit Limit + Surplus Funds
 *                   − current cycle accrual − unpaid bills.
 * Overpayments grow the available balance via surplus funds; they do
 * not raise the credit limit itself.
 */
export const availableCredit = (): number =>
  Math.max(0, corporateCreditLimit + surplusFunds - currentCycleAccrual() - unpaidBillsTotal());

// Statement-only entries (refunds, cashback, fees, ATM withdrawals). Internal wallet<->card transfers are excluded by design.
export type StatementExtraType = "refund" | "cashback" | "fee" | "atm_withdrawal" | "atm_fee";
export interface StatementExtra {
  id: string;
  date: string;
  type: StatementExtraType;
  description: string;
  amount: number; // positive = money in, negative = money out
  reference?: string;
}

/** Flat fee charged to the corporate account for every ATM cash withdrawal. */
export const ATM_WITHDRAWAL_FEE = 10;

// NOTE: Service fees (ATM fees, monthly platform fees, card issuance fees)
// are NOT billed to the Account Statement automatically. They are settled separately
// through the Service Fees payment gateway. Only if the user chooses to pay with the
// Peko corporate card will the resulting charge appear on the Account Statement
// (added via `addStatementExtra`).
export const statementExtras: StatementExtra[] = [
  { id: "se1", date: "2024-10-23", type: "refund",   description: "United Airlines — itinerary change refund", amount: 320.00, reference: "RFND-UA-8821" },
  { id: "se2", date: "2024-10-15", type: "cashback", description: "Monthly card spend cashback (1%)",          amount: 184.20, reference: "CB-OCT-24" },
  { id: "se5", date: "2024-09-22", type: "refund",   description: "Hilton Hotels — duplicate charge refund",  amount: 412.00, reference: "RFND-HIL-7711" },
  { id: "se6", date: "2024-09-15", type: "cashback", description: "Monthly card spend cashback (1%)",          amount: 156.80, reference: "CB-SEP-24" },

  // ATM cash withdrawals — the cash itself is a real card transaction and stays on the statement.
  // The flat AED 10 ATM service fee is billed separately via the Service Fees gateway.
  { id: "se-atm1", date: "2024-10-19", type: "atm_withdrawal", description: "ATM cash withdrawal — Sarah Chen (•• 4521) · Emirates NBD ATM, Dubai Mall", amount: -500.00,  reference: "ATM-DXB-10019" },
  { id: "se-atm2", date: "2024-10-12", type: "atm_withdrawal", description: "ATM cash withdrawal — Ahmed Hassan (•• 7788) · ADCB ATM, Abu Dhabi Mall",  amount: -1000.00, reference: "ATM-AUH-10012" },
  { id: "se-atm3", date: "2024-10-03", type: "atm_withdrawal", description: "ATM cash withdrawal — Priya Patel (•• 3344) · HSBC ATM, DIFC",            amount: -2000.00, reference: "ATM-DXB-10003" },
  { id: "se-atm4", date: "2024-09-24", type: "atm_withdrawal", description: "ATM cash withdrawal — Sarah Chen (•• 4521) · Mashreq ATM, JLT",           amount: -750.00,  reference: "ATM-DXB-09024" },
  { id: "se-atm5", date: "2024-09-11", type: "atm_withdrawal", description: "ATM cash withdrawal — David Kim (•• 9911) · FAB ATM, Yas Mall",           amount: -1500.00, reference: "ATM-AUH-09011" },
];

/**
 * Append a runtime statement entry (e.g. when a service fee is paid using the
 * Peko corporate card and should be reflected on the Account Statement).
 */
export const addStatementExtra = (entry: StatementExtra) => {
  statementExtras.push(entry);
};

// ---------------------------------------------------------------------------
// Service fees — billed outside the Account Statement, settled via payment
// gateway. Includes ATM service fees, monthly platform fees and card issuance
// fees. International transaction (FX) fees are NOT billed here — they are
// deducted together with the underlying card transaction at the time of spend.
export type ServiceFeeType = "atm" | "platform" | "card_issuance";
export type ServiceFeeStatus = "outstanding" | "paid";
export type ServiceFeePaymentMethod = "peko_card" | "external_gateway";

export interface ServiceFee {
  id: string;
  date: string;          // when the fee was incurred
  type: ServiceFeeType;
  description: string;
  amount: number;        // positive number (amount due)
  reference: string;
  status: ServiceFeeStatus;
  paidAt?: string;
  paidMethod?: ServiceFeePaymentMethod;
  /** When paid with the Peko card, the cardId used. */
  paidCardId?: string;
  /** When paid externally, last 4 digits of the external card entered. */
  externalLast4?: string;
}

export const serviceFees: ServiceFee[] = [
  // Outstanding — current cycle
  { id: "sf-atm-10019", date: "2024-10-19", type: "atm",           description: "ATM withdrawal fee — Sarah Chen (•• 4521)",   amount: 10.00, reference: "ATM-FEE-10019", status: "outstanding" },
  { id: "sf-atm-10012", date: "2024-10-12", type: "atm",           description: "ATM withdrawal fee — Ahmed Hassan (•• 7788)", amount: 10.00, reference: "ATM-FEE-10012", status: "outstanding" },
  { id: "sf-atm-10003", date: "2024-10-03", type: "atm",           description: "ATM withdrawal fee — Priya Patel (•• 3344)",  amount: 10.00, reference: "ATM-FEE-10003", status: "outstanding" },
  { id: "sf-plt-oct",   date: "2024-10-05", type: "platform",      description: "Monthly platform fee — October 2024",         amount: 49.00, reference: "FEE-PLT-OCT",   status: "outstanding" },
  { id: "sf-ci-oct",    date: "2024-10-08", type: "card_issuance", description: "Card issuance fee — David Kim (•• 9911)",     amount: 25.00, reference: "FEE-CI-9911",   status: "outstanding" },

  // Historical — already paid
  { id: "sf-atm-09024", date: "2024-09-24", type: "atm",           description: "ATM withdrawal fee — Sarah Chen (•• 4521)",   amount: 10.00, reference: "ATM-FEE-09024", status: "paid", paidAt: "2024-09-30", paidMethod: "external_gateway", externalLast4: "4242" },
  { id: "sf-atm-09011", date: "2024-09-11", type: "atm",           description: "ATM withdrawal fee — David Kim (•• 9911)",    amount: 10.00, reference: "ATM-FEE-09011", status: "paid", paidAt: "2024-09-30", paidMethod: "peko_card",        paidCardId: "c1" },
  { id: "sf-plt-sep",   date: "2024-09-04", type: "platform",      description: "Monthly platform fee — September 2024",       amount: 49.00, reference: "FEE-PLT-SEP",   status: "paid", paidAt: "2024-09-10", paidMethod: "external_gateway", externalLast4: "4242" },
  { id: "sf-ci-sep",    date: "2024-09-02", type: "card_issuance", description: "Card issuance fee — Priya Patel (•• 3344)",   amount: 25.00, reference: "FEE-CI-3344",   status: "paid", paidAt: "2024-09-05", paidMethod: "external_gateway", externalLast4: "8810" },
];

// ---------------------------------------------------------------------------
// Fee catalog — the centralized price list. Each entry binds a billable
// service to a trigger event that auto-generates an outstanding bill.
export type FeeTriggerEvent =
  | "atm.withdrawal.completed"
  | "card.issued"
  | "card.replaced"
  | "billing.month.rolled"
  | "admin.charge.created";

export interface FeeCatalogItem {
  code: string;
  type: ServiceFeeType;
  name: string;
  description: string;
  price: number;
  currency: string;
  taxCode: string;
  trigger: FeeTriggerEvent;
  triggerLabel: string;
  recurrence: "per-event" | "monthly";
  freeQuotaPerMonth?: number;
  active: boolean;
}

export const feeCatalog: FeeCatalogItem[] = [
  {
    code: "FEE.ATM.WDR",
    type: "atm",
    name: "ATM withdrawal",
    description: "Charged each time a cardholder withdraws cash at any ATM.",
    price: 10,
    currency: "AED",
    taxCode: "VAT-5",
    trigger: "atm.withdrawal.completed",
    triggerLabel: "On every ATM withdrawal",
    recurrence: "per-event",
    freeQuotaPerMonth: 0,
    active: true,
  },
  {
    code: "FEE.CARD.ISSUE",
    type: "card_issuance",
    name: "Card issuance",
    description: "One-off fee for issuing a new physical or virtual corporate card.",
    price: 25,
    currency: "AED",
    taxCode: "VAT-5",
    trigger: "card.issued",
    triggerLabel: "On new card issued",
    recurrence: "per-event",
    active: true,
  },
  {
    code: "FEE.CARD.REPLACE",
    type: "card_issuance",
    name: "Card replacement",
    description: "Replacement fee for lost, stolen, or damaged cards.",
    price: 40,
    currency: "AED",
    taxCode: "VAT-5",
    trigger: "card.replaced",
    triggerLabel: "On card replacement request",
    recurrence: "per-event",
    active: true,
  },
  {
    code: "FEE.PLATFORM.MONTHLY",
    type: "platform",
    name: "Monthly platform fee",
    description: "Recurring subscription for the Peko corporate platform.",
    price: 49,
    currency: "AED",
    taxCode: "VAT-5",
    trigger: "billing.month.rolled",
    triggerLabel: "1st of every month",
    recurrence: "monthly",
    active: true,
  },
];

export const feeCatalogByCode = (code: string) =>
  feeCatalog.find((f) => f.code === code);

/**
 * Trigger handler — fires an event and, if the catalog has a matching active
 * fee, generates a new outstanding ServiceFee bill. Returns the new bill (or
 * null if the event has no billable fee).
 */
export const triggerFeeEvent = (
  event: FeeTriggerEvent,
  context: { subject?: string; reference?: string } = {},
): ServiceFee | null => {
  const item = feeCatalog.find((f) => f.trigger === event && f.active);
  if (!item) return null;
  const today = new Date().toISOString().slice(0, 10);
  const id = `sf-${item.code.toLowerCase().replace(/\./g, "-")}-${Date.now().toString().slice(-6)}`;
  const fee: ServiceFee = {
    id,
    date: today,
    type: item.type,
    description: context.subject
      ? `${item.name} — ${context.subject}`
      : item.name,
    amount: item.price,
    reference: context.reference ?? `${item.code}-${Date.now().toString().slice(-6)}`,
    status: "outstanding",
  };
  serviceFees.unshift(fee);
  return fee;
};

export const memberById = (id: string) => members.find((m) => m.id === id);
export const cardById = (id: string) => cards.find((c) => c.id === id);

/**
 * Sum of spending limits across all active cards. Limits ARE reserved against
 * the wallet — the sum of allocations cannot exceed the wallet balance.
 */
export const totalAllocatedLimits = (excludeId?: string): number =>
  cards
    .filter((c) => c.id !== excludeId && c.status !== "terminated")
    .reduce((s, c) => s + c.spendLimit, 0);

/** Total spent across all active cards. */
export const totalSpentAcrossCards = (excludeId?: string): number =>
  cards
    .filter((c) => c.id !== excludeId && c.status !== "terminated")
    .reduce((s, c) => s + c.spent, 0);

/**
 * Funds remaining in the wallet after deducting actual spend.
 */
export const walletAvailable = (excludeId?: string): number =>
  Math.max(0, walletBalance - totalSpentAcrossCards(excludeId));

/**
 * Unallocated wallet funds — wallet balance minus the sum of spending limits
 * already assigned to active cards. New allocations must fit within this.
 */
export const walletUnallocated = (excludeId?: string): number =>
  Math.max(0, walletBalance - totalAllocatedLimits(excludeId));

/**
 * Whether the wallet has ever been funded. Card issuance is gated on this:
 * the first top-up must be completed before any card can be issued. After
 * that, cards can be issued freely regardless of current wallet balance.
 */
export const hasCompletedFirstTopUp = (): boolean =>
  walletTopUps.some((t) => t.status === "completed");

/** Distinct countries appearing across transactions, reimbursements, and invoices. */
export const allCountries = (): string[] => {
  const set = new Set<string>();
  transactions.forEach((t) => t.country && set.add(t.country));
  reimbursements.forEach((r) => r.country && set.add(r.country));
  invoices.forEach((i) => i.country && set.add(i.country));
  return Array.from(set).sort();
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(n);

/** Format an amount in any ISO currency code, prefixed with the code (e.g. "USD 39.20"). */
export const formatMoney = (n: number, currency: string = "AED") => {
  const formatted = new Intl.NumberFormat("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `${currency} ${formatted}`;
};

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtCycleDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "2-digit" });
