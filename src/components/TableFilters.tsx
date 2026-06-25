import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const ALL = "__all__";

export interface FilterOption {
  value: string;
  label: string;
}

export interface TableFiltersProps {
  /** Date range */
  from?: Date;
  to?: Date;
  onFromChange?: (d: Date | undefined) => void;
  onToChange?: (d: Date | undefined) => void;

  /** Cardholder selector — hidden when fewer than 2 options */
  cardholders?: FilterOption[];
  cardholderId?: string; // ALL means no filter
  onCardholderChange?: (id: string) => void;

  /**
   * Card selector — hidden when fewer than 2 options.
   * Pass cards already scoped to the selected cardholder (or all cards) from the parent.
   */
  cards?: FilterOption[];
  cardId?: string; // ALL means no filter
  onCardChange?: (id: string) => void;

  /** Free-text merchant/vendor search */
  merchant?: string;
  onMerchantChange?: (v: string) => void;
  merchantLabel?: string;
  merchantPlaceholder?: string;

  /** Country filter */
  countries?: string[];
  country?: string; // ALL means no filter
  onCountryChange?: (v: string) => void;

  /** Optional reset handler — when provided, shows a "Clear" button */
  onReset?: () => void;
}

/**
 * Generic filter bar for data tables.
 * Each filter is opt-in: omit the props you don't need.
 * Cardholder & Card selects are auto-hidden when there is only one (or zero) option.
 */
export function TableFilters({
  from, to, onFromChange, onToChange,
  cardholders, cardholderId, onCardholderChange,
  cards, cardId, onCardChange,
  merchant, onMerchantChange,
  merchantLabel = "Merchant",
  merchantPlaceholder = "Search merchant…",
  countries, country, onCountryChange,
  onReset,
}: TableFiltersProps) {
  const showCardholders = cardholders && cardholders.length > 1 && onCardholderChange;
  const showCards = cards && cards.length > 1 && onCardChange;
  const showCountry = countries && countries.length > 0 && onCountryChange;
  const showMerchant = onMerchantChange !== undefined;
  const showDates = onFromChange && onToChange;

  return (
    <Card className="shadow-soft">
      <CardContent className="flex flex-wrap items-end gap-3 p-4">
        {showDates && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("w-[160px] justify-start text-left font-normal", !from && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {from ? format(from, "MMM d, yyyy") : "Any"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={from} onSelect={onFromChange} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("w-[160px] justify-start text-left font-normal", !to && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {to ? format(to, "MMM d, yyyy") : "Any"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={to} onSelect={onToChange} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}

        {showCardholders && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Cardholder</label>
            <Select value={cardholderId ?? ALL} onValueChange={onCardholderChange}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All cardholders</SelectItem>
                {cardholders!.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showCards && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Card</label>
            <Select value={cardId ?? ALL} onValueChange={onCardChange}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All cards</SelectItem>
                {cards!.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showMerchant && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">{merchantLabel}</label>
            <Input
              value={merchant ?? ""}
              onChange={(e) => onMerchantChange!(e.target.value)}
              placeholder={merchantPlaceholder}
              className="h-9 w-[200px]"
            />
          </div>
        )}

        {showCountry && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">Country</label>
            <Select value={country ?? ALL} onValueChange={onCountryChange}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All countries</SelectItem>
                {countries!.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {onReset && (
          <Button variant="ghost" size="sm" className="ml-auto gap-1 self-end" onClick={onReset}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
