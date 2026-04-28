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
import { Plus, Snowflake, ArrowLeftRight, CreditCard, Settings2, Sun, AlertTriangle, RefreshCcw, Ban, ShieldCheck, History, Plus as PlusIcon, Pencil, ShieldAlert, MapPin, Store } from "lucide-react";
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
                        <AuditTrailDialog card={card} />
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

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
];

function MultiSelectChips({
  label, placeholder, options, selected, onChange, allLabel = "All",
}: {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  allLabel?: string;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {selected.length > 0 && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        )}
      </div>
      <div className="rounded-md border border-border p-2">
        {selected.length === 0 ? (
          <p className="px-1 py-0.5 text-xs text-muted-foreground">{allLabel} ({placeholder})</p>
        ) : (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {selected.map((s) => {
              const opt = options.find((o) => o.value === s);
              return (
                <Badge key={s} variant="secondary" className="gap-1">
                  {opt?.label ?? s}
                  <button
                    type="button"
                    onClick={() => toggle(s)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${opt?.label ?? s}`}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
        <div className="max-h-32 overflow-y-auto rounded border border-border/60 bg-secondary/30">
          {options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-secondary"
            >
              <Checkbox
                checked={selected.includes(o.value)}
                onCheckedChange={() => toggle(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function IssueCardDialog() {
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

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
        <MultiSelectChips
          label="Allowed merchant categories"
          placeholder="all categories allowed"
          allLabel="No restrictions"
          options={MERCHANT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          selected={categories}
          onChange={setCategories}
        />
        <MultiSelectChips
          label="Allowed countries"
          placeholder="all countries allowed"
          allLabel="No restrictions"
          options={COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }))}
          selected={countries}
          onChange={setCountries}
        />
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button onClick={() => toast.success("Card issued")}>Issue card</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ManageCardDialog({ card }: { card: CardModel }) {
  const [open, setOpen] = useState(false);
  const member = memberById(card.memberId);

  // Status / lifecycle
  const [frozen, setFrozen] = useState(card.status === "frozen");

  // Limits
  const [perTxnLimit, setPerTxnLimit] = useState(String(card.spendLimit));

  // Merchant controls
  const initialAllowed = card.merchantCategories?.length
    ? card.merchantCategories
    : MERCHANT_CATEGORIES.slice(0, 6);
  const [merchantMode, setMerchantMode] = useState<"allow" | "block">("allow");
  const [merchants, setMerchants] = useState<string[]>(initialAllowed);

  // Geography controls
  const [geoMode, setGeoMode] = useState<"allow" | "block">("allow");
  const [regions, setRegions] = useState<string[]>(["North America", "Europe (EEA)"]);
  const [allowOnline, setAllowOnline] = useState(true);
  const [allowAtm, setAllowAtm] = useState(false);

  // Replace card
  const [replaceReason, setReplaceReason] = useState<"lost" | "stolen" | "damaged" | "other">("lost");
  const [replaceType, setReplaceType] = useState<"physical" | "virtual">(card.type === "virtual" ? "virtual" : "physical");
  const [replaceNotes, setReplaceNotes] = useState("");

  // Terminate
  const [terminateConfirm, setTerminateConfirm] = useState("");

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const saveControls = () => {
    toast.success("Card controls updated");
    setOpen(false);
  };

  const handleFreezeToggle = (val: boolean) => {
    setFrozen(val);
    toast.success(val ? "Card frozen" : "Card unfrozen");
  };

  const handleReplace = () => {
    toast.success(`Replacement ${replaceType} card requested (${replaceReason})`);
    setOpen(false);
  };

  const handleTerminate = () => {
    if (terminateConfirm.trim().toUpperCase() !== "TERMINATE") {
      return toast.error('Type "TERMINATE" to confirm');
    }
    toast.success(`Card •• ${card.last4} terminated`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Manage card">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage card •• {card.last4}</DialogTitle>
          <DialogDescription>
            {member?.name} · {card.type} card · balance {formatCurrency(card.balance)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="limits">Limits</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          </TabsList>

          {/* Status */}
          <TabsContent value="status" className="space-y-4 pt-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Snowflake className="h-5 w-5 text-info" />
                <div>
                  <p className="text-sm font-medium">Freeze card</p>
                  <p className="text-xs text-muted-foreground">
                    Temporarily block all transactions. You can unfreeze any time.
                  </p>
                </div>
              </div>
              <Switch checked={frozen} onCheckedChange={handleFreezeToggle} />
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" /> Current state
              </p>
              <p className="text-xs text-muted-foreground">
                {frozen
                  ? "All purchases are declined. Existing authorizations may still settle."
                  : "Card is active and accepting transactions per the configured limits and controls."}
              </p>
            </div>

            <section className="space-y-3 rounded-lg border border-destructive/40 p-4">
              <p className="text-sm font-medium text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Terminate card
              </p>
              <p className="text-xs text-muted-foreground">
                Permanently cancels the card. Remaining balance ({formatCurrency(card.balance)}) will
                be returned to the wallet. This action cannot be undone.
              </p>
              <div className="space-y-1.5">
                <Label>Type <span className="font-mono">TERMINATE</span> to confirm</Label>
                <Input
                  value={terminateConfirm}
                  onChange={(e) => setTerminateConfirm(e.target.value)}
                  placeholder="TERMINATE"
                />
              </div>
              <Button variant="destructive" onClick={handleTerminate} className="gap-2">
                <Ban className="h-4 w-4" /> Terminate card
              </Button>
            </section>
          </TabsContent>

          {/* Limits */}
          <TabsContent value="limits" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label>Per-transaction limit (USD)</Label>
              <Input
                type="number"
                value={perTxnLimit}
                onChange={(e) => setPerTxnLimit(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum amount allowed for a single transaction on this card.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveControls}>Save limits</Button>
            </DialogFooter>
          </TabsContent>

          {/* Controls: merchant & geography */}
          <TabsContent value="controls" className="space-y-6 pt-4">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Merchant categories</p>
                  <p className="text-xs text-muted-foreground">
                    Restrict or allow specific merchant categories.
                  </p>
                </div>
                <Select value={merchantMode} onValueChange={(v) => setMerchantMode(v as "allow" | "block")}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow only selected</SelectItem>
                    <SelectItem value="block">Block selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                {MERCHANT_CATEGORIES.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={merchants.includes(m)}
                      onCheckedChange={() => toggleItem(merchants, setMerchants, m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Geography</p>
                  <p className="text-xs text-muted-foreground">
                    Restrict where this card can be used.
                  </p>
                </div>
                <Select value={geoMode} onValueChange={(v) => setGeoMode(v as "allow" | "block")}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow only selected</SelectItem>
                    <SelectItem value="block">Block selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                {REGIONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={regions.includes(r)}
                      onCheckedChange={() => toggleItem(regions, setRegions, r)}
                    />
                    {r}
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">Online / e-commerce</span>
                  <Switch checked={allowOnline} onCheckedChange={setAllowOnline} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">ATM withdrawals</span>
                  <Switch checked={allowAtm} onCheckedChange={setAllowAtm} />
                </div>
              </div>
            </section>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveControls}>Save controls</Button>
            </DialogFooter>
          </TabsContent>

          {/* Lifecycle: replace + terminate */}
          <TabsContent value="lifecycle" className="space-y-6 pt-4">
            <section className="space-y-3 rounded-lg border p-4">
              <p className="text-sm font-medium flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" /> Replace card
              </p>
              <p className="text-xs text-muted-foreground">
                The current card will be cancelled immediately and a new one issued.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Reason</Label>
                  <Select value={replaceReason} onValueChange={(v) => setReplaceReason(v as typeof replaceReason)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="stolen">Stolen</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Replacement type</Label>
                  <Select value={replaceType} onValueChange={(v) => setReplaceType(v as typeof replaceType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Textarea
                  rows={2}
                  placeholder="Shipping notes, urgency, etc."
                  value={replaceNotes}
                  onChange={(e) => setReplaceNotes(e.target.value)}
                />
              </div>
              <Button onClick={handleReplace} className="gap-2">
                <RefreshCcw className="h-4 w-4" /> Request replacement
              </Button>
            </section>

          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

type AuditEvent = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  category: "lifecycle" | "limits" | "controls" | "funds" | "security";
  detail: string;
};

const auditEventsForCard = (card: CardModel): AuditEvent[] => {
  const member = memberById(card.memberId)?.name ?? "Unknown";
  return [
    {
      id: "a1",
      ts: "2024-10-22 14:32",
      actor: "Sarah Chen (Admin)",
      action: "Updated per-transaction limit",
      category: "limits",
      detail: `Changed from $${(card.spendLimit * 0.8).toFixed(0)} to $${card.spendLimit}`,
    },
    {
      id: "a2",
      ts: "2024-10-20 09:14",
      actor: "Sarah Chen (Admin)",
      action: "Added merchant restriction",
      category: "controls",
      detail: "Blocked category: ATM & Cash",
    },
    {
      id: "a3",
      ts: "2024-10-18 17:05",
      actor: "System",
      action: "Transaction declined",
      category: "security",
      detail: "Geo restriction — attempted use in blocked region",
    },
    {
      id: "a4",
      ts: "2024-10-15 11:48",
      actor: "Marcus Patel (Admin)",
      action: card.status === "frozen" ? "Card frozen" : "Card unfrozen",
      category: "lifecycle",
      detail: "Manual action via card management",
    },
    {
      id: "a5",
      ts: "2024-10-10 08:22",
      actor: "Sarah Chen (Admin)",
      action: "Wallet → Card top-up",
      category: "funds",
      detail: `+$${card.balance.toFixed(2)} loaded onto card`,
    },
    {
      id: "a6",
      ts: card.createdAt,
      actor: "Sarah Chen (Admin)",
      action: "Card issued",
      category: "lifecycle",
      detail: `${card.type} card assigned to ${member}`,
    },
  ];
};

const categoryMeta: Record<AuditEvent["category"], { label: string; icon: typeof History; className: string }> = {
  lifecycle: { label: "Lifecycle", icon: PlusIcon, className: "bg-info/10 text-info border-0" },
  limits: { label: "Limits", icon: Pencil, className: "bg-warning/10 text-warning border-0" },
  controls: { label: "Controls", icon: Store, className: "bg-accent/20 text-accent-foreground border-0" },
  funds: { label: "Funds", icon: ArrowLeftRight, className: "bg-success/10 text-success border-0" },
  security: { label: "Security", icon: ShieldAlert, className: "bg-destructive/10 text-destructive border-0" },
};

function AuditTrailDialog({ card }: { card: CardModel }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | AuditEvent["category"]>("all");
  const events = auditEventsForCard(card);
  const filtered = filter === "all" ? events : events.filter((e) => e.category === filter);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" title="Audit trail">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit trail · •• {card.last4}</DialogTitle>
          <DialogDescription>
            Chronological log of every change and action performed on this card.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 pt-2">
          {(["all", "lifecycle", "limits", "controls", "funds", "security"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "all" ? "All events" : categoryMeta[f].label}
            </Button>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          {filtered.map((e) => {
            const meta = categoryMeta[e.category];
            const Icon = meta.icon;
            return (
              <div key={e.id} className="flex gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{e.action}</p>
                    <Badge className={meta.className}>{meta.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.detail}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.ts} · {e.actor}
                  </p>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No events for this filter.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={() => toast.success("Audit log exported (CSV)")}>Export CSV</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Cards;
