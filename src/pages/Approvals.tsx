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
  topUpRequests as seedTopUpRequests,
  cardById,
  primaryUnallocated,
  cards as allCards, members, allCountries,
  formatCurrency, formatDate, memberById,
  type TxnApproval, type Reimbursement, type Invoice,
  type CardRequest, type TopUpRequest,
} from "@/lib/mockData";
import { Check, X, Inbox, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { TableFilters, ALL } from "@/components/TableFilters";

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
  const [lReqs, setLReqs] = useState<TopUpRequest[]>(seedTopUpRequests);

  // Available headroom on the primary card to grant new/raised allocations.
  const [available, setAvailable] = useState<number>(primaryUnallocated());

  // ── Filter state (shared across the three "expense" tabs) ────────────────
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [memberFilter, setMemberFilter] = useState<string>(ALL);
  const [cardFilter, setCardFilter] = useState<string>(ALL);
  const [merchantQ, setMerchantQ] = useState("");
  const [country, setCountry] = useState<string>(ALL);

  const cardholderOptions = useMemo(() => {
    const ids = new Set(allCards.map((c) => c.memberId));
    return members.filter((m) => ids.has(m.id)).map((m) => ({ value: m.id, label: m.name }));
  }, []);
  const cardOptions = useMemo(() => {
    const scoped = memberFilter === ALL ? allCards : allCards.filter((c) => c.memberId === memberFilter);
    return scoped.map((c) => ({ value: c.id, label: `•• ${c.last4} — ${memberById(c.memberId)?.name ?? ""}` }));
  }, [memberFilter]);
  const activeCardId = useMemo(() => {
    if (cardFilter === ALL) return ALL;
    if (memberFilter === ALL) return cardFilter;
    const owns = allCards.find((c) => c.id === cardFilter)?.memberId === memberFilter;
    return owns ? cardFilter : ALL;
  }, [cardFilter, memberFilter]);
  const countries = useMemo(() => allCountries(), []);

  const inRange = (iso: string) => {
    const d = new Date(iso);
    if (from && d < from) return false;
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  };

  const resetFilters = () => {
    setFrom(undefined); setTo(undefined);
    setMemberFilter(ALL); setCardFilter(ALL);
    setMerchantQ(""); setCountry(ALL);
  };

  const merchantQLower = merchantQ.trim().toLowerCase();

  const txnsFiltered = useMemo(() => txns.filter((r) => {
    if (!inRange(r.date)) return false;
    if (memberFilter !== ALL && r.memberId !== memberFilter) return false;
    if (activeCardId !== ALL && r.cardId !== activeCardId) return false;
    if (merchantQLower && !r.merchant.toLowerCase().includes(merchantQLower)) return false;
    return true;
  }), [txns, from, to, memberFilter, activeCardId, merchantQLower]);

  const oopFiltered = useMemo(() => oop.filter((r) => {
    if (!inRange(r.date)) return false;
    if (memberFilter !== ALL && r.memberId !== memberFilter) return false;
    if (merchantQLower && !r.merchant.toLowerCase().includes(merchantQLower)) return false;
    if (country !== ALL && r.country !== country) return false;
    return true;
  }), [oop, from, to, memberFilter, merchantQLower, country]);

  const invsFiltered = useMemo(() => invs.filter((r) => {
    if (!inRange(r.date)) return false;
    if (memberFilter !== ALL && r.uploadedBy !== memberFilter) return false;
    if (merchantQLower && !r.vendor.toLowerCase().includes(merchantQLower)) return false;
    if (country !== ALL && r.country !== country) return false;
    return true;
  }), [invs, from, to, memberFilter, merchantQLower, country]);


  const counts = useMemo(() => ({
    txn: txns.filter((r) => r.status === "pending").length,
    oop: oop.filter((r) => r.status === "pending").length,
    inv: invs.filter((r) => r.status === "pending").length,
    card: cReqs.filter((r) => r.status === "pending").length,
    topup: lReqs.filter((r) => r.status === "pending").length,
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

  const updateTopUp = (id: string, status: ApprovalStatus) => {
    setLReqs((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      if (status !== "approved") {
        toast.success(`Limit-increase request ${status}`);
        return { ...r, status };
      }
      const delta = r.requestedAmount;
      if (available >= delta) {
        setAvailable((w) => w - delta);
        const member = memberById(r.memberId);
        const card = cardById(r.cardId);
        toast.success(
          `Limit increase approved — ${formatCurrency(delta)} additional allocation granted to ${member?.name ?? "cardholder"} •• ${card?.last4 ?? ""}`,
        );
        return { ...r, status: "approved", fundingStatus: "funded" };
      }
      toast.error(
        `Approved, but primary card has only ${formatCurrency(available)} unallocated — increase is on hold pending more funds.`,
      );
      return { ...r, status: "approved", fundingStatus: "insufficient_funds" };
    }));
  };

  return (
    <AppLayout
      title="Approval Requests"
      subtitle="Review approval requests from members across transactions, expenses, invoices, and card controls."
    >
      <Tabs defaultValue="txn" className="w-full">
        <TabsList className="grid w-full grid-cols-5 md:max-w-3xl">
          <TabsTrigger value="txn">Transactions ({counts.txn})</TabsTrigger>
          <TabsTrigger value="oop">Out-of-Pocket ({counts.oop})</TabsTrigger>
          <TabsTrigger value="inv">Vendor Invoices ({counts.inv})</TabsTrigger>
          <TabsTrigger value="card">Card requests ({counts.card})</TabsTrigger>
          <TabsTrigger value="topup">Limit increases ({counts.topup})</TabsTrigger>
        </TabsList>

        {/* 1. Transaction approvals — tagging only */}
        <TabsContent value="txn" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Tagging only — these decisions do not affect whether the transaction flows to Accounting Export.
          </p>
          <TableFilters
            from={from} to={to} onFromChange={setFrom} onToChange={setTo}
            cardholders={cardholderOptions}
            cardholderId={memberFilter}
            onCardholderChange={(v) => { setMemberFilter(v); setCardFilter(ALL); }}
            cards={cardOptions}
            cardId={activeCardId}
            onCardChange={setCardFilter}
            merchant={merchantQ}
            onMerchantChange={setMerchantQ}
            onReset={resetFilters}
          />
          {txnsFiltered.length === 0 ? <EmptyState /> : (
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
                    {txnsFiltered.map((r) => {
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
        <TabsContent value="oop" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Approved claims will flow to Accounting Export for mapping.
          </p>
          <TableFilters
            from={from} to={to} onFromChange={setFrom} onToChange={setTo}
            cardholders={cardholderOptions}
            cardholderId={memberFilter}
            onCardholderChange={(v) => { setMemberFilter(v); setCardFilter(ALL); }}
            merchant={merchantQ}
            onMerchantChange={setMerchantQ}
            countries={countries}
            country={country}
            onCountryChange={setCountry}
            onReset={resetFilters}
          />
          {oopFiltered.length === 0 ? <EmptyState /> : (
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
                    {oopFiltered.map((r) => {
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
        <TabsContent value="inv" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Approved invoices will flow to Accounting Export for mapping.
          </p>
          <TableFilters
            from={from} to={to} onFromChange={setFrom} onToChange={setTo}
            cardholders={cardholderOptions}
            cardholderId={memberFilter}
            onCardholderChange={(v) => { setMemberFilter(v); setCardFilter(ALL); }}
            merchant={merchantQ}
            onMerchantChange={setMerchantQ}
            merchantLabel="Vendor"
            merchantPlaceholder="Search vendor…"
            countries={countries}
            country={country}
            onCountryChange={setCountry}
            onReset={resetFilters}
          />
          {invsFiltered.length === 0 ? <EmptyState /> : (
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

        {/* 5. Card top-up requests */}
        <TabsContent value="topup" className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Limit-increase requests submitted by cardholders. On approval, additional limit is reserved from the primary card's unallocated balance.
            </p>
            <p className="text-xs">
              <span className="text-muted-foreground">Primary card unallocated: </span>
              <span className="font-semibold">{formatCurrency(available)}</span>
            </p>
          </div>
          {lReqs.length === 0 ? <EmptyState /> : (
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead className="text-right">Current limit</TableHead>
                      <TableHead className="text-right">Requested increase</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lReqs.map((r) => {
                      const m = memberById(r.memberId);
                      const c = cardById(r.cardId);
                      const insufficient = r.status === "pending" && r.requestedAmount > available;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                          <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                          <TableCell className="text-sm">{c ? `•• ${c.last4}` : "—"}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(r.currentBalance)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">
                            {formatCurrency(r.requestedAmount)}
                            {insufficient && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-warning">
                                <AlertTriangle className="h-3 w-3" /> low headroom
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.reason}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {statusBadge(r.status)}
                              {r.status === "approved" && r.fundingStatus === "insufficient_funds" && (
                                <span className="text-[10px] text-warning">On hold — primary card underfunded</span>
                              )}
                              {r.status === "approved" && r.fundingStatus === "funded" && (
                                <span className="text-[10px] text-muted-foreground">Limit increase applied</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <ActionCell status={r.status}
                              onApprove={() => updateTopUp(r.id, "approved")}
                              onReject={() => updateTopUp(r.id, "rejected")} />
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
