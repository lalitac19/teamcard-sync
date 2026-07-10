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

import {
  walletBalance,
  walletTopUps,
  cards as allCards,
  totalSpentAcrossCards,
  totalAllocatedLimits,
  walletAvailable,
  memberById,
  formatCurrency,
  formatDate,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { Plus, Copy, Info, ArrowRight } from "lucide-react";

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
  const activeCards = useMemo(
    () => allCards.filter((c) => c.status !== "terminated"),
    [],
  );
  const totalCaps = useMemo(() => totalAllocatedLimits(), []);
  const totalSpent = useMemo(() => totalSpentAcrossCards(), []);
  const walletAv = useMemo(() => walletAvailable(), []);
  const totalFunded = useMemo(
    () => walletTopUps
      .filter((w) => w.status === "completed")
      .reduce((s, w) => s + w.amount, 0),
    [],
  );

  return (
    <AppLayout
      title="Wallet"
      subtitle="A single pool of funds. All active cards spend from this shared wallet. Card spending caps don't reserve funds — unspent allocation remains in the wallet until it's actually spent."
      actions={<TopUpDialog />}
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Wallet balance</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(walletAv)}</p>
            <p className="text-xs text-muted-foreground mt-1">shared across active cards</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total topped up</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalFunded > 0 ? totalFunded : walletBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">via bank transfer</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Spending activity</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-muted-foreground mt-1">across {activeCards.length} active cards</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Sum of card caps</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalCaps)}</p>
            <p className="text-xs text-muted-foreground mt-1">informational only</p>
          </CardContent>
        </Card>
      </div>

      {/* IBAN */}
      <Card className="mb-6 shadow-soft">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Funding IBAN</p>
            <Badge variant="secondary" className="font-normal text-xs">Unique to your company</Badge>
          </div>
          <CopyField label="IBAN" value={COMPANY_BANK.iban} />
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3 w-3 shrink-0" />
            Wire transfers only · Include payment reference · Settles in 1–2 business days
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="topups">
        <TabsList>
          <TabsTrigger value="topups">Top-up history</TabsTrigger>
          <TabsTrigger value="allocations">Card spend limits</TabsTrigger>
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
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={3} className="text-sm font-medium">Total</TableCell>
                    <TableCell className="text-right text-sm font-semibold">{formatCurrency(totalCaps)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(totalSpent)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      Wallet available: {formatCurrency(walletAv)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Top up wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Top up wallet</DialogTitle>
          <DialogDescription>
            Send a bank transfer to your company's assigned IBAN below. Funds are added to the shared wallet pool and become available to all cards.
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

export default Wallet;
