import { useCurrentUser } from "@/lib/currentUser";
import Dashboard from "./Dashboard";
import MemberDashboard from "./member/MemberDashboard";

export default function HomeRouter() {
  const { isMember } = useCurrentUser();
  return isMember ? <MemberDashboard /> : <Dashboard />;
}
