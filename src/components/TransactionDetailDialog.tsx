import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Transaction, memberById, cardById, chartOfAccounts, vatRates, formatCurrency, formatDate,
} from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, FileText, Plus, Trash2, CheckCircle2, Send, Building2, CreditCard, User, Globe,
} from "lucide-react";

interface SplitRow {
  id: string;
  account: string;
  amount: string;
  vatRate: string;
  nonBusiness: boolean;
  memo: string;
}

interface ReceiptFile { name: string; uploadedBy: "admin" | "cardholder"; uploadedAt: string; }
interface CommentEntry { author: "admin" | "cardholder"; name: string; text: string; at: string; }
interface AuditEntry { actor: string; action: string; at: string; }

const statusBadge = (s: string) => {
  if (s === "posted") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Posted</Badge>;
  if (s === "pending") return <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/10 border-0">Pending</Badge>;
  return <Badge variant="destructive">Declined</Badge>;
};

const accountingSoftwares = ["QuickBooks", "Xero", "NetSuite", "Sage Intacct"];

const FX_RATE = 1; // simple stub: assume USD
const INTL_FEE_PCT = 0.015;

export function TransactionDetailDialog({
  txn, open, onOpenChange,
}: {
  txn: Transaction | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadAs, setUploadAs] = useState<"admin" | "cardholder">("admin");

  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [adminComment, setAdminComment] = useState("");
  const [cardholderComment, setCardholderComment] = useState("");
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const [software, setSoftware] = useState<string>("QuickBooks");
  const [vatRate, setVatRate] = useState<string>("0");
  const [splits, setSplits] = useState<SplitRow[]>([]);

  const member = txn ? memberById(txn.memberId) : undefined;
  const card = txn?.cardId ? cardById(txn.cardId) : undefined;

  const isInternational = useMemo(() => {
    if (!txn?.country) return false;
    return txn.country !== "United States";
  }, [txn]);

  const intlFee = useMemo(() => (txn && isInternational ? +(txn.amount * INTL_FEE_PCT).toFixed(2) : 0), [txn, isInternational]);
  const totalCharged = useMemo(() => (txn ? +(txn.amount + intlFee).toFixed(2) : 0), [txn, intlFee]);

  // Initialize state when opening a new txn
  useEffect(() => {
    if (!txn || !open) return;
    setReceipts(txn.receipt ? [{ name: `${txn.id}-original.pdf`, uploadedBy: "cardholder", uploadedAt: txn.date }] : []);
    setSplits([{ id: crypto.randomUUID(), account: txn.debitAccount ?? "", amount: txn.amount.toFixed(2), vatRate: "ZERO_0", nonBusiness: false, memo: "" }]);
    setVatRate("ZERO_0");
    setAdminComment("");
    setCardholderComment("");
    setComments([]);
    setAudit([
      { actor: "System", action: `Transaction captured at ${txn.merchant}`, at: txn.date },
      { actor: "System", action: `Status set to ${txn.status}`, at: txn.date },
    ]);
  }, [txn, open]);

  const pushAudit = (action: string, actor = "Admin (Sarah Chen)") =>
    setAudit((a) => [...a, { actor, action, at: new Date().toISOString().slice(0, 10) }]);

  const splitTotal = useMemo(
    () => splits.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [splits],
  );
  const splitDelta = txn ? +(splitTotal - txn.amount).toFixed(2) : 0;
  const splitsBalanced = Math.abs(splitDelta) < 0.005;

  if (!txn) return null;

  const handleUpload = () => fileInputRef.current?.click();
  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const newOnes: ReceiptFile[] = Array.from(files).map((f) => ({
      name: f.name, uploadedBy: uploadAs, uploadedAt: new Date().toISOString().slice(0, 10),
    }));
    setReceipts((r) => [...r, ...newOnes]);
    pushAudit(`Uploaded ${newOnes.length} receipt(s) as ${uploadAs}`);
    toast({ title: "Receipt uploaded", description: `${newOnes.length} file(s) attached.` });
  };

  const addSplit = () => setSplits((s) => [...s, { id: crypto.randomUUID(), account: "", amount: "0.00", vatRate: "0", nonBusiness: false, memo: "" }]);
  const removeSplit = (id: string) => setSplits((s) => s.filter((r) => r.id !== id));
  const updateSplit = (id: string, patch: Partial<SplitRow>) =>
    setSplits((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const sendComment = (who: "admin" | "cardholder") => {
    const text = (who === "admin" ? adminComment : cardholderComment).trim();
    if (!text) return;
    const entry: CommentEntry = {
      author: who,
      name: who === "admin" ? "Sarah Chen" : member?.name ?? "Cardholder",
      text,
      at: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setComments((c) => [...c, entry]);
    pushAudit(`${entry.name} added a comment`, entry.name);
    if (who === "admin") setAdminComment(""); else setCardholderComment("");
  };

  const postToAccounting = () => {
    if (!splitsBalanced) {
      toast({ title: "Splits not balanced", description: `Difference: ${formatCurrency(splitDelta)}`, variant: "destructive" });
      return;
    }
    pushAudit(`Mapped to ${software} across ${splits.length} account(s)`);
    toast({ title: "Mapped", description: `Sent to ${software}.` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{txn.merchant}</DialogTitle>
              <DialogDescription>
                {formatDate(txn.date)} · {txn.id} · {txn.category}
              </DialogDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">−{formatCurrency(txn.amount)}</p>
              <div className="mt-1">{statusBadge(txn.status)}</div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <section className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium"><User className="h-4 w-4" /> Cardholder</div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{member?.name}</p>
                  <p className="text-muted-foreground">{member?.email}</p>
                  <p className="text-muted-foreground">{member?.department} · {member?.role}</p>
                </div>
              </section>

              <section className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium"><CreditCard className="h-4 w-4" /> Card</div>
                {card ? (
                  <div className="text-sm space-y-1">
                    <p className="font-mono">•••• •••• •••• {card.last4}</p>
                    <p className="text-muted-foreground capitalize">{card.type} card · {card.status}</p>
                    <p className="text-muted-foreground">Limit {formatCurrency(card.spendLimit)} / {card.limitPeriod}</p>
                  </div>
                ) : <p className="text-sm text-muted-foreground">No card on file</p>}
              </section>

              <section className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium"><Building2 className="h-4 w-4" /> Merchant</div>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{txn.merchant}</p>
                  <p className="text-muted-foreground">{txn.vendor ?? "—"}</p>
                  <p className="text-muted-foreground">Category: {txn.category}</p>
                </div>
              </section>

              <section className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium"><Globe className="h-4 w-4" /> Payment details</div>
                <div className="text-sm grid grid-cols-2 gap-y-1">
                  <span className="text-muted-foreground">Type</span><span>Card purchase</span>
                  <span className="text-muted-foreground">Currency</span><span>USD</span>
                  <span className="text-muted-foreground">Country</span><span>{txn.country ?? "—"}</span>
                  <span className="text-muted-foreground">International</span>
                  <span>{isInternational ? "Yes" : "No"}</span>
                </div>
              </section>
            </div>

            <section className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Amounts</p>
              <div className="text-sm grid grid-cols-2 gap-y-1">
                <span className="text-muted-foreground">Transaction amount</span>
                <span className="text-right">{formatCurrency(txn.amount)}</span>
                <span className="text-muted-foreground">International fee {isInternational ? "(1.5%)" : ""}</span>
                <span className="text-right">{formatCurrency(intlFee)}</span>
                <Separator className="col-span-2 my-1" />
                <span className="font-medium">Total charged</span>
                <span className="text-right font-semibold">{formatCurrency(totalCharged)}</span>
              </div>
            </section>
          </TabsContent>

          {/* RECEIPTS */}
          <TabsContent value="receipts" className="space-y-4">
            <div className="flex items-end gap-2 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Upload as</Label>
                <Select value={uploadAs} onValueChange={(v) => setUploadAs(v as "admin" | "cardholder")}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cardholder">Cardholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpload} className="gap-2">
                <Upload className="h-4 w-4" /> Upload receipt
              </Button>
              <input
                ref={fileInputRef} type="file" multiple className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {receipts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center border rounded-lg">No receipts uploaded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Uploaded by</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-success" /> {r.name}
                      </TableCell>
                      <TableCell className="text-sm capitalize">{r.uploadedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(r.uploadedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* ACCOUNTING */}
          <TabsContent value="accounting" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Accounting software</Label>
                <Select value={software} onValueChange={setSoftware}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accountingSoftwares.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground self-end">
                Amounts entered are <span className="font-medium text-foreground">VAT-inclusive</span>. Net &amp; VAT are derived per line.
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Split mapping</p>
                <Button variant="outline" size="sm" className="gap-2" onClick={addSplit}>
                  <Plus className="h-4 w-4" /> Add split
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Debit account</TableHead>
                    <TableHead className="w-28">Gross (incl. VAT)</TableHead>
                    <TableHead className="w-24">VAT</TableHead>
                    <TableHead className="w-24 text-right">Net</TableHead>
                    <TableHead className="w-24 text-right">VAT amt</TableHead>
                    <TableHead className="w-24">Non-business</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {splits.map((row) => {
                    const gross = parseFloat(row.amount) || 0;
                    const rate = parseFloat(row.vatRate) || 0;
                    const net = +(gross / (1 + rate / 100)).toFixed(2);
                    const vatAmt = +(gross - net).toFixed(2);
                    return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Select value={row.account} onValueChange={(v) => updateSplit(row.id, { account: v })}>
                          <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                          <SelectContent>
                            {chartOfAccounts.map((a) => (
                              <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" step="0.01" value={row.amount}
                          onChange={(e) => updateSplit(row.id, { amount: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.vatRate}
                          onValueChange={(v) => updateSplit(row.id, { vatRate: v })}
                          disabled={row.nonBusiness}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {vatRates.map((v) => <SelectItem key={v.rate} value={String(v.rate)}>{v.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{formatCurrency(net)}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{formatCurrency(vatAmt)}</TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={row.nonBusiness}
                            onChange={(e) => updateSplit(row.id, {
                              nonBusiness: e.target.checked,
                              vatRate: e.target.checked ? "0" : row.vatRate,
                            })}
                          />
                          <span className="text-muted-foreground">Personal</span>
                        </label>
                      </TableCell>
                      <TableCell>
                        <Input value={row.memo} onChange={(e) => updateSplit(row.id, { memo: e.target.value })} placeholder="Optional" />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeSplit(row.id)} disabled={splits.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Allocated {formatCurrency(splitTotal)} of {formatCurrency(txn.amount)} (must equal total paid)
                </span>
                {splitsBalanced ? (
                  <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" /> Balanced</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-destructive">Difference: {formatCurrency(splitDelta)}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSplits((s) => {
                          if (!s.length) return s;
                          const last = s[s.length - 1];
                          const others = s.slice(0, -1).reduce((a, r) => a + (parseFloat(r.amount) || 0), 0);
                          const remaining = +(txn.amount - others).toFixed(2);
                          return s.map((r, i) => i === s.length - 1 ? { ...r, amount: remaining.toFixed(2) } : r);
                        });
                      }}
                    >
                      Auto-balance
                    </Button>
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={postToAccounting} className="gap-2">
                <Send className="h-4 w-4" /> Map to {software}
              </Button>
            </div>
          </TabsContent>

          {/* COMMENTS */}
          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Admin comment</Label>
              <Textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)} placeholder="Add a note as admin…" />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => sendComment("admin")} disabled={!adminComment.trim()}>Post as admin</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs">Cardholder comment</Label>
              <Textarea value={cardholderComment} onChange={(e) => setCardholderComment(e.target.value)} placeholder={`Add a note as ${member?.name ?? "cardholder"}…`} />
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={() => sendComment("cardholder")} disabled={!cardholderComment.trim()}>Post as cardholder</Button>
              </div>
            </div>

            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">Thread</p>
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : comments.map((c, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span>{c.at} · <span className="capitalize">{c.author}</span></span>
                  </div>
                  <p className="text-sm">{c.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* AUDIT */}
          <TabsContent value="audit">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(a.at)}</TableCell>
                    <TableCell className="text-sm">{a.actor}</TableCell>
                    <TableCell className="text-sm">{a.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
