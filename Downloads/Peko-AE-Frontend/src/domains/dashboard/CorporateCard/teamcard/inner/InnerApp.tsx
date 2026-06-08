import { Suspense, lazy, Component, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@src/domains/dashboard/CorporateCard/teamcard/components/ui/tooltip';
import { Toaster } from '@src/domains/dashboard/CorporateCard/teamcard/components/ui/toaster';
import { Toaster as Sonner } from '@src/domains/dashboard/CorporateCard/teamcard/components/ui/sonner';
import { CurrentUserProvider, useCurrentUser } from '@src/domains/dashboard/CorporateCard/teamcard/lib/currentUser';
import {
    LayoutDashboard, CreditCard, Users, Receipt, Wallet as WalletIcon,
    BookOpen, Settings as SettingsIcon, HandCoins, FileText, ClipboardCheck,
    Calculator, PlusCircle, UserCog,
} from 'lucide-react';

const queryClient = new QueryClient();

// Lazy-load every page to isolate any individual page crashes
const HomeRouter       = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/HomeRouter'));
const Cards            = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Cards'));
const Members          = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Members'));
const Transactions     = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Transactions'));
const Wallet           = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Wallet'));
const AccountingExport = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/AccountingExport'));
const AccountStatement = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/AccountStatement'));
const ServiceFees      = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/ServiceFees'));
const Reimbursements   = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Reimbursements'));
const Invoices         = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Invoices'));
const Approvals        = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Approvals'));
const Settings         = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Settings'));
const Plans            = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/Plans'));
const MyCards          = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/member/MyCards'));
const MyTransactions   = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/member/MyTransactions'));
const MyReimbursements = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/member/MyReimbursements'));
const MyInvoices       = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/member/MyInvoices'));
const MyRequests       = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/member/MyRequests'));
const MyProfile        = lazy(() => import('@src/domains/dashboard/CorporateCard/teamcard/pages/member/MyProfile'));

// ── Tab navigation ─────────────────────────────────────────────────────────

const adminNav = [
    { label: 'Dashboard',         path: '/',              icon: LayoutDashboard },
    { label: 'Corporate Account', path: '/wallet',        icon: WalletIcon },
    { label: 'Cards',             path: '/cards',         icon: CreditCard },
    { label: 'People',            path: '/members',       icon: Users },
    { label: 'Transactions',      path: '/transactions',  icon: Receipt },
    { label: 'Approvals',         path: '/approvals',     icon: ClipboardCheck },
    { label: 'Reimbursements',    path: '/reimbursements',icon: HandCoins },
    { label: 'Invoices',          path: '/invoices',      icon: FileText },
    { label: 'Statement',         path: '/statement',     icon: BookOpen },
    { label: 'Accounting',        path: '/accounting',    icon: Calculator },
    { label: 'Service Fees',      path: '/service-fees',  icon: Receipt },
    { label: 'Settings',          path: '/settings',      icon: SettingsIcon },
];

const memberNav = [
    { label: 'Dashboard',      path: '/',                  icon: LayoutDashboard },
    { label: 'My Cards',       path: '/me/cards',          icon: CreditCard },
    { label: 'Transactions',   path: '/me/transactions',   icon: Receipt },
    { label: 'Reimbursements', path: '/me/reimbursements', icon: HandCoins },
    { label: 'Invoices',       path: '/me/invoices',       icon: FileText },
    { label: 'Requests',       path: '/me/requests',       icon: PlusCircle },
    { label: 'Profile',        path: '/me/profile',        icon: UserCog },
];

function TabNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isMember } = useCurrentUser();
    const items = isMember ? memberNav : adminNav;
    const isActive = (p: string) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

    return (
        <div style={{ borderBottom: '1px solid #E4E7EC', background: '#fff', position: 'sticky', top: 0, zIndex: 20 }}>
            <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {items.map(item => {
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                padding: '12px 16px', border: 'none', background: 'transparent',
                                borderBottom: active ? '2px solid #FF3A3A' : '2px solid transparent',
                                color: active ? '#FF3A3A' : '#595959',
                                fontWeight: active ? 600 : 400, fontSize: '13px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                                fontFamily: 'Roboto, system-ui, sans-serif', flexShrink: 0,
                            }}
                        >
                            <Icon size={14} />
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Per-page error boundary ────────────────────────────────────────────────

class PageErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null };
    static getDerivedStateFromError(e: Error) { return { error: e }; }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 24, fontFamily: 'monospace', background: '#fff1f0', border: '1px solid #ff4d4f', borderRadius: 8, margin: 16 }}>
                    <strong style={{ color: '#cf1322' }}>Page error: </strong>
                    <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', fontSize: 11 }}>
                        {(this.state.error as Error).message}{'\n'}{(this.state.error as Error).stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Main app ───────────────────────────────────────────────────────────────

export default function InnerApp() {
    return (
        <QueryClientProvider client={queryClient}>
            <CurrentUserProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <MemoryRouter initialEntries={['/']}>
                        <div style={{ width: '100%', minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Roboto, system-ui, sans-serif' }}>
                            <TabNav />
                            <div style={{ padding: '24px 32px' }}>
                                <PageErrorBoundary>
                                    <Suspense fallback={<div style={{ padding: 24, color: '#8C8C8C' }}>Loading…</div>}>
                                        <Routes>
                                            <Route path="/"               element={<HomeRouter />} />
                                            <Route path="/cards"          element={<Cards />} />
                                            <Route path="/members"        element={<Members />} />
                                            <Route path="/transactions"   element={<Transactions />} />
                                            <Route path="/wallet"         element={<Wallet />} />
                                            <Route path="/reimbursements" element={<Reimbursements />} />
                                            <Route path="/invoices"       element={<Invoices />} />
                                            <Route path="/approvals"      element={<Approvals />} />
                                            <Route path="/accounting"     element={<AccountingExport />} />
                                            <Route path="/statement"      element={<AccountStatement />} />
                                            <Route path="/service-fees"   element={<ServiceFees />} />
                                            <Route path="/plans"          element={<Plans />} />
                                            <Route path="/settings"       element={<Settings />} />
                                            <Route path="/me/cards"          element={<MyCards />} />
                                            <Route path="/me/transactions"   element={<MyTransactions />} />
                                            <Route path="/me/reimbursements" element={<MyReimbursements />} />
                                            <Route path="/me/invoices"       element={<MyInvoices />} />
                                            <Route path="/me/requests"       element={<MyRequests />} />
                                            <Route path="/me/profile"        element={<MyProfile />} />
                                        </Routes>
                                    </Suspense>
                                </PageErrorBoundary>
                            </div>
                        </div>
                    </MemoryRouter>
                </TooltipProvider>
            </CurrentUserProvider>
        </QueryClientProvider>
    );
}
