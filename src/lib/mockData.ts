// Centralized mock data for the corporate card portal

export type CardType = "virtual" | "physical" | "single-use";
export type CardStatus = "active" | "frozen" | "expired";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  department: string;
  avatar: string;
  kycStatus: "verified" | "pending" | "not_started";
  joinedAt: string;
}

export interface Card {
  id: string;
  memberId: string;
  type: CardType;
  status: CardStatus;
  last4: string;
  spendLimit: number;
  spent: number;
  limitPeriod: "daily" | "weekly" | "monthly" | "per-transaction";
  merchantCategories?: string[];
  createdAt: string;
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
  exported?: boolean;
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

export interface LimitIncreaseRequest {
  id: string;
  date: string;
  memberId: string;
  cardId: string;
  currentLimit: number;
  requestedLimit: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
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
  { code: "1010", name: "Cash — Corporate Wallet", type: "Asset" },
  { code: "1020", name: "Bank Account — Operating", type: "Asset" },
];

export const vatRates = [
  { rate: 0, label: "0% — Zero rated" },
  { rate: 5, label: "5% — Reduced" },
  { rate: 10, label: "10% — Standard (intl.)" },
  { rate: 20, label: "20% — Standard" },
];

export const members: Member[] = [
  { id: "m1", name: "Sarah Chen", email: "sarah@northwind.co", role: "admin", department: "Finance", avatar: "SC", kycStatus: "verified", joinedAt: "2024-01-12" },
  { id: "m2", name: "Marcus Patel", email: "marcus@northwind.co", role: "manager", department: "Sales", avatar: "MP", kycStatus: "verified", joinedAt: "2024-02-03" },
  { id: "m3", name: "Elena Rodriguez", email: "elena@northwind.co", role: "employee", department: "Marketing", avatar: "ER", kycStatus: "verified", joinedAt: "2024-02-18" },
  { id: "m4", name: "James O'Connor", email: "james@northwind.co", role: "employee", department: "Engineering", avatar: "JO", kycStatus: "verified", joinedAt: "2024-03-04" },
  { id: "m5", name: "Aiko Tanaka", email: "aiko@northwind.co", role: "manager", department: "Operations", avatar: "AT", kycStatus: "verified", joinedAt: "2024-03-22" },
  { id: "m6", name: "David Kim", email: "david@northwind.co", role: "employee", department: "Engineering", avatar: "DK", kycStatus: "pending", joinedAt: "2024-09-15" },
  { id: "m7", name: "Priya Shah", email: "priya@northwind.co", role: "employee", department: "Sales", avatar: "PS", kycStatus: "not_started", joinedAt: "2024-10-02" },
];

export const cards: Card[] = [
  { id: "c1", memberId: "m1", type: "physical", status: "active", last4: "4821", spendLimit: 25000, spent: 8420, limitPeriod: "monthly", createdAt: "2024-01-15" },
  { id: "c2", memberId: "m2", type: "physical", status: "active", last4: "9012", spendLimit: 15000, spent: 11200, limitPeriod: "monthly", createdAt: "2024-02-05" },
  { id: "c3", memberId: "m2", type: "virtual", status: "active", last4: "3344", spendLimit: 5000, spent: 1280, limitPeriod: "monthly", merchantCategories: ["Software"], createdAt: "2024-04-10" },
  { id: "c4", memberId: "m3", type: "virtual", status: "active", last4: "5566", spendLimit: 8000, spent: 6450, limitPeriod: "monthly", merchantCategories: ["Marketing"], createdAt: "2024-02-20" },
  { id: "c5", memberId: "m4", type: "virtual", status: "active", last4: "7788", spendLimit: 3000, spent: 980, limitPeriod: "monthly", merchantCategories: ["Software"], createdAt: "2024-03-08" },
  { id: "c6", memberId: "m5", type: "physical", status: "frozen", last4: "1199", spendLimit: 10000, spent: 0, limitPeriod: "monthly", createdAt: "2024-03-25" },
  { id: "c7", memberId: "m3", type: "single-use", status: "active", last4: "2255", spendLimit: 1200, spent: 0, limitPeriod: "per-transaction", createdAt: "2024-10-20" },
];

export const transactions: Transaction[] = [
  { id: "t1", date: "2024-10-22", merchant: "United Airlines", category: "Travel", amount: 1240.50, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "United Airlines Inc." },
  { id: "t2", date: "2024-10-22", merchant: "Figma Inc.", category: "Software", amount: 144.00, cardId: "c3", memberId: "m2", status: "posted", receipt: true, vendor: "Figma Inc." },
  { id: "t3", date: "2024-10-21", merchant: "WeWork", category: "Office", amount: 890.00, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "WeWork Companies" },
  { id: "t4", date: "2024-10-21", merchant: "Google Ads", category: "Marketing", amount: 2400.00, cardId: "c4", memberId: "m3", status: "posted", receipt: true, vendor: "Google LLC" },
  { id: "t5", date: "2024-10-20", merchant: "Uber", category: "Travel", amount: 38.20, cardId: "c2", memberId: "m2", status: "posted", receipt: false, vendor: "Uber Technologies" },
  { id: "t6", date: "2024-10-20", merchant: "Sweetgreen", category: "Meals", amount: 64.80, cardId: "c2", memberId: "m2", status: "posted", receipt: true, vendor: "Sweetgreen Inc." },
  { id: "t7", date: "2024-10-19", merchant: "AWS", category: "Software", amount: 1820.00, cardId: "c5", memberId: "m4", status: "posted", receipt: true, vendor: "Amazon Web Services" },
  { id: "t8", date: "2024-10-19", merchant: "LinkedIn Ads", category: "Marketing", amount: 760.00, cardId: "c4", memberId: "m3", status: "posted", receipt: true, vendor: "LinkedIn Corp." },
  { id: "t9", date: "2024-10-18", merchant: "Hilton Hotels", category: "Travel", amount: 412.00, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "Hilton Worldwide" },
  { id: "t10", date: "2024-10-18", merchant: "Notion Labs", category: "Software", amount: 96.00, cardId: "c3", memberId: "m2", status: "posted", receipt: true, vendor: "Notion Labs Inc." },
  { id: "t11", date: "2024-10-17", merchant: "Lyft", category: "Travel", amount: 24.50, cardId: "c2", memberId: "m2", status: "pending", receipt: false, vendor: "Lyft Inc." },
  { id: "t12", date: "2024-10-17", merchant: "Staples", category: "Office", amount: 156.30, cardId: "c1", memberId: "m1", status: "posted", receipt: true, vendor: "Staples Inc." },
];

export const reimbursements: Reimbursement[] = [
  { id: "r1", date: "2024-10-21", memberId: "m4", merchant: "Local Taxi", category: "Travel", amount: 42.00, status: "approved", receipt: true, description: "Client meeting transport" },
  { id: "r2", date: "2024-10-20", memberId: "m3", merchant: "Print Shop", category: "Office", amount: 88.50, status: "approved", receipt: true, description: "Conference materials" },
  { id: "r3", date: "2024-10-19", memberId: "m5", merchant: "Restaurant Daniel", category: "Meals", amount: 215.00, status: "approved", receipt: true, description: "Client dinner" },
  { id: "r4", date: "2024-10-22", memberId: "m4", merchant: "Coffee Bean", category: "Meals", amount: 18.40, status: "pending", receipt: true, description: "Team coffee" },
  { id: "r5", date: "2024-10-18", memberId: "m2", merchant: "Parking Garage", category: "Travel", amount: 35.00, status: "approved", receipt: true, description: "Off-site meeting parking" },
];

export const invoices: Invoice[] = [
  { id: "i1", invoiceNumber: "INV-2024-1042", date: "2024-10-15", dueDate: "2024-11-14", vendor: "Acme Legal LLP", amount: 4500.00, uploadedBy: "m1", status: "approved" },
  { id: "i2", invoiceNumber: "INV-90234", date: "2024-10-12", dueDate: "2024-11-11", vendor: "BrightDesign Studio", amount: 6800.00, uploadedBy: "m3", status: "approved" },
  { id: "i3", invoiceNumber: "2024-1098", date: "2024-10-18", dueDate: "2024-11-17", vendor: "Cloudflare Enterprise", amount: 2400.00, uploadedBy: "m4", status: "approved" },
  { id: "i4", invoiceNumber: "INV-7711", date: "2024-10-22", dueDate: "2024-11-21", vendor: "FreshClean Office Co.", amount: 320.00, uploadedBy: "m5", status: "pending" },
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

export const limitRequests: LimitIncreaseRequest[] = [
  { id: "lr1", date: "2024-10-22", memberId: "m2", cardId: "c2", currentLimit: 15000, requestedLimit: 20000, reason: "End of quarter client entertainment", status: "pending" },
  { id: "lr2", date: "2024-10-20", memberId: "m3", cardId: "c4", currentLimit: 8000, requestedLimit: 12000, reason: "Holiday ad campaign", status: "pending" },
  { id: "lr3", date: "2024-10-10", memberId: "m4", cardId: "c5", currentLimit: 3000, requestedLimit: 4000, reason: "Increased AWS usage", status: "approved" },
];

export const walletBalance = 47820.50;
export const walletReserved = 12400.00;

export const memberById = (id: string) => members.find((m) => m.id === id);
export const cardById = (id: string) => cards.find((c) => c.id === id);

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
