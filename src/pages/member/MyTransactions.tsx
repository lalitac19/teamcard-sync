import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  transactions as allTxns,
  cards as allCards,
  formatCurrency,
  formatDate,
} from "@/lib/mockData";
import { useCurrentUser } from "@/lib/currentUser";
import { Search } from "lucide-react";

const statusBadge = (s: string) => {
  if (s === "posted")
    return <Badge className="border-0 bg-success/10 text-success">Posted</Badge>;
  if (s === "pending")
    return <Badge className="border-0 bg-warning/10 text-warning">Pending</Badge>;
  return <Badge className="border-0 bg-destructive/10 text-destructive">Declined</Badge>;
};

export default function MyTransactions() {
  const { user } = useCurrentUser();
  const [q, setQ] = useState("");
  const [cardId, setCardId] = useState<string>("all");

  const myCards = allCards.filter((c) => c.memberId === user.id);

  const rows = useMemo(() => {
    return allTxns
      .filter((t) => t.memberId === user.id)
      .filter((t) => (cardId === "all" ? true : t.cardId === cardId))
      .filter((t) => (q ? t.merchant.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [user.id, q, cardId]);

  const total = rows.reduce((s, t) => s + t.amount, 0);

  return (
    <AppLayout
      title="My transactions"
      subtitle="Every charge made on cards issued to you."
    >
      <Card className="shadow-soft">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search merchant"
                className="h-9 w-64 pl-9"
              />
            </div>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All my cards</SelectItem>
                {myCards.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.type} ••••{c.last4}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="ml-auto text-sm text-muted-foreground">
              {rows.length} transactions · {formatCurrency(total)}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => {
                const card = allCards.find((c) => c.id === t.cardId);
                return (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(t.date)}</TableCell>
                    <TableCell className="font-medium">{t.merchant}</TableCell>
                    <TableCell className="text-muted-foreground">{t.category}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {card ? `••••${card.last4}` : "—"}
                    </TableCell>
                    <TableCell>{statusBadge(t.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(t.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
