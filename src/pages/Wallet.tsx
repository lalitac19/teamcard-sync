import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { walletBalance, walletReserved, walletTopUps, formatCurrency, formatDate } from "@/lib/mockData";
import { ArrowDownLeft, ArrowUpRight, Plus, Banknote } from "lucide-react";

const Wallet = () => {
  return (
    <AppLayout
      title="Wallet"
      subtitle="Fund your corporate cards from your operating account."
      actions={
        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Top up wallet</Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 gradient-hero text-white border-0 shadow-card">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-white/60">Available balance</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{formatCurrency(walletBalance)}</p>
            <div className="mt-6 grid grid-cols-3 gap-6 border-t border-white/10 pt-6 text-sm">
              <div>
                <p className="text-white/60">Reserved</p>
                <p className="mt-1 font-semibold">{formatCurrency(walletReserved)}</p>
              </div>
              <div>
                <p className="text-white/60">Total funded</p>
                <p className="mt-1 font-semibold">{formatCurrency(155000)}</p>
              </div>
              <div>
                <p className="text-white/60">Account</p>
                <p className="mt-1 font-mono text-xs">•••• 4521 USD</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2"><ArrowDownLeft className="h-4 w-4" /> ACH transfer in</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><ArrowUpRight className="h-4 w-4" /> Wire instructions</Button>
            <Button variant="outline" className="w-full justify-start gap-2"><Banknote className="h-4 w-4" /> Auto top-up rules</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold">Top-up history</h3>
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletTopUps.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(w.date)}</TableCell>
                    <TableCell className="font-mono text-xs">{w.reference}</TableCell>
                    <TableCell className="text-sm">{w.source}</TableCell>
                    <TableCell>
                      {w.status === "completed" ? (
                        <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Completed</Badge>
                      ) : (
                        <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Processing</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-success">+{formatCurrency(w.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Wallet;
