import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ShieldCheck } from "lucide-react";
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
                    <Input defaultValue="Northwind Inc." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Billing email</Label>
                    <Input defaultValue="finance@northwind.co" />
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
                        <CheckCircle2 className="h-3 w-3" /> Connected • Northwind Inc.
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

function RolesPermissions() {
  const [roles, setRoles] = useState<RolePermissions[]>(defaultRolePermissions);
  const [activeRole, setActiveRole] = useState<string>(defaultRolePermissions[0].role);

  const current = roles.find((r) => r.role === activeRole)!;

  const togglePerm = (key: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.role === activeRole
          ? { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } }
          : r,
      ),
    );
  };

  const groups = Array.from(new Set(permissionCatalog.map((p) => p.group)));

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card className="shadow-soft">
        <CardContent className="p-3">
          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Roles
          </p>
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
                <div className="font-medium">{r.label}</div>
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
            <div>
              <h3 className="text-base font-semibold">{current.label}</h3>
              <p className="text-sm text-muted-foreground">{current.description}</p>
            </div>
            <Button size="sm" onClick={() => toast.success(`${current.label} permissions saved`)}>
              Save changes
            </Button>
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
