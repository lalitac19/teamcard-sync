import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/lib/currentUser";
import { Smartphone, Monitor, LogOut, ShieldCheck } from "lucide-react";

export default function MyProfile() {
  const { user } = useCurrentUser();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("+971 50 123 4567");

  const [notif, setNotif] = useState({
    txnEmail: true,
    txnPush: true,
    receiptReminder: true,
    approvalUpdates: true,
    weeklySummary: false,
  });

  const [prefs, setPrefs] = useState({
    language: "en",
    timezone: "Asia/Dubai",
    theme: "system",
  });

  const sessions = [
    { id: "s1", device: "iPhone 15 — Peko Mobile", location: "Dubai, UAE", lastActive: "Active now", icon: Smartphone, current: true },
    { id: "s2", device: "Chrome — macOS", location: "Dubai, UAE", lastActive: "2 hours ago", icon: Monitor, current: false },
    { id: "s3", device: "Safari — iPad", location: "Abu Dhabi, UAE", lastActive: "Yesterday", icon: Monitor, current: false },
  ];

  const save = (section: string) => toast({ title: `${section} updated`, description: "Your changes have been saved." });

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal details, security, and preferences.</p>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information. Department is managed by your admin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {user.avatar}
              </div>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.department ?? "—"}</div>
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Mobile number (used for OTP)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  This number receives the OTP required to reveal full card details on the app or browser.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => save("Profile")}>Save profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Security</CardTitle>
            <CardDescription>Password, OTP device, and active sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input id="confirm" type="password" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => save("Password")}>Update password</Button>
            </div>

            <Separator />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Active sessions</div>
                  <div className="text-xs text-muted-foreground">Devices currently signed in to your account.</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => save("Sessions")}>
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out everywhere
                </Button>
              </div>
              <div className="space-y-2">
                {sessions.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">
                            {s.device} {s.current && <Badge variant="secondary" className="ml-2">This device</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground">{s.location} · {s.lastActive}</div>
                        </div>
                      </div>
                      {!s.current && (
                        <Button variant="ghost" size="sm" onClick={() => save("Session")}>Sign out</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what you want to be notified about.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "txnEmail", label: "Transaction alerts — email", desc: "Get an email when your card is used." },
              { key: "txnPush", label: "Transaction alerts — push", desc: "Push notification to the Peko mobile app." },
              { key: "receiptReminder", label: "Receipt reminders", desc: "Remind me to attach a receipt to recent transactions." },
              { key: "approvalUpdates", label: "Approval status updates", desc: "When your requests are approved or declined." },
              { key: "weeklySummary", label: "Weekly spend summary", desc: "A digest of your card activity every Monday." },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.desc}</div>
                </div>
                <Switch
                  checked={notif[n.key as keyof typeof notif]}
                  onCheckedChange={(v) => setNotif((p) => ({ ...p, [n.key]: v }))}
                />
              </div>
            ))}
            <div className="flex justify-end">
              <Button onClick={() => save("Notifications")}>Save preferences</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Language, timezone, and appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={prefs.language} onValueChange={(v) => setPrefs((p) => ({ ...p, language: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={prefs.timezone} onValueChange={(v) => setPrefs((p) => ({ ...p, timezone: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={prefs.theme} onValueChange={(v) => setPrefs((p) => ({ ...p, theme: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => save("Preferences")}>Save preferences</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
