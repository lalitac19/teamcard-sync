import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@src/domains/dashboard/CorporateCard/teamcard/components/AppLayout";
import { Card, CardContent } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/card";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Badge } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/badge";
import { Progress } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/progress";
import { CardVisual } from "@src/domains/dashboard/CorporateCard/teamcard/components/CardVisual";
import {
  cards as seedCards,
  formatCurrency,
  type Card as CardModel,
} from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { useCurrentUser } from "@src/domains/dashboard/CorporateCard/teamcard/lib/currentUser";
import { Snowflake, PlusCircle, Inbox, CreditCard, Eye } from "lucide-react";
import { toast } from "sonner";
import { CardDetailsRevealDialog } from "@src/domains/dashboard/CorporateCard/teamcard/components/CardDetailsRevealDialog";

export default function MyCards() {
  const { user } = useCurrentUser();
  const [cards, setCards] = useState<CardModel[]>(seedCards);
  const [revealCard, setRevealCard] = useState<CardModel | null>(null);

  const myCards = useMemo(
    () => cards.filter((c) => c.memberId === user.id && c.status !== "terminated"),
    [cards, user.id],
  );

  const toggleFreeze = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.status === "active") {
          toast.success(`Card ••••${c.last4} frozen`);
          return { ...c, status: "frozen" };
        }
        if (c.status === "frozen") {
          toast.success(`Card ••••${c.last4} unfrozen`);
          return { ...c, status: "active" };
        }
        return c;
      }),
    );
  };

  return (
    <AppLayout
      title="My cards"
      subtitle="Cards issued to you. Freeze instantly if anything looks off."
      actions={
        <Button asChild>
          <Link to="/me/requests">
            <PlusCircle className="mr-2 h-4 w-4" /> Request a card
          </Link>
        </Button>
      }
    >
      {myCards.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No cards have been issued to you yet.</p>
            <Button asChild className="mt-4">
              <Link to="/me/requests">Request a card</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {myCards.map((c) => {
            const pct = c.spendLimit ? Math.min(100, (c.spent / c.spendLimit) * 100) : 0;
            return (
              <Card key={c.id} className="shadow-soft">
                <CardContent className="space-y-4 p-5">
                  <div className="flex justify-center">
                    <CardVisual card={c} size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {c.type.replace("-", " ")}
                    </Badge>
                    <Badge
                      className={
                        c.status === "active"
                          ? "border-0 bg-success/10 text-success"
                          : c.status === "frozen"
                          ? "border-0 bg-info/10 text-info"
                          : "border-0 bg-muted text-muted-foreground"
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Spent</span>
                      <span>
                        {formatCurrency(c.spent)} / {formatCurrency(c.spendLimit)}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-1 h-1.5" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={c.status !== "active"}
                      onClick={() => setRevealCard(c)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Show details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={c.status === "expired"}
                      onClick={() => toggleFreeze(c.id)}
                    >
                      <Snowflake className="mr-2 h-4 w-4" />
                      {c.status === "frozen" ? "Unfreeze" : "Freeze"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/me/requests">Request limit increase</Link>
                    </Button>
                    {c.type === "virtual" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          toast.success(`Physical card requested for ••••${c.last4}`)
                        }
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Request physical card
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {revealCard && (
        <CardDetailsRevealDialog
          card={revealCard}
          open={!!revealCard}
          onOpenChange={(o) => !o && setRevealCard(null)}
        />
      )}
    </AppLayout>
  );
}

