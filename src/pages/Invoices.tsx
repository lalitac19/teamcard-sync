import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  invoices as seedInvoices,
  formatCurrency, formatDate, memberById,
  type Invoice,
} from "@/lib/mockData";
import { Check, X, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";

type Status = Invoice["status"];

const statusBadge = (s: Status) => {
  if (s === "approved") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Approved</Badge>;
  if (s === "rejected") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Rejected</Badge>;
  return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">Pending</Badge>;
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
  const [rows, setRows] = useState<Invoice[]>(seedInvoices);

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

  const setStatus = (id: string, status: Status) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(status === "approved" ? "Invoice approved" : "Invoice rejected");
  };

  return (
    <AppLayout
      title="Vendor Invoices"
      subtitle="Review unpaid vendor invoices uploaded by members for approval."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard icon={Clock} label="Needs action" value={counts.pending} total={counts.pendingTotal} tone="warning" />
        <KpiCard icon={CheckCircle2} label="Approved" value={counts.approved} total={counts.approvedTotal} tone="success" />
        <KpiCard icon={XCircle} label="Rejected" value={counts.rejected} total={counts.rejectedTotal} tone="destructive" />
      </div>

      <Tabs defaultValue="pending" className="mt-6 w-full">
        <TabsList className="grid w-full grid-cols-4 md:max-w-xl">
          <TabsTrigger value="pending">Needs action ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <InvoiceList
              rows={tab === "all" ? rows : rows.filter((r) => r.status === tab)}
              onApprove={(id) => setStatus(id, "approved")}
              onReject={(id) => setStatus(id, "rejected")}
            />
          </TabsContent>
        ))}
      </Tabs>
    </AppLayout>
  );
};

function InvoiceList({ rows, onApprove, onReject }: {
  rows: Invoice[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No invoices in this view.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-soft">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Uploaded by</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const m = memberById(r.uploadedBy);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.invoiceNumber}</TableCell>
                  <TableCell className="text-sm font-medium">{r.vendor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                  <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                  <TableCell className="text-sm">{m?.name}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-right">
                    {r.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => onReject(r.id)}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" className="h-8 gap-1" onClick={() => onApprove(r.id)}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default Invoices;
