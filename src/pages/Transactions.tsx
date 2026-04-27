import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  transactions, formatCurrency, formatDate, memberById, cardById,
  cards as allCards, members, allCountries,
} from "@/lib/mockData";
import { Download, FileText, Inbox } from "lucide-react";
import { TableFilters, ALL } from "@/components/TableFilters";
import { TransactionDetailDialog } from "@/components/TransactionDetailDialog";
import type { Transaction } from "@/lib/mockData";

const statusBadge = (s: string) => {
  if (s === "posted") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Posted</Badge>;
  if (s === "pending") return <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/10 border-0">Pending</Badge>;
  return <Badge variant="destructive">Declined</Badge>;
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

const Transactions = () => {
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [cardholderId, setCardholderId] = useState<string>(ALL);
  const [cardId, setCardId] = useState<string>(ALL);
  const [merchant, setMerchant] = useState("");
  const [country, setCountry] = useState<string>(ALL);
  const [selected, setSelected] = useState<Transaction | null>(null);

  // Cardholders = members who own at least one card
  const cardholderOptions = useMemo(() => {
    const ids = new Set(allCards.map((c) => c.memberId));
    return members
      .filter((m) => ids.has(m.id))
      .map((m) => ({ value: m.id, label: m.name }));
  }, []);

  // Cards scoped to the selected cardholder (so the dropdown only shows
  // multiple options when that cardholder actually has more than one card).
  const cardOptions = useMemo(() => {
    const scoped = cardholderId === ALL
      ? allCards
      : allCards.filter((c) => c.memberId === cardholderId);
    return scoped.map((c) => {
      const m = memberById(c.memberId);
      return {
        value: c.id,
        label: `•• ${c.last4} — ${m?.name ?? ""} (${c.type})`,
      };
    });
  }, [cardholderId]);

  // If the active cardId no longer belongs to the chosen cardholder, reset it.
  const activeCardId = useMemo(() => {
    if (cardId === ALL) return ALL;
    if (cardholderId === ALL) return cardId;
    const owns = allCards.find((c) => c.id === cardId)?.memberId === cardholderId;
    return owns ? cardId : ALL;
  }, [cardId, cardholderId]);

  const countries = useMemo(() => allCountries(), []);

  const filtered = useMemo(() => {
    const merchantQ = merchant.trim().toLowerCase();
    return transactions.filter((t) => {
      if (!inRange(t.date, from, to)) return false;
      if (cardholderId !== ALL && t.memberId !== cardholderId) return false;
      if (activeCardId !== ALL && t.cardId !== activeCardId) return false;
      if (merchantQ && !t.merchant.toLowerCase().includes(merchantQ)) return false;
      if (country !== ALL && t.country !== country) return false;
      return true;
    });
  }, [from, to, cardholderId, activeCardId, merchant, country]);

  const reset = () => {
    setFrom(undefined); setTo(undefined);
    setCardholderId(ALL); setCardId(ALL);
    setMerchant(""); setCountry(ALL);
  };

  return (
    <AppLayout
      title="Transactions"
      subtitle="All card activity across your organization."
      actions={
        <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
      }
    >
      <TableFilters
        from={from} to={to} onFromChange={setFrom} onToChange={setTo}
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
        onReset={reset}
      />

      <Card className="mt-4 shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    <Inbox className="mx-auto mb-2 h-6 w-6" />
                    No transactions match the selected filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((t) => {
                const m = memberById(t.memberId);
                const c = t.cardId ? cardById(t.cardId) : undefined;
                return (
                  <TableRow key={t.id} onClick={() => setSelected(t)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-sm text-muted-foreground">{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{t.merchant}</p>
                    </TableCell>
                    <TableCell className="text-sm">{m?.name}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {c ? `•• ${c.last4}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.country ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal">{t.category}</Badge></TableCell>
                    <TableCell>{statusBadge(t.status)}</TableCell>
                    <TableCell>
                      {t.receipt ? (
                        <FileText className="h-4 w-4 text-success" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Missing</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">−{formatCurrency(t.amount)}</TableCell>
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

export default Transactions;
