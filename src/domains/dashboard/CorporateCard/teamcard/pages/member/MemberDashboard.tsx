import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@src/domains/dashboard/CorporateCard/teamcard/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/card";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Badge } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/badge";
import { Progress } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/progress";
import {
  CreditCard as CardIcon,
  Receipt,
  FileText,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";
import { CardVisual } from "@src/domains/dashboard/CorporateCard/teamcard/components/CardVisual";
import {
  cards as allCards,
  transactions as allTxns,
  cardRequests as allCardReq,
  topUpRequests as allTopUps,
  formatCurrency,
  formatDate,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { useCurrentUser } from "@src/domains/dashboard/CorporateCard/teamcard/lib/currentUser";

const KpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "success" | "warning" | "info";
}) => (
  <Card className="shadow-soft">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-${tone}/10 text-${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function MemberDashboard() {
  const { user } = useCurrentUser();

  const myCards = useMemo(
    () => allCards.filter((c) => c.memberId === user.id && c.status !== "terminated"),
    [user.id],
  );
  const myTxns = useMemo(
    () =>
      allTxns
        .filter((t) => t.memberId === user.id)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [user.id],
  );
  const pendingReq = [
    ...allCardReq.filter((r) => r.memberId === user.id && r.status === "pending"),
    ...allTopUps.filter((r) => r.memberId === user.id && r.status === "pending"),
  ];

  const totalLimit = myCards.reduce((s, c) => s + c.spendLimit, 0);
  const totalSpent = myCards.reduce((s, c) => s + c.spent, 0);

  return (
    <AppLayout
      title={`Welcome, ${user.name.split(" ")[0]}`}
      subtitle="Your cards, transactions and pending requests."
      actions={
        <Button asChild>
          <Link to="/me/requests">
            <PlusCircle className="mr-2 h-4 w-4" /> New request
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icon={CardIcon}
          label="My cards"
          value={String(myCards.length)}
          hint={`${myCards.filter((c) => c.status === "active").length} active`}
          tone="primary"
        />
        <KpiCard
          icon={Receipt}
          label="Spent this period"
          value={formatCurrency(totalSpent)}
          hint={`of ${formatCurrency(totalLimit)} limit`}
          tone="info"
        />
        <KpiCard
          icon={FileText}
          label="Open requests"
          value={String(pendingReq.length)}
          hint="Card & fund requests"
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">My cards</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/me/cards">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {myCards.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You don't have any cards yet.{" "}
                <Link to="/me/requests" className="text-primary underline">
                  Request one
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myCards.slice(0, 4).map((c) => {
                  const pct = c.spendLimit ? Math.min(100, (c.spent / c.spendLimit) * 100) : 0;
                  return (
                    <div key={c.id} className="space-y-3">
                      <CardVisual card={c} size="sm" />
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {formatCurrency(c.spent)} / {formatCurrency(c.spendLimit)}
                          </span>
                          <Badge variant="outline" className="capitalize">
                            {c.status}
                          </Badge>
                        </div>
                        <Progress value={pct} className="mt-1 h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/me/transactions">
                All <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {myTxns.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.merchant}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                </div>
                <p className="font-medium">{formatCurrency(t.amount)}</p>
              </div>
            ))}
            {myTxns.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
