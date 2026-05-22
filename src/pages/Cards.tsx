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
import { cards, formatCurrency, hasCompletedFirstTopUp, memberById, members, walletAvailable, type Card as CardModel } from "@/lib/mockData";
import { Plus, Snowflake, ArrowLeftRight, CreditCard, Settings2, AlertTriangle, RefreshCcw, Ban, ShieldCheck, History, Plus as PlusIcon, Pencil, ShieldAlert, Store, Search, X } from "lucide-react";
import { toast } from "sonner";

const MERCHANT_CATEGORIES = [
  "Food",
  "Bars & Nightlife",
  "Retail",
  "Travel",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Education",
  "Legal & Accounting",
  "Professional Services",
  "Charities & Memberships",
  "Government Services",
  "Financial Services",
];

// Geography options use the full COUNTRIES list (defined below).

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
      subtitle={`${cards.length} cards issued · ${formatCurrency(available)} of the wallet still available to allocate to new cards.`}
      actions={
        <div className="flex gap-2">
          <FreezeAllDialog />
          <UnfreezeAllDialog />
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-2"
                disabled={!hasCompletedFirstTopUp()}
                title={!hasCompletedFirstTopUp() ? "Complete your first wallet top-up to issue cards" : undefined}
              >
                <Plus className="h-4 w-4" /> Issue card
              </Button>
            </DialogTrigger>
            <IssueCardDialog />
          </Dialog>
        </div>
      }
    >
      <div className="mb-3 flex items-start gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          For security, full card numbers, CVV, and expiry are never visible from the admin portal. Cardholders can reveal their own details via OTP from their member view.
        </span>
      </div>

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
    toast.success(`Bulk froze ${count} card${count === 1 ? "" : "s"}`);
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
          <Snowflake className="h-4 w-4" /> Bulk freeze
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Bulk freeze cards</DialogTitle>
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
                <AlertTriangle className="h-4 w-4" /> Confirm bulk freeze
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

