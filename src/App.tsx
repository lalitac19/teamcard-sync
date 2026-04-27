import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard.tsx";
import Cards from "./pages/Cards.tsx";
import Members from "./pages/Members.tsx";
import Transactions from "./pages/Transactions.tsx";
import Wallet from "./pages/Wallet.tsx";
import AccountingExport from "./pages/AccountingExport.tsx";
import AccountStatement from "./pages/AccountStatement.tsx";
import CardStatement from "./pages/CardStatement.tsx";
import WalletInternalStatement from "./pages/WalletInternalStatement.tsx";
import Reimbursements from "./pages/Reimbursements.tsx";
import Invoices from "./pages/Invoices.tsx";
import Approvals from "./pages/Approvals.tsx";
import Settings from "./pages/Settings.tsx";
import Plans from "./pages/Plans.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/members" element={<Members />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/reimbursements" element={<Reimbursements />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/accounting" element={<AccountingExport />} />
          <Route path="/statement" element={<AccountStatement />} />
          <Route path="/statement/cards" element={<CardStatement />} />
          <Route path="/statement/wallet-internal" element={<WalletInternalStatement />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
