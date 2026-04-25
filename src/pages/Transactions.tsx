import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { transactions, formatCurrency, formatDate, memberById, cardById } from "@/lib/mockData";
import { Download, Filter, FileText } from "lucide-react";

const statusBadge = (s: string) => {
  if (s === "posted") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Posted</Badge>;
  if (s === "pending") return <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/10 border-0">Pending</Badge>;
  return <Badge variant="destructive">Declined</Badge>;
};

const Transactions = () => {
  return (
    <AppLayout
      title="Transactions"
      subtitle="All card activity across your organization."
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
        </>
      }
    >
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Card</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const m = memberById(t.memberId);
                const c = t.cardId ? cardById(t.cardId) : undefined;
                return (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{t.merchant}</p>
                    </TableCell>
                    <TableCell className="text-sm">{m?.name}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {c ? `•• ${c.last4}` : "—"}
                    </TableCell>
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
