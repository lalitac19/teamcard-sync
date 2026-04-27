import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  cards, transactions, walletTransfers, memberById, cardById,
  members, allCountries,
  formatCurrency, formatDate,
} from "@/lib/mockData";
import {
  CalendarIcon, Download, Printer, ArrowDownLeft, ArrowUpRight,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ALL } from "@/components/TableFilters";

type Row = {
  id: string;
  date: string;
  description: string;
  reference: string;
  category: "wallet_to_card" | "card_to_wallet" | "card_to_card_in" | "card_to_card_out" | "card_spend";
  amount: number; // signed: + into card, - out of card
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

const categoryBadge = (c: Row["category"]) => {
  switch (c) {
    case "wallet_to_card":
      return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Wallet → Card</Badge>;
    case "card_to_wallet":
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Card → Wallet</Badge>;
    case "card_to_card_in":
      return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Card → Card (in)</Badge>;
    case "card_to_card_out":
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Card → Card (out)</Badge>;
    case "card_spend":
      return <Badge variant="secondary" className="font-normal">Card spend</Badge>;
  }
};

const CardStatement = () => {
  const [cardholderId, setCardholderId] = useState<string>(ALL);
  const [cardId, setCardId] = useState<string>(cards[0]?.id ?? "");
  const [from, setFrom] = useState<Date | undefined>(new Date("2024-10-01"));
  const [to, setTo] = useState<Date | undefined>(new Date("2024-10-31"));
  const [merchantQ, setMerchantQ] = useState("");
  const [country, setCountry] = useState<string>(ALL);

  // Cardholder list — only members who hold ≥1 card
  const cardholderOptions = useMemo(() => {
    const ids = new Set(cards.map((c) => c.memberId));
    return members.filter((m) => ids.has(m.id));
  }, []);

  // Cards scoped to selected cardholder
  const cardOptions = useMemo(() => {
    return cardholderId === ALL ? cards : cards.filter((c) => c.memberId === cardholderId);
  }, [cardholderId]);

  // Keep cardId valid for the chosen cardholder
  useMemo(() => {
    if (cardholderId !== ALL && !cardOptions.some((c) => c.id === cardId)) {
      setCardId(cardOptions[0]?.id ?? "");
    }
  }, [cardholderId, cardOptions, cardId]);

  const card = cards.find((c) => c.id === cardId);
  const holder = card ? memberById(card.memberId) : undefined;

  const countries = useMemo(() => allCountries(), []);

  const rows = useMemo<Row[]>(() => {
    if (!card) return [];
    const list: Row[] = [];

    // Card spend (posted only) — money out of card
    transactions
      .filter((t) => t.cardId === card.id && t.status === "posted" && inRange(t.date, from, to))
      .forEach((t) => {
        list.push({
          id: `tx-${t.id}`,
          date: t.date,
          description: `${t.merchant} — ${t.category}`,
          reference: t.id.toUpperCase(),
          category: "card_spend",
          amount: -t.amount,
        });
      });

    // Internal transfers (approved only) affecting this card
    walletTransfers
      .filter((w) => w.status === "approved" && inRange(w.date, from, to))
      .forEach((w) => {
        if (w.direction === "wallet_to_card" && w.toCardId === card.id) {
          list.push({
            id: `wt-${w.id}`,
            date: w.date,
            description: `Funds added from main wallet${w.reason ? ` — ${w.reason}` : ""}`,
            reference: w.id.toUpperCase(),
            category: "wallet_to_card",
            amount: w.amount,
          });
        } else if (w.direction === "card_to_wallet" && w.fromCardId === card.id) {
          list.push({
            id: `wt-${w.id}`,
            date: w.date,
            description: `Funds returned to main wallet${w.reason ? ` — ${w.reason}` : ""}`,
            reference: w.id.toUpperCase(),
            category: "card_to_wallet",
            amount: -w.amount,
          });
        } else if (w.direction === "card_to_card") {
          if (w.toCardId === card.id) {
            const src = w.fromCardId ? cardById(w.fromCardId) : undefined;
            list.push({
              id: `wt-${w.id}-in`,
              date: w.date,
              description: `Received from card •• ${src?.last4 ?? "—"}${w.reason ? ` — ${w.reason}` : ""}`,
              reference: w.id.toUpperCase(),
              category: "card_to_card_in",
              amount: w.amount,
            });
          } else if (w.fromCardId === card.id) {
            const dst = w.toCardId ? cardById(w.toCardId) : undefined;
            list.push({
              id: `wt-${w.id}-out`,
              date: w.date,
              description: `Sent to card •• ${dst?.last4 ?? "—"}${w.reason ? ` — ${w.reason}` : ""}`,
              reference: w.id.toUpperCase(),
              category: "card_to_card_out",
              amount: -w.amount,
            });
          }
        }
      });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [card, from, to]);

  const fundsIn = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const fundsOut = rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  // Opening = current balance minus net activity in the selected range (mocked reconstruction)
  const opening = card ? card.balance - (fundsIn - fundsOut) : 0;
  const closing = opening + fundsIn - fundsOut;

  let running = opening;
  const rowsWithBalance = rows.map((r) => {
    running += r.amount;
    return { ...r, balance: running };
  });

  return (
    <AppLayout
      title="Card Statement"
      subtitle="Internal per-card reconciliation: funding, returns, card-to-card transfers, and card spend."
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
            <label className="text-xs text-muted-foreground">Card</label>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTrigger className="w-full md:w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cards.map((c) => {
                  const m = memberById(c.memberId);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      •• {c.last4} — {m?.name ?? "Unknown"} ({c.type})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

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

          {card && (
            <div className="ml-auto text-right">
              <p className="text-xs text-muted-foreground">Cardholder</p>
              <p className="text-sm font-medium">{holder?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">•• {card.last4} · {card.type}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Opening balance</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(opening)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Funds in</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-success">
              <TrendingUp className="h-5 w-5" /> {formatCurrency(fundsIn)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">From wallet & other cards</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Funds out</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-destructive">
              <TrendingDown className="h-5 w-5" /> {formatCurrency(fundsOut)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Spend & returns</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Closing balance</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{formatCurrency(closing)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Activity {from && to ? `— ${format(from, "MMM d, yyyy")} → ${format(to, "MMM d, yyyy")}` : ""}
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
                <TableHead className="text-right">Out</TableHead>
                <TableHead className="text-right">In</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">{from ? format(from, "yyyy-MM-dd") : "—"}</TableCell>
                <TableCell className="font-medium">Opening balance</TableCell>
                <TableCell className="text-sm text-muted-foreground">—</TableCell>
                <TableCell>—</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right">—</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(opening)}</TableCell>
              </TableRow>

              {rowsWithBalance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    No activity for the selected range.
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
                  <TableCell className="text-right text-sm font-medium">{formatCurrency(r.balance)}</TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">{to ? format(to, "yyyy-MM-dd") : "—"}</TableCell>
                <TableCell className="font-medium">Closing balance</TableCell>
                <TableCell className="text-sm text-muted-foreground">—</TableCell>
                <TableCell>—</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(fundsOut)}</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(fundsIn)}</TableCell>
                <TableCell className="text-right text-sm font-semibold text-primary">{formatCurrency(closing)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Internal statement — for reconciliation only. Includes card spend plus internal transfers between this card and the
        main wallet (or other cards). Pending transfers are excluded.
      </p>
    </AppLayout>
  );
};

export default CardStatement;
