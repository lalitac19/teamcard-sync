import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Transaction,
  cardById,
  formatCurrency,
  formatDate,
} from "@/lib/mockData";
import { useCurrentUser } from "@/lib/currentUser";
import {
  Upload,
  FileText,
  Send,
  Building2,
  CreditCard,
  Globe,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ReceiptFile {
  name: string;
  uploadedAt: string;
  uploadedBy: string;
}
interface CommentEntry {
  name: string;
  text: string;
  at: string;
}

const statusBadge = (s: string) => {
  if (s === "posted")
    return <Badge className="border-0 bg-success/10 text-success">Posted</Badge>;
  if (s === "pending")
    return <Badge className="border-0 bg-warning/10 text-warning">Pending</Badge>;
  return <Badge className="border-0 bg-destructive/10 text-destructive">Declined</Badge>;
};

export function MemberTxnDetailDialog({
  txn,
  open,
  onOpenChange,
}: {
  txn: Transaction | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { user } = useCurrentUser();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [receipts, setReceipts] = useState<ReceiptFile[]>([]);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!txn || !open) return;
    setReceipts(
      txn.receipt
        ? [{ name: `${txn.id}-original.pdf`, uploadedAt: txn.date, uploadedBy: user.name }]
        : [],
    );
    setComments([]);
    setDraft("");
  }, [txn, open, user.name]);

  if (!txn) return null;

  const card = txn.cardId ? cardById(txn.cardId) : undefined;

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const added = Array.from(files).map((f) => ({
      name: f.name,
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: user.name,
    }));
    setReceipts((r) => [...r, ...added]);
    toast.success(`${added.length} receipt(s) attached`);
  };

  const sendComment = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((c) => [
      ...c,
      { name: user.name, text, at: new Date().toISOString().slice(0, 16).replace("T", " ") },
    ]);
    setDraft("");
    toast.success("Comment added");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="receipts">
              Receipts {receipts.length > 0 && `(${receipts.length})`}
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comments {comments.length > 0 && `(${comments.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <section className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" /> Card
                </div>
                {card ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-mono">•••• {card.last4}</p>
                    <p className="capitalize text-muted-foreground">
                      {card.type} · {card.status}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No card on file</p>
                )}
              </section>

              <section className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="h-4 w-4" /> Merchant
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{txn.merchant}</p>
                  <p className="text-muted-foreground">{txn.vendor ?? "—"}</p>
                </div>
              </section>

              <section className="space-y-2 rounded-lg border p-4 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" /> Payment details
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Country</span>
                  <span>{txn.country ?? "—"}</span>
                  <span className="text-muted-foreground">Category</span>
                  <span>{txn.category}</span>
                  <Separator className="col-span-2 my-1" />
                  <span className="font-medium">Amount</span>
                  <span className="text-right font-semibold">{formatCurrency(txn.amount)}</span>
                </div>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={() => fileRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" /> Upload receipt
              </Button>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,application/pdf"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <p className="text-xs text-muted-foreground">PDF or image, up to 20MB.</p>
            </div>

            {receipts.length === 0 ? (
              <div className="rounded-lg border py-10 text-center">
                <ReceiptIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No receipts uploaded yet.</p>
              </div>
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
                      <TableCell className="text-sm">{r.uploadedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(r.uploadedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-2">
              {comments.length === 0 ? (
                <p className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
                  No comments yet.
                </p>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{c.name}</span>
                      <span>{c.at}</span>
                    </div>
                    <p className="mt-1 text-sm">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a note for finance — what was this for, who attended, etc."
                rows={3}
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{draft.length}/1000</p>
                <Button onClick={sendComment} disabled={!draft.trim()} className="gap-2">
                  <Send className="h-4 w-4" /> Post comment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