function UnfreezeAllDialog() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const unfreezable = cards.filter((c) => c.status === "frozen");
  const allSelected = unfreezable.length > 0 && selected.length === unfreezable.length;
  const count = selected.length;

  const reset = () => setSelected([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleAll = () => {
    setSelected(allSelected ? [] : unfreezable.map((c) => c.id));
  };

  const handleUnfreeze = () => {
    cards.forEach((c) => {
      if (selected.includes(c.id)) c.status = "active";
    });
    toast.success(`Bulk unfroze ${count} card${count === 1 ? "" : "s"}`);
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
        <Button size="sm" variant="outline" className="gap-2" disabled={unfreezable.length === 0}>
          <Snowflake className="h-4 w-4" /> Bulk unfreeze
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk unfreeze cards</DialogTitle>
          <DialogDescription>
            Choose which frozen cards to reactivate. They will resume accepting transactions immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="flex items-center gap-2 rounded-md border bg-secondary/40 px-3 py-2 text-sm font-medium">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            Select all ({unfreezable.length})
          </label>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
            {unfreezable.map((c) => {
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
          <Button onClick={handleUnfreeze} disabled={count === 0}>
            Unfreeze {count > 0 ? `(${count})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// (Funds add/withdraw dialog removed — supplementary cards are governed by limit allocation, not balance transfers.)

// ISO 3166-1 alpha-2 country list (all 249 officially-assigned codes).
const COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" }, { code: "AX", name: "Åland Islands" }, { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" }, { code: "AS", name: "American Samoa" }, { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" }, { code: "AI", name: "Anguilla" }, { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" }, { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" }, { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" }, { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" }, { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" }, { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" }, { code: "BT", name: "Bhutan" }, { code: "BO", name: "Bolivia" },
  { code: "BQ", name: "Bonaire, Sint Eustatius and Saba" }, { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" }, { code: "BV", name: "Bouvet Island" }, { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" }, { code: "BN", name: "Brunei Darussalam" },
  { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" }, { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" }, { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" }, { code: "KY", name: "Cayman Islands" }, { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" }, { code: "CN", name: "China" },
  { code: "CX", name: "Christmas Island" }, { code: "CC", name: "Cocos (Keeling) Islands" }, { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" }, { code: "CD", name: "Congo (Democratic Republic)" },
  { code: "CK", name: "Cook Islands" }, { code: "CR", name: "Costa Rica" }, { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CW", name: "Curaçao" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" }, { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" }, { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" }, { code: "ET", name: "Ethiopia" }, { code: "FK", name: "Falkland Islands" },
  { code: "FO", name: "Faroe Islands" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "GF", name: "French Guiana" }, { code: "PF", name: "French Polynesia" },
  { code: "TF", name: "French Southern Territories" }, { code: "GA", name: "Gabon" }, { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" }, { code: "GR", name: "Greece" }, { code: "GL", name: "Greenland" },
  { code: "GD", name: "Grenada" }, { code: "GP", name: "Guadeloupe" }, { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" }, { code: "GG", name: "Guernsey" }, { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" }, { code: "HT", name: "Haiti" },
  { code: "HM", name: "Heard Island and McDonald Islands" }, { code: "VA", name: "Holy See" },
  { code: "HN", name: "Honduras" }, { code: "HK", name: "Hong Kong" }, { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" }, { code: "IN", name: "India" }, { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" },
  { code: "IM", name: "Isle of Man" }, { code: "IL", name: "Israel" }, { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" }, { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" }, { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" }, { code: "KP", name: "Korea (North)" }, { code: "KR", name: "Korea (South)" },
  { code: "KW", name: "Kuwait" }, { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" }, { code: "MO", name: "Macao" },
  { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" }, { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" }, { code: "MQ", name: "Martinique" }, { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" }, { code: "YT", name: "Mayotte" }, { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" }, { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" }, { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" }, { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" }, { code: "NC", name: "New Caledonia" }, { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" }, { code: "NG", name: "Nigeria" },
  { code: "NU", name: "Niue" }, { code: "NF", name: "Norfolk Island" }, { code: "MK", name: "North Macedonia" },
  { code: "MP", name: "Northern Mariana Islands" }, { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" }, { code: "PW", name: "Palau" }, { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" }, { code: "PH", name: "Philippines" }, { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" }, { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" }, { code: "RE", name: "Réunion" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russian Federation" }, { code: "RW", name: "Rwanda" }, { code: "BL", name: "Saint Barthélemy" },
  { code: "SH", name: "Saint Helena, Ascension and Tristan da Cunha" }, { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" }, { code: "MF", name: "Saint Martin (French part)" },
  { code: "PM", name: "Saint Pierre and Miquelon" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" }, { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten (Dutch part)" }, { code: "SK", name: "Slovakia" }, { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" }, { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" }, { code: "SJ", name: "Svalbard and Jan Mayen" }, { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" }, { code: "SY", name: "Syrian Arab Republic" }, { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" }, { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" }, { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Türkiye" }, { code: "TM", name: "Turkmenistan" }, { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" }, { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" }, { code: "UM", name: "United States Minor Outlying Islands" },
  { code: "UY", name: "Uruguay" }, { code: "UZ", name: "Uzbekistan" }, { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" }, { code: "VN", name: "Viet Nam" }, { code: "VG", name: "Virgin Islands (British)" },
  { code: "VI", name: "Virgin Islands (U.S.)" }, { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" }, { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
].sort((a, b) => a.name.localeCompare(b.name));

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
  const [limitFrequency, setLimitFrequency] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [perTxnLimit, setPerTxnLimit] = useState("");
  const [atmEnabled, setAtmEnabled] = useState(false);
  const [atmLimit, setAtmLimit] = useState("");
  const [cardName, setCardName] = useState("");

  const firstTopUpDone = hasCompletedFirstTopUp();
  const requested = Number(allocatedLimit) || 0;
  const walletPoolAvailable = walletAvailable();
  const exceedsWallet = requested > 0 && requested > walletPoolAvailable;

  const perTxn = Number(perTxnLimit) || 0;
  const perTxnExceedsSpend = perTxn > 0 && requested > 0 && perTxn > requested;

  // ATM withdrawal is capped at 20% of the assigned spending limit.
  const atmDailyCap = Math.floor(requested * 0.2 * 100) / 100;
  const atm = atmEnabled ? Number(atmLimit) || 0 : 0;
  const atmExceedsCap = atmEnabled && atm > 0 && requested > 0 && atm > atmDailyCap;

  const submit = () => {
    if (!firstTopUpDone) return toast.error("Complete your first wallet top-up before issuing cards");
    if (!requested || requested <= 0) return toast.error("Enter a spending cap for this card");
    if (exceedsWallet) {
      return toast.error(`Not enough unallocated wallet funds. Only ${formatCurrency(walletPoolAvailable)} available — top up the wallet or reduce an existing card's limit.`);
    }
    if (perTxnExceedsSpend) {
      return toast.error("Per-transaction limit cannot exceed the spending cap");
    }
    if (atmExceedsCap) {
      return toast.error(`Daily ATM limit cannot exceed 20% of the daily spending cap (${formatCurrency(atmDailyCap)})`);
    }
    toast.success(
      `Card issued · ${formatCurrency(requested)} ${limitFrequency} cap` +
        (perTxn ? `, ${formatCurrency(perTxn)} per-txn` : "") +
        (atm ? `, ${formatCurrency(atm)} ATM/day` : ""),
    );
  };

  return (
    <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Issue a card</DialogTitle>
        <DialogDescription>
          Sets a spending cap for this card. Card issuance is unlimited once the wallet has been funded — caps are limits, not reservations, and cards spend from the shared wallet on a first-come, first-served basis.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        {!firstTopUpDone && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            You must complete your first wallet top-up before any card can be issued.
          </div>
        )}


        <div className="space-y-1.5">
          <Label>Card type</Label>
          <Select defaultValue="virtual">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="virtual">Virtual</SelectItem>
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
          <Label>Name on card</Label>
          <Input
            placeholder="e.g. Marcus Patel"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Name printed on the card. Defaults to the member name if left blank.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Spending cap (AED)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="5000"
              value={allocatedLimit}
              onChange={(e) => setAllocatedLimit(e.target.value)}
              className="flex-1"
            />
            <Select value={limitFrequency} onValueChange={(v) => setLimitFrequency(v as typeof limitFrequency)}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Per day</SelectItem>
                <SelectItem value="weekly">Per week</SelectItem>
                <SelectItem value="monthly">Per month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum this card can spend in the chosen period. Funds are drawn from the shared wallet on a first-come, first-served basis.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Per-transaction limit (AED, optional)</Label>
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
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">ATM cash withdrawal</Label>
              <p className="text-xs text-muted-foreground">
                Allow cash withdrawals on this card.
              </p>
            </div>
            <Switch checked={atmEnabled} onCheckedChange={setAtmEnabled} />
          </div>
          {atmEnabled && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs">Daily ATM withdrawal limit (AED)</Label>
              <p className="text-xs text-muted-foreground">
                The daily cash withdrawal limit is 20% of the assigned spending limit (max {requested ? formatCurrency(atmDailyCap) : "—"}/day).
              </p>
              <Input
                type="number"
                placeholder={requested ? `up to ${formatCurrency(atmDailyCap)}` : "e.g. 200"}
                value={atmLimit}
                onChange={(e) => {
                  const v = e.target.value;
                  setAtmLimit(v);
                  const n = Number(v) || 0;
                  if (requested > 0 && n > atmDailyCap) {
                    toast.error(`Please reduce — the daily ATM limit cannot exceed 20% of the assigned spending limit (max ${formatCurrency(atmDailyCap)}/day).`);
                  }
                }}
              />
              {atmExceedsCap && (
                <p className="text-xs text-destructive">
                  Please reduce — the daily ATM limit cannot exceed 20% of the assigned spending limit ({formatCurrency(atmDailyCap)}).
                </p>
              )}
            </div>
          )}
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
          label="Allowed geography"
          placeholder="all regions allowed"
          allLabel="No restrictions"
          options={[
            { value: "Domestic", label: "Domestic" },
            { value: "International", label: "International" },
          ]}
          selected={countries}
          onChange={setCountries}
        />
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button onClick={submit} disabled={!firstTopUpDone || !requested || perTxnExceedsSpend || atmExceedsCap}>Issue card</Button>
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
  const [limitFrequency, setLimitFrequency] = useState<"daily" | "weekly" | "monthly">(
    card.limitPeriod === "per-transaction" ? "monthly" : (card.limitPeriod as "daily" | "weekly" | "monthly"),
  );
  const [atmEnabled, setAtmEnabled] = useState(!!card.atmDailyLimit);
  const [atmLimit, setAtmLimit] = useState(card.atmDailyLimit ? String(card.atmDailyLimit) : "");
  // Wallet pool is shared — caps are not reservations. Show available for info only.
  const walletPoolAvailable = walletAvailable();
  const newSpendLimit = Number(spendLimit) || 0;
  const newPerTxn = Number(perTxnLimit) || 0;
  const perTxnExceedsSpend = newPerTxn > 0 && newSpendLimit > 0 && newPerTxn > newSpendLimit;
  const atmDailyCap = Math.floor(newSpendLimit * 0.2 * 100) / 100;
  const newAtm = atmEnabled ? Number(atmLimit) || 0 : 0;
  const atmExceedsCap = atmEnabled && newAtm > 0 && newSpendLimit > 0 && newAtm > atmDailyCap;

  // Merchant controls
  const initialAllowed = card.merchantCategories?.length
    ? card.merchantCategories
    : MERCHANT_CATEGORIES.slice(0, 6);
  const [merchantMode, setMerchantMode] = useState<"allow" | "block">("allow");
  const [merchants, setMerchants] = useState<string[]>(initialAllowed);

  // Geography controls
  const [geoMode, setGeoMode] = useState<"allow" | "block">("allow");
  const [regions, setRegions] = useState<string[]>([]);
  

  // Replace card
  const [replaceReason, setReplaceReason] = useState<
    | "compromised"
    | "suspected_fraud"
    | "merchant_breach"
    | "subscription_reset"
    | "lost"
    | "stolen"
    | "damaged"
    | "other"
  >("compromised");
  const [replaceType, setReplaceType] = useState<"virtual">("virtual");
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
    if (newSpendLimit <= 0) return toast.error("Spending cap must be greater than zero");
    if (perTxnExceedsSpend) {
      return toast.error("Per-transaction limit cannot exceed the spending cap");
    }
    if (atmExceedsCap) {
      return toast.error(`Daily ATM limit cannot exceed 20% of the daily spending cap (${formatCurrency(atmDailyCap)})`);
    }
    toast.success("Card limits updated");
    setOpen(false);
  };

  const handleFreezeToggle = (val: boolean) => {
    setFrozen(val);
    toast.success(val ? "Card frozen" : "Card unfrozen");
  };

  const replaceReasonLabels: Record<typeof replaceReason, string> = {
    compromised: "Card details compromised",
    suspected_fraud: "Suspected fraud",
    merchant_breach: "Merchant data breach",
    subscription_reset: "Recurring charges reset",
    lost: "Lost",
    stolen: "Stolen",
    damaged: "Damaged",
    other: "Other",
  };

  const handleReplace = () => {
    toast.success(`Replacement virtual card requested (${replaceReasonLabels[replaceReason]})`);
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
              <Label>Spending cap (AED)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={spendLimit}
                  onChange={(e) => setSpendLimit(e.target.value)}
                  className="flex-1"
                />
                <Select value={limitFrequency} onValueChange={(v) => setLimitFrequency(v as typeof limitFrequency)}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Per day</SelectItem>
                    <SelectItem value="weekly">Per week</SelectItem>
                    <SelectItem value="monthly">Per month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum this card can spend in the chosen period. Funds are drawn from the shared wallet ({formatCurrency(walletPoolAvailable)} available) on a first-come, first-served basis.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Per-transaction limit (AED)</Label>
              <Input
                type="number"
                value={perTxnLimit}
                onChange={(e) => setPerTxnLimit(e.target.value)}
                placeholder="Leave blank for no per-txn cap"
              />
              <p className={`text-xs ${perTxnExceedsSpend ? "text-destructive" : "text-muted-foreground"}`}>
                {perTxnExceedsSpend
                  ? "Per-transaction limit cannot exceed the spending cap."
                  : "Maximum amount allowed for a single transaction on this card. Increase or decrease independently of the spending cap."}
              </p>
            </div>
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">ATM cash withdrawal</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow cash withdrawals on this card.
                  </p>
                </div>
                <Switch checked={atmEnabled} onCheckedChange={setAtmEnabled} />
              </div>
              {atmEnabled && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs">Daily ATM withdrawal limit (AED)</Label>
                  <p className="text-xs text-muted-foreground">
                    The daily cash withdrawal limit is 20% of the assigned spending limit (max {newSpendLimit ? formatCurrency(atmDailyCap) : "—"}/day).
                  </p>
                  <Input
                    type="number"
                    value={atmLimit}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAtmLimit(v);
                      const n = Number(v) || 0;
                      if (newSpendLimit > 0 && n > atmDailyCap) {
                        toast.error(`Please reduce — the daily ATM limit cannot exceed 20% of the assigned spending limit (max ${formatCurrency(atmDailyCap)}/day).`);
                      }
                    }}
                    placeholder={newSpendLimit ? `up to ${formatCurrency(atmDailyCap)}` : "e.g. 200"}
                  />
                  {atmExceedsCap && (
                    <p className="text-xs text-destructive">
                      Please reduce — the daily ATM limit cannot exceed 20% of the assigned spending limit ({formatCurrency(atmDailyCap)}).
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={saveLimits}
                disabled={perTxnExceedsSpend || atmExceedsCap}
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
                    Mark categories to restrict on this card.
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground">Restrict</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                {MERCHANT_CATEGORIES.map((m) => {
                  const active = merchants.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleItem(merchants, setMerchants, m)}
                      className="flex items-center gap-2 text-left text-sm"
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                          active ? "border-destructive bg-destructive text-destructive-foreground" : "border-input"
                        }`}
                      >
                        {active && <X className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      {m}
                    </button>
                  );
                })}
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Geography</p>
                  <p className="text-xs text-muted-foreground">
                    Mark regions to restrict on this card.
                  </p>
                </div>
                <span className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground">Restrict</span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                {(["Domestic", "International"] as const).map((label) => {
                  const active = regions.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleItem(regions, setRegions, label)}
                      className="flex items-center gap-2 text-left text-sm"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                          active ? "border-destructive bg-destructive text-destructive-foreground" : "border-input"
                        }`}
                      >
                        {active && <X className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                ATM withdrawals are configured on the Limits tab — set a daily cap (max 20% of the daily spending cap) or leave blank to disable.
              </p>
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
                      <SelectItem value="compromised">Card details compromised</SelectItem>
                      <SelectItem value="suspected_fraud">Suspected fraud</SelectItem>
                      <SelectItem value="merchant_breach">Merchant data breach</SelectItem>
                      <SelectItem value="subscription_reset">Recurring charges reset</SelectItem>
                      {card.type === "physical" && (
                        <>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="stolen">Stolen</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                        </>
                      )}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Replacement type</Label>
                  <div className="flex h-9 items-center rounded-md border border-input bg-secondary/40 px-3 text-sm">
                    Virtual card
                  </div>
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

            {card.type === "virtual" && (
              <section className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Request physical card
                </p>
                <p className="text-xs text-muted-foreground">
                  Order a physical card with the <strong>same card number, expiry, and CVV</strong> as this virtual card. It will be shipped to the cardholder. Use “Replace card” instead if you need a brand-new card number.
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => toast.success(`Physical card requested for ${member?.name ?? "cardholder"}`)}
                >
                  <CreditCard className="h-4 w-4" /> Request physical card
                </Button>
              </section>
            )}

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
