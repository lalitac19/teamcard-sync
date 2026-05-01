// Centralized mock data for the corporate card portal

export type CardType = "virtual" | "physical" | "single-use";
export type CardStatus = "active" | "frozen" | "expired";

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
  { key: "manage_members", label: "Invite & remove members", group: "Members" },
  { key: "assign_roles", label: "Assign roles to members", group: "Members" },
  { key: "manage_teams", label: "Create & edit teams", group: "Members" },
  { key: "issue_cards", label: "Issue new cards", group: "Cards" },
  { key: "freeze_cards", label: "Freeze / unfreeze cards", group: "Cards" },
  { key: "set_card_limits", label: "Set card spend limits", group: "Cards" },
  { key: "approve_transactions", label: "Approve card transactions", group: "Approvals" },
  { key: "approve_oop", label: "Approve out-of-pocket expenses", group: "Approvals" },
  { key: "approve_invoices", label: "Approve vendor invoices", group: "Approvals" },
  { key: "approve_card_requests", label: "Approve card issuance requests", group: "Approvals" },
  { key: "approve_topup_requests", label: "Approve card top-up requests", group: "Approvals" },
  { key: "view_wallet", label: "View wallet & balances", group: "Wallet" },
  { key: "topup_wallet", label: "Top up wallet", group: "Wallet" },
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
    description: "Standard cardholder, can submit expenses & invoices.",
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
        ["view_dashboard", "approve_oop", "approve_invoices", "set_card_limits"].includes(p.key),
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
  /**
   * Overall spending limit for the period.
   * For the primary card: the card's own per-period spend cap (the unallocated portion is also spendable here).
   * For supplementary cards: the limit allocated from the primary card balance.
   */
  spendLimit: number;
  /** Maximum amount allowed for a single transaction on this card. */
  txnLimit?: number;
  spent: number;
  /**
   * Primary card only: total funds topped up to the workspace.
   * Supplementary cards do not hold a balance — they spend against their allocated limit.
   */
  balance: number;
  limitPeriod: "daily" | "weekly" | "monthly" | "per-transaction";
  merchantCategories?: string[];
  createdAt: string;
  /** Marks the workspace's single primary card. All other cards are supplementary. */
  isPrimary?: boolean;
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
  limitPeriod: "daily" | "weekly" | "monthly" | "per-transaction";
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
  { code: "1010", name: "Cash — Corporate Wallet", type: "Asset" },
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
  // Primary card — its `balance` is the total funds topped up to the workspace.
  { id: "c1", memberId: "m1", type: "physical", status: "active", last4: "4821", spendLimit: 25000, txnLimit: 5000, spent: 8420, balance: 60000, limitPeriod: "monthly", createdAt: "2024-01-15", isPrimary: true },
  // Supplementary cards — `spendLimit` is the limit allocated from the primary card.
  { id: "c2", memberId: "m2", type: "physical", status: "active", last4: "9012", spendLimit: 15000, txnLimit: 2500, spent: 11200, balance: 0, limitPeriod: "monthly", createdAt: "2024-02-05" },
  { id: "c3", memberId: "m2", type: "virtual", status: "active", last4: "3344", spendLimit: 5000, txnLimit: 1000, spent: 1280, balance: 0, limitPeriod: "monthly", merchantCategories: ["Software"], createdAt: "2024-04-10" },
  { id: "c4", memberId: "m3", type: "virtual", status: "active", last4: "5566", spendLimit: 8000, txnLimit: 2000, spent: 6450, balance: 0, limitPeriod: "monthly", merchantCategories: ["Marketing"], createdAt: "2024-02-20" },
  { id: "c5", memberId: "m4", type: "virtual", status: "active", last4: "7788", spendLimit: 3000, txnLimit: 800, spent: 980, balance: 0, limitPeriod: "monthly", merchantCategories: ["Software"], createdAt: "2024-03-08" },
  { id: "c6", memberId: "m5", type: "physical", status: "frozen", last4: "1199", spendLimit: 1500, txnLimit: 500, spent: 0, balance: 0, limitPeriod: "monthly", createdAt: "2024-03-25" },
  { id: "c7", memberId: "m3", type: "single-use", status: "active", last4: "2255", spendLimit: 1200, txnLimit: 1200, spent: 0, balance: 0, limitPeriod: "per-transaction", createdAt: "2024-10-20" },
];

