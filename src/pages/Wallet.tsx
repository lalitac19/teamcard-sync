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
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  walletTopUps, cards as allCards, walletBalance, walletAvailable,
  totalAllocatedLimits, memberById,
  formatCurrency, formatDate,
} from "@/lib/mockData";
import {
  ArrowDownLeft, ArrowUpRight, Plus, Banknote, Wallet as WalletIcon, Lock,
} from "lucide-react";
import { toast } from "sonner";

const Wallet = () => {
  const allocated = useMemo(() => totalAllocatedLimits(), []);
  const available = useMemo(() => walletAvailable(), []);
  const activeCards = useMemo(
    () => allCards.filter((c) => c.status !== "terminated"),
    [],
  );

  return (
    <AppLayout
      title="Wallet"
      subtitle="Top up the wallet, then allocate limits to cards. Allocated funds are locked to that card until you reallocate."
      actions={
        <div className="flex gap-2">
          <TopUpDialog />
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 gradient-hero text-white border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-white/60">Wallet · Total balance</p>
              <Badge className="bg-white/15 text-white border-0 hover:bg-white/15 gap-1">
                <WalletIcon className="h-3 w-3" /> Wallet
              </Badge>
            </div>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(walletBalance)}</p>
            <p className="mt-1 text-xs text-white/60">
              The wallet is a pool of funds — not a card. Money is spent only after it is allocated to a card as a limit.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
              <div>
                <p className="text-white/60 flex items-center gap-1"><Lock className="h-3 w-3" /> Locked to cards</p>
                <p className="mt-1 font-semibold">{formatCurrency(allocated)}</p>
                <p className="text-xs text-white/50">{activeCards.length} cards</p>
              </div>
              <div>
                <p className="text-white/60">Available to allocate</p>
                <p className="mt-1 font-semibold">{formatCurrency(available)}</p>
                <p className="text-xs text-white/50">Issue cards or raise limits</p>
              </div>
              <div>
                <p className="text-white/60">Funding account</p>
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
            <TabsTrigger value="allocations">Locked allocations</TabsTrigger>
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

          <TabsContent value="allocations" className="mt-4">
            <Card className="shadow-soft">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cardholder</TableHead>
                      <TableHead>Card</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Locked limit</TableHead>
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
                          <TableCell className="text-sm">•• {c.last4} <span className="text-xs text-muted-foreground capitalize">({c.type})</span></TableCell>
                          <TableCell className="text-xs capitalize text-muted-foreground">{c.status}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatCurrency(c.spendLimit)}</TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(c.spent)}</TableCell>
                          <TableCell className="text-right text-sm">{formatCurrency(remaining)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={3} className="text-sm font-medium">Total locked</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(allocated)}</TableCell>
                      <TableCell colSpan={2} className="text-right text-xs text-muted-foreground">
                        Available: {formatCurrency(available)} of {formatCurrency(walletBalance)}
                      </TableCell>
                    </TableRow>
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

function TopUpDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const submit = () => {
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    toast.success(`Top-up of ${Number(amount).toLocaleString("en-US", { style: "currency", currency: "USD" })} initiated`);
    setOpen(false);
    setAmount(""); setReference("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Top up wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top up wallet</DialogTitle>
          <DialogDescription>
            Funds added here become available to allocate as spending limits to cards. Allocating a limit locks that amount in the wallet until you reallocate it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Amount (USD)</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Reference (optional)</Label>
            <Input placeholder="e.g. WIRE-NOV-001" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Initiate top-up</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Wallet;
