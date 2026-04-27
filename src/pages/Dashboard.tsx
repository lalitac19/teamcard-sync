import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  CreditCard as CardIcon,
  Users,
  Plus,
  Download,
} from "lucide-react";
import {
  cards,
  members,
  transactions,
  walletBalance,
  walletReserved,
  formatCurrency,
  formatDate,
  memberById,
} from "@/lib/mockData";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
  const activeCards = cards.filter((c) => c.status === "active").length;
  const verifiedMembers = members.filter((m) => m.kycStatus === "verified").length;
  const allocatedToCards = cards.reduce((s, c) => s + c.balance, 0);

  // Spend by category
  const byCategory = transactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount;
    return acc;
  }, {});
  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const topCat = categories[0]?.[1] ?? 1;

  const recent = transactions.slice(0, 6);

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Real-time spend, balances, and activity across Northwind."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Issue card
          </Button>
        </>
      }
    >
      {/* Hero balance card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 gradient-hero text-white shadow-card border-0">
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">Wallet balance</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(walletBalance)}</p>
              <div className="mt-2 flex gap-4 text-sm text-white/70">
                <span>Reserved: {formatCurrency(walletReserved)}</span>
                <span className="text-accent">+ {formatCurrency(30000)} processing</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0">
                Top up
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1">
                <ArrowUpRight className="h-4 w-4" /> Move money
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">This month spent</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalSpent)}</p>
            <div className="mt-3 flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" /> 12.4%
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI row */}
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <KpiCard label="Active cards" value={String(activeCards)} icon={<CardIcon className="h-4 w-4" />} delta="+3 this week" trend="up" />
        <KpiCard label="Verified members" value={`${verifiedMembers} / ${members.length}`} icon={<Users className="h-4 w-4" />} delta="2 pending KYC" trend="neutral" />
        <KpiCard label="Pending reimbursements" value="$108.40" icon={<TrendingDown className="h-4 w-4" />} delta="1 awaiting approval" trend="neutral" />
        <KpiCard label="Unmapped txns" value="14" icon={<TrendingUp className="h-4 w-4" />} delta="Ready to export" trend="up" />
      </div>

      {/* Charts + recent */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Spend by category</CardTitle>
            <Badge variant="secondary" className="font-normal">Last 30 days</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map(([cat, amt]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{cat}</span>
                  <span className="text-muted-foreground">{formatCurrency(amt)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(amt / topCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
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
                    <p className="truncate text-sm font-medium">{t.merchant}</p>
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
      </div>
    </AppLayout>
  );
};

function KpiCard({
  label,
  value,
  icon,
  delta,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delta: string;
  trend: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <Card className="shadow-soft">
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
}

export default Dashboard;
