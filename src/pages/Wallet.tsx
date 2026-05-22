import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  totalSpentAcrossCards, memberById,
  formatCurrency, formatDate,
} from "@/lib/mockData";
import { Plus, Wallet as WalletIcon, Lock, Copy, Info } from "lucide-react";
import { toast } from "sonner";

// Company-specific bank details (assigned on onboarding)
const COMPANY_BANK = {
  beneficiary: "Peko Technologies Inc.",
  iban: "GB29 PEKO 0000 0012 3456 78",
  bic: "PEKOGB2LXXX",
  bankName: "Peko Banking Partner, London",
  bankAddress: "1 Finsbury Avenue, London EC2M 2PP",
  reference: "PEKO-CLIENT-00421",
};

const Wallet = () => {
  const spent = useMemo(() => totalSpentAcrossCards(), []);
  const available = useMemo(() => walletAvailable(), []);
  const activeCards = useMemo(
    () => allCards.filter((c) => c.status !== "terminated"),
    [],
  );
  const totalCaps = useMemo(
    () => activeCards.reduce((s, c) => s + c.spendLimit, 0),
    [activeCards],
  );

  return (
    <AppLayout
      title="Wallet"
      subtitle="A single wallet funds all cards. Each card reserves its spending cap from the wallet — to issue a new card, the wallet must have enough unallocated funds, otherwise top up or reduce an existing card's limit."
      actions={
        <div className="flex gap-2">
          <TopUpDialog />
        </div>
      }
    >
      <Card className="gradient-hero text-white border-0 shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-white/60">Wallet · Total balance</p>
            <Badge className="bg-white/15 text-white border-0 hover:bg-white/15 gap-1">
              <WalletIcon className="h-3 w-3" /> Wallet
            </Badge>
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(walletBalance)}</p>
          <p className="mt-1 text-xs text-white/60">
            Shared pool — every active card draws from this same balance. Spend caps on cards are limits, not reservations.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
            <div>
              <p className="text-white/60">Spent from wallet</p>
              <p className="mt-1 font-semibold">{formatCurrency(spent)}</p>
              <p className="text-xs text-white/50">{activeCards.length} active cards</p>
            </div>
            <div>
              <p className="text-white/60">Available to spend</p>
              <p className="mt-1 font-semibold">{formatCurrency(available)}</p>
              <p className="text-xs text-white/50">First spend wins</p>
            </div>
            <div>
              <p className="text-white/60">Funding IBAN</p>
              <p className="mt-1 font-mono text-xs">{COMPANY_BANK.iban}</p>
              <p className="text-xs text-white/50">Unique to your company</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Tabs defaultValue="topups">
          <TabsList>
            <TabsTrigger value="topups">Top-up history</TabsTrigger>
            <TabsTrigger value="allocations">Card spend caps</TabsTrigger>
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
                      <TableHead className="text-right">Spend cap</TableHead>
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
                        Wallet available: {formatCurrency(available)} of {formatCurrency(walletBalance)}
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
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Top up wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Top up wallet — bank transfer details</DialogTitle>
          <DialogDescription>
            Transfer funds to your company's unique IBAN below. Once received, the wallet balance updates automatically and becomes immediately spendable by any active card.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <CopyField label="Beneficiary" value={COMPANY_BANK.beneficiary} mono={false} />
          <CopyField label="IBAN" value={COMPANY_BANK.iban} />
          <CopyField label="BIC / SWIFT" value={COMPANY_BANK.bic} />
          <CopyField label="Bank" value={COMPANY_BANK.bankName} mono={false} />
          <CopyField label="Bank address" value={COMPANY_BANK.bankAddress} mono={false} />
          <CopyField label="Payment reference (required)" value={COMPANY_BANK.reference} />
          <div className="flex items-start gap-2 rounded-md bg-info/10 p-3 text-xs text-info">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Always include the payment reference so we can auto-match your transfer. Transfers usually settle in 1–2 business days.
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
