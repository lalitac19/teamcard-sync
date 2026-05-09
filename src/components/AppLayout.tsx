import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserSwitcher } from "./UserSwitcher";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="relative ml-2 hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions, members, cards…"
                className="h-9 w-80 border-border bg-secondary/50 pl-9 text-sm"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <UserSwitcher />
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 md:px-8 md:py-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
