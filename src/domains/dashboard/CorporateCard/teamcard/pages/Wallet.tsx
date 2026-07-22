import { useMemo, useState } from "react";
import { AppLayout } from "@src/domains/dashboard/CorporateCard/teamcard/components/AppLayout";
import { Card, CardContent } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/card";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Badge } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/badge";
import { Input } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/input";
import { Label } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/table";

import {
  walletTopUps,
  cards as allCards,
  memberById,
  formatCurrency,
  formatDate,
  fmtCycleDate,
  corporateCreditLimit,
  surplusFunds,
  currentCycleAccrual,
  unpaidBillsTotal,
  availableCredit,
  currentCycle,
  bills,
  creditLimitHistory,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { Plus, Copy, Info, ArrowRight, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

import { toast } from "sonner";

const COMPANY_BANK = {
  beneficiary: "Peko Technologies Inc.",
  iban: "GB29 PEKO 0000 0012 3456 78",
  bic: "PEKOGB2LXXX",
  bankName: "Peko Banking Partner, London",
  bankAddress: "1 Finsbury Avenue, London EC2M 2PP",
  reference: "PEKO-CLIENT-00421",
};

const Wallet = () => {
  const [creditLimit, setCreditLimit] = useState(corporateCreditLimit);
  const [surplus, setSurplus] = useState(surplusFunds);
  const [convertOpen, setConvertOpen] = useState(false);

  const activeCards = useMemo(
    () => allCards.filter((c) => c.status !== "terminated"),
    [],
  );

  const cycleAccrual = useMemo(() => currentCycleAccrual(), []);
  const unpaidBills = useMemo(() => unpaidBillsTotal(), []);
  const availableLimit = useMemo(
    () => Math.max(0, creditLimit + surplus - cycleAccrual - unpaidBills),
    [creditLimit, surplus, cycleAccrual, unpaidBills],
  );

  const cycle = useMemo(() => currentCycle(), []);
  const cycleLabel = `${fmtCycleDate(cycle.start)} to ${fmtCycleDate(cycle.end)}`;

  const handleConvert = (amount: number) => {
    if (amount <= 0 || amount > surplus) return;
    setCreditLimit((prev) => prev + amount);
    setSurplus((prev) => prev - amount);
    setConvertOpen(false);
    toast.success(`AED ${amount.toLocaleString()} moved from surplus to Corporate Credit Limit`);
  };

  return (
    <AppLayout
      title="Corporate Account"
      subtitle={`Secured credit model. Current billing cycle: ${cycleLabel}. Available Limit = Corporate Credit Limit + Surplus Funds − Current Accrual − Unpaid Bills.`}
      actions={<FundAccountDialog />}
    >
      {/* Available Limit hero */}
      <Card className="mb-6 shadow-soft border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Limit</p>
              <p className="mt-1 text-4xl font-semibold">{formatCurrency(availableLimit)}</p>
              <p className="text-sm text-muted-foreground mt-1">Available to spend across all cards right now</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setConvertOpen(true)} disabled={surplus <= 0}>
                <TrendingUp className="h-4 w-4" /> Use surplus to increase limit
              </Button>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
            <BreakdownItem label="Corporate Credit Limit" value={creditLimit} />
            <BreakdownItem label="Surplus Funds" value={surplus} highlight={surplus > 0} />
            <BreakdownItem label="Current Cycle Accrual" value={cycleAccrual} negative />
            <BreakdownItem label="Unpaid Bills" value={unpaidBills} negative />
          </div>

          {unpaidBills > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-warning/10 p-3 text-xs text-warning">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>
                {formatCurrency(unpaidBills)} in unpaid bills is locked against your Corporate Credit Limit. If not paid by month-end, your limit will drop automatically and permanently.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funding IBAN */}
      <Card className="mb-6 shadow-soft">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Funding IBAN</p>
            <Badge variant="secondary" className="font-normal text-xs">Unique to your company</Badge>
          </div>
          <CopyField label="IBAN" value={COMPANY_BANK.iban} />
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3 shrink-0" />
            Bank transfer is the only accepted funding route · Include payment reference · Settles in 1–2 business days
          </p>
        </CardContent>
      </Card>

      {/* Surplus conversion dialog (controlled from hero) */}
      <ConvertSurplusDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        surplus={surplus}
        onConvert={handleConvert}
      />

      {/* Tabs */}
      <Tabs defaultValue="funding">
        <TabsList>
          <TabsTrigger value="funding">Funding history</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="limits">Limit history</TabsTrigger>
          <TabsTrigger value="allocations">Card spend limits</TabsTrigger>
        </TabsList>

        <TabsContent value="funding" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletTopUps.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(w.date)}</TableCell>
                      <TableCell className="font-mono text-xs">{w.reference}</TableCell>
                      <TableCell className="text-sm">{w.source}</TableCell>
                      <TableCell>
                        {w.status === "completed" ? (
                          <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Completed</Badge>
                        ) : (
                          <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Processing</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-success">
                        +{formatCurrency(w.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Billed</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((b) => {
                    const balance = Math.max(0, b.amount - (b.paidAmount ?? 0));
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm">{fmtCycleDate(new Date(b.cycleStart))} to {fmtCycleDate(new Date(b.cycleEnd))}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(b.issueDate)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(b.dueDate)}</TableCell>
                        <TableCell>
                          <BillStatusBadge status={b.status} />
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatCurrency(b.amount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(b.paidAmount ?? 0)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatCurrency(balance)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">New Limit</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditLimitHistory.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(e.date)}</TableCell>
                      <TableCell>
                        <LimitEventBadge type={e.type} />
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate" title={e.reason}>{e.reason}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {e.delta >= 0 ? `+${formatCurrency(e.delta)}` : `−${formatCurrency(Math.abs(e.delta))}`}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(e.resultingLimit)}</TableCell>
                      <TableCell className="font-mono text-xs">{e.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cardholder</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Spend limit</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCards.map((c) => {
                    const m = memberById(c.memberId);
                    const remaining = Math.max(0, c.spendLimit - c.spent);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                        <TableCell className="text-sm">
                          •• {c.last4}{" "}
                          <span className="text-xs text-muted-foreground capitalize">({c.type})</span>
                        </TableCell>
                        <TableCell className="text-xs capitalize text-muted-foreground">{c.status}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatCurrency(c.spendLimit)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(c.spent)}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(remaining)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

function BreakdownItem({ label, value, highlight, negative }: { label: string; value: number; highlight?: boolean; negative?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${negative ? "text-destructive" : highlight ? "text-success" : ""}`}>
        {negative && value > 0 ? "−" : ""}{formatCurrency(value)}
      </p>
    </div>
  );
}

function BillStatusBadge({ status }: { status: string }) {
  if (status === "paid") {
    return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Paid</Badge>;
  }
  if (status === "partial") {
    return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">Partial</Badge>;
  }
  return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Unpaid</Badge>;
}

function LimitEventBadge({ type }: { type: string }) {
  if (type === "increase") {
    return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0 gap-1"><TrendingUp className="h-3 w-3" /> Increase</Badge>;
  }
  if (type === "decrease") {
    return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0 gap-1"><TrendingDown className="h-3 w-3" /> Decrease</Badge>;
  }
  return <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Initial</Badge>;
}

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-card px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className={`mt-0.5 text-sm ${mono ? "font-mono" : ""} break-all`}>{value}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={copy}>
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function FundAccountDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Fund Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fund Account</DialogTitle>
          <DialogDescription>
            Send a bank transfer to your company's assigned IBAN below. The first funding sets your Corporate Credit Limit; later funding creates surplus funds unless it settles a bill.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <CopyField label="Beneficiary" value={COMPANY_BANK.beneficiary} mono={false} />
          <CopyField label="IBAN (only accepted funding route)" value={COMPANY_BANK.iban} />
          <CopyField label="BIC / SWIFT" value={COMPANY_BANK.bic} />
          <CopyField label="Bank" value={COMPANY_BANK.bankName} mono={false} />
          <CopyField label="Bank address" value={COMPANY_BANK.bankAddress} mono={false} />
          <CopyField label="Payment reference (required)" value={COMPANY_BANK.reference} />
          <div className="flex items-start gap-2 rounded-md bg-info/10 p-3 text-xs text-info">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Always include the payment reference so we can auto-match the transfer. Transfers usually settle in 1–2 business days.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ConvertSurplusDialog({ open, onOpenChange, surplus, onConvert }: { open: boolean; onOpenChange: (v: boolean) => void; surplus: number; onConvert: (amount: number) => void }) {
  const [amount, setAmount] = useState<string>("");

  const parsed = parseFloat(amount);
  const valid = !isNaN(parsed) && parsed > 0 && parsed <= surplus;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onConvert(parsed);
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use surplus to increase credit limit</DialogTitle>
          <DialogDescription>
            Move funds from Surplus Funds to your Corporate Credit Limit. This permanently raises the credit limit and the new limit will be used for future bill calculations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="convert-amount">Amount to convert</Label>
            <Input
              id="convert-amount"
              type="number"
              min={1}
              max={surplus}
              placeholder={`Max ${formatCurrency(surplus)}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Available surplus: {formatCurrency(surplus)}</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid}>Use to increase credit limit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default Wallet;
