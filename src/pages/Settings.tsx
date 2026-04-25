import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

const Settings = () => {
  return (
    <AppLayout title="Settings" subtitle="Workspace, integrations, and preferences.">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold">Company</h3>
            <p className="text-sm text-muted-foreground">Information shown on cards and statements.</p>
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

        <Card className="shadow-soft lg:col-span-2">
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
    </AppLayout>
  );
};

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <p className="text-sm">{label}</p>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export default Settings;
