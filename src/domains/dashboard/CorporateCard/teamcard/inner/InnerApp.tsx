import { Suspense, lazy, Component, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@src/domains/dashboard/CorporateCard/teamcard/components/ui/tooltip';
import { Toaster } from '@src/domains/dashboard/CorporateCard/teamcard/components/ui/toaster';
import { Toaster as Sonner } from '@src/domains/dashboard/CorporateCard/teamcard/components/ui/sonner';
import { CurrentUserProvider, useCurrentUser } from '@src/domains/dashboard/CorporateCard/teamcard/lib/currentUser';
// No lucide icons needed — using emoji icons for the pill nav style

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
    { label: 'Dashboard',         path: '/',              emoji: '🏠' },
    { label: 'Corporate Account', path: '/wallet',        emoji: '🏦' },
    { label: 'Cards',             path: '/cards',         emoji: '💳' },
    { label: 'People',            path: '/members',       emoji: '👥' },
    { label: 'Transactions',      path: '/transactions',  emoji: '💸' },
    { label: 'Approvals',         path: '/approvals',     emoji: '✅' },
    { label: 'Reimbursements',    path: '/reimbursements',emoji: '🔄' },
    { label: 'Invoices',          path: '/invoices',      emoji: '📄' },
    { label: 'Statement',         path: '/statement',     emoji: '📋' },
    { label: 'Accounting',        path: '/accounting',    emoji: '📊' },
    { label: 'Service Fees',      path: '/service-fees',  emoji: '💰' },
    { label: 'Settings',          path: '/settings',      emoji: '⚙️' },
];

const memberNav = [
    { label: 'Dashboard',      path: '/',                  emoji: '🏠' },
    { label: 'My Cards',       path: '/me/cards',          emoji: '💳' },
    { label: 'Transactions',   path: '/me/transactions',   emoji: '💸' },
    { label: 'Reimbursements', path: '/me/reimbursements', emoji: '🔄' },
    { label: 'Invoices',       path: '/me/invoices',       emoji: '📄' },
    { label: 'Requests',       path: '/me/requests',       emoji: '➕' },
    { label: 'Profile',        path: '/me/profile',        emoji: '👤' },
];

function TabNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isMember } = useCurrentUser();
    const items = isMember ? memberNav : adminNav;
    const isActive = (p: string) => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);

    return (
        <div style={{
            background: '#fff',
            borderBottom: '1px solid #E4E7EC',
            padding: '10px 16px',
            flexShrink: 0,
        }}>
            <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                alignItems: 'center',
            }}>
                {items.map(item => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '7px 14px',
                                border: 'none',
                                borderRadius: '999px',
                                background: active ? '#FFF0EE' : '#F5F5F5',
                                color: active ? '#FF3A3A' : '#595959',
                                fontWeight: active ? 600 : 400,
                                fontSize: '13px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontFamily: 'Roboto, system-ui, sans-serif',
                                flexShrink: 0,
                                outline: active ? '1.5px solid #FFCCC7' : '1.5px solid transparent',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                        >
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.emoji}</span>
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
                        {/* Flex column — TabNav is fixed at top, content scrolls independently */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: 'calc(100vh - 64px)',
                            background: '#FAFAFA',
                            fontFamily: 'Roboto, system-ui, sans-serif',
                            overflow: 'hidden',
                        }}>
                            <TabNav />
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
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
