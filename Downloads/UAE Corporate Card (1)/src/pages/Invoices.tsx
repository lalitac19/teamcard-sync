import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  invoices as seedInvoices,
  formatCurrency, formatDate, memberById, allCountries,
  type Invoice,
} from "@/lib/mockData";
import { Clock, CheckCircle2, XCircle, Inbox } from "lucide-react";
import { TableFilters, ALL } from "@/components/TableFilters";

type Status = Invoice["status"];

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

const Invoices = () => {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [uploaderId, setUploaderId] = useState<string>(ALL);
  const [vendorQ, setVendorQ] = useState("");
  const [country, setCountry] = useState<string>(ALL);

  const uploaderOptions = useMemo(() => {
    const ids = new Set(seedInvoices.map((r) => r.uploadedBy));
    return Array.from(ids)
      .map((id) => ({ value: id, label: memberById(id)?.name ?? id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const countries = useMemo(() => allCountries(), []);

  const rows = useMemo(() => {
    const q = vendorQ.trim().toLowerCase();
    return seedInvoices.filter((r) => {
      if (!inRange(r.date, from, to)) return false;
      if (uploaderId !== ALL && r.uploadedBy !== uploaderId) return false;
      if (q && !r.vendor.toLowerCase().includes(q)) return false;
      if (country !== ALL && r.country !== country) return false;
      return true;
    });
  }, [from, to, uploaderId, vendorQ, country]);

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
    setUploaderId(ALL); setVendorQ(""); setCountry(ALL);
  };

  return (
    <AppLayout
      title="Vendor Invoices"
      subtitle="Unpaid vendor invoices uploaded by members. Approvals are handled in Approval Requests."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard icon={Clock} label="Pending approval" value={counts.pending} total={counts.pendingTotal} tone="warning" />
        <KpiCard icon={CheckCircle2} label="Approved" value={counts.approved} total={counts.approvedTotal} tone="success" />
        <KpiCard icon={XCircle} label="Rejected" value={counts.rejected} total={counts.rejectedTotal} tone="destructive" />
      </div>

      <div className="mt-6">
        <TableFilters
          from={from} to={to} onFromChange={setFrom} onToChange={setTo}
          cardholders={uploaderOptions}
          cardholderId={uploaderId}
          onCardholderChange={setUploaderId}
          merchant={vendorQ}
          onMerchantChange={setVendorQ}
          merchantLabel="Vendor"
          merchantPlaceholder="Search vendor…"
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                    <Inbox className="mx-auto mb-2 h-6 w-6" />
                    No invoices match the selected filters.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => {
                const m = memberById(r.uploadedBy);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.invoiceNumber}</TableCell>
                    <TableCell className="text-sm font-medium">{r.vendor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.country ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                    <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                    <TableCell className="text-sm">{m?.name}</TableCell>
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

export default Invoices;
