import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cards, formatCurrency, memberById, type Card as CardModel } from "@/lib/mockData";
import { Plus, Snowflake, ArrowLeftRight, CreditCard, Settings2, Sun, AlertTriangle, RefreshCcw, Ban, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const MERCHANT_CATEGORIES = [
  "Software & SaaS",
  "Travel & Transportation",
  "Lodging & Hotels",
  "Restaurants & Food",
  "Office Supplies",
  "Marketing & Advertising",
  "Professional Services",
  "Utilities & Telecom",
  "Entertainment",
  "ATM & Cash",
];

const REGIONS = [
  "North America",
  "Europe (EEA)",
  "United Kingdom",
  "Latin America",
  "Middle East",
  "Africa",
  "Asia Pacific",
  "Oceania",
];

const statusBadge = (status: string) => {
  if (status === "active") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Active</Badge>;
  if (status === "frozen") return <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Frozen</Badge>;
  return <Badge variant="secondary">Expired</Badge>;
};

const typeBadge = (type: string) => {
  const label = type.replace("-", " ");
  return <Badge variant="outline" className="capitalize">{label}</Badge>;
};

const Cards = () => {
  const [filter, setFilter] = useState<"all" | "virtual" | "physical" | "single-use">("all");
  const filtered = filter === "all" ? cards : cards.filter((c) => c.type === filter);

  return (
    <AppLayout
      title="Cards"
      subtitle={`${cards.length} cards issued across your team.`}
      actions={
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Issue new card
            </Button>
          </DialogTrigger>
          <IssueCardDialog />
        </Dialog>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "virtual", "physical", "single-use"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All cards" : f.replace("-", " ")}
          </Button>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card</TableHead>
                <TableHead>Cardholder</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Per-txn limit</TableHead>
                <TableHead className="w-[260px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((card) => {
                const member = memberById(card.memberId);
                return (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-10 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-sm">•• {card.last4}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{member?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{member?.department}</p>
                    </TableCell>
                    <TableCell>{typeBadge(card.type)}</TableCell>
                    <TableCell>{statusBadge(card.status)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(card.balance)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(card.spent)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatCurrency(card.spendLimit)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <CardFundsDialog card={card} mode="add" />
                        <CardFundsDialog card={card} mode="withdraw" />
                        <ManageCardDialog card={card} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

function CardFundsDialog({ card, mode }: { card: CardModel; mode: "add" | "withdraw" }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const isAdd = mode === "add";

  const submit = () => {
    if (!amount || Number(amount) <= 0) return toast.error("Enter a valid amount");
    if (!isAdd && Number(amount) > card.balance) return toast.error("Amount exceeds card balance");
    toast.success(`Transfer submitted for approval (${isAdd ? "Wallet → Card" : "Card → Wallet"})`);
    setOpen(false);
    setAmount(""); setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1" title={isAdd ? "Add funds" : "Withdraw"}>
          {isAdd ? <Plus className="h-3.5 w-3.5" /> : <ArrowLeftRight className="h-3.5 w-3.5" />}
          <span className="hidden lg:inline">{isAdd ? "Add" : "Withdraw"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdd ? "Add funds to card" : "Withdraw funds from card"}</DialogTitle>
          <DialogDescription>
            •• {card.last4} · {memberById(card.memberId)?.name} · current balance {formatCurrency(card.balance)}.
            All transfers require admin approval.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Amount (USD)</Label>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Reason (optional)</Label>
            <Input placeholder="e.g. Top up for travel" value={reason} onChange={(e) => setReason(e.target.value)} />
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

function IssueCardDialog() {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Issue a new card</DialogTitle>
        <DialogDescription>Configure the card type, limits, and assigned member.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Card type</Label>
          <Select defaultValue="virtual">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="single-use">Single-use</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Assign to member</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="m2">Marcus Patel — Sales</SelectItem>
              <SelectItem value="m3">Elena Rodriguez — Marketing</SelectItem>
              <SelectItem value="m4">James O'Connor — Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Per-transaction limit</Label>
          <Input type="number" placeholder="5000" />
          <p className="text-xs text-muted-foreground">Maximum amount allowed for a single transaction.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Allowed merchant categories</Label>
          <Input placeholder="e.g. Software, Travel, Office" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Issue card</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default Cards;
