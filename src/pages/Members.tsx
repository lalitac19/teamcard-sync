import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { members, cards } from "@/lib/mockData";
import { UserPlus, Mail, MoreHorizontal } from "lucide-react";

const kycBadge = (k: string) => {
  if (k === "verified") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Verified</Badge>;
  if (k === "pending") return <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/10 border-0">KYC pending</Badge>;
  return <Badge variant="secondary">Invite sent</Badge>;
};

const Members = () => {
  return (
    <AppLayout
      title="Members"
      subtitle="Manage your team, KYC status, and card assignments."
      actions={
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" /> Invite member
            </Button>
          </DialogTrigger>
          <InviteDialog />
        </Dialog>
      }
    >
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Cards</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => {
                const memberCards = cards.filter((c) => c.memberId === m.id);
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {m.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{m.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize font-normal">{m.role}</Badge>
                    </TableCell>
                    <TableCell>{kycBadge(m.kycStatus)}</TableCell>
                    <TableCell className="text-sm">{memberCards.length}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.joinedAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

function InviteDialog() {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Invite a new member</DialogTitle>
        <DialogDescription>
          They'll get an email to sign up, complete KYC, and download the mobile app.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input placeholder="Jane" />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input placeholder="Doe" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Work email</Label>
          <Input type="email" placeholder="jane@northwind.co" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input placeholder="Sales" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select defaultValue="employee">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button className="gap-2"><Mail className="h-4 w-4" /> Send invite</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default Members;
