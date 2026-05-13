import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, Plus, Trash2, Lock } from "lucide-react";
import {
  defaultRolePermissions,
  permissionCatalog,
  chartOfAccounts,
  vatRates,
  type RolePermissions,
} from "@/lib/mockData";
import { toast } from "sonner";

const FEES_ACCOUNT_KEY = "accounting:feesAccount";
const FEES_VAT_RATE_KEY = "accounting:feesVatRate";

const Settings = () => {
  return (
    <AppLayout title="Settings" subtitle="Workspace, roles, integrations, and preferences.">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold">Company</h3>
                <p className="text-sm text-muted-foreground">
                  Information shown on cards and statements.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Company name</Label>
                    <Input defaultValue="Peko Inc." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Billing email</Label>
                    <Input defaultValue="finance@peko.co" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold">Notifications & controls</h3>
                <div className="mt-4 space-y-4">
                  <Toggle label="Require receipts on transactions over $75" defaultChecked />
                  <Toggle label="Auto-decline cards over their monthly limit" defaultChecked />
                  <Toggle label="Notify admins of pending KYC after 48 hours" defaultChecked />
                  <Toggle label="Send weekly spend digest by email" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <RolesPermissions />
        </TabsContent>

        <TabsContent value="integrations" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-soft">
              <CardContent className="p-6">
                <h3 className="text-base font-semibold">Integrations</h3>
                <p className="text-sm text-muted-foreground">Connect your accounting software.</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3">
                    <div>
                      <p className="text-sm font-medium">QuickBooks Online</p>
                      <p className="flex items-center gap-1 text-xs text-success">
                        <CheckCircle2 className="h-3 w-3" /> Connected • Peko Inc.
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Xero</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <FeesAccountCard />
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

const CUSTOM_ROLES_KEY = "roles:custom";

type ExtendedRole = RolePermissions & { custom?: boolean };

function RolesPermissions() {
  const [roles, setRoles] = useState<ExtendedRole[]>(defaultRolePermissions);
  const [activeRole, setActiveRole] = useState<string>(defaultRolePermissions[0].role);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [cloneFrom, setCloneFrom] = useState<string>("__blank__");

  useEffect(() => {
    const stored = localStorage.getItem(CUSTOM_ROLES_KEY);
    if (stored) {
      try {
        const custom: ExtendedRole[] = JSON.parse(stored);
        setRoles([...defaultRolePermissions, ...custom.map((c) => ({ ...c, custom: true }))]);
      } catch {/* ignore */}
    }
  }, []);

  const persistCustom = (all: ExtendedRole[]) => {
    const custom = all.filter((r) => r.custom);
    localStorage.setItem(CUSTOM_ROLES_KEY, JSON.stringify(custom));
  };

  const current = roles.find((r) => r.role === activeRole) ?? roles[0];

  const togglePerm = (key: string) => {
    setRoles((prev) => {
      const next = prev.map((r) =>
        r.role === current.role
          ? { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } }
          : r,
      );
      persistCustom(next);
      return next;
    });
  };

  const updateMeta = (field: "label" | "description", value: string) => {
    setRoles((prev) => {
      const next = prev.map((r) =>
        r.role === current.role ? { ...r, [field]: value } : r,
      );
      persistCustom(next);
      return next;
    });
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Role name is required");
      return;
    }
    const slug = `custom_${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Date.now().toString(36)}`;
    const basePerms =
      cloneFrom === "__blank__"
        ? Object.fromEntries(permissionCatalog.map((p) => [p.key, false]))
        : { ...(roles.find((r) => r.role === cloneFrom)?.permissions ?? {}) };

    const created: ExtendedRole = {
      role: slug as any,
      label: trimmed,
      description: newDesc.trim() || "Custom role",
      permissions: basePerms,
      custom: true,
    };
    setRoles((prev) => {
      const next = [...prev, created];
      persistCustom(next);
      return next;
    });
    setActiveRole(slug);
    setNewName("");
    setNewDesc("");
    setCloneFrom("__blank__");
    setCreateOpen(false);
    toast.success(`Role "${trimmed}" created`);
  };

  const handleDelete = (roleKey: string) => {
    setRoles((prev) => {
      const next = prev.filter((r) => r.role !== roleKey);
      persistCustom(next);
      return next;
    });
    if (activeRole === roleKey) setActiveRole(defaultRolePermissions[0].role);
    toast.success("Role deleted");
  };

  const groups = Array.from(new Set(permissionCatalog.map((p) => p.group)));
  const enabledCount = Object.values(current.permissions).filter(Boolean).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="shadow-soft">
        <CardContent className="p-3">
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Roles
            </p>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 gap-1 px-2">
                  <Plus className="h-3.5 w-3.5" /> New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create custom role</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Role name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Finance Reviewer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="What this role can do"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Start from</Label>
                    <Select value={cloneFrom} onValueChange={setCloneFrom}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__blank__">Blank (no permissions)</SelectItem>
                        {roles.map((r) => (
                          <SelectItem key={r.role} value={r.role}>
                            Clone from {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {roles.map((r) => (
              <button
                key={r.role}
                onClick={() => setActiveRole(r.role)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  activeRole === r.role
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium truncate">{r.label}</div>
                  {r.custom ? (
                    <Badge
                      variant="outline"
                      className={`h-5 shrink-0 px-1.5 text-[10px] ${
                        activeRole === r.role
                          ? "border-primary-foreground/40 text-primary-foreground"
                          : ""
                      }`}
                    >
                      Custom
                    </Badge>
                  ) : (
                    <Lock
                      className={`h-3 w-3 shrink-0 ${
                        activeRole === r.role
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                </div>
                <div
                  className={`text-xs ${
                    activeRole === r.role
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {Object.values(r.permissions).filter(Boolean).length} permissions
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              {current.custom ? (
                <>
                  <Input
                    value={current.label}
                    onChange={(e) => updateMeta("label", e.target.value)}
                    className="h-9 text-base font-semibold"
                  />
                  <Textarea
                    value={current.description}
                    onChange={(e) => updateMeta("description", e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </>
              ) : (
                <>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    {current.label}
                    <Badge variant="secondary" className="text-[10px]">System</Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">{current.description}</p>
                </>
              )}
              <p className="text-xs text-muted-foreground">
                {enabledCount} of {permissionCatalog.length} permissions enabled
              </p>
            </div>
            <div className="flex items-center gap-2">
              {current.custom && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete role "{current.label}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        People assigned to this role will need to be reassigned.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(current.role)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="sm" onClick={() => {
                persistCustom(roles);
                toast.success(`${current.label} permissions saved`);
              }}>
                Save changes
              </Button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {groups.map((group) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group}
                </p>
                <div className="space-y-2">
                  {permissionCatalog
                    .filter((p) => p.group === group)
                    .map((p) => (
                      <div
                        key={p.key}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2.5"
                      >
                        <span className="text-sm">{p.label}</span>
                        <Switch
                          checked={!!current.permissions[p.key]}
                          onCheckedChange={() => togglePerm(p.key)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <p className="text-sm">{label}</p>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function FeesAccountCard() {
  const [account, setAccount] = useState<string>("5090");
  const [vatRate, setVatRate] = useState<string>("STD_5");

  useEffect(() => {
    const stored = localStorage.getItem(FEES_ACCOUNT_KEY);
    if (stored) setAccount(stored);
    const storedVat = localStorage.getItem(FEES_VAT_RATE_KEY);
    if (storedVat) setVatRate(storedVat);
  }, []);

  const handleChange = (v: string) => {
    setAccount(v);
    localStorage.setItem(FEES_ACCOUNT_KEY, v);
    const acc = chartOfAccounts.find((a) => a.code === v);
    toast.success(`Card fees will auto-map to ${acc?.code} · ${acc?.name}`);
  };

  const handleVatChange = (v: string) => {
    setVatRate(v);
    localStorage.setItem(FEES_VAT_RATE_KEY, v);
    const vr = vatRates.find((r) => r.code === v);
    toast.success(`Default VAT rate on fees set to ${vr?.label} (inclusive)`);
  };

  const expenseAccounts = chartOfAccounts.filter((a) => a.type === "Expense");

  const selectedVat = vatRates.find((r) => r.code === vatRate);
  const rate = selectedVat?.rate ?? 0;
  const sampleGross = 100;
  const sampleNet = rate > 0 ? sampleGross / (1 + rate / 100) : sampleGross;
  const sampleVat = sampleGross - sampleNet;

  return (
    <Card className="shadow-soft">
      <CardContent className="p-6">
        <h3 className="text-base font-semibold">Card fees mapping</h3>
        <p className="text-sm text-muted-foreground">
          Choose the default account for card transaction fees (FX, processing,
          interchange). Fees are auto-mapped to this account on every export.
        </p>
        <div className="mt-4 space-y-1.5">
          <Label>Default fees account</Label>
          <Select value={account} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an expense account" />
            </SelectTrigger>
            <SelectContent>
              {expenseAccounts.map((a) => (
                <SelectItem key={a.code} value={a.code}>
                  <span className="font-mono text-muted-foreground">{a.code}</span> · {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only the amount paid to the vendor needs manual mapping in the
            Accounting Export.
          </p>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label>Default VAT rate on fees</Label>
          <Select value={vatRate} onValueChange={handleVatChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select VAT rate" />
            </SelectTrigger>
            <SelectContent>
              {vatRates.map((v) => (
                <SelectItem key={v.code} value={v.code}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Fees are always treated as <strong>inclusive of VAT</strong>. The VAT
            portion is split out automatically on export.
          </p>
          {rate > 0 && (
            <div className="mt-2 rounded-md border border-border bg-secondary/40 p-3 text-xs">
              <p className="font-medium">Example on $100 fee (inclusive)</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-muted-foreground">
                <div>Net: <span className="font-mono text-foreground">${sampleNet.toFixed(2)}</span></div>
                <div>VAT ({rate}%): <span className="font-mono text-foreground">${sampleVat.toFixed(2)}</span></div>
                <div>Gross: <span className="font-mono text-foreground">${sampleGross.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default Settings;
