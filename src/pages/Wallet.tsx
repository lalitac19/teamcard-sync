import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  walletBalance, walletReserved, walletTopUps, walletTransfers,
  cards, memberById, cardById,
  formatCurrency, formatDate,
  type TransferDirection,
} from "@/lib/mockData";
import {
  ArrowDownLeft, ArrowUpRight, Plus, Banknote, ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";

const directionLabel = (d: TransferDirection) => {
  if (d === "wallet_to_card") return "Wallet → Card";
  return "Card → Wallet";
};

const transferStatusBadge = (s: "pending" | "approved" | "rejected") => {
  if (s === "approved") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Approved</Badge>;
  if (s === "rejected") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Rejected</Badge>;
  return <Badge className="bg-warning/10 text-warning hover:bg-warning/10 border-0">Pending approval</Badge>;
};

const Wallet = () => {
  const totalAllocated = useMemo(
    () => cards.reduce((s, c) => s + c.balance, 0),
    [],
  );

  return (
    <AppLayout
      title="Wallet"
      subtitle="Top up from your bank, then move funds between the main wallet and cards."
      actions={
        <div className="flex gap-2">
          <MoveMoneyDialog />
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Top up wallet</Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 gradient-hero text-white border-0 shadow-card">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-white/60">Main wallet · Available</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(walletBalance)}</p>
            <div className="mt-6 grid grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
              <div>
                <p className="text-white/60">Allocated to cards</p>
                <p className="mt-1 font-semibold">{formatCurrency(totalAllocated)}</p>
              </div>
              <div>
                <p className="text-white/60">Reserved</p>
                <p className="mt-1 font-semibold">{formatCurrency(walletReserved)}</p>
              </div>
              <div>
                <p className="text-white/60">Account</p>
                <p className="mt-1 font-mono text-xs">•••• 4521 USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2"><ArrowDownLeft className="h-4 w-4" /> ACH transfer in</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><ArrowUpRight className="h-4 w-4" /> Wire instructions</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><Banknote className="h-4 w-4" /> Auto top-up rules</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="topups">
          <TabsList>
            <TabsTrigger value="topups">Top-up history</TabsTrigger>
            <TabsTrigger value="transfers">Card transfers</TabsTrigger>
            <TabsTrigger value="balances">Card balances</TabsTrigger>
          </TabsList>

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

          <TabsContent value="transfers" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {walletTransfers.map((t) => {
                      const fromCard = t.fromCardId ? cardById(t.fromCardId) : undefined;
                      const toCard = t.toCardId ? cardById(t.toCardId) : undefined;
                      const fromLabel = t.direction === "wallet_to_card"
                        ? "Main wallet"
                        : fromCard ? `${memberById(fromCard.memberId)?.name} •• ${fromCard.last4}` : "—";
                      const toLabel = t.direction === "card_to_wallet"
                        ? "Main wallet"
                        : toCard ? `${memberById(toCard.memberId)?.name} •• ${toCard.last4}` : "—";
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="text-sm text-muted-foreground">{formatDate(t.date)}</TableCell>
                          <TableCell className="text-xs">{directionLabel(t.direction)}</TableCell>
                          <TableCell className="text-sm">{fromLabel}</TableCell>
                          <TableCell className="text-sm">{toLabel}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{t.reason ?? "—"}</TableCell>
                          <TableCell>{transferStatusBadge(t.status)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(t.amount)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balances" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cardholder</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Per-txn limit</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">Card balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cards.map((c) => {
                      const m = memberById(c.memberId);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm font-medium">{m?.name}</TableCell>
                          <TableCell className="text-sm">•• {c.last4} <span className="text-xs text-muted-foreground capitalize">({c.type})</span></TableCell>
                          <TableCell className="text-xs capitalize text-muted-foreground">{c.status}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(c.spendLimit)}</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(c.spent)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(c.balance)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

function MoveMoneyDialog() {
  const [direction, setDirection] = useState<TransferDirection>("wallet_to_card");
  const [fromCard, setFromCard] = useState<string>("");
  const [toCard, setToCard] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!amount) return toast.error("Enter an amount");
    if (direction === "card_to_wallet" && !fromCard) {
      return toast.error("Select a source card");
    }
    if (direction === "wallet_to_card" && !toCard) {
      return toast.error("Select a destination card");
    }
    toast.success("Transfer submitted for approval");
    setOpen(false);
    setAmount(""); setReason(""); setFromCard(""); setToCard("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <ArrowLeftRight className="h-4 w-4" /> Move money
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move money</DialogTitle>
          <DialogDescription>
            Move funds between the main wallet and issued cards. All transfers require admin approval.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as TransferDirection)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wallet_to_card">Main wallet → Card</SelectItem>
                <SelectItem value="card_to_wallet">Card → Main wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(direction === "card_to_wallet" || direction === "card_to_card") && (
            <div className="space-y-1.5">
              <Label>From card</Label>
              <Select value={fromCard} onValueChange={setFromCard}>
                <SelectTrigger><SelectValue placeholder="Select source card" /></SelectTrigger>
                <SelectContent>
                  {cards.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {memberById(c.memberId)?.name} — •• {c.last4} ({formatCurrency(c.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(direction === "wallet_to_card" || direction === "card_to_card") && (
            <div className="space-y-1.5">
              <Label>To card</Label>
              <Select value={toCard} onValueChange={setToCard}>
                <SelectTrigger><SelectValue placeholder="Select destination card" /></SelectTrigger>
                <SelectContent>
                  {cards.filter((c) => c.id !== fromCard).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {memberById(c.memberId)?.name} — •• {c.last4}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Amount (USD)</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Reason (optional)</Label>
            <Input placeholder="e.g. Q4 marketing budget reallocation" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Submit for approval</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Wallet;
