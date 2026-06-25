import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Sparkles, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/mockData";
import { toast } from "sonner";

type PlanId = "starter" | "growth" | "scale";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    tagline: "For small teams getting started with corporate cards.",
    features: [
      "Up to 5 active cards",
      "2 team members",
      "Basic spend controls",
      "Monthly account statement",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 149,
    tagline: "For growing teams that need approvals and accounting.",
    features: [
      "Up to 25 active cards",
      "10 team members",
      "Approval workflows",
      "Accounting export (CSV, Xero, QuickBooks)",
      "Reimbursements & invoices",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: 399,
    tagline: "For larger organizations with advanced controls.",
    features: [
      "Unlimited cards",
      "Unlimited members",
      "Custom roles & permissions",
      "Multi-entity support",
      "Dedicated account manager",
      "SLA & SSO",
    ],
  },
];

interface Bill {
  id: string;
  period: string;
  issuedOn: string;
  plan: string;
  amount: number;
  status: "paid" | "due" | "overdue";
}

const bills: Bill[] = [
  { id: "INV-2025-04", period: "Apr 2025", issuedOn: "2025-04-01", plan: "Growth", amount: 149, status: "due" },
  { id: "INV-2025-03", period: "Mar 2025", issuedOn: "2025-03-01", plan: "Growth", amount: 149, status: "paid" },
  { id: "INV-2025-02", period: "Feb 2025", issuedOn: "2025-02-01", plan: "Growth", amount: 149, status: "paid" },
  { id: "INV-2025-01", period: "Jan 2025", issuedOn: "2025-01-01", plan: "Growth", amount: 149, status: "paid" },
  { id: "INV-2024-12", period: "Dec 2024", issuedOn: "2024-12-01", plan: "Starter", amount: 49, status: "paid" },
  { id: "INV-2024-11", period: "Nov 2024", issuedOn: "2024-11-01", plan: "Starter", amount: 49, status: "paid" },
];

const statusVariant = (s: Bill["status"]) =>
  s === "paid"
    ? "bg-success/15 text-success border-success/30"
    : s === "due"
    ? "bg-warning/15 text-warning border-warning/30"
    : "bg-destructive/15 text-destructive border-destructive/30";

const Plans = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("growth");

  const handleSelect = (id: PlanId) => {
    if (id === currentPlan) {
      toast.info("This is your current plan.");
      return;
    }
    setCurrentPlan(id);
    toast.success(`Upgraded to ${plans.find((p) => p.id === id)?.name} plan.`);
  };

  return (
    <AppLayout
      title="Plans & Billing"
      subtitle="Manage your subscription tier and review monthly invoices."
    >
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="bills">My Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-0">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <Card
                  key={plan.id}
                  className={
                    plan.highlighted
                      ? "relative border-primary shadow-md"
                      : "relative"
                  }
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gap-1 bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        {isCurrent && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.tagline}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? "outline" : plan.highlighted ? "default" : "secondary"}
                      onClick={() => handleSelect(plan.id)}
                      disabled={isCurrent}
                    >
                      {isCurrent ? "Current plan" : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bills" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Issued on</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>{bill.period}</TableCell>
                      <TableCell>{formatDate(bill.issuedOn)}</TableCell>
                      <TableCell>{bill.plan}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(bill.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusVariant(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.status === "due" || bill.status === "overdue" ? (
                          <Button size="sm" onClick={() => toast.success(`Paid ${bill.id}`)}>
                            Pay now
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Download className="h-4 w-4" /> PDF
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Plans;
