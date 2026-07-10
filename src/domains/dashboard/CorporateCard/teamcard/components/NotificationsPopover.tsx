import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/popover";
import { ScrollArea } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/scroll-area";
import { Separator } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/separator";
import { useCurrentUser } from "@src/domains/dashboard/CorporateCard/teamcard/lib/currentUser";
import { getNotificationsForUser, type AppNotification } from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockNotifications";
import { cn } from "@src/domains/dashboard/CorporateCard/teamcard/lib/utils";

export function NotificationsPopover() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const initial = useMemo(() => getNotificationsForUser(user), [user]);
  const [items, setItems] = useState<AppNotification[]>(initial);
  const [open, setOpen] = useState(false);

  const unreadCount = items.filter((i) => i.unread).length;

  const markAllRead = () => setItems((prev) => prev.map((i) => ({ ...i, unread: false })));

  const handleClick = (n: AppNotification) => {
    setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, unread: false } : i)));
    if (n.href) {
      setOpen(false);
      navigate(n.href);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            Mark all as read
          </button>
        </div>
        <Separator />
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">You're all caught up.</div>
        ) : (
          <ScrollArea className="max-h-[380px]">
            <ul>
              {items.map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60",
                        n.unread && "bg-secondary/30",
                      )}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-sm font-medium">{n.title}</div>
                          {n.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">{n.description}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{n.time}</div>
                      </div>
                    </button>
                    <Separator />
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
        <div className="px-4 py-2 text-center">
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
