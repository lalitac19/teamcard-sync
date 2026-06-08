import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

// TopNav is suppressed — Peko's own sidebar/header is used instead
export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  return (
    <div className="w-full">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#171717]">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[#8C8C8C]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
