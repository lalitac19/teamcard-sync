import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  reimbursements as seedReimbursements,
  formatCurrency, formatDate, memberById, allCountries,
  type Reimbursement,
} from "@/lib/mockData";
import { Clock, CheckCircle2, XCircle, Receipt, Inbox } from "lucide-react";
import { TableFilters, ALL } from "@/components/TableFilters";

type Status = Reimbursement["status"];

const statusBadge = (s: Status) => {
  if (s === "approved") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Approved</Badge>;
  if (s === "rejected") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Rejected</Badge>;
  return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">Pending</Badge>;
};

const inRange = (iso: string, from?: Date, to?: Date) => {
  const d = new Date(iso);
  if (from && d < from) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (d > end) return false;
  }
  return true;
};

const KpiCard = ({ icon: Icon, label, value, total, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; total: number; tone: "warning" | "success" | "destructive";
}) => (
  <Card className="shadow-soft">
    <CardContent className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(total)} total</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-${tone}/10 text-${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Reimbursements = () => {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [memberId, setMemberId] = useState<string>(ALL);
  const [merchant, setMerchant] = useState("");
  const [country, setCountry] = useState<string>(ALL);

  const memberOptions = useMemo(() => {
    const ids = new Set(seedReimbursements.map((r) => r.memberId));
    return Array.from(ids)
      .map((id) => ({ value: id, label: memberById(id)?.name ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const countries = useMemo(() => allCountries(), []);

  const rows = useMemo(() => {
    const merchantQ = merchant.trim().toLowerCase();
    return seedReimbursements.filter((r) => {
      if (!inRange(r.date, from, to)) return false;
      if (memberId !== ALL && r.memberId !== memberId) return false;
      if (merchantQ && !r.merchant.toLowerCase().includes(merchantQ)) return false;
      if (country !== ALL && r.country !== country) return false;
      return true;
    });
  }, [from, to, memberId, merchant, country]);

  const counts = useMemo(() => {
    const sum = (s: Status) => rows.filter((r) => r.status === s).reduce((a, b) => a + b.amount, 0);
    return {
      pending: rows.filter((r) => r.status === "pending").length,
      approved: rows.filter((r) => r.status === "approved").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
      pendingTotal: sum("pending"),
      approvedTotal: sum("approved"),
      rejectedTotal: sum("rejected"),
    };
  }, [rows]);

  const reset = () => {
    setFrom(undefined); setTo(undefined);
    setMemberId(ALL); setMerchant(""); setCountry(ALL);
  };

  return (
    <AppLayout
      title="Reimbursements"
      subtitle="Reimbursement claims uploaded by members. Approvals are handled in Approval Requests."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard icon={Clock} label="Pending approval" value={counts.pending} total={counts.pendingTotal} tone="warning" />
        <KpiCard icon={CheckCircle2} label="Approved" value={counts.approved} total={counts.approvedTotal} tone="success" />
        <KpiCard icon={XCircle} label="Rejected" value={counts.rejected} total={counts.rejectedTotal} tone="destructive" />
      </div>

      <div className="mt-6">
        <TableFilters
          from={from} to={to} onFromChange={setFrom} onToChange={setTo}
          cardholders={memberOptions}
          cardholderId={memberId}
          onCardholderChange={setMemberId}
          merchant={merchant}
          onMerchantChange={setMerchant}
          countries={countries}
          country={country}
          onCountryChange={setCountry}
          onReset={reset}
        />
      </div>

      <Card className="mt-4 shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Merchant / Description</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    <Inbox className="mx-auto mb-2 h-6 w-6" />
                    No claims match the selected filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => {
                const m = memberById(r.memberId);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                    <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{r.merchant}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.country ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.category}</TableCell>
                    <TableCell>
                      {r.receipt
                        ? <Badge variant="secondary" className="gap-1"><Receipt className="h-3 w-3" /> Attached</Badge>
                        : <Badge variant="outline">Missing</Badge>}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Reimbursements;
