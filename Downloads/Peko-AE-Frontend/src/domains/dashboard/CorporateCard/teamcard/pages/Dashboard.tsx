import { useMemo } from "react";
import { AppLayout } from "@src/domains/dashboard/CorporateCard/teamcard/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/card";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Badge } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/badge";
import { Progress } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CreditCard as CardIcon,
  Users,
  Plus,
  Download,
  AlertCircle,
  Clock,
  Receipt,
  ShieldCheck,
  Flame,
} from "lucide-react";
import {
  cards,
  members,
  transactions,
  reimbursements,
  invoices,
  walletTopUps,
  txnApprovals,
  cardRequests,
  walletBalance,
  corporateDeposit,
  currentCycle,
  currentCycleAccrual,
  unpaidBillsTotal,
  availableCredit,
  formatCurrency,
  formatDate,
  fmtCycleDate,
  memberById,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { Link } from "react-router-dom";

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const Dashboard = () => {
  // ---------- Aggregations ----------

  const cycle = useMemo(() => currentCycle(), []);
  const cycleAccrual = useMemo(() => currentCycleAccrual(), []);
  const unpaid = useMemo(() => unpaidBillsTotal(), []);
  const available = useMemo(() => availableCredit(), []);
  const processingTopUps = useMemo(
    () => walletTopUps.filter((w) => w.status === "processing").reduce((s, w) => s + w.amount, 0),
    [],
  );


  const activeCards = useMemo(() => cards.filter((c) => c.status === "active"), []);
  const verifiedMembers = useMemo(() => members.filter((m) => m.kycStatus === "verified"), []);
  const pendingKyc = members.length - verifiedMembers.length;

  const pendingReimb = useMemo(() => reimbursements.filter((r) => r.status === "pending"), []);
  const pendingReimbTotal = pendingReimb.reduce((s, r) => s + r.amount, 0);
  const pendingInvoices = invoices.filter((i) => i.status === "pending");

  const pendingApprovalsTotal =
    txnApprovals.filter((t) => t.status === "pending").length +
    cardRequests.filter((c) => c.status === "pending").length +
    pendingReimb.length +
    pendingInvoices.length;

  // This month vs last month spend (anchor on most recent transaction date)
  const { thisMonthTotal, lastMonthTotal, momDelta, trendData } = useMemo(() => {
    const allDates = transactions.map((t) => new Date(t.date).getTime());
    const anchor = new Date(Math.max(...allDates));
    const thisMonth = anchor.getMonth();
    const thisYear = anchor.getFullYear();
    const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);

    let thisM = 0;
    let lastM = 0;
    transactions.forEach((t) => {
      const d = new Date(t.date);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) thisM += t.amount;
      if (d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear())
        lastM += t.amount;
    });

    // Build daily buckets for last 30 days from anchor
    const buckets: { date: string; spend: number; label: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({
        date: key,
        spend: 0,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    const idx = new Map(buckets.map((b, i) => [b.date, i]));
    transactions.forEach((t) => {
      const i = idx.get(t.date);
      if (i !== undefined) buckets[i].spend += t.amount;
    });

    const delta = lastM > 0 ? ((thisM - lastM) / lastM) * 100 : 0;
    return { thisMonthTotal: thisM, lastMonthTotal: lastM, momDelta: delta, trendData: buckets };
  }, []);

  // Runway = wallet / monthly spend
  const runwayMonths = thisMonthTotal > 0 ? walletBalance / thisMonthTotal : null;

  // Spend by category (top 5)
  const categories = useMemo(() => {
    const byCat = transactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});
    const total = Object.values(byCat).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => ({ cat, amt, pct: (amt / total) * 100 }));
  }, []);

  // Card utilization (top 5 active by utilization)
  const cardUtil = useMemo(() => {
    return activeCards
      .map((c) => ({
        card: c,
        member: memberById(c.memberId),
        util: c.spendLimit > 0 ? (c.spent / c.spendLimit) * 100 : 0,
      }))
      .sort((a, b) => b.util - a.util)
      .slice(0, 5);
  }, [activeCards]);
  const cardsNearLimit = cardUtil.filter((c) => c.util >= 80).length;

  // Top spenders
  const topSpenders = useMemo(() => {
    const byMember = transactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.memberId] = (acc[t.memberId] ?? 0) + t.amount;
      return acc;
    }, {});
    const total = Object.values(byMember).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(byMember)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mid, amt]) => ({ member: memberById(mid), amt, pct: (amt / total) * 100 }));
  }, []);

  const recent = transactions.slice(0, 6);

  // Action items for top strip
  const actionItems = [
    { count: txnApprovals.filter((t) => t.status === "pending").length, label: "transactions need approval", to: "/approvals", icon: ShieldCheck },
    { count: cardRequests.filter((c) => c.status === "pending").length, label: "card requests pending", to: "/approvals", icon: CardIcon },
    { count: pendingKyc, label: "people pending KYC", to: "/members", icon: Users },
    { count: pendingInvoices.length, label: "vendor invoices awaiting approval", to: "/invoices", icon: Receipt },
    { count: cardsNearLimit, label: "cards over 80% utilization", to: "/cards", icon: Flame },
  ].filter((a) => a.count > 0);

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Real-time spend, Available Limits, and activity across Peko."
    >
      {/* Action center strip */}
      {actionItems.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {actionItems.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                to={a.to}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary"
              >
                <Icon className="h-3.5 w-3.5 text-warning" />
                <span className="text-foreground">{a.count}</span>
                <span className="text-muted-foreground">{a.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {unpaid > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p>
            You have <strong>{formatCurrency(unpaid)}</strong> in unpaid bills. This amount is temporarily held from your available credit. If it is not settled before midnight on the last day of the month, your credit limit will drop by this amount automatically and permanently.{" "}
            <Link to="/wallet" className="underline">View bills</Link>
          </p>
        </div>
      )}

      {/* Hero balance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 gradient-hero text-white shadow-card border-0">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase tracking-widest text-white/60">Available Limit</p>
                <Badge className="bg-white/15 text-white border-0 hover:bg-white/15 gap-1 h-5 px-2 text-[10px]">
                  <ShieldCheck className="h-3 w-3" /> Secured credit
                </Badge>
              </div>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(available)}</p>
              <p className="mt-1 text-xs text-white/60">
                Corporate Credit Limit {formatCurrency(corporateDeposit)} · Cycle {fmtCycleDate(cycle.start)} to {fmtCycleDate(cycle.end)}: {formatCurrency(cycleAccrual)} accrued · Next bill {fmtCycleDate(cycle.issue)}, due {fmtCycleDate(cycle.due)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" asChild>
                <Link to="/cards"><ArrowUpRight className="h-4 w-4" /> Manage cards</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">This month spent</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(thisMonthTotal)}</p>
            <div
              className={`mt-3 flex items-center gap-1 text-sm ${
                momDelta > 0 ? "text-destructive" : momDelta < 0 ? "text-success" : "text-muted-foreground"
              }`}
            >
              {momDelta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(momDelta).toFixed(1)}%
              <span className="text-muted-foreground">vs last month ({formatCurrency(lastMonthTotal)})</span>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* KPI row */}
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Active cards"
          value={String(activeCards.length)}
          icon={<CardIcon className="h-4 w-4" />}
          delta={`${cards.length} total issued`}
          trend="neutral"
          to="/cards"
        />
        <KpiCard
          label="Verified people"
          value={`${verifiedMembers.length} / ${members.length}`}
          icon={<Users className="h-4 w-4" />}
          delta={pendingKyc > 0 ? `${pendingKyc} pending KYC` : "All verified"}
          trend={pendingKyc > 0 ? "neutral" : "up"}
          to="/members"
        />
        <KpiCard
          label="Pending reimbursements"
          value={formatCurrency(pendingReimbTotal)}
          icon={<Receipt className="h-4 w-4" />}
          delta={`${pendingReimb.length} awaiting approval`}
          trend="neutral"
          to="/reimbursements"
        />
        <KpiCard
          label="Pending approvals"
          value={String(pendingApprovalsTotal)}
          icon={<AlertCircle className="h-4 w-4" />}
          delta={pendingApprovalsTotal > 0 ? "Action needed" : "All caught up"}
          trend={pendingApprovalsTotal > 0 ? "down" : "up"}
          to="/approvals"
        />
      </div>

      {/* Trend + top spenders */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Daily spend</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Last 30 days · card transactions</p>
            </div>
            <Badge variant="secondary" className="font-normal">{formatCurrency(thisMonthTotal)} this month</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ spend: { label: "Spend", color: "hsl(var(--primary))" } }}
              className="aspect-[16/6] w-full"
            >
              <AreaChart data={trendData} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={4}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)}
                  width={48}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                      labelFormatter={(l) => String(l)}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#spendFill)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Top spenders</CardTitle>
            <Link to="/transactions" className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSpenders.map(({ member, amt, pct }) => (
              <div key={member?.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {member?.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{member?.name}</span>
                    <span className="font-semibold">{formatCurrency(amt)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={pct} className="h-1.5" />
                    <span className="w-10 text-right text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Categories + card utilization */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Spend by category</CardTitle>
            <Badge variant="secondary" className="font-normal">Top 5</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map(({ cat, amt, pct }) => (
              <Link key={cat} to="/transactions" className="block group">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium group-hover:text-primary">{cat}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(amt)} <span className="text-xs">· {pct.toFixed(0)}%</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Card utilization</CardTitle>
            <Link to="/cards" className="text-xs text-muted-foreground hover:text-foreground">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {cardUtil.map(({ card, member, util }) => (
              <div key={card.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-medium">{member?.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">•• {card.last4}</span>
                    {util >= 80 && (
                      <Badge className="bg-destructive/10 text-destructive border-0 hover:bg-destructive/10 h-5 px-1.5 text-[10px]">
                        Near limit
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatCurrency(card.spent)} / {formatCurrency(card.spendLimit)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${util >= 80 ? "bg-destructive" : util >= 60 ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${Math.min(util, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="mt-4 shadow-soft">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent activity</CardTitle>
          <Link to="/transactions" className="text-xs text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.map((t) => {
            const m = memberById(t.memberId);
            return (
              <div key={t.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {m?.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{t.merchant}</p>
                    <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{t.category}</Badge>
                    {t.status === "pending" && (
                      <Badge className="bg-warning/10 text-warning border-0 hover:bg-warning/10 h-5 px-1.5 text-[10px] gap-1">
                        <Clock className="h-2.5 w-2.5" /> Pending
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {m?.name} • {formatDate(t.date)}
                  </p>
                </div>
                <span className="text-sm font-semibold">−{formatCurrency(t.amount)}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

function KpiCard({
  label,
  value,
  icon,
  delta,
  trend,
  to,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delta: string;
  trend: "up" | "down" | "neutral";
  to?: string;
}) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  const inner = (
    <Card className="shadow-soft transition-shadow hover:shadow-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            {icon}
          </div>
        </div>
        <p className="mt-3 text-2xl font-semibold">{value}</p>
        <p className={`mt-1 text-xs ${trendColor}`}>{delta}</p>
      </CardContent>
    </Card>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
}

export default Dashboard;
