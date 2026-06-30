import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Globe, Info } from "lucide-react";
import { formatCurrency } from "@/lib/mockData";

const PHYSICAL_CARD_FEE = 25;
const VAT_RATE = 0.05;
const physicalCardTotal = PHYSICAL_CARD_FEE * (1 + VAT_RATE);

const freePlanFeatures = [
  "3 physical cards included",
  "Unlimited virtual cards",
  "Unlimited team members",
  "Spend controls & approval workflows",
  "Account statement & accounting export",
  "Standard support",
];

const internationalFees = [
  {
    title: "International vendor payments",
    description: "Paying vendors billed outside the UAE.",
  },
  {
    title: "POS swipes outside the UAE",
    description: "Card swipes at any point-of-sale terminal abroad.",
  },
  {
    title: "ATM withdrawals from other banks",
    description: "Cash withdrawals from any ATM in the UAE other than Reem Bank.",
  },
  {
    title: "ATM withdrawals outside the UAE",
    description: "Cash withdrawals from any ATM located abroad.",
  },
];

const Plans = () => {
  return (
    <AppLayout
      title="Plans & Pricing"
      subtitle="Simple, transparent pricing. Pay only for what you use beyond the free plan."
    >
      <div className="space-y-6">
        {/* Free plan */}
        <Card className="relative border-primary shadow-md">
          <div className="absolute -top-3 left-6">
            <Badge className="bg-primary text-primary-foreground">Your plan</Badge>
          </div>
          <CardContent className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Everything you need to run corporate spending — no monthly subscription.
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{formatCurrency(0)}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
            </div>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {freePlanFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Additional physical card fee */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Additional physical cards</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  After the 3 physical cards included in your free plan, each extra physical card is charged as a one-off fee at the time of issuance.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Card fee</p>
                <p className="mt-1 text-lg font-semibold">{formatCurrency(PHYSICAL_CARD_FEE)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">VAT (5%)</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(PHYSICAL_CARD_FEE * VAT_RATE)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Total per card</p>
                <p className="mt-1 text-lg font-semibold text-primary">
                  {formatCurrency(physicalCardTotal)}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              One-off charge — no recurring fee. Virtual cards remain unlimited and free.
            </p>
          </CardContent>
        </Card>

        {/* International transaction fees */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">International transaction fees</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  These fees are configured by our card processor and fetched live via API. They are deducted along with the original transaction and shown on your Account Statement.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {internationalFees.map((item) => (
                <div key={item.title} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                Live fee rates are pulled from the processor at the time of each transaction, so the
                amount you see reflects the most current pricing.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Plans;
