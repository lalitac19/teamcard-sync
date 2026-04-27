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
  txnApprovals as seedTxnApprovals,
  reimbursements as seedReimbursements,
  invoices as seedInvoices,
  cardRequests as seedCardRequests,
  limitRequests as seedLimitRequests,
  walletTransfers as seedTransfers,
  cardById,
  formatCurrency, formatDate, memberById,
  type TxnApproval, type Reimbursement, type Invoice,
  type CardRequest, type LimitIncreaseRequest,
  type WalletTransfer, type TransferDirection,
} from "@/lib/mockData";
import { Check, X, Inbox } from "lucide-react";
import { toast } from "sonner";

type ApprovalStatus = "pending" | "approved" | "rejected";

const statusBadge = (s: ApprovalStatus) => {
  if (s === "approved") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Approved</Badge>;
  if (s === "rejected") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Rejected</Badge>;
  return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">Pending</Badge>;
};

const ActionCell = ({ status, onApprove, onReject }: {
  status: ApprovalStatus; onApprove: () => void; onReject: () => void;
}) => {
  if (status !== "pending") return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" className="h-8 gap-1" onClick={onReject}>
        <X className="h-3.5 w-3.5" /> Reject
      </Button>
      <Button size="sm" className="h-8 gap-1" onClick={onApprove}>
        <Check className="h-3.5 w-3.5" /> Approve
      </Button>
    </div>
  );
};

const EmptyState = () => (
  <Card className="shadow-soft">
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">Nothing to review.</p>
    </CardContent>
  </Card>
);

const Approvals = () => {
  const [txns, setTxns] = useState<TxnApproval[]>(seedTxnApprovals);
  const [oop, setOop] = useState<Reimbursement[]>(seedReimbursements);
  const [invs, setInvs] = useState<Invoice[]>(seedInvoices);
  const [cReqs, setCReqs] = useState<CardRequest[]>(seedCardRequests);
  const [lReqs, setLReqs] = useState<LimitIncreaseRequest[]>(seedLimitRequests);

  const counts = useMemo(() => ({
    txn: txns.filter((r) => r.status === "pending").length,
    oop: oop.filter((r) => r.status === "pending").length,
    inv: invs.filter((r) => r.status === "pending").length,
    card: cReqs.filter((r) => r.status === "pending").length,
    limit: lReqs.filter((r) => r.status === "pending").length,
  }), [txns, oop, invs, cReqs, lReqs]);

  const setField = <T extends { id: string; status: ApprovalStatus }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    label: string,
  ) => (id: string, status: ApprovalStatus) => {
    setter((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`${label} ${status}`);
  };

  const updateTxn = setField(setTxns, "Transaction tag");
  const updateOop = setField(setOop, "Reimbursement");
  const updateInv = setField(setInvs, "Invoice");
  const updateCard = setField(setCReqs, "Card request");
  const updateLimit = setField(setLReqs, "Limit request");

  return (
    <AppLayout
      title="Approval Requests"
      subtitle="Review approval requests from members across transactions, expenses, invoices, and card controls."
    >
      <Tabs defaultValue="txn" className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:max-w-3xl">
          <TabsTrigger value="txn">Transactions ({counts.txn})</TabsTrigger>
          <TabsTrigger value="oop">Out-of-Pocket ({counts.oop})</TabsTrigger>
          <TabsTrigger value="inv">Invoices ({counts.inv})</TabsTrigger>
          <TabsTrigger value="card">Card requests ({counts.card})</TabsTrigger>
          <TabsTrigger value="limit">Limit increase ({counts.limit})</TabsTrigger>
        </TabsList>

        {/* 1. Transaction approvals — tagging only */}
        <TabsContent value="txn" className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Tagging only — these decisions do not affect whether the transaction flows to Accounting Export.
          </p>
          {txns.length === 0 ? <EmptyState /> : (
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Policy reason</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txns.map((r) => {
                      const m = memberById(r.memberId);
                      const c = cardById(r.cardId);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                          <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                          <TableCell className="text-sm">{c ? `•• ${c.last4}` : "—"}</TableCell>
                          <TableCell className="text-sm">{r.merchant}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.policyReason}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-right">
                            <ActionCell status={r.status}
                              onApprove={() => updateTxn(r.id, "approved")}
                              onReject={() => updateTxn(r.id, "rejected")} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 2. Out-of-Pocket approvals */}
        <TabsContent value="oop" className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Approved claims will flow to Accounting Export for mapping.
          </p>
          {oop.length === 0 ? <EmptyState /> : (
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Merchant / Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oop.map((r) => {
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
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-right">
                            <ActionCell status={r.status}
                              onApprove={() => updateOop(r.id, "approved")}
                              onReject={() => updateOop(r.id, "rejected")} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 3. Invoice approvals */}
        <TabsContent value="inv" className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Approved invoices will flow to Accounting Export for mapping.
          </p>
          {invs.length === 0 ? <EmptyState /> : (
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Uploaded by</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invs.map((r) => {
                      const m = memberById(r.uploadedBy);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs">{r.invoiceNumber}</TableCell>
                          <TableCell className="text-sm font-medium">{r.vendor}</TableCell>
                          <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                          <TableCell className="text-sm">{m?.name}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-right">
                            <ActionCell status={r.status}
                              onApprove={() => updateInv(r.id, "approved")}
                              onReject={() => updateInv(r.id, "rejected")} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 4. Card issuance requests */}
        <TabsContent value="card" className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Card issuance requests submitted by members from the mobile app.
          </p>
          {cReqs.length === 0 ? <EmptyState /> : (
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Card type</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cReqs.map((r) => {
                      const m = memberById(r.memberId);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                          <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{r.type}</Badge></TableCell>
                          <TableCell className="text-sm">
                            {formatCurrency(r.requestedLimit)}
                            <span className="text-xs text-muted-foreground"> / {r.limitPeriod}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.reason}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-right">
                            <ActionCell status={r.status}
                              onApprove={() => updateCard(r.id, "approved")}
                              onReject={() => updateCard(r.id, "rejected")} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 5. Limit increase requests */}
        <TabsContent value="limit" className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Spending limit increase requests submitted by cardholders from the mobile app.
          </p>
          {lReqs.length === 0 ? <EmptyState /> : (
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Requested</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lReqs.map((r) => {
                      const m = memberById(r.memberId);
                      const c = cardById(r.cardId);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                          <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                          <TableCell className="text-sm">{c ? `•• ${c.last4}` : "—"}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(r.currentLimit)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.requestedLimit)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.reason}</TableCell>
                          <TableCell>{statusBadge(r.status)}</TableCell>
                          <TableCell className="text-right">
                            <ActionCell status={r.status}
                              onApprove={() => updateLimit(r.id, "approved")}
                              onReject={() => updateLimit(r.id, "rejected")} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Approvals;
