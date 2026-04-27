import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  walletTransfers, cardById, memberById, cards as allCards, members,
  formatCurrency, formatDate,
} from "@/lib/mockData";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ALL } from "@/components/TableFilters";
import {
  CalendarIcon, Download, Printer, ArrowDownLeft, ArrowUpRight,
  TrendingUp, TrendingDown,
} from "lucide-react";

type Row = {
  id: string;
  date: string;
  description: string;
  reference: string;
  category: "from_card" | "to_card";
  amount: number; // signed: + into wallet, - out of wallet
};

const inRange = (iso: string, from?: Date, to?: Date) => {
  const d = new Date(iso);
  if (from && d < from) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (d > end) return false;
  }
  return true;
};

const categoryBadge = (c: Row["category"]) =>
  c === "from_card" ? (
    <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Card → Wallet</Badge>
  ) : (
    <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Wallet → Card</Badge>
  );

const WalletInternalStatement = () => {
  const [from, setFrom] = useState<Date | undefined>(new Date("2024-10-01"));
  const [to, setTo] = useState<Date | undefined>(new Date("2024-10-31"));
  const [cardholderId, setCardholderId] = useState<string>(ALL);
  const [cardId, setCardId] = useState<string>(ALL);

  const cardholderOptions = useMemo(() => {
    const ids = new Set(allCards.map((c) => c.memberId));
    return members.filter((m) => ids.has(m.id));
  }, []);

  const cardOptions = useMemo(() => {
    return cardholderId === ALL ? allCards : allCards.filter((c) => c.memberId === cardholderId);
  }, [cardholderId]);

  const activeCardId = useMemo(() => {
    if (cardId === ALL) return ALL;
    if (cardholderId === ALL) return cardId;
    const owns = allCards.find((c) => c.id === cardId)?.memberId === cardholderId;
    return owns ? cardId : ALL;
  }, [cardId, cardholderId]);

  // Transfer matches if any of its cards (from/to) belongs to the selected scope.
  const matchesCardScope = (fromCard?: string, toCard?: string) => {
    if (activeCardId !== ALL) {
      return fromCard === activeCardId || toCard === activeCardId;
    }
    if (cardholderId !== ALL) {
      const fromOwned = fromCard ? cardById(fromCard)?.memberId === cardholderId : false;
      const toOwned = toCard ? cardById(toCard)?.memberId === cardholderId : false;
      return fromOwned || toOwned;
    }
    return true;
  };

  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];

    walletTransfers
      .filter((w) => w.status === "approved" && inRange(w.date, from, to))
      .filter((w) => matchesCardScope(w.fromCardId, w.toCardId))
      .forEach((w) => {
        if (w.direction === "wallet_to_card") {
          const dst = w.toCardId ? cardById(w.toCardId) : undefined;
          const holder = dst ? memberById(dst.memberId) : undefined;
          list.push({
            id: `wt-${w.id}`,
            date: w.date,
            description: `Funded card •• ${dst?.last4 ?? "—"}${holder ? ` (${holder.name})` : ""}${w.reason ? ` — ${w.reason}` : ""}`,
            reference: w.id.toUpperCase(),
            category: "to_card",
            amount: -w.amount,
          });
        } else if (w.direction === "card_to_wallet") {
          const src = w.fromCardId ? cardById(w.fromCardId) : undefined;
          const holder = src ? memberById(src.memberId) : undefined;
          list.push({
            id: `wt-${w.id}`,
            date: w.date,
            description: `Returned from card •• ${src?.last4 ?? "—"}${holder ? ` (${holder.name})` : ""}${w.reason ? ` — ${w.reason}` : ""}`,
            reference: w.id.toUpperCase(),
            category: "from_card",
            amount: w.amount,
          });
        } else if (w.direction === "card_to_card") {
          // Card-to-card moves through the wallet: in then out (net zero, but shown for trace)
          const src = w.fromCardId ? cardById(w.fromCardId) : undefined;
          const dst = w.toCardId ? cardById(w.toCardId) : undefined;
          list.push({
            id: `wt-${w.id}-in`,
            date: w.date,
            description: `Received from card •• ${src?.last4 ?? "—"} (in transit to •• ${dst?.last4 ?? "—"})`,
            reference: w.id.toUpperCase(),
            category: "from_card",
            amount: w.amount,
          });
          list.push({
            id: `wt-${w.id}-out`,
            date: w.date,
            description: `Forwarded to card •• ${dst?.last4 ?? "—"} (from •• ${src?.last4 ?? "—"})`,
            reference: w.id.toUpperCase(),
            category: "to_card",
            amount: -w.amount,
          });
        }
      });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [from, to, cardholderId, activeCardId]);

  const fundsIn = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const fundsOut = rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const net = fundsIn - fundsOut;

  let running = 0;
  const rowsWithBalance = rows.map((r) => {
    running += r.amount;
    return { ...r, balance: running };
  });

  return (
    <AppLayout
      title="Wallet Internal Statement"
      subtitle="Internal reconciliation of all approved transfers between the main wallet and issued cards."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2"><Printer className="h-4 w-4" /> Print</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
        </>
      }
    >
      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-end md:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !from && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={from} onSelect={setFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !to && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={to} onSelect={setTo} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {cardholderOptions.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Cardholder</label>
              <Select value={cardholderId} onValueChange={(v) => { setCardholderId(v); setCardId(ALL); }}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All cardholders</SelectItem>
                  {cardholderOptions.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {cardOptions.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">Card</label>
              <Select value={activeCardId} onValueChange={setCardId}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All cards</SelectItem>
                  {cardOptions.map((c) => {
                    const m = memberById(c.memberId);
                    return (
                      <SelectItem key={c.id} value={c.id}>•• {c.last4} — {m?.name ?? ""}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Inflow from cards</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-success">
              <TrendingUp className="h-5 w-5" /> {formatCurrency(fundsIn)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Returns & card-to-card legs</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Outflow to cards</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-destructive">
              <TrendingDown className="h-5 w-5" /> {formatCurrency(fundsOut)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Funding & card-to-card legs</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net wallet movement</p>
            <p className={cn("mt-2 text-2xl font-semibold", net >= 0 ? "text-success" : "text-destructive")}>
              {net >= 0 ? "+" : "−"}{formatCurrency(Math.abs(net))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Internal transfers only</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Internal transfers {from && to ? `— ${format(from, "MMM d, yyyy")} → ${format(to, "MMM d, yyyy")}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Out of wallet</TableHead>
                <TableHead className="text-right">Into wallet</TableHead>
                <TableHead className="text-right">Running net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsWithBalance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No internal transfers for the selected range.
                  </TableCell>
                </TableRow>
              )}

              {rowsWithBalance.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      {r.amount > 0 ? (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-destructive" />
                      )}
                      <span>{r.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{r.reference}</TableCell>
                  <TableCell>{categoryBadge(r.category)}</TableCell>
                  <TableCell className="text-right text-sm">
                    {r.amount < 0 ? formatCurrency(Math.abs(r.amount)) : "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {r.amount > 0 ? formatCurrency(r.amount) : "—"}
                  </TableCell>
                  <TableCell className={cn("text-right text-sm font-medium", r.balance >= 0 ? "" : "text-destructive")}>
                    {r.balance >= 0 ? "" : "−"}{formatCurrency(Math.abs(r.balance))}
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">{to ? format(to, "yyyy-MM-dd") : "—"}</TableCell>
                <TableCell className="font-medium">Period totals</TableCell>
                <TableCell className="text-sm text-muted-foreground">—</TableCell>
                <TableCell>—</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(fundsOut)}</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(fundsIn)}</TableCell>
                <TableCell className={cn("text-right text-sm font-semibold", net >= 0 ? "text-primary" : "text-destructive")}>
                  {net >= 0 ? "+" : "−"}{formatCurrency(Math.abs(net))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Internal statement — these movements do not affect the overall account balance and are excluded from the main
        Account Statement. Pending transfers are not shown.
      </p>
    </AppLayout>
  );
};

export default WalletInternalStatement;
