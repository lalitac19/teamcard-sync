import { useCurrentUser } from "@/lib/currentUser";
import { members } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog } from "lucide-react";

const roleLabel: Record<string, string> = {
  admin: "Admin",
  accountant: "Accountant",
  external_auditor: "Auditor",
  team_member: "Member",
};

export function UserSwitcher() {
  const { user, setUserId } = useCurrentUser();
  return (
    <div className="flex items-center gap-2">
      <UserCog className="h-4 w-4 text-muted-foreground" />
      <Select value={user.id} onValueChange={setUserId}>
        <SelectTrigger className="h-9 w-[220px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              <span className="font-medium">{m.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                · {roleLabel[m.role] ?? m.role}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
