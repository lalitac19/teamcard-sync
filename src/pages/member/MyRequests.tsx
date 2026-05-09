import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
  cardRequests as seedCardReq,
  topUpRequests as seedTopUps,
  cards as allCards,
  formatCurrency,
  formatDate,
  type CardRequest,
  type TopUpRequest,
  type CardType,
} from "@/lib/mockData";
import { useCurrentUser } from "@/lib/currentUser";
import { CreditCard, Plus, ArrowUp } from "lucide-react";
import { toast } from "sonner";

const statusBadge = (s: string) => {
  if (s === "approved") return <Badge className="border-0 bg-success/10 text-success">Approved</Badge>;
  if (s === "rejected") return <Badge className="border-0 bg-destructive/10 text-destructive">Rejected</Badge>;
  return <Badge className="border-0 bg-warning/10 text-warning">Pending</Badge>;
};

export default function MyRequests() {
  const { user } = useCurrentUser();
  const [cardReqs, setCardReqs] = useState<CardRequest[]>(seedCardReq);
  const [topUps, setTopUps] = useState<TopUpRequest[]>(seedTopUps);

  // Card request dialog
  const [cardOpen, setCardOpen] = useState(false);
  const [type, setType] = useState<CardType>("virtual");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<CardRequest["limitPeriod"]>("monthly");
  const [reason, setReason] = useState("");

  // Top-up dialog
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [cardId, setCardId] = useState<string>("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpReason, setTopUpReason] = useState("");

  const myCards = allCards.filter((c) => c.memberId === user.id && c.status === "active");
  const myCardReqs = cardReqs.filter((r) => r.memberId === user.id);
  const myTopUps = topUps.filter((r) => r.memberId === user.id);

  const submitCard = () => {
    const lim = parseFloat(limit);
    if (!lim || lim <= 0 || !reason) {
      toast.error("Please enter a limit and reason.");
      return;
    }
    const req: CardRequest = {
      id: `cr${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      memberId: user.id,
      type,
      requestedLimit: lim,
      limitPeriod: period,
      reason,
      status: "pending",
    };
    setCardReqs((prev) => [req, ...prev]);
    setCardOpen(false);
    setLimit("");
    setReason("");
    toast.success("Card request submitted");
  };

  const submitTopUp = () => {
    const amt = parseFloat(topUpAmount);
    if (!cardId || !amt || amt <= 0 || !topUpReason) {
      toast.error("Please complete all fields.");
      return;
    }
    const card = allCards.find((c) => c.id === cardId);
    const req: TopUpRequest = {
      id: `tr${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      memberId: user.id,
      cardId,
      currentBalance: card ? card.spendLimit - card.spent : 0,
      requestedAmount: amt,
      reason: topUpReason,
      status: "pending",
    };
    setTopUps((prev) => [req, ...prev]);
    setTopUpOpen(false);
    setCardId("");
    setTopUpAmount("");
    setTopUpReason("");
    toast.success("Top-up request submitted");
  };

  return (
    <AppLayout
      title="My requests"
      subtitle="Request a new card or a top-up on an existing one."
      actions={
        <div className="flex gap-2">
          <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={myCards.length === 0}>
                <ArrowUp className="mr-2 h-4 w-4" /> Top-up request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a card top-up</DialogTitle>
                <DialogDescription>Admin will review and fund your card.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Card</Label>
                  <Select value={cardId} onValueChange={setCardId}>
                    <SelectTrigger><SelectValue placeholder="Select card" /></SelectTrigger>
                    <SelectContent>
                      {myCards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.type} ••••{c.last4} — {formatCurrency(c.spendLimit - c.spent)} remaining
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (USD)</Label>
                  <Input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea value={topUpReason} onChange={(e) => setTopUpReason(e.target.value)} placeholder="Why do you need more funds?" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTopUpOpen(false)}>Cancel</Button>
                <Button onClick={submitTopUp}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={cardOpen} onOpenChange={setCardOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New card request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a new card</DialogTitle>
                <DialogDescription>Admin will review and issue the card.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Card type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as CardType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">Virtual</SelectItem>
                        <SelectItem value="single-use">Single-use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Period</Label>
                    <Select value={period} onValueChange={(v) => setPeriod(v as CardRequest["limitPeriod"])}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="per-transaction">Per-transaction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Spending limit (USD)</Label>
                  <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What will this card be used for?" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCardOpen(false)}>Cancel</Button>
                <Button onClick={submitCard}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" /> Card requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myCardReqs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                    <TableCell className="capitalize">{r.type.replace("-", " ")}</TableCell>
                    <TableCell>{formatCurrency(r.requestedLimit)}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                  </TableRow>
                ))}
                {myCardReqs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No card requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowUp className="h-4 w-4" /> Top-up requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTopUps.map((r) => {
                  const c = allCards.find((x) => x.id === r.cardId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                      <TableCell>{c ? `••••${c.last4}` : "—"}</TableCell>
                      <TableCell>{formatCurrency(r.requestedAmount)}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                    </TableRow>
                  );
                })}
                {myTopUps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No top-up requests yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
