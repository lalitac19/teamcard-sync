import {
  ClipboardCheck,
  Wallet,
  CreditCard,
  FileSpreadsheet,
  ShieldCheck,
  TrendingUp,
  Receipt,
  LucideIcon,
} from "lucide-react";
import type { Member } from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: LucideIcon;
  href?: string;
}

const adminNotifications: AppNotification[] = [
  {
    id: "a1",
    title: "3 new approval requests",
    description: "Card limit increases awaiting your review.",
    time: "2m ago",
    unread: true,
    icon: ClipboardCheck,
    href: "/approvals",
  },
  {
    id: "a2",
    title: "Available Credit Limit low",
    description: "Available Credit Limit below AED 10,000 — consider funding the account.",
    time: "1h ago",
    unread: true,
    icon: Wallet,
    href: "/wallet",
  },
  {
    id: "a3",
    title: "New card issuance request",
    description: "Sara Ahmed requested a virtual card.",
    time: "3h ago",
    unread: true,
    icon: CreditCard,
    href: "/approvals",
  },
  {
    id: "a5",
    title: "Accounting export ready",
    description: "October transactions are ready to download.",
    time: "2 days ago",
    unread: false,
    icon: FileSpreadsheet,
    href: "/accounting",
  },
];

const memberNotifications: AppNotification[] = [
  {
    id: "m1",
    title: "Card request approved",
    description: "Your virtual card is now active.",
    time: "10m ago",
    unread: true,
    icon: CreditCard,
    href: "/me/cards",
  },
  {
    id: "m3",
    title: "Missing receipt",
    description: "Attach a receipt for your AED 145 purchase at Carrefour.",
    time: "5h ago",
    unread: true,
    icon: Receipt,
    href: "/me/transactions",
  },
  {
    id: "m4",
    title: "Card details revealed",
    description: "Full card details were shown after OTP verification.",
    time: "Yesterday",
    unread: false,
    icon: ShieldCheck,
    href: "/me/cards",
  },
  {
    id: "m5",
    title: "Limit-increase request",
    description: "Your request for AED 5,000 additional limit is pending review.",
    time: "2 days ago",
    unread: false,
    icon: TrendingUp,
    href: "/me/requests",
  },
];

export function getNotificationsForUser(user: Member): AppNotification[] {
  return user.role === "team_member" ? memberNotifications : adminNotifications;
}
