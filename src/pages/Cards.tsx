import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardVisual } from "@/components/CardVisual";
import { cards, formatCurrency, memberById } from "@/lib/mockData";
import { Plus, Snowflake, MoreHorizontal } from "lucide-react";

const statusBadge = (status: string) => {
  if (status === "active") return <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">Active</Badge>;
  if (status === "frozen") return <Badge className="bg-info/10 text-info hover:bg-info/10 border-0">Frozen</Badge>;
  return <Badge variant="secondary">Expired</Badge>;
};

const Cards = () => {
  const [filter, setFilter] = useState<"all" | "virtual" | "physical" | "single-use">("all");
  const filtered = filter === "all" ? cards : cards.filter((c) => c.type === filter);

  return (
    <AppLayout
      title="Cards"
      subtitle={`${cards.length} cards issued across your team.`}
      actions={
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Issue new card
            </Button>
          </DialogTrigger>
          <IssueCardDialog />
        </Dialog>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "virtual", "physical", "single-use"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All cards" : f.replace("-", " ")}
          </Button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((card) => {
          const member = memberById(card.memberId);
          const pct = (card.spent / card.spendLimit) * 100;
          return (
            <Card key={card.id} className="shadow-soft transition-shadow hover:shadow-card">
              <CardContent className="p-5">
                <div className="flex justify-center">
                  <CardVisual card={card} size="md" />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{member?.name}</p>
                    <p className="text-xs text-muted-foreground">{member?.department}</p>
                  </div>
                  {statusBadge(card.status)}
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(card.spent)} spent</span>
                    <span>{formatCurrency(card.spendLimit)} {card.limitPeriod}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${pct > 85 ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Snowflake className="h-3.5 w-3.5" /> Freeze
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
};

function IssueCardDialog() {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Issue a new card</DialogTitle>
        <DialogDescription>Configure the card type, limits, and assigned member.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>Card type</Label>
          <Select defaultValue="virtual">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="single-use">Single-use</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Assign to member</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="m2">Marcus Patel — Sales</SelectItem>
              <SelectItem value="m3">Elena Rodriguez — Marketing</SelectItem>
              <SelectItem value="m4">James O'Connor — Engineering</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Spend limit</Label>
            <Input type="number" placeholder="5000" />
          </div>
          <div className="space-y-1.5">
            <Label>Period</Label>
            <Select defaultValue="monthly">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="per-transaction">Per transaction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Allowed merchant categories</Label>
          <Input placeholder="e.g. Software, Travel, Office" />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Issue card</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default Cards;