export const transactions: Transaction[] = [
  { id: "t1", date: "2024-10-22", merchant: "United Airlines", category: "Travel", amount: 1240.50, fee: 18.60, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "United Airlines Inc.", country: "United States" },
  { id: "t2", date: "2024-10-22", merchant: "Figma Inc.", category: "Software", amount: 144.00, fee: 2.16, cardId: "c3", memberId: "m2", status: "posted", receipt: true, vendor: "Figma Inc.", country: "United States" },
  { id: "t3", date: "2024-10-21", merchant: "WeWork", category: "Office", amount: 890.00, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "WeWork Companies", country: "United Kingdom" },
  { id: "t4", date: "2024-10-21", merchant: "Google Ads", category: "Marketing", amount: 2400.00, fee: 36.00, cardId: "c4", memberId: "m3", status: "posted", receipt: true, vendor: "Google LLC", country: "Ireland" },
  { id: "t5", date: "2024-10-20", merchant: "Uber", category: "Travel", amount: 38.20, cardId: "c2", memberId: "m2", status: "posted", receipt: false, vendor: "Uber Technologies", country: "United States" },
  { id: "t6", date: "2024-10-20", merchant: "Sweetgreen", category: "Meals", amount: 64.80, cardId: "c2", memberId: "m2", status: "posted", receipt: true, vendor: "Sweetgreen Inc.", country: "United States" },
  { id: "t7", date: "2024-10-19", merchant: "AWS", category: "Software", amount: 1820.00, fee: 27.30, cardId: "c5", memberId: "m4", status: "posted", receipt: true, vendor: "Amazon Web Services", country: "United States" },
  { id: "t8", date: "2024-10-19", merchant: "LinkedIn Ads", category: "Marketing", amount: 760.00, fee: 11.40, cardId: "c4", memberId: "m3", status: "posted", receipt: true, vendor: "LinkedIn Corp.", country: "United States" },
  { id: "t9", date: "2024-10-18", merchant: "Hilton Hotels", category: "Travel", amount: 412.00, fee: 6.18, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "Hilton Worldwide", country: "Germany" },
  { id: "t10", date: "2024-10-18", merchant: "Notion Labs", category: "Software", amount: 96.00, fee: 1.44, cardId: "c3", memberId: "m2", status: "posted", receipt: true, vendor: "Notion Labs Inc.", country: "United States" },
  { id: "t11", date: "2024-10-17", merchant: "Lyft", category: "Travel", amount: 24.50, cardId: "c2", memberId: "m2", status: "pending", receipt: false, vendor: "Lyft Inc.", country: "United States" },
  { id: "t12", date: "2024-10-17", merchant: "Staples", category: "Office", amount: 156.30, fee: 2.34, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "Staples Inc.", country: "Canada" },
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
  { id: "ta1", txnId: "t4", date: "2024-10-21", memberId: "m3", cardId: "c4", merchant: "Google Ads", amount: 2400.00, policyReason: "Exceeds $2,000 single-txn policy", status: "pending" },
  { id: "ta2", txnId: "t7", date: "2024-10-19", memberId: "m4", cardId: "c5", merchant: "AWS", amount: 1820.00, policyReason: "Cardholder requires manager review", status: "pending" },
  { id: "ta3", txnId: "t1", date: "2024-10-22", memberId: "m1", cardId: "c1", merchant: "United Airlines", amount: 1240.50, policyReason: "Travel category > $1,000", status: "approved" },
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
  { id: "tr3", date: "2024-10-10", memberId: "m4", cardId: "c5", currentBalance: 1020, requestedAmount: 800, reason: "Top up for AWS usage", status: "approved", fundingStatus: "funded" },
];

