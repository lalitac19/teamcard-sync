import { useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  members as initialMembers,
  teams as initialTeams,
  cards,
  type Member,
  type Team,
  type MemberRole,
} from "@/lib/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Mail,
  Trash2,
  Users,
  Plus,
  MoreHorizontal,
  Pencil,
  Save,
} from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<MemberRole, string> = {
  admin: "Admin",
  accountant: "Accountant",
  external_auditor: "External Auditor",
  team_member: "Team Member",
};

const roleBadge = (role: MemberRole) => {
  const styles: Record<MemberRole, string> = {
    admin: "bg-primary/10 text-primary hover:bg-primary/10 border-0",
    accountant: "bg-info/10 text-info hover:bg-info/10 border-0",
    external_auditor: "bg-accent/20 text-accent-foreground hover:bg-accent/20 border-0",
    team_member: "bg-secondary text-secondary-foreground hover:bg-secondary border-0",
  };
  return <Badge className={styles[role]}>{roleLabels[role]}</Badge>;
};

type CardStatusLabel = "active" | "inactive" | "pending_verification";

const cardStatusBadge = (status: CardStatusLabel, count: number) => {
  if (count === 0) return <span className="text-xs text-muted-foreground">No cards</span>;
  if (status === "active")
    return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Active</Badge>;
  if (status === "inactive")
    return <Badge className="bg-muted text-muted-foreground hover:bg-muted border-0">Inactive</Badge>;
  return (
    <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/10 border-0">
      Pending verification
    </Badge>
  );
};

