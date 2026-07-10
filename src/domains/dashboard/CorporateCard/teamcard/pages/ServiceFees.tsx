import { useMemo, useState } from "react";
import { AppLayout } from "@src/domains/dashboard/CorporateCard/teamcard/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/card";
import { Badge } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/badge";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/radio-group";
import { Label } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/label";
import { Input } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/tabs";
import {
  serviceFees as initialFees,
  ServiceFee, ServiceFeeType, ServiceFeePaymentMethod,
  cards as allCards, cardById, memberById,
  addStatementExtra,
  formatCurrency, formatDate,
  feeCatalog, FeeCatalogItem, FeeTriggerEvent, triggerFeeEvent,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { Banknote, CreditCard, ShieldCheck, Receipt, Globe, CheckCircle2, Download, Zap, BookOpen, Bell } from "lucide-react";
import { toast } from "sonner";

const typeMeta: Record<ServiceFeeType, { label: string; icon: typeof Banknote }> = {
  atm:           { label: "ATM fee",           icon: Banknote },
  platform:      { label: "Platform fee",      icon: ShieldCheck },
  card_issuance: { label: "Card issuance fee", icon: CreditCard },
};

const typeBadge = (t: ServiceFeeType) => {
  const meta = typeMeta[t];
  const Icon = meta.icon;
  return (
    <Badge variant="secondary" className="gap-1 font-normal">
      <Icon className="h-3 w-3" /> {meta.label}
    </Badge>
  );
};

const activeCorporateCards = () =>
  allCards.filter((c) => c.status === "active");

const ServiceFees = () => {
  const [fees, setFees] = useState<ServiceFee[]>(initialFees);
  const [payTarget, setPayTarget] = useState<ServiceFee | null>(null);
  const [method, setMethod] = useState<ServiceFeePaymentMethod>("external_gateway");
  const [cardId, setCardId] = useState<string>(activeCorporateCards()[0]?.id ?? "");
  const [externalLast4, setExternalLast4] = useState("");
  const [filter, setFilter] = useState<"all" | ServiceFeeType>("all");

  const outstanding = useMemo(
    () => fees.filter((f) => f.status === "outstanding" && (filter === "all" || f.type === filter)),
    [fees, filter],
  );
  const paid = useMemo(
    () => fees.filter((f) => f.status === "paid" && (filter === "all" || f.type === filter))
      .sort((a, b) => (b.paidAt ?? b.date).localeCompare(a.paidAt ?? a.date)),
    [fees, filter],
  );

  const totalOutstanding = outstanding.reduce((s, f) => s + f.amount, 0);
  const totalThisMonthPaid = fees
    .filter((f) => f.status === "paid" && (f.paidAt ?? "").startsWith("2024-10"))
    .reduce((s, f) => s + f.amount, 0);

  const openPay = (fee: ServiceFee) => {
    setPayTarget(fee);
    setMethod("external_gateway");
    setExternalLast4("");
    setCardId(activeCorporateCards()[0]?.id ?? "");
  };

  /** Fire a fee trigger event — generates a new outstanding bill and prompts the user to pay. */
  const fireTrigger = (item: FeeCatalogItem, subject?: string) => {
    const newFee = triggerFeeEvent(item.trigger, { subject });
    if (!newFee) {
      toast.error("No active fee mapped to this trigger.");
      return;
    }
    setFees((prev) => [newFee, ...prev]);
    toast.message(`New bill generated: ${item.name}`, {
      description: `${formatCurrency(item.price)} due — open payment gateway to settle.`,
      icon: <Bell className="h-4 w-4" />,
      action: { label: "Pay now", onClick: () => openPay(newFee) },
      duration: 8000,
    });
  };

  const confirmPay = () => {
    if (!payTarget) return;
    if (method === "external_gateway" && externalLast4.replace(/\D/g, "").length !== 4) {
      toast.error("Enter the last 4 digits of the external card.");
      return;
    }
    if (method === "peko_card" && !cardId) {
      toast.error("Select a Peko corporate card.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const updated: ServiceFee = {
      ...payTarget,
      status: "paid",
      paidAt: today,
      paidMethod: method,
      paidCardId: method === "peko_card" ? cardId : undefined,
      externalLast4: method === "external_gateway" ? externalLast4.replace(/\D/g, "") : undefined,
    };
    setFees((prev) => prev.map((f) => (f.id === payTarget.id ? updated : f)));

    if (method === "peko_card") {
      const c = cardById(cardId);
      const m = c ? memberById(c.memberId) : undefined;
      addStatementExtra({
        id: `se-paid-${payTarget.id}`,
        date: today,
        type: "fee",
        description: `${typeMeta[payTarget.type].label} settled — ${payTarget.description}${c ? ` · paid with Peko card •• ${c.last4}` : ""}${m ? ` (${m.name})` : ""}`,
        amount: -payTarget.amount,
        reference: `PAY-${payTarget.reference}`,
      });
      toast.success(`Paid ${formatCurrency(payTarget.amount)} with Peko card — added to Account Statement.`);
    } else {
      toast.success(`Paid ${formatCurrency(payTarget.amount)} via external card ••${externalLast4.replace(/\D/g, "")} — not added to Account Statement.`);
    }
    setPayTarget(null);
  };

  const paymentBadge = (fee: ServiceFee) => {
    if (fee.paidMethod === "peko_card") {
      const c = fee.paidCardId ? cardById(fee.paidCardId) : undefined;
      return (
        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0 gap-1">
          <CreditCard className="h-3 w-3" /> Peko •• {c?.last4 ?? "—"}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 font-normal">
        <Globe className="h-3 w-3" /> External •• {fee.externalLast4 ?? "—"}
      </Badge>
    );
  };

  return (
    <AppLayout
      title="Service Fees"
      subtitle="Service fees (ATM, platform, card issuance, FX) are billed separately from the Account Statement. Pay them here through the gateway. Paying with the Peko corporate card automatically reflects the charge on your Account Statement."
      actions={
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fee types</SelectItem>
            <SelectItem value="atm">ATM fees</SelectItem>
            <SelectItem value="platform">Platform fees</SelectItem>
            <SelectItem value="card_issuance">Card issuance fees</SelectItem>
            
          </SelectContent>
        </Select>
      }
    >
      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-soft border-warning/40">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="mt-2 text-2xl font-semibold text-warning">{formatCurrency(totalOutstanding)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{outstanding.length} fee{outstanding.length === 1 ? "" : "s"} awaiting payment</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Paid this month</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalThisMonthPaid)}</p>
            <p className="mt-1 text-xs text-muted-foreground">October 2024</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Payment gateway</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-success" /> Secure 3-D Secure checkout
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Pay with Peko card or any external card.</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="outstanding" className="mt-6">
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding Bills ({outstanding.length})</TabsTrigger>
          <TabsTrigger value="paid">Payment History ({paid.length})</TabsTrigger>
          <TabsTrigger value="catalog">Fee Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="outstanding" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Outstanding Bills</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right w-[160px]">Tax invoice</TableHead>
                    <TableHead className="text-right w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstanding.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
                        All caught up — no outstanding service fees.
                      </TableCell>
                    </TableRow>
                  )}
                  {outstanding.map((f) => {
                    const invoiceNo = `TINV-${f.date.replace(/-/g, "").slice(2)}-${f.id.slice(-4).toUpperCase()}`;
                    return (
                    <TableRow key={f.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(f.date)}</TableCell>
                      <TableCell className="text-sm">{f.description}</TableCell>
                      <TableCell>{typeBadge(f.type)}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{f.reference}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(f.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-[11px] text-muted-foreground">{invoiceNo}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs"
                            onClick={() => toast.success(`Tax invoice ${invoiceNo} downloaded (PDF).`)}
                          >
                            <Download className="h-3 w-3" /> PDF
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => openPay(f)} className="gap-1">
                          <Receipt className="h-3.5 w-3.5" /> Pay
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-4">
          <Card className="shadow-soft">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Payment history</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Paid on</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Paid with</TableHead>
                    <TableHead>On statement?</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right w-[160px]">Tax invoice</TableHead>
                    <TableHead className="text-right w-[160px]">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paid.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No payment history.</TableCell>
                    </TableRow>
                  )}
                  {paid.map((f) => {
                    const invoiceNo = `TINV-${(f.paidAt ?? f.date).replace(/-/g, "").slice(2)}-${f.id.slice(-4).toUpperCase()}`;
                    const receiptNo = `RCPT-${(f.paidAt ?? f.date).replace(/-/g, "").slice(2)}-${f.id.slice(-4).toUpperCase()}`;
                    return (
                    <TableRow key={f.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(f.paidAt ?? f.date)}</TableCell>
                      <TableCell className="text-sm">{f.description}</TableCell>
                      <TableCell>{typeBadge(f.type)}</TableCell>
                      <TableCell>{paymentBadge(f)}</TableCell>
                      <TableCell>
                        {f.paidMethod === "peko_card" ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Yes</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-normal">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(f.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-[11px] text-muted-foreground">{invoiceNo}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs"
                            onClick={() => toast.success(`Tax invoice ${invoiceNo} downloaded (PDF).`)}
                          >
                            <Download className="h-3 w-3" /> PDF
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono text-[11px] text-muted-foreground">{receiptNo}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 text-xs"
                            onClick={() => toast.success(`Payment receipt ${receiptNo} downloaded (PDF).`)}
                          >
                            <Download className="h-3 w-3" /> PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="mt-4 space-y-4">
          <Card className="shadow-soft border-primary/30 bg-primary/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Event-driven billing</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Each fee below is bound to a trigger event. When the event fires, the system auto-generates an
                    outstanding bill with a tax invoice and notifies the admin to settle it via the payment gateway.
                    Simulate any trigger to see the flow end-to-end.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4" /> Fee catalog
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Code</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Trigger event</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right w-[180px]">Simulate trigger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeCatalog.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.code}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="secondary" className="w-fit font-mono text-[10px]">{item.trigger}</Badge>
                          <span className="text-xs text-muted-foreground">{item.triggerLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.taxCode}</TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(item.price)}</div>
                        <div className="text-[11px] text-muted-foreground capitalize">{item.recurrence.replace("-", " ")}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs"
                          onClick={() => fireTrigger(item, item.recurrence === "monthly" ? undefined : "Simulated event")}
                        >
                          <Zap className="h-3 w-3" /> Fire event
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment gateway dialog */}
      <Dialog open={!!payTarget} onOpenChange={(o) => !o && setPayTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay service fee</DialogTitle>
            <DialogDescription>
              {payTarget?.description} — <span className="font-medium text-foreground">{payTarget && formatCurrency(payTarget.amount)}</span>
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={method} onValueChange={(v) => setMethod(v as ServiceFeePaymentMethod)} className="space-y-3">
            <Label htmlFor="peko" className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-secondary/40">
              <RadioGroupItem id="peko" value="peko_card" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" /> Peko corporate card
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Will be added to the Account Statement as a standard card spend.
                </p>
                {method === "peko_card" && (
                  <Select value={cardId} onValueChange={setCardId}>
                    <SelectTrigger className="mt-2 h-9"><SelectValue placeholder="Select a card" /></SelectTrigger>
                    <SelectContent>
                      {activeCorporateCards().map((c) => {
                        const m = memberById(c.memberId);
                        return (
                          <SelectItem key={c.id} value={c.id}>
                            •• {c.last4} — {m?.name ?? "—"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </Label>

            <Label htmlFor="ext" className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 hover:bg-secondary/40">
              <RadioGroupItem id="ext" value="external_gateway" className="mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" /> External card via payment gateway
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Paid outside the corporate account — will <span className="font-medium">not</span> appear on the Account Statement.
                </p>
                {method === "external_gateway" && (
                  <Input
                    value={externalLast4}
                    onChange={(e) => setExternalLast4(e.target.value.slice(0, 4))}
                    placeholder="Last 4 digits"
                    inputMode="numeric"
                    className="mt-2 h-9"
                  />
                )}
              </div>
            </Label>
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button onClick={confirmPay} className="gap-1">
              <ShieldCheck className="h-4 w-4" /> Pay {payTarget && formatCurrency(payTarget.amount)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ServiceFees;
