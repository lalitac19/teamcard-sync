import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  transactions, reimbursements, invoices, walletTopUps,
  formatCurrency, formatDate, memberById, chartOfAccounts, vatRates,
} from "@/lib/mockData";
import {
  CheckCircle2, ChevronDown, ChevronRight, Download, Plus, RefreshCw, Trash2, Upload,
} from "lucide-react";
import { toast } from "sonner";

/* ---------- Shared types ---------- */
interface SplitLine {
  id: string;
  debitAccount?: string;
  amount: string; // string for input
  vatRate?: string;
  nonBusiness: boolean;
  memo: string;
}

const newLine = (amount: number, debitAccount?: string, vatRate?: string): SplitLine => ({
  id: crypto.randomUUID(),
  debitAccount,
  amount: amount.toFixed(2),
  vatRate,
  nonBusiness: false,
  memo: "",
});

const splitTotal = (lines: SplitLine[]) =>
  lines.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0);

const splitsBalanced = (lines: SplitLine[], total: number) =>
  Math.abs(splitTotal(lines) - total) < 0.005;

const splitsReady = (lines: SplitLine[]) =>
  lines.length > 0 && lines.every((l) => !!l.debitAccount && (!!l.vatRate || l.nonBusiness));

/* ---------- Reusable selects ---------- */
const AccountingHeader = ({ count, onExport }: { count: number; onExport: () => void }) => (
  <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="text-sm">
        <p className="font-medium">QuickBooks Online connected</p>
        <p className="text-xs text-muted-foreground">Chart of accounts synced • {chartOfAccounts.length} accounts</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-2"><RefreshCw className="h-3.5 w-3.5" /> Sync chart</Button>
      <Button size="sm" className="gap-2" onClick={onExport}>
        <Upload className="h-4 w-4" /> Export selected ({count})
      </Button>
    </div>
  </div>
);

