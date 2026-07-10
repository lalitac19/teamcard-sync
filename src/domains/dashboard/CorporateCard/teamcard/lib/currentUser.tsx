import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { members, memberById, type Member } from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";

interface CurrentUserContextValue {
  user: Member;
  setUserId: (id: string) => void;
  isMember: boolean;
  isAdmin: boolean;
}

const STORAGE_KEY = "peko.currentUserId";

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserIdState] = useState<string>(() => {
    if (typeof window === "undefined") return "m1";
    return localStorage.getItem(STORAGE_KEY) || "m1";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, userId);
  }, [userId]);

  const user = memberById(userId) || members[0];

  return (
    <CurrentUserContext.Provider
      value={{
        user,
        setUserId: setUserIdState,
        isMember: user.role === "team_member",
        isAdmin: user.role === "admin",
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
