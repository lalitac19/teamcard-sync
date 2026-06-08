import { useMemo, useState } from "react";
import { AppLayout } from "@src/domains/dashboard/CorporateCard/teamcard/components/AppLayout";
import { Card, CardContent } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/card";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Badge } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/badge";
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
import { Input } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/input";
import { Label } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/label";

import {
  walletTopUps, cards as allCards, walletBalance,
  memberById,
  corporateDeposit, surplusFunds, bills, currentCycle, currentCycleAccrual,
  unpaidBillsTotal, availableCredit, creditLimitHistory,
  cardLimitNotifications, applyCorporateLimitCap,
  formatCurrency, formatDate, fmtCycleDate,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { Plus, ShieldCheck, Copy, Info, AlertTriangle, CalendarClock, ArrowUpRight, ArrowDownRight, Flag, BellRing } from "lucide-react";

import { toast } from "sonner";

const COMPANY_BANK = {
  beneficiary: "Peko Technologies Inc.",
  iban: "GB29 PEKO 0000 0012 3456 78",
  bic: "PEKOGB2LXXX",
  bankName: "Peko Banking Partner, London",
  bankAddress: "1 Finsbury Avenue, London EC2M 2PP",
  reference: "PEKO-CLIENT-00421",
};

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const Wallet = () => {
  // Local mutable card list so the demo can show the cascade effect of a corp-limit decrease.
  const [cardsState, setCardsState] = useState(allCards);
  const activeCards = useMemo(
    () => cardsState.filter((c) => c.status !== "terminated"),
    [cardsState],
  );
  const totalCaps = useMemo(
    () => activeCards.reduce((s, c) => s + c.spendLimit, 0),
    [activeCards],
  );

  const cycle = useMemo(() => currentCycle(), []);
  const accrual = useMemo(() => currentCycleAccrual(), []);
  const unpaid = useMemo(() => unpaidBillsTotal(), []);

  // Local overrides so the corporate can convert surplus → credit limit in the demo.
  const [creditLimit, setCreditLimit] = useState(corporateDeposit);
  const [surplus, setSurplus] = useState(surplusFunds);
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertAmount, setConvertAmount] = useState("");
  const [limitEvents, setLimitEvents] = useState(creditLimitHistory);
  const [notifications, setNotifications] = useState(cardLimitNotifications);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropAmount, setDropAmount] = useState("");

  const available = Math.max(0, creditLimit + surplus - accrual - unpaid);
  const utilization = (accrual / creditLimit) * 100;

  const handleConvert = () => {
    const amt = Number(convertAmount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (amt > surplus) return toast.error("Amount exceeds available surplus");
    setSurplus((s) => s - amt);
    setCreditLimit((l) => l + amt);
    setLimitEvents((evts) => [
      ...evts,
      {
        id: `cl${evts.length + 1}`,
        date: new Date().toISOString().slice(0, 10),
        type: "increase",
        delta: amt,
        resultingLimit: creditLimit + amt,
        reason: "Surplus converted to Corporate Credit Limit",
      },
    ]);
    setConvertOpen(false);
    setConvertAmount("");
    toast.success(`${formatCurrency(amt)} used to increase credit limit. Card limits are unchanged — raise them manually if needed.`);
  };

  // Demo: simulate a corporate-limit decrease (e.g. unpaid bill) and cascade to cards.
  const handleSimulateDrop = () => {
    const newLimit = Number(dropAmount);
    if (!newLimit || newLimit <= 0) return toast.error("Enter a valid new limit");
    if (newLimit >= creditLimit) return toast.error("New limit must be lower than current limit");
    const delta = newLimit - creditLimit;
    const eventId = `cl${limitEvents.length + 1}`;
    const { updatedCards, notifications: newNotifs } = applyCorporateLimitCap(
      newLimit,
      cardsState,
      eventId,
    );
    setCardsState(updatedCards);
    setCreditLimit(newLimit);
    setLimitEvents((evts) => [
      ...evts,
      {
        id: eventId,
        date: new Date().toISOString().slice(0, 10),
        type: "decrease",
        delta,
        resultingLimit: newLimit,
        reason: "Simulated corporate limit decrease",
      },
    ]);
    setNotifications((n) => [...n, ...newNotifs]);
    setDropOpen(false);
    setDropAmount("");
    if (newNotifs.length > 0) {
      toast.success(`Limit dropped to ${formatCurrency(newLimit)}. ${newNotifs.length} cardholder${newNotifs.length === 1 ? "" : "s"} notified.`);
    } else {
      toast.success(`Limit dropped to ${formatCurrency(newLimit)}. No cards exceeded the new limit.`);
    }
  };




  return (
    <AppLayout
      title="Corporate Account"
      subtitle="Your credit limit starts at your first deposit and only goes down if a bill is left unpaid past its due date. Extra payments sit as surplus and boost your available credit without changing the limit itself."
      actions={
        <div className="flex gap-2">
          <TopUpDialog />
        </div>
      }
    >
      {unpaid > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-warning-foreground">
            You have <strong>{formatCurrency(unpaid)}</strong> in unpaid bills. This amount is temporarily held from your available credit. If it is not settled before midnight on the last day of the month, your credit limit will drop by this amount automatically and permanently.
          </p>
        </div>
      )}

      <Card className="gradient-hero text-white border-0 shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-white/60">Available Limit</p>
            <Badge className="bg-white/15 text-white border-0 hover:bg-white/15 gap-1">
              <ShieldCheck className="h-3 w-3" /> Corporate credit
            </Badge>
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(available)}</p>
          <p className="mt-1 text-xs text-white/60">
            Limit {formatCurrency(creditLimit)}
            {surplus > 0 && <> + surplus {formatCurrency(surplus)}</>}
            {" "}− spent this cycle {formatCurrency(accrual)}
            {unpaid > 0 && <> − unpaid bills {formatCurrency(unpaid)}</>}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-white/10 pt-6 text-sm">
            <div>
              <p className="text-white/60">Corporate Credit Limit</p>
              <p className="mt-1 font-semibold">{formatCurrency(creditLimit)}</p>
              <p className="text-xs text-white/50">Set at first funding · only decreases on unpaid bills</p>
            </div>
            <div>
              <p className="text-white/60">Surplus funds</p>
              <p className="mt-1 font-semibold">{formatCurrency(surplus)}</p>
              <p className="text-xs text-white/50">Overpayments held on top of the limit</p>
              {surplus > 0 && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 h-7 text-xs"
                  onClick={() => setConvertOpen(true)}
                >
                  Use to increase the credit limit
                </Button>
              )}
            </div>

            <div>
              <p className="text-white/60">Current cycle spend</p>
              <p className="mt-1 font-semibold">{formatCurrency(accrual)}</p>
              <p className="text-xs text-white/50">
                {fmtCycleDate(cycle.start)} to {fmtCycleDate(cycle.end)} · {utilization.toFixed(0)}% of limit
              </p>
            </div>
            <div>
              <p className="text-white/60">Next bill</p>
              <p className="mt-1 font-semibold flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                Issued {fmtCycleDate(cycle.issue)}
              </p>
              <p className="text-xs text-white/50">Due by {fmtCycleDate(cycle.due)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Tabs defaultValue="bills">
          <TabsList>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="topups">Funding history</TabsTrigger>
            <TabsTrigger value="limit">Limit history</TabsTrigger>
            <TabsTrigger value="allocations">Card spend limits</TabsTrigger>
          </TabsList>

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
                    <TableRow className="bg-info/5">
                      <TableCell className="text-sm font-medium">
                        {fmtCycleDate(cycle.start)} to {fmtCycleDate(cycle.end)}
                        <span className="ml-2 text-xs text-muted-foreground">(open)</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtShort(cycle.issue)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtShort(cycle.due)}</TableCell>
                      <TableCell>
                        <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Accruing</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(accrual)}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">—</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">—</TableCell>
                    </TableRow>
                    {[...bills].reverse().map((b) => {
                      const paid = b.paidAmount ?? (b.status === "paid" ? b.amount : 0);
                      const balance = Math.max(0, b.amount - paid);
                      return (
                      <TableRow key={b.id}>
                      <TableCell className="text-sm">
                        {fmtCycleDate(new Date(b.cycleStart))} to {fmtCycleDate(new Date(b.cycleEnd))}
                      </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(b.issueDate)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(b.dueDate)}</TableCell>
                        <TableCell>
                          {b.status === "paid" ? (
                            <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">
                              Paid {b.paidDate ? `· ${fmtShort(new Date(b.paidDate))}` : ""}
                            </Badge>
                          ) : b.status === "partial" ? (
                            <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">
                              Partial {b.paidDate ? `· ${fmtShort(new Date(b.paidDate))}` : ""}
                            </Badge>
                          ) : b.status === "due" ? (
                            <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Due</Badge>
                          ) : (
                            <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Overdue</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">{formatCurrency(b.amount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(paid)}</TableCell>
                        <TableCell className={`text-right text-sm font-semibold ${balance > 0 ? "text-warning" : "text-muted-foreground"}`}>
                          {formatCurrency(balance)}
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topups" className="mt-4">
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
                        <TableCell className="text-right text-sm font-semibold text-success">+{formatCurrency(w.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="limit" className="mt-4 space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Cascade rule:</span> when the Corporate Credit Limit
                drops (e.g. an unpaid bill), every card whose spend limit is above the new corporate limit is capped
                at it and the cardholder is notified. Limit increases never raise card limits automatically — an
                admin must do that manually.
              </p>
              <Dialog open={dropOpen} onOpenChange={setDropOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="shrink-0 gap-2">
                    <ArrowDownRight className="h-4 w-4" /> Simulate drop
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Simulate a corporate limit decrease</DialogTitle>
                    <DialogDescription>
                      Enter the new (lower) Corporate Credit Limit. Cards above it will be capped and their cardholders notified.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="dropAmt">New Corporate Credit Limit (AED)</Label>
                    <Input
                      id="dropAmt"
                      type="number"
                      placeholder={`Less than ${creditLimit.toLocaleString()}`}
                      value={dropAmount}
                      onChange={(e) => setDropAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Current limit: {formatCurrency(creditLimit)} · Highest card limit:{" "}
                      {formatCurrency(Math.max(...activeCards.map((c) => c.spendLimit), 0))}
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDropOpen(false)}>Cancel</Button>
                    <Button onClick={handleSimulateDrop}>Apply drop</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Resulting limit</TableHead>
                      <TableHead className="text-right">Cards affected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...limitEvents].reverse().map((e) => {
                      const affected = notifications.filter((n) => n.triggerEventId === e.id).length;
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(e.date)}</TableCell>
                          <TableCell>
                            {e.type === "initial" ? (
                              <Badge className="bg-info/10 text-info hover:bg-info/10 border-0 gap-1">
                                <Flag className="h-3 w-3" /> Initial
                              </Badge>
                            ) : e.type === "increase" ? (
                              <Badge className="bg-success/10 text-success hover:bg-success/10 border-0 gap-1">
                                <ArrowUpRight className="h-3 w-3" /> Increase
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0 gap-1">
                                <ArrowDownRight className="h-3 w-3" /> Decrease
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{e.reason}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{e.reference ?? "—"}</TableCell>
                          <TableCell className={`text-right text-sm font-semibold ${e.type === "decrease" ? "text-destructive" : e.type === "increase" ? "text-success" : "text-muted-foreground"}`}>
                            {e.type === "decrease" ? "−" : e.type === "increase" ? "+" : ""}{formatCurrency(Math.abs(e.delta))}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(e.resultingLimit)}</TableCell>
                          <TableCell className="text-right text-sm">
                            {e.type === "decrease" ? (
                              affected > 0 ? (
                                <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">{affected}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-warning" />
                  <h3 className="text-sm font-semibold">Cardholder notifications</h3>
                  <Badge variant="secondary" className="font-normal">{notifications.length}</Badge>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No cardholder notifications yet. They are generated automatically when the Corporate Credit Limit
                    falls below an individual card's spend limit.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Cardholder</TableHead>
                        <TableHead>Card</TableHead>
                        <TableHead className="text-right">Old limit</TableHead>
                        <TableHead className="text-right">New limit</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...notifications].reverse().map((n) => {
                        const m = memberById(n.memberId);
                        const c = cardsState.find((x) => x.id === n.cardId);
                        return (
                          <TableRow key={n.id}>
                            <TableCell className="text-sm text-muted-foreground">{formatDate(n.date)}</TableCell>
                            <TableCell className="text-sm">{m?.name ?? n.memberId}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{c ? `•• ${c.last4}` : n.cardId}</TableCell>
                            <TableCell className="text-right text-sm">{formatCurrency(n.oldLimit)}</TableCell>
                            <TableCell className="text-right text-sm font-semibold text-destructive">{formatCurrency(n.newLimit)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{n.message}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
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
                      <TableHead className="text-right">Cap remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCards.map((c) => {
                      const m = memberById(c.memberId);
                      const remaining = Math.max(0, c.spendLimit - c.spent);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                          <TableCell className="text-sm">•• {c.last4} <span className="text-xs text-muted-foreground capitalize">({c.type})</span></TableCell>
                          <TableCell className="text-xs capitalize text-muted-foreground">{c.status}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(c.spendLimit)}</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(c.spent)}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(remaining)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={3} className="text-sm font-medium">Sum of caps</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(totalCaps)}</TableCell>
                      <TableCell colSpan={2} className="text-right text-xs text-muted-foreground">
                        Backed by Corporate Credit Limit of {formatCurrency(creditLimit)} · Available {formatCurrency(available)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Use surplus to increase credit limit</DialogTitle>
            <DialogDescription>
              Move surplus funds into your Corporate Credit Limit. The increase is permanent — your credit limit grows by the amount used and the surplus drops by the same amount. Available Limit is unchanged.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Current credit limit</p>
                <p className="mt-1 font-semibold">{formatCurrency(creditLimit)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Available surplus</p>
                <p className="mt-1 font-semibold">{formatCurrency(surplus)}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="convert-amount">Amount to use</Label>
              <Input
                id="convert-amount"
                type="number"
                min={0}
                max={surplus}
                placeholder="0.00"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
              />
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setConvertAmount(String(surplus))}
              >
                Use full surplus ({formatCurrency(surplus)})
              </button>
            </div>
            {Number(convertAmount) > 0 && Number(convertAmount) <= surplus && (
              <div className="rounded-md bg-muted/50 p-3 text-xs">
                New credit limit: <strong>{formatCurrency(creditLimit + Number(convertAmount))}</strong> · Remaining surplus: <strong>{formatCurrency(surplus - Number(convertAmount))}</strong>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertOpen(false)}>Cancel</Button>
            <Button onClick={handleConvert}>Use</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>

  );
};

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

function TopUpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Fund Account</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fund Account</DialogTitle>
          <DialogDescription>
            Funding is accepted <strong>only by bank transfer</strong> to your company's assigned IBAN below. The <strong>first funding</strong> you make after onboarding sets your Corporate Credit Limit permanently. After that, funding is used to settle outstanding bills — any amount paid in excess of what was due is held as <strong>surplus funds</strong> and adds to your Available Limit, but does <strong>not</strong> raise your credit limit.
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
              Use the same IBAN to pay your monthly bill. Always include the payment reference so we can auto-match the transfer. Transfers usually settle in 1–2 business days.
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

export default Wallet;