const AccountSelect = ({ value, onChange, size = "sm" }: { value?: string; onChange: (v: string) => void; size?: "sm" | "xs" }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={`h-8 ${size === "xs" ? "w-[200px]" : "w-[220px]"} border-dashed text-xs`}>
      <SelectValue placeholder="Map debit account…" />
    </SelectTrigger>
    <SelectContent>
      {chartOfAccounts.filter((a) => a.type === "Expense" || a.type === "Asset").map((a) => (
        <SelectItem key={a.code} value={a.code}>
          <span className="font-mono text-muted-foreground">{a.code}</span> · {a.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const VatSelect = ({ value, onChange, disabled }: { value?: string; onChange: (v: string) => void; disabled?: boolean }) => (
  <Select value={value} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="h-8 w-[110px] border-dashed text-xs">
      <SelectValue placeholder="VAT" />
    </SelectTrigger>
    <SelectContent>
      {vatRates.map((v) => (
        <SelectItem key={v.code} value={v.code}>{v.label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

/* ---------- Reusable split editor ---------- */
function SplitEditor({
  total, lines, onChange,
}: {
  total: number;
  lines: SplitLine[];
  onChange: (lines: SplitLine[]) => void;
}) {
  const update = (id: string, patch: Partial<SplitLine>) =>
    onChange(lines.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const remove = (id: string) => onChange(lines.filter((l) => l.id !== id));
  const add = () => {
    const allocated = splitTotal(lines);
    const remaining = Math.max(0, +(total - allocated).toFixed(2));
    onChange([...lines, newLine(remaining)]);
  };

  const allocated = splitTotal(lines);
  const balanced = splitsBalanced(lines, total);
  const delta = +(allocated - total).toFixed(2);

  return (
    <div className="space-y-2 rounded-md border border-dashed bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Line-wise mapping</p>
        <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={add}>
          <Plus className="h-3 w-3" /> Add line
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-8 text-xs">Debit account</TableHead>
            <TableHead className="h-8 w-28 text-xs">Amount</TableHead>
            <TableHead className="h-8 w-28 text-xs">VAT</TableHead>
            <TableHead className="h-8 w-24 text-xs">Non-business</TableHead>
            <TableHead className="h-8 text-xs">Memo</TableHead>
            <TableHead className="h-8 w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="py-1.5">
                <AccountSelect value={l.debitAccount} onChange={(v) => update(l.id, { debitAccount: v })} size="xs" />
              </TableCell>
              <TableCell className="py-1.5">
                <Input
                  type="number" step="0.01" value={l.amount}
                  className="h-8 text-xs"
                  onChange={(e) => update(l.id, { amount: e.target.value })}
                />
              </TableCell>
              <TableCell className="py-1.5">
                <VatSelect
                  value={l.vatRate}
                  onChange={(v) => update(l.id, { vatRate: v })}
                  disabled={l.nonBusiness}
                />
              </TableCell>
              <TableCell className="py-1.5">
                <label className="flex items-center gap-1.5 text-xs">
                  <Checkbox
                    checked={l.nonBusiness}
                    onCheckedChange={(v) => update(l.id, {
                      nonBusiness: !!v,
                      vatRate: v ? "ZERO_0" : l.vatRate,
                    })}
                  />
                  <span className="text-muted-foreground">Personal</span>
                </label>
              </TableCell>
              <TableCell className="py-1.5">
                <Input
                  className="h-8 text-xs"
                  value={l.memo}
                  onChange={(e) => update(l.id, { memo: e.target.value })}
                  placeholder="Optional memo"
                />
              </TableCell>
              <TableCell className="py-1.5">
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => remove(l.id)} disabled={lines.length === 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Allocated {formatCurrency(allocated)} of {formatCurrency(total)}
        </span>
        {balanced ? (
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Balanced
          </span>
        ) : (
          <span className="text-destructive">Difference: {formatCurrency(delta)}</span>
        )}
      </div>
    </div>
  );
}

/* ---------- Helpers for row state ---------- */
type RowBase = { id: string; selected: boolean; expanded: boolean; lines: SplitLine[] };

const initLines = (amount: number, debitAccount?: string, vatRate?: string): SplitLine[] =>
  [newLine(amount, debitAccount, vatRate)];

const rowReady = (r: RowBase, total: number) => splitsReady(r.lines) && splitsBalanced(r.lines, total);

/* ---------- Page ---------- */
const AccountingExport = () => {
  return (
    <AppLayout
      title="Accounting Export"
      subtitle="Map and push transactions to QuickBooks Online."
      actions={<Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /> Download history</Button>}
    >
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-2xl md:grid-cols-4">
          <TabsTrigger value="cards">Card transactions</TabsTrigger>
          <TabsTrigger value="reimbursements">Reimbursements</TabsTrigger>
          <TabsTrigger value="invoices">Unpaid invoices</TabsTrigger>
          <TabsTrigger value="topups">Wallet top-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4"><CardTxnsTab /></TabsContent>
        <TabsContent value="reimbursements" className="mt-4"><ReimbursementsTab /></TabsContent>
        <TabsContent value="invoices" className="mt-4"><InvoicesTab /></TabsContent>
        <TabsContent value="topups" className="mt-4"><TopUpsTab /></TabsContent>
      </Tabs>
    </AppLayout>
  );
};

/* ---------- Tab 1: Card transactions ---------- */
function CardTxnsTab() {
  const postedTxns = transactions.filter((t) => t.status === "posted");
  const pendingCount = transactions.filter((t) => t.status === "pending").length;

  const [rows, setRows] = useState(
    postedTxns.map((t) => ({
      ...t,
      selected: false,
      expanded: false,
      lines: initLines(t.amount, t.debitAccount, t.vatRate != null ? String(t.vatRate) : undefined),
    })),
  );
  const selectedCount = rows.filter((r) => r.selected).length;
  const toggleAll = (v: boolean) => setRows(rows.map((r) => ({ ...r, selected: v })));
  const update = (id: string, patch: Partial<typeof rows[number]>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm">
          <span className="font-medium">{pendingCount} card transaction{pendingCount > 1 ? "s" : ""}</span> pending settlement — they'll appear here once posted.
        </div>
      )}
      <AccountingHeader
        count={selectedCount}
        onExport={() => toast.success(`Exported ${selectedCount} transactions to QuickBooks`)}
      />
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox onCheckedChange={(v) => toggleAll(!!v)} /></TableHead>
                <TableHead className="w-8" />
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const m = memberById(r.memberId);
                const ready = rowReady(r, r.amount);
                return (
                  <>
                    <TableRow key={r.id} data-state={r.selected ? "selected" : undefined}>
                      <TableCell><Checkbox checked={r.selected} onCheckedChange={(v) => update(r.id, { selected: !!v })} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update(r.id, { expanded: !r.expanded })}>
                          {r.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                      <TableCell><p className="text-sm font-medium">{r.merchant}</p><p className="text-xs text-muted-foreground">{r.category}</p></TableCell>
                      <TableCell className="text-sm">{m?.name}</TableCell>
                      <TableCell className="text-sm">{r.vendor}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        {ready
                          ? <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Ready</Badge>
                          : <Badge variant="secondary">Needs mapping</Badge>}
                      </TableCell>
                    </TableRow>
                    {r.expanded && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/20 p-3">
                          <SplitEditor total={r.amount} lines={r.lines} onChange={(lines) => update(r.id, { lines })} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Tab 2: Reimbursements ---------- */
function ReimbursementsTab() {
  const approved = reimbursements.filter((r) => r.status === "approved");
  const [rows, setRows] = useState(
    approved.map((r) => ({
      ...r,
      selected: false,
      expanded: false,
      lines: initLines(r.amount),
    })),
  );
  const selectedCount = rows.filter((r) => r.selected).length;
  const toggleAll = (v: boolean) => setRows(rows.map((r) => ({ ...r, selected: v })));
  const update = (id: string, patch: Partial<typeof rows[number]>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const pendingCount = reimbursements.filter((r) => r.status === "pending").length;

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm">
          <span className="font-medium">{pendingCount} reimbursement{pendingCount > 1 ? "s" : ""}</span> awaiting your approval — they'll appear here once approved.
        </div>
      )}
      <AccountingHeader
        count={selectedCount}
        onExport={() => toast.success(`Exported ${selectedCount} reimbursements to QuickBooks`)}
      />
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox onCheckedChange={(v) => toggleAll(!!v)} /></TableHead>
                <TableHead className="w-8" />
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Merchant / Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const m = memberById(r.memberId);
                const ready = rowReady(r, r.amount);
                return (
                  <>
                    <TableRow key={r.id} data-state={r.selected ? "selected" : undefined}>
                      <TableCell><Checkbox checked={r.selected} onCheckedChange={(v) => update(r.id, { selected: !!v })} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update(r.id, { expanded: !r.expanded })}>
                          {r.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                      <TableCell className="text-sm">{m?.name}</TableCell>
                      <TableCell><p className="text-sm font-medium">{r.merchant}</p><p className="text-xs text-muted-foreground">{r.description}</p></TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        {ready
                          ? <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Ready</Badge>
                          : <Badge variant="secondary">Needs mapping</Badge>}
                      </TableCell>
                    </TableRow>
                    {r.expanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20 p-3">
                          <SplitEditor total={r.amount} lines={r.lines} onChange={(lines) => update(r.id, { lines })} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Tab 3: Unpaid invoices ---------- */
function InvoicesTab() {
  const approved = invoices.filter((i) => i.status === "approved");
  const [rows, setRows] = useState(
    approved.map((i) => ({
      ...i,
      selected: false,
      expanded: false,
      lines: initLines(i.amount),
    })),
  );
  const selectedCount = rows.filter((r) => r.selected).length;
  const toggleAll = (v: boolean) => setRows(rows.map((r) => ({ ...r, selected: v })));
  const update = (id: string, patch: Partial<typeof rows[number]>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const pendingCount = invoices.filter((i) => i.status === "pending").length;

  return (
    <>
      {pendingCount > 0 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm">
          <span className="font-medium">{pendingCount} invoice{pendingCount > 1 ? "s" : ""}</span> awaiting approval from admin.
        </div>
      )}
      <AccountingHeader
        count={selectedCount}
        onExport={() => toast.success(`Pushed ${selectedCount} bills to QuickBooks`)}
      />
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox onCheckedChange={(v) => toggleAll(!!v)} /></TableHead>
                <TableHead className="w-8" />
                <TableHead>Invoice #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const m = memberById(r.uploadedBy);
                const ready = rowReady(r, r.amount);
                return (
                  <>
                    <TableRow key={r.id} data-state={r.selected ? "selected" : undefined}>
                      <TableCell><Checkbox checked={r.selected} onCheckedChange={(v) => update(r.id, { selected: !!v })} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update(r.id, { expanded: !r.expanded })}>
                          {r.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.invoiceNumber}</TableCell>
                      <TableCell className="text-sm font-medium">{r.vendor}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                      <TableCell className="text-sm">{formatDate(r.dueDate)}</TableCell>
                      <TableCell className="text-sm">{m?.name}</TableCell>
                      <TableCell className="text-right text-sm font-semibold">{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        {ready
                          ? <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Ready</Badge>
                          : <Badge variant="secondary">Needs mapping</Badge>}
                      </TableCell>
                    </TableRow>
                    {r.expanded && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/20 p-3">
                          <SplitEditor total={r.amount} lines={r.lines} onChange={(lines) => update(r.id, { lines })} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- Tab 4: Wallet top-ups ---------- */
function TopUpsTab() {
  const [rows, setRows] = useState(
    walletTopUps.map((w) => ({
      ...w,
      selected: false,
      expanded: false,
      lines: initLines(w.amount),
    })),
  );
  const selectedCount = rows.filter((r) => r.selected).length;
  const toggleAll = (v: boolean) => setRows(rows.map((r) => ({ ...r, selected: v })));
  const update = (id: string, patch: Partial<typeof rows[number]>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <>
      <AccountingHeader
        count={selectedCount}
        onExport={() => toast.success(`Exported ${selectedCount} top-ups as bank transfers to QuickBooks`)}
      />
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox onCheckedChange={(v) => toggleAll(!!v)} /></TableHead>
                <TableHead className="w-8" />
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const ready = rowReady(r, r.amount);
                return (
                  <>
                    <TableRow key={r.id} data-state={r.selected ? "selected" : undefined}>
                      <TableCell><Checkbox checked={r.selected} onCheckedChange={(v) => update(r.id, { selected: !!v })} disabled={r.status !== "completed"} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update(r.id, { expanded: !r.expanded })}>
                          {r.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
                      <TableCell className="font-mono text-xs">{r.reference}</TableCell>
                      <TableCell className="text-sm">{r.source}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-success">+{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        {r.status === "processing"
                          ? <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Processing</Badge>
                          : ready
                            ? <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Ready</Badge>
                            : <Badge variant="secondary">Needs mapping</Badge>}
                      </TableCell>
                    </TableRow>
                    {r.expanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20 p-3">
                          <SplitEditor total={r.amount} lines={r.lines} onChange={(lines) => update(r.id, { lines })} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

export default AccountingExport;
