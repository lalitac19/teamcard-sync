import { Card as CardType, memberById } from "@/lib/mockData";
import { Wifi } from "lucide-react";

interface CardVisualProps {
  card: CardType;
  size?: "sm" | "md" | "lg";
}

const gradientFor = (type: CardType["type"]) => {
  if (type === "virtual") return "gradient-card-virtual";
  if (type === "physical") return "gradient-card-physical";
  return "gradient-card-single";
};

const sizes = {
  sm: "h-32 w-52 text-xs",
  md: "h-44 w-72 text-sm",
  lg: "h-52 w-[22rem] text-base",
};

export function CardVisual({ card, size = "md" }: CardVisualProps) {
  const member = memberById(card.memberId);
  return (
    <div
      className={`relative ${sizes[size]} ${gradientFor(card.type)} flex flex-col justify-between overflow-hidden rounded-xl p-4 text-white shadow-card`}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/60">
            {card.type === "single-use" ? "Single-use" : card.type}
          </p>
          <p className="mt-1 font-semibold">Peko</p>
        </div>
        <Wifi className="h-4 w-4 rotate-90 text-white/70" />
      </div>

      <div className="relative">
        <p className="font-mono tracking-[0.2em] text-white/90">
          •••• •••• •••• {card.last4}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/50">Cardholder</p>
            <p className="text-xs font-medium">{member?.name ?? "—"}</p>
          </div>
          <div className="flex h-7 w-10 items-center justify-center rounded bg-gradient-to-br from-yellow-200 to-yellow-400 text-[8px] font-bold text-black/70">
            VISA
          </div>
        </div>
      </div>
    </div>
  );
}
