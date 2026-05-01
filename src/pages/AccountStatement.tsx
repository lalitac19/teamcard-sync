import { useMemo, useState } from "react";
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
  transactions, walletTopUps, statementExtras, memberById, cardById,
  cards as allCards, members, allCountries,
  formatCurrency, formatDate,
} from "@/lib/mockData";
import { Download, Printer, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { TableFilters, ALL } from "@/components/TableFilters";

type Row = {
  id: string;
  date: string;
  description: string;
  reference: string;
  category: string;
  amount: number; // signed: + money in, - money out
};

const MONTHS = [
  { value: "2024-10", label: "October 2024" },
  { value: "2024-09", label: "September 2024" },
  { value: "2024-08", label: "August 2024" },
];

// Approximate opening balance at the start of the selected month (mocked, for reconciliation feel)
const OPENING_BALANCES: Record<string, number> = {
  "2024-10": 22150.30,
  "2024-09": 8420.10,
  "2024-08": 5200.00,
};

const inMonth = (iso: string, ym: string) => iso.startsWith(ym);

const typeLabel = (t: string) => {
  switch (t) {
    case "refund": return "Refund";
    case "cashback": return "Cashback";
    case "fee": return "Fee";
    case "topup": return "Wallet top-up";
    case "card_spend": return "Card spend";
    default: return t;
  }
};

const AccountStatement = () => {
  const [period, setPeriod] = useState("2024-10");

  // Filters removed — statement always shows the full monthly account view.
  const cardholderId = ALL;
  const activeCardId = ALL;
  const merchant = "";
  const country = ALL;
  const isCardScoped = false;

  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];
    const merchantQ = merchant.trim().toLowerCase();

    // Money out — corporate card uses (posted only), filtered by all selectors
    transactions
      .filter((t) => t.status === "posted" && inMonth(t.date, period))
      .filter((t) => cardholderId === ALL || t.memberId === cardholderId)
      .filter((t) => activeCardId === ALL || t.cardId === activeCardId)
      .filter((t) => !merchantQ || t.merchant.toLowerCase().includes(merchantQ))
      .filter((t) => country === ALL || t.country === country)
      .forEach((t) => {
        const m = memberById(t.memberId);
        const c = t.cardId ? cardById(t.cardId) : undefined;
        list.push({
          id: `tx-${t.id}`,
          date: t.date,
          description: `${t.merchant} — ${m?.name ?? ""}${c ? ` (•• ${c.last4})` : ""}${t.country ? ` · ${t.country}` : ""}`,
          reference: t.id.toUpperCase(),
          category: "card_spend",
          amount: -t.amount,
        });
      });

    if (!isCardScoped) {
      // Money in — wallet top-ups (completed only)
      walletTopUps
        .filter((w) => w.status === "completed" && inMonth(w.date, period))
        .forEach((w) => {
          list.push({
            id: `top-${w.id}`,
            date: w.date,
            description: `Bank transfer — ${w.source}`,
            reference: w.reference,
            category: "topup",
            amount: w.amount,
          });
        });

      // Refunds, cashback, fees
      statementExtras
        .filter((e) => inMonth(e.date, period))
        .forEach((e) => {
          list.push({
            id: `ex-${e.id}`,
            date: e.date,
            description: e.description,
            reference: e.reference ?? "—",
            category: e.type,
            amount: e.amount,
          });
        });
    }

    // Internal wallet<->card transfers are intentionally excluded.
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [period, cardholderId, activeCardId, merchant, country, isCardScoped]);

  const opening = isCardScoped ? 0 : (OPENING_BALANCES[period] ?? 0);
  const moneyIn = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const moneyOut = rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const closing = opening + moneyIn - moneyOut;

  // Build running balance
  let running = opening;
  const rowsWithBalance = rows.map((r) => {
    running += r.amount;
    return { ...r, balance: running };
  });

  const periodLabel = MONTHS.find((m) => m.value === period)?.label ?? period;

  const categoryBadge = (c: string) => {
    if (c === "topup") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Top-up</Badge>;
    if (c === "refund") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Refund</Badge>;
    if (c === "cashback") return <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-0">Cashback</Badge>;
    if (c === "fee") return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10 border-0">Fee</Badge>;
    return <Badge variant="secondary" className="font-normal">{typeLabel(c)}</Badge>;
  };

  return (
    <AppLayout
      title="Account Statement"
      subtitle="Monthly statement for reconciliation. Internal transfers between wallet and cards are excluded."
      actions={
        <>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2"><Printer className="h-4 w-4" /> Print</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export PDF</Button>
        </>
      }
    >
      {/* Filters */}
      <TableFilters
        cardholders={cardholderOptions}
        cardholderId={cardholderId}
        onCardholderChange={(v) => { setCardholderId(v); setCardId(ALL); }}
        cards={cardOptions}
        cardId={activeCardId}
        onCardChange={setCardId}
        merchant={merchant}
        onMerchantChange={setMerchant}
        countries={countries}
        country={country}
        onCountryChange={setCountry}
        onReset={() => { setCardholderId(ALL); setCardId(ALL); setMerchant(""); setCountry(ALL); }}
      />
      {isCardScoped && (
        <p className="mt-2 text-xs text-muted-foreground">
          Filtering active — only matching card spend is shown. Wallet top-ups and adjustments (refunds, fees) are hidden while a card-related filter is applied.
        </p>
      )}

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Opening balance</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(opening)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Start of {periodLabel}</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Money in</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-success">
              <TrendingUp className="h-5 w-5" /> {formatCurrency(moneyIn)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Top-ups, refunds, cashback</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Money out</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-destructive">
              <TrendingDown className="h-5 w-5" /> {formatCurrency(moneyOut)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Card spend & fees</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft border-primary/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Closing balance</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{formatCurrency(closing)}</p>
            <p className="mt-1 text-xs text-muted-foreground">End of {periodLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Statement table */}
      <Card className="mt-6 shadow-soft">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Statement — {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Money out</TableHead>
                <TableHead className="text-right">Money in</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Opening */}
              <TableRow className="bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">{periodLabel.split(" ")[1]}-{period.split("-")[1]}-01</TableCell>
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
                    No activity for this period.
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

              {/* Closing */}
              <TableRow className="bg-muted/30">
                <TableCell className="text-sm text-muted-foreground">End of period</TableCell>
                <TableCell className="font-medium">Closing balance</TableCell>
                <TableCell className="text-sm text-muted-foreground">—</TableCell>
                <TableCell>—</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(moneyOut)}</TableCell>
                <TableCell className="text-right text-sm font-semibold">{formatCurrency(moneyIn)}</TableCell>
                <TableCell className="text-right text-sm font-semibold text-primary">{formatCurrency(closing)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Note: Internal transfers between the main wallet and cards (and between cards via the wallet) are excluded
        from this statement, as they do not change your overall account balance.
      </p>
    </AppLayout>
  );
};

export default AccountStatement;