const Members = () => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  const teamById = (id?: string) => teams.find((t) => t.id === id);

  const memberCardSummary = (memberId: string) => {
    const memberCards = cards.filter((c) => c.memberId === memberId);
    const member = members.find((m) => m.id === memberId);
    let status: CardStatusLabel = "active";
    if (memberCards.length === 0) status = "inactive";
    else if (member?.kycStatus !== "verified") status = "pending_verification";
    else if (memberCards.every((c) => c.status !== "active")) status = "inactive";
    return { count: memberCards.length, status };
  };

  const handleInvite = (m: Omit<Member, "id" | "avatar" | "joinedAt" | "kycStatus">) => {
    const id = `m${members.length + 1}-${Date.now()}`;
    const avatar = m.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    setMembers((prev) => [
      ...prev,
      {
        ...m,
        id,
        avatar,
        kycStatus: "not_started",
        joinedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    toast.success(`Invite sent to ${m.email}`);
  };

  const handleRemove = (id: string) => {
    // Terminate any cards linked to this member (irreversible)
    const linked = cards.filter((c) => c.memberId === id);
    linked.forEach((c) => {
      c.status = "terminated";
      c.spendLimit = 0;
      c.txnLimit = 0;
    });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        memberIds: t.memberIds.filter((mid) => mid !== id),
        leadId: t.leadId === id ? t.memberIds.find((mid) => mid !== id) ?? "" : t.leadId,
      })),
    );
    if (linked.length > 0) {
      toast.success(`Member removed. ${linked.length} card${linked.length === 1 ? "" : "s"} terminated.`);
    } else {
      toast.success("Member removed");
    }
  };

  const handleUpdateMember = (
    id: string,
    updates: { role: MemberRole; teamId?: string; department: string; makeLead: boolean },
  ) => {
    const previousTeamId = members.find((m) => m.id === id)?.teamId;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, role: updates.role, teamId: updates.teamId, department: updates.department }
          : m,
      ),
    );
    setTeams((prev) =>
      prev.map((t) => {
        let memberIds = t.memberIds;
        let leadId = t.leadId;
        // Remove from previous team if changed
        if (previousTeamId === t.id && updates.teamId !== t.id) {
          memberIds = memberIds.filter((mid) => mid !== id);
          if (leadId === id) leadId = memberIds[0] ?? "";
        }
        // Add to new team
        if (updates.teamId === t.id && !memberIds.includes(id)) {
          memberIds = [...memberIds, id];
        }
        // Promote to lead
        if (updates.teamId === t.id && updates.makeLead) {
          leadId = id;
        }
        return { ...t, memberIds, leadId };
      }),
    );
    toast.success("Member updated");
  };

  const handleCreateTeam = (t: Omit<Team, "id" | "createdAt">) => {
    const id = `tm${teams.length + 1}-${Date.now()}`;
    setTeams((prev) => [...prev, { ...t, id, createdAt: new Date().toISOString().slice(0, 10) }]);
    setMembers((prev) =>
      prev.map((m) => (t.memberIds.includes(m.id) ? { ...m, teamId: id } : m)),
    );
    toast.success(`Team "${t.name}" created`);
  };

  return (
    <AppLayout
      title="Members"
      subtitle="Manage your team, roles, KYC status, and team structure."
    >
      <Tabs defaultValue="members" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="members" className="gap-2">
              <UserPlus className="h-4 w-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Users className="h-4 w-4" /> Teams
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <InviteMemberDialog onInvite={handleInvite} />
            <CreateTeamDialog members={members} onCreate={handleCreateTeam} />
          </div>
        </div>

        <TabsContent value="members" className="mt-0">
          <Card className="shadow-soft">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Card status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => {
                    const team = teamById(m.teamId);
                    const { count, status } = memberCardSummary(m.id);
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
                        <TableCell>{roleBadge(m.role)}</TableCell>
                        <TableCell className="text-sm">
                          {team ? (
                            <span className="inline-flex items-center gap-1.5">
                              {team.name}
                              {team.leadId === m.id && (
                                <Badge variant="outline" className="font-normal">
                                  Lead
                                </Badge>
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{count}</TableCell>
                        <TableCell>{cardStatusBadge(status, count)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {m.joinedAt}
                        </TableCell>
                        <TableCell>
                          <MemberRowActions
                            member={m}
                            teams={teams}
                            onUpdate={handleUpdateMember}
                            onRemove={handleRemove}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <TeamsTab teams={teams} members={members} />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

function TeamsTab({ teams, members }: { teams: Team[]; members: Member[] }) {
  const memberById = (id: string) => members.find((m) => m.id === id);

  if (teams.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No teams yet</p>
          <p className="text-sm text-muted-foreground">
            Create a team to group members and assign a team lead.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((t) => {
        const lead = memberById(t.leadId);
        return (
          <Card key={t.id} className="shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold">{t.name}</h3>
                  {t.description && (
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="font-normal">
                  {t.memberIds.length} {t.memberIds.length === 1 ? "member" : "members"}
                </Badge>
              </div>

              {lead && (
                <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary/50 p-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {lead.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{lead.name}</p>
                    <p className="text-[11px] text-muted-foreground">Team lead</p>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                {t.memberIds
                  .filter((mid) => mid !== t.leadId)
                  .map((mid) => {
                    const m = memberById(mid);
                    if (!m) return null;
                    return (
                      <div key={mid} className="flex items-center gap-2 text-sm">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                          {m.avatar}
                        </div>
                        <span>{m.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {roleLabels[m.role]}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function InviteMemberDialog({
  onInvite,
}: {
  onInvite: (m: Omit<Member, "id" | "avatar" | "joinedAt" | "kycStatus">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState<MemberRole>("team_member");

  const submit = () => {
    if (!first || !email) {
      toast.error("Name and email are required");
      return;
    }
    onInvite({
      name: `${first} ${last}`.trim(),
      email,
      department: department || "—",
      role,
    });
    setFirst("");
    setLast("");
    setEmail("");
    setDepartment("");
    setRole("team_member");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" /> Invite member
        </Button>
      </DialogTrigger>
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
              <Input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Jane" />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Work email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@northwind.co"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Sales"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="external_auditor">External Auditor</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Permissions for each role can be configured in{" "}
            <span className="font-medium text-foreground">Settings → Roles & Permissions</span>.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} className="gap-2">
            <Mail className="h-4 w-4" /> Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateTeamDialog({
  members,
  onCreate,
}: {
  members: Member[];
  onCreate: (t: Omit<Team, "id" | "createdAt">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leadId, setLeadId] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    if (!name || !leadId) {
      toast.error("Team name and team lead are required");
      return;
    }
    const memberIds = Array.from(new Set([leadId, ...selected]));
    onCreate({ name, description, leadId, memberIds });
    setName("");
    setDescription("");
    setLeadId("");
    setSelected(new Set());
    setOpen(false);
  };

  const eligibleLeads = useMemo(
    () => members.filter((m) => selected.has(m.id) || m.id === leadId),
    [members, selected, leadId],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Create team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
          <DialogDescription>
            Group existing members together and assign a team lead.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Team name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Growth" />
            </div>
            <div className="space-y-1.5">
              <Label>Team lead</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {(eligibleLeads.length ? eligibleLeads : members).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this team do?"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Members</Label>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {members.map((m) => {
                const checked = selected.has(m.id) || m.id === leadId;
                return (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-secondary/50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(m.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                      {m.avatar}
                    </div>
                    <span className="text-sm">{m.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {roleLabels[m.role]}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Create team</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberRowActions({
  member,
  teams,
  onUpdate,
  onRemove,
}: {
  member: Member;
  teams: Team[];
  onUpdate: (
    id: string,
    updates: { role: MemberRole; teamId?: string; department: string; makeLead: boolean },
  ) => void;
  onRemove: (id: string) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [role, setRole] = useState<MemberRole>(member.role);
  const [teamId, setTeamId] = useState<string>(member.teamId ?? "none");
  const [department, setDepartment] = useState(member.department);
  const [makeLead, setMakeLead] = useState(false);

  const openEdit = () => {
    setRole(member.role);
    setTeamId(member.teamId ?? "none");
    setDepartment(member.department);
    setMakeLead(teams.find((t) => t.id === member.teamId)?.leadId === member.id);
    setEditOpen(true);
  };

  const submit = () => {
    onUpdate(member.id, {
      role,
      teamId: teamId === "none" ? undefined : teamId,
      department,
      makeLead: teamId !== "none" && makeLead,
    });
    setEditOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${member.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={openEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Edit member
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setRemoveOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Remove member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {member.name}</DialogTitle>
            <DialogDescription>
              Update this member's role, team, and department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="external_auditor">External Auditor</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {teamId !== "none" && (
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3">
                <input
                  type="checkbox"
                  checked={makeLead}
                  onChange={(e) => setMakeLead(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">Make team lead</p>
                  <p className="text-xs text-muted-foreground">
                    Replaces the current lead of this team.
                  </p>
                </div>
              </label>
            )}
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Sales"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Permissions for each role are configured in{" "}
              <span className="font-medium text-foreground">Settings → Roles & Permissions</span>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} className="gap-2">
              <Save className="h-4 w-4" /> Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {(() => {
                  const linkedCards = cards.filter(
                    (c) => c.memberId === member.id && c.status !== "terminated" && c.status !== "expired",
                  );
                  if (linkedCards.length === 0) {
                    return (
                      <p>
                        They'll lose access to the workspace. This action cannot be undone.
                      </p>
                    );
                  }
                  return (
                    <>
                      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
                        <p className="text-sm font-semibold">
                          Warning: {linkedCards.length} card{linkedCards.length === 1 ? "" : "s"} linked to this member will be permanently terminated.
                        </p>
                        <p className="mt-1 text-xs">
                          This action is irreversible. Terminated cards cannot be reactivated and any pending authorizations may fail.
                        </p>
                      </div>
                      <ul className="space-y-1 rounded-md bg-muted/40 p-2 text-xs">
                        {linkedCards.map((c) => (
                          <li key={c.id} className="flex items-center justify-between">
                            <span className="font-medium capitalize">{c.type.replace("-", " ")} card</span>
                            <span className="text-muted-foreground">•••• {c.last4}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        The member will also lose access to the workspace.
                      </p>
                    </>
                  );
                })()}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onRemove(member.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove & terminate cards
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Members;

