import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  invoices as seedInvoices,
  formatCurrency,
  formatDate,
  type Invoice,
} from "@/lib/mockData";
import { useCurrentUser } from "@/lib/currentUser";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

const statusBadge = (s: Invoice["status"]) => {
  if (s === "approved") return <Badge className="border-0 bg-success/10 text-success">Approved</Badge>;
  if (s === "rejected") return <Badge className="border-0 bg-destructive/10 text-destructive">Rejected</Badge>;
  return <Badge className="border-0 bg-warning/10 text-warning">Pending</Badge>;
};

export default function MyInvoices() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<Invoice[]>(seedInvoices);
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attached, setAttached] = useState(false);

  const mine = items
    .filter((i) => i.uploadedBy === user.id)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const submit = () => {
    const amt = parseFloat(amount);
    if (!vendor || !invoiceNumber || !amt || amt <= 0) {
      toast.error("Please complete all required fields.");
      return;
    }
    const inv: Invoice = {
      id: `i${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString().slice(0, 10),
      dueDate: dueDate || new Date(Date.now() + 30 * 86400e3).toISOString().slice(0, 10),
      vendor,
      amount: amt,
      uploadedBy: user.id,
      status: "pending",
    };
    setItems((prev) => [inv, ...prev]);
    setOpen(false);
    setVendor("");
    setInvoiceNumber("");
    setAmount("");
    setDueDate("");
    setAttached(false);
    toast.success("Invoice uploaded for approval");
  };

  return (
    <AppLayout
      title="Vendor invoices"
      subtitle="Upload vendor invoices for approval and payment."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Upload invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload vendor invoice</DialogTitle>
              <DialogDescription>Finance will review and process payment.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Vendor</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Acme Legal LLP" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Invoice #</Label>
                  <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-1234" />
                </div>
                <div>
                  <Label>Amount (AED)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { setAttached(true); toast.success("Invoice file attached"); }}
              >
                <Upload className="mr-2 h-4 w-4" />
                {attached ? "Invoice attached ✓" : "Attach PDF"}
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Upload</Button>
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mine.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(i.date)}</TableCell>
                  <TableCell className="font-mono text-xs">{i.invoiceNumber}</TableCell>
                  <TableCell className="font-medium">{i.vendor}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(i.dueDate)}</TableCell>
                  <TableCell>{statusBadge(i.status)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(i.amount)}</TableCell>
                </TableRow>
              ))}
              {mine.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No invoices uploaded yet.
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
