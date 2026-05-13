import { NavLink, useLocation } from "react-router-dom";
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
  Sparkles,
  PlusCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCurrentUser } from "@/lib/currentUser";

const adminMain = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "People", url: "/members", icon: Users },
  { title: "Transactions", url: "/transactions", icon: Receipt },
];

const adminApprovals = [
  { title: "Approval Requests", url: "/approvals", icon: ClipboardCheck },
  { title: "Out-of-Pocket", url: "/reimbursements", icon: HandCoins },
  { title: "Vendor Invoices", url: "/invoices", icon: FileText },
];

const adminAccounting = [
  { title: "Account Statement", url: "/statement", icon: BookOpen },
  { title: "Accounting Export", url: "/accounting", icon: FileSpreadsheet },
];

const memberMain = [
  { title: "My Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Cards", url: "/me/cards", icon: CreditCard },
  { title: "My Transactions", url: "/me/transactions", icon: Receipt },
];

const memberSubmit = [
  { title: "Out-of-Pocket", url: "/me/reimbursements", icon: HandCoins },
  { title: "Vendor Invoices", url: "/me/invoices", icon: FileText },
  { title: "Card Requests", url: "/me/requests", icon: PlusCircle },
];

const bottomItems = [
  { title: "Plans & Billing", url: "/plans", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: Settings },
];

const roleLabel: Record<string, string> = {
  admin: "Admin",
  accountant: "Accountant",
  external_auditor: "Auditor",
  team_member: "Member",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isMember } = useCurrentUser();

  const isActive = (url: string) =>
    url === "/" || url === "/statement" ? location.pathname === url : location.pathname.startsWith(url);

  const linkCls = (active: boolean) =>
    active
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground";

  const renderGroup = (label: string, items: typeof adminMain) => (
    <SidebarGroup className="mt-4 first:mt-0">
      {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end={item.url === "/"} className={linkCls(isActive(item.url))}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">Peko</span>
              <span className="text-xs text-sidebar-foreground/70">
                {isMember ? "Member Portal" : "Commercial Corporate Card"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {isMember ? (
          <>
            {renderGroup("Main", memberMain)}
            {renderGroup("Submit", memberSubmit)}
          </>
        ) : (
          <>
            {renderGroup("Main", adminMain)}
            {renderGroup("Approvals", adminApprovals)}
            {renderGroup("Accounting", adminAccounting)}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={linkCls(isActive(item.url))}>
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {!collapsed && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-sidebar-accent px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {user.avatar}
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-medium text-sidebar-accent-foreground">{user.name}</span>
              <span className="text-sidebar-foreground/70">{roleLabel[user.role] ?? user.role}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