export const walletTransfers: WalletTransfer[] = [
  { id: "wt1", date: "2024-10-22", direction: "wallet_to_card", amount: 2000, toCardId: "c1", requestedBy: "m1", reason: "Top up for travel week", status: "pending" },
  { id: "wt2", date: "2024-10-21", direction: "card_to_wallet", amount: 500, fromCardId: "c5", requestedBy: "m1", reason: "Reallocate unused SaaS budget", status: "pending" },
  { id: "wt3", date: "2024-10-20", direction: "card_to_wallet", amount: 1500, fromCardId: "c6", requestedBy: "m1", reason: "Card frozen — return funds", status: "approved" },
  { id: "wt4", date: "2024-10-18", direction: "wallet_to_card", amount: 3000, toCardId: "c4", requestedBy: "m1", reason: "Q4 ad spend", status: "approved" },
];

export const walletBalance = 47820.50;
export const walletReserved = 12400.00;

// Statement-only entries (refunds, cashback, fees). Internal wallet<->card transfers are excluded by design.
export type StatementExtraType = "refund" | "cashback" | "fee";
export interface StatementExtra {
  id: string;
  date: string;
  type: StatementExtraType;
  description: string;
  amount: number; // positive = money in, negative = money out
  reference?: string;
}

export const statementExtras: StatementExtra[] = [
  { id: "se1", date: "2024-10-23", type: "refund", description: "United Airlines — itinerary change refund", amount: 320.00, reference: "RFND-UA-8821" },
  { id: "se2", date: "2024-10-15", type: "cashback", description: "Monthly card spend cashback (1%)", amount: 184.20, reference: "CB-OCT-24" },
  { id: "se3", date: "2024-10-10", type: "fee", description: "International transaction fee", amount: -12.40, reference: "FEE-FX-1010" },
  { id: "se4", date: "2024-10-05", type: "fee", description: "Monthly platform fee", amount: -49.00, reference: "FEE-PLT-OCT" },
  { id: "se5", date: "2024-09-22", type: "refund", description: "Hilton Hotels — duplicate charge refund", amount: 412.00, reference: "RFND-HIL-7711" },
  { id: "se6", date: "2024-09-15", type: "cashback", description: "Monthly card spend cashback (1%)", amount: 156.80, reference: "CB-SEP-24" },
  { id: "se7", date: "2024-09-04", type: "fee", description: "Monthly platform fee", amount: -49.00, reference: "FEE-PLT-SEP" },
];

export const memberById = (id: string) => members.find((m) => m.id === id);
export const cardById = (id: string) => cards.find((c) => c.id === id);

/** The single primary card for the workspace. */
export const primaryCard = (): Card => cards.find((c) => c.isPrimary) ?? cards[0];

/** All non-primary (supplementary) cards. */
export const supplementaryCards = (): Card[] => cards.filter((c) => !c.isPrimary);

/** Sum of limits allocated to supplementary cards (frozen/expired excluded only if they shouldn't reserve funds — kept inclusive here). */
export const totalAllocatedLimits = (excludeId?: string): number =>
  supplementaryCards()
    .filter((c) => c.id !== excludeId)
    .reduce((s, c) => s + c.spendLimit, 0);

/**
 * Funds on the primary card that are NOT yet allocated to supplementary cards.
 * This is what's available to issue new supplementary cards (or raise existing limits)
 * AND what the primary card itself can still spend on.
 */
export const primaryUnallocated = (excludeId?: string): number =>
  Math.max(0, primaryCard().balance - totalAllocatedLimits(excludeId));

/** Distinct countries appearing across transactions, reimbursements, and invoices. */
export const allCountries = (): string[] => {
  const set = new Set<string>();
  transactions.forEach((t) => t.country && set.add(t.country));
  reimbursements.forEach((r) => r.country && set.add(r.country));
  invoices.forEach((i) => i.country && set.add(i.country));
  return Array.from(set).sort();
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
