import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  reimbursements as seedReimb,
  formatCurrency,
  formatDate,
  type Reimbursement,
} from "@/lib/mockData";
import { useCurrentUser } from "@/lib/currentUser";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["Travel", "Meals", "Office", "Software", "Marketing", "Other"];

const statusBadge = (s: Reimbursement["status"]) => {
  if (s === "approved")
    return <Badge className="border-0 bg-success/10 text-success">Approved</Badge>;
  if (s === "rejected")
    return <Badge className="border-0 bg-destructive/10 text-destructive">Rejected</Badge>;
  return <Badge className="border-0 bg-warning/10 text-warning">Pending</Badge>;
};

export default function MyReimbursements() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<Reimbursement[]>(seedReimb);
  const [open, setOpen] = useState(false);
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Travel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [hasReceipt, setHasReceipt] = useState(false);

  const mine = items
    .filter((r) => r.memberId === user.id)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const submit = () => {
    const amt = parseFloat(amount);
    if (!merchant || !amt || amt <= 0) {
      toast.error("Please enter a merchant and a valid amount.");
      return;
    }
    const r: Reimbursement = {
      id: `r${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      memberId: user.id,
      merchant,
      category,
      amount: amt,
      status: "pending",
      receipt: hasReceipt,
      description,
    };
    setItems((prev) => [r, ...prev]);
    setOpen(false);
    setMerchant("");
    setAmount("");
    setDescription("");
    setHasReceipt(false);
    toast.success("Expense submitted for approval");
  };

  return (
    <AppLayout
      title="Reimbursements"
      subtitle="Submit personal expenses for reimbursement."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Submit expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit reimbursement expense</DialogTitle>
              <DialogDescription>
                Your manager will review and approve reimbursement.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Merchant</Label>
                <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Lyft" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (AED)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this for?" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { setHasReceipt(true); toast.success("Receipt attached"); }}
              >
                <Upload className="mr-2 h-4 w-4" />
                {hasReceipt ? "Receipt attached ✓" : "Attach receipt"}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="shadow-soft">
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mine.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                  <TableCell className="font-medium">{r.merchant}</TableCell>
                  <TableCell className="text-muted-foreground">{r.category}</TableCell>
                  <TableCell>{r.receipt ? "Yes" : "—"}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(r.amount)}</TableCell>
                </TableRow>
              ))}
              {mine.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No expenses submitted yet.
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
