import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Receipt,
  Wallet,
  FileSpreadsheet,
  BookOpen,
  Settings,
  Zap,
  HandCoins,
  FileText,
  ClipboardCheck,
  PlusCircle,
  Search,
  UserCog,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSwitcher } from "./UserSwitcher";
import { NotificationsPopover } from "./NotificationsPopover";
import { useCurrentUser } from "@/lib/currentUser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = { title: string; url: string; icon: LucideIcon };

const adminItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "People", url: "/members", icon: Users },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Accounting", url: "__accounting__", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminAccountingItems: NavItem[] = [
  { title: "Account Statement", url: "/statement", icon: BookOpen },
  { title: "Accounting Export", url: "/accounting", icon: FileSpreadsheet },
];

const adminMoreItems: NavItem[] = [
  { title: "Approvals", url: "/approvals", icon: ClipboardCheck },
  { title: "Reimbursements", url: "/reimbursements", icon: HandCoins },
  { title: "Vendor Invoices", url: "/invoices", icon: FileText },
];

const memberItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Cards", url: "/me/cards", icon: CreditCard },
  { title: "My Transactions", url: "/me/transactions", icon: Receipt },
  { title: "Reimbursements", url: "/me/reimbursements", icon: HandCoins },
  { title: "Vendor Invoices", url: "/me/invoices", icon: FileText },
  { title: "Card Requests", url: "/me/requests", icon: PlusCircle },
  { title: "My Profile", url: "/me/profile", icon: UserCog },
];

export function TopNav() {
  const { isMember } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const items = isMember ? memberItems : adminItems;
  const moreActive = !isMember && adminMoreItems.some((i) => location.pathname.startsWith(i.url));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="hidden text-sm font-semibold sm:inline">Peko</span>
        </div>

        <nav className="ml-2 flex flex-1 items-center gap-1 overflow-x-auto">
          <TooltipProvider delayDuration={150}>
            {items.map((item) => {
              const Icon = item.icon;
              const node = (
                <Tooltip key={item.url}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/" || item.url === "/statement"}
                      className={({ isActive }) =>
                        `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors ${
                          isActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{item.title}</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{item.title}</TooltipContent>
                </Tooltip>
              );
              if (!isMember && item.url === "/transactions") {
                return (
                  <span key="txn-more" className="contents">
                    {node}
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors ${
                                moreActive
                                  ? "bg-secondary text-foreground"
                                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                              }`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">More</TooltipContent>
                      </Tooltip>
                      <DropdownMenuContent align="start">
                        {adminMoreItems.map((m) => {
                          const MIcon = m.icon;
                          return (
                            <DropdownMenuItem key={m.url} onClick={() => navigate(m.url)}>
                              <MIcon className="mr-2 h-4 w-4" />
                              {m.title}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </span>
                );
              }
              return node;
            })}
          </TooltipProvider>
        </nav>

        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="h-9 w-64 border-border bg-secondary/50 pl-9 text-sm"
          />
        </div>

        <NotificationsPopover />
        <UserSwitcher />
      </div>
    </header>
  );
}
