import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CardVisual } from "@/components/CardVisual";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cards as seedCards,
  formatCurrency,
  type Card as CardModel,
} from "@/lib/mockData";
import { useCurrentUser } from "@/lib/currentUser";
import { Snowflake, PlusCircle, Inbox, CreditCard, Eye, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { CardDetailsRevealDialog } from "@/components/CardDetailsRevealDialog";

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
                    <p className="mt-1 text-[11px] text-muted-foreground capitalize">
                      {c.limitPeriod} limit
                    </p>
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
                    <ReplaceCardDialog card={c} />
                    {c.type === "virtual" && (
                      <>
                        <div className="w-full rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">Physical card fee</p>
                          <p className="mt-1">
                            A one-off fee of {formatCurrency(25)} + 5% VAT ({formatCurrency(1.25)}) = {formatCurrency(26.25)} per physical card will be charged to the Corporate Account.
                          </p>
                        </div>
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
                      </>
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

function ReplaceCardDialog({ card }: { card: CardModel }) {
  const [open, setOpen] = useState(false);
  const [replaceReason, setReplaceReason] = useState<
    | "compromised"
    | "suspected_fraud"
    | "merchant_breach"
    | "subscription_reset"
    | "lost"
    | "stolen"
    | "damaged"
    | "other"
  >(card.type === "physical" ? "lost" : "compromised");
  const [replaceType, setReplaceType] = useState<"virtual" | "physical">(
    card.type === "physical" ? "physical" : "virtual",
  );
  const [replaceNotes, setReplaceNotes] = useState("");

  const handleReplace = () => {
    const typeLabel = replaceType === "physical" ? "physical" : "virtual";
    toast.success(`Replacement ${typeLabel} card requested for ••••${card.last4}`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Replace card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replace card •• {card.last4}</DialogTitle>
          <DialogDescription>
            The current card will be cancelled and a new {replaceType} card will be issued.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={replaceReason} onValueChange={(v) => setReplaceReason(v as typeof replaceReason)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="compromised">Card details compromised</SelectItem>
                  <SelectItem value="suspected_fraud">Suspected fraud</SelectItem>
                  <SelectItem value="merchant_breach">Merchant data breach</SelectItem>
                  <SelectItem value="subscription_reset">Recurring charges reset</SelectItem>
                  {replaceType === "physical" && (
                    <>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="stolen">Stolen</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </>
                  )}
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Replacement type</Label>
              <Select value={replaceType} onValueChange={(v) => setReplaceType(v as "virtual" | "physical")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual card</SelectItem>
                  <SelectItem value="physical">Physical card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea
              rows={2}
              placeholder="Shipping notes, urgency, etc."
              value={replaceNotes}
              onChange={(e) => setReplaceNotes(e.target.value)}
            />
          </div>
          {replaceType === "physical" ? (
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Replacement fee</p>
              <p className="mt-1">
                A one-off fee of {formatCurrency(25)} + 5% VAT ({formatCurrency(1.25)}) = {formatCurrency(26.25)} per replacement physical card will be charged to the Corporate Account.
              </p>
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">No replacement fee</p>
              <p className="mt-1">
                Virtual card replacements are free of charge and the new card will be available instantly.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleReplace} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Request replacement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
