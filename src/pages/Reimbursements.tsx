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
  reimbursements as seedReimbursements,
  formatCurrency, formatDate, memberById,
  type Reimbursement,
} from "@/lib/mockData";
import { Check, X, Clock, CheckCircle2, XCircle, Receipt } from "lucide-react";
import { toast } from "sonner";

type Status = Reimbursement["status"];

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

const Reimbursements = () => {
  const [rows, setRows] = useState<Reimbursement[]>(seedReimbursements);

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
    toast.success(status === "approved" ? "Reimbursement approved" : "Reimbursement rejected");
  };

  return (
    <AppLayout
      title="Out-of-Pocket Expenses"
      subtitle="Review reimbursement claims uploaded by members through the mobile app."
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
            <ReimbList
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

function ReimbList({ rows, onApprove, onReject }: {
  rows: Reimbursement[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No claims in this view.</p>
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
              <TableHead>Date</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Merchant / Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  <TableCell className="text-sm">{r.category}</TableCell>
                  <TableCell>
                    {r.receipt
                      ? <Badge variant="secondary" className="gap-1"><Receipt className="h-3 w-3" /> Attached</Badge>
                      : <Badge variant="outline">Missing</Badge>}
                  </TableCell>
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

export default Reimbursements;
