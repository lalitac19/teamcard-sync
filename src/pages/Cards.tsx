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
import { cards, formatCurrency, memberById, members, walletAvailable, type Card as CardModel } from "@/lib/mockData";
import { Plus, Snowflake, ArrowLeftRight, CreditCard, Settings2, AlertTriangle, RefreshCcw, Ban, ShieldCheck, History, Plus as PlusIcon, Pencil, ShieldAlert, Store, Search, X } from "lucide-react";
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
  if (status === "terminated") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Terminated</Badge>;
  return <Badge variant="secondary">Expired</Badge>;
};

const typeBadge = (type: string) => {
  const label = type.replace("-", " ");
  return <Badge variant="outline" className="capitalize">{label}</Badge>;
};

const Cards = () => {
  const [filter, setFilter] = useState<"all" | "virtual" | "physical" | "single-use">("all");
  const [cardholderId, setCardholderId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "frozen" | "expired">("all");
  const [search, setSearch] = useState("");

  const cardholderOptions = (() => {
    const ids = new Set(cards.map((c) => c.memberId));
    return members.filter((m) => ids.has(m.id));
  })();

  const searchQ = search.trim().toLowerCase();
  const filtered = cards.filter((c) => {
    if (filter !== "all" && c.type !== filter) return false;
    if (cardholderId !== "all" && c.memberId !== cardholderId) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQ) {
      const m = memberById(c.memberId);
      const hay = `${c.last4} ${m?.name ?? ""} ${m?.department ?? ""}`.toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });

  const hasActiveFilter =
    filter !== "all" || cardholderId !== "all" || statusFilter !== "all" || searchQ.length > 0;
  const resetFilters = () => {
    setFilter("all");
    setCardholderId("all");
    setStatusFilter("all");
    setSearch("");
  };

  const available = walletAvailable();

  return (
    <AppLayout
      title="Cards"
      subtitle={`${cards.length} cards issued · ${formatCurrency(available)} available in wallet to allocate.`}
      actions={
        <div className="flex gap-2">
          <FreezeAllDialog />
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Issue card
              </Button>
            </DialogTrigger>
            <IssueCardDialog />
          </Dialog>
        </div>
      }
    >
      {/* Type quick filters */}
      <div className="mb-3 flex flex-wrap gap-2">
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

      {/* Filter bar */}
      <Card className="mb-4 shadow-soft">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Last 4, name, dept…"
                className="h-9 w-[220px] pl-8"
              />
            </div>
          </div>

          {cardholderOptions.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Cardholder</Label>
              <Select value={cardholderId} onValueChange={setCardholderId}>
                <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cardholders</SelectItem>
                  {cardholderOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-3 self-end">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {cards.length}
            </span>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" className="gap-1" onClick={resetFilters}>
                <X className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card</TableHead>
                <TableHead>Cardholder</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend limit</TableHead>
                <TableHead className="text-right">Per-txn limit</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((card) => {
                const member = memberById(card.memberId);
                const remaining = Math.max(0, card.spendLimit - card.spent);
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
                    <TableCell className="text-right text-sm font-semibold">
                      {formatCurrency(card.spendLimit)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {card.txnLimit ? formatCurrency(card.txnLimit) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatCurrency(card.spent)}</TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(remaining)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
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

function FreezeAllDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmText, setConfirmText] = useState("");

  const freezable = cards.filter((c) => c.status === "active");
  const allSelected = freezable.length > 0 && selected.length === freezable.length;
  const count = selected.length;

  const reset = () => {
    setStep("select");
    setSelected([]);
    setConfirmText("");
  };

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : freezable.map((c) => c.id));
  };

  const handleFreeze = () => {
    if (confirmText.trim().toUpperCase() !== "FREEZE") {
      return toast.error('Type "FREEZE" to confirm');
    }
    cards.forEach((c) => {
      if (selected.includes(c.id)) c.status = "frozen";
    });
    toast.success(`Froze ${count} card${count === 1 ? "" : "s"}`);
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2" disabled={freezable.length === 0}>
          <Snowflake className="h-4 w-4" /> Freeze cards
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Freeze cards</DialogTitle>
              <DialogDescription>
                Choose which active cards to freeze. New transactions will be declined until they are unfrozen.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <label className="flex items-center gap-2 rounded-md border bg-secondary/40 px-3 py-2 text-sm font-medium">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                Select all ({freezable.length})
              </label>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
                {freezable.map((c) => {
                  const m = memberById(c.memberId);
                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-secondary/60"
                    >
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onCheckedChange={() => toggle(c.id)}
                      />
                      <span className="font-mono text-xs">•• {c.last4}</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{m?.name ?? "—"}</span>
                      <span className="ml-auto text-xs capitalize text-muted-foreground">{c.type}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setStep("confirm")} disabled={count === 0}>
                OK ({count})
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" /> Confirm freeze
              </DialogTitle>
              <DialogDescription>
                You are about to freeze <span className="font-semibold text-foreground">{count}</span> card
                {count === 1 ? "" : "s"}. Type <span className="font-mono font-semibold">FREEZE</span> below to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5 py-2">
              <Label>Confirmation</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="FREEZE"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
              <Button
                variant="destructive"
                onClick={handleFreeze}
                disabled={confirmText.trim().toUpperCase() !== "FREEZE"}
                className="gap-2"
              >
                <Snowflake className="h-4 w-4" /> Freeze {count} card{count === 1 ? "" : "s"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// (Funds add/withdraw dialog removed — supplementary cards are governed by limit allocation, not balance transfers.)

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
  const [allocatedLimit, setAllocatedLimit] = useState("");
  const [perTxnLimit, setPerTxnLimit] = useState("");

  const available = walletAvailable();
  const requested = Number(allocatedLimit) || 0;
  const exceeds = requested > available;

  const perTxn = Number(perTxnLimit) || 0;
  const perTxnExceedsSpend = perTxn > 0 && requested > 0 && perTxn > requested;

  const submit = () => {
    if (!requested || requested <= 0) return toast.error("Enter the spending limit to allocate to this card");
    if (exceeds) {
      return toast.error(
        `Spending limit exceeds wallet's available balance (${formatCurrency(available)}). Top up the wallet or reduce another card's limit.`,
      );
    }
    if (perTxnExceedsSpend) {
      return toast.error("Per-transaction limit cannot exceed the spending limit");
    }
    toast.success(`Card issued · ${formatCurrency(requested)} locked from wallet${perTxn ? `, ${formatCurrency(perTxn)} per-txn cap` : ""}`);
  };

  return (
    <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Issue a card</DialogTitle>
        <DialogDescription>
          Allocates a spending limit from the wallet's available balance. The amount is locked in the wallet and reserved for this card until reallocated.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="rounded-md border bg-secondary/40 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Wallet available</span>
            <span className="font-semibold">{formatCurrency(available)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">After this allocation</span>
            <span className={exceeds ? "font-semibold text-destructive" : "font-semibold"}>
              {formatCurrency(Math.max(0, available - requested))}
            </span>
          </div>
        </div>

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
          <Label>Spending limit (USD)</Label>
          <Input
            type="number"
            placeholder="5000"
            value={allocatedLimit}
            onChange={(e) => setAllocatedLimit(e.target.value)}
          />
          <p className={`text-xs ${exceeds ? "text-destructive" : "text-muted-foreground"}`}>
            {exceeds
              ? `Exceeds wallet available balance (${formatCurrency(available)}). Top up the wallet or reduce another card's limit.`
              : `Total amount this card can spend in the period. Locked from wallet. Max ${formatCurrency(available)} available.`}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Per-transaction limit (USD, optional)</Label>
          <Input
            type="number"
            placeholder="e.g. 1000"
            value={perTxnLimit}
            onChange={(e) => setPerTxnLimit(e.target.value)}
          />
          <p className={`text-xs ${perTxnExceedsSpend ? "text-destructive" : "text-muted-foreground"}`}>
            {perTxnExceedsSpend
              ? "Per-transaction limit cannot exceed the spending limit."
              : "Caps the size of any single transaction. Leave blank for no per-transaction cap."}
          </p>
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
        <Button onClick={submit} disabled={exceeds || !requested || perTxnExceedsSpend}>Issue card</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function ManageCardDialog({ card }: { card: CardModel }) {
  const [open, setOpen] = useState(false);
  const member = memberById(card.memberId);

  // Status / lifecycle
  const [frozen, setFrozen] = useState(card.status === "frozen");

  // Limits — two distinct caps:
  //   spendLimit = overall spend limit for the period (also the allocation from primary for supplementary cards)
  //   txnLimit   = max amount per single transaction
  const [spendLimit, setSpendLimit] = useState(String(card.spendLimit));
  const [perTxnLimit, setPerTxnLimit] = useState(card.txnLimit ? String(card.txnLimit) : "");
  // Headroom available to raise this card's allocation: wallet available EXCLUDING this card's current allocation.
  const otherCardsAllocated = walletAvailable(card.id);
  const newSpendLimit = Number(spendLimit) || 0;
  const newPerTxn = Number(perTxnLimit) || 0;
  const exceedsAllocation = newSpendLimit > otherCardsAllocated;
  const perTxnExceedsSpend = newPerTxn > 0 && newSpendLimit > 0 && newPerTxn > newSpendLimit;

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

  const saveLimits = () => {
    if (newSpendLimit <= 0) return toast.error("Spending limit must be greater than zero");
    if (exceedsAllocation) {
      return toast.error(
        `Spending limit exceeds wallet's available balance (${formatCurrency(otherCardsAllocated)}).`,
      );
    }
    if (perTxnExceedsSpend) {
      return toast.error("Per-transaction limit cannot exceed the spending limit");
    }
    toast.success("Card limits updated");
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
              <Label>Spending limit (USD)</Label>
              <Input
                type="number"
                value={spendLimit}
                onChange={(e) => setSpendLimit(e.target.value)}
              />
              <p className={`text-xs ${exceedsAllocation ? "text-destructive" : "text-muted-foreground"}`}>
                {exceedsAllocation
                  ? `Exceeds wallet's available balance (${formatCurrency(otherCardsAllocated)}). Reduce another card's limit or top up the wallet.`
                  : `Total amount this card can spend in the period. Locked from wallet. Increase up to ${formatCurrency(otherCardsAllocated)} (wallet available, excluding this card) or decrease at any time.`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Per-transaction limit (USD)</Label>
              <Input
                type="number"
                value={perTxnLimit}
                onChange={(e) => setPerTxnLimit(e.target.value)}
                placeholder="Leave blank for no per-txn cap"
              />
              <p className={`text-xs ${perTxnExceedsSpend ? "text-destructive" : "text-muted-foreground"}`}>
                {perTxnExceedsSpend
                  ? "Per-transaction limit cannot exceed the spending limit."
                  : "Maximum amount allowed for a single transaction on this card. Increase or decrease independently of the spending limit."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={saveLimits}
                disabled={exceedsAllocation || perTxnExceedsSpend}
              >
                Save limits
              </Button>
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
          {(["all", "lifecycle", "limits", "controls", "security"] as const).map((f) => (
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
