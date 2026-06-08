import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/dialog";
import { Button } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/button";
import { Label } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/label";
import { Input } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/input";
import { Checkbox } from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@src/domains/dashboard/CorporateCard/teamcard/components/ui/input-otp";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import type { Card as CardModel } from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";
import { memberById } from "@src/domains/dashboard/CorporateCard/teamcard/lib/mockData";

interface Props {
  card: CardModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Factor = "otp" | "pin" | "password";

const FACTOR_META: Record<
  Factor,
  { label: string; description: string; icon: typeof Smartphone }
> = {
  otp: {
    label: "One-time code (OTP)",
    description: "6-digit code sent to your registered phone",
    icon: Smartphone,
  },
  pin: {
    label: "Card PIN",
    description: "The 4-digit PIN you use at ATMs and terminals",
    icon: KeyRound,
  },
  password: {
    label: "App login password",
    description: "The password you use to sign in to this app",
    icon: Lock,
  },
};

function fakeDetails(card: CardModel) {
  const seed = parseInt(card.last4, 10) || 1234;
  const block = (offset: number) =>
    String((seed * (offset + 7)) % 10000).padStart(4, "0");
  const pan = `4242 ${block(1)} ${block(2)} ${card.last4}`;
  const cvv = String((seed * 13) % 1000).padStart(3, "0");
  const month = String(((seed % 12) + 1)).padStart(2, "0");
  const year = String(28 + (seed % 4));
  return { pan, cvv, expiry: `${month}/${year}` };
}

function maskedPhone(memberId: string) {
  const tail = (parseInt(memberId.replace(/\D/g, ""), 10) || 1) * 1117;
  return `+971 •• ••• ${String(tail % 10000).padStart(4, "0")}`;
}

export function CardDetailsRevealDialog({ card, open, onOpenChange }: Props) {
  const [step, setStep] = useState<"choose" | "verify" | "revealed">("choose");
  const [selected, setSelected] = useState<Factor[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showCvv, setShowCvv] = useState(false);

  const member = memberById(card.memberId);
  const phone = maskedPhone(card.memberId);
  const details = useMemo(() => fakeDetails(card), [card]);

  useEffect(() => {
    if (!open) {
      setStep("choose");
      setSelected([]);
      setCurrentIdx(0);
      setOtp("");
      setPin("");
      setPassword("");
      setSecondsLeft(0);
      setShowCvv(false);
    }
  }, [open]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (step !== "revealed") return;
    const t = setTimeout(() => onOpenChange(false), 60_000);
    return () => clearTimeout(t);
  }, [step, onOpenChange]);

  const toggleFactor = (f: Factor) => {
    setSelected((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      if (prev.length >= 2) {
        toast.info("Pick exactly 2 verification methods");
        return prev;
      }
      return [...prev, f];
    });
  };

  const startVerification = () => {
    if (selected.length !== 2) {
      toast.error("Select 2 verification methods");
      return;
    }
    setCurrentIdx(0);
    setStep("verify");
    if (selected[0] === "otp") {
      setSecondsLeft(30);
      toast.success(`OTP sent to ${phone}`);
    }
  };

  const resendOtp = () => {
    setSecondsLeft(30);
    toast.success(`OTP resent to ${phone}`);
  };

  const currentFactor = selected[currentIdx];

  const currentValid = () => {
    if (currentFactor === "otp") return otp.length === 6;
    if (currentFactor === "pin") return pin.length === 4 && /^\d{4}$/.test(pin);
    if (currentFactor === "password") return password.trim().length >= 4;
    return false;
  };

  const submitCurrent = () => {
    if (!currentValid()) {
      if (currentFactor === "otp") toast.error("Enter the 6-digit code");
      else if (currentFactor === "pin") toast.error("Enter your 4-digit PIN");
      else toast.error("Enter your app password");
      return;
    }
    if (currentIdx === selected.length - 1) {
      setStep("revealed");
      toast.success("Identity verified");
      return;
    }
    const next = selected[currentIdx + 1];
    setCurrentIdx(currentIdx + 1);
    if (next === "otp") {
      setSecondsLeft(30);
      toast.success(`OTP sent to ${phone}`);
    }
  };

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value.replace(/\s+/g, ""));
    toast.success(`${label} copied`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Reveal card details
          </DialogTitle>
          <DialogDescription>
            For your security, verify your identity with 2 methods to view full
            card details.
          </DialogDescription>
        </DialogHeader>

        {step === "choose" && (
          <div className="space-y-4 py-2">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="text-muted-foreground">Card</p>
              <p className="font-medium capitalize">
                {card.type.replace("-", " ")} •••• {card.last4}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">
                Choose any 2 verification methods
              </p>
              <div className="space-y-2">
                {(Object.keys(FACTOR_META) as Factor[]).map((f) => {
                  const meta = FACTOR_META[f];
                  const Icon = meta.icon;
                  const checked = selected.includes(f);
                  return (
                    <label
                      key={f}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                        checked ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleFactor(f)}
                        className="mt-0.5"
                      />
                      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {meta.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {selected.length}/2 selected
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={startVerification}
                disabled={selected.length !== 2}
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "verify" && currentFactor && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Step {currentIdx + 1} of {selected.length} ·{" "}
              {FACTOR_META[currentFactor].label}
            </p>

            {currentFactor === "otp" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-mono text-foreground">{phone}</span>.
                </p>
                <div className="flex flex-col items-center gap-2">
                  <Label className="sr-only">One-time code</Label>
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  <button
                    type="button"
                    disabled={secondsLeft > 0}
                    onClick={resendOtp}
                    className="text-xs text-primary disabled:text-muted-foreground"
                  >
                    {secondsLeft > 0
                      ? `Resend code in ${secondsLeft}s`
                      : "Resend code"}
                  </button>
                </div>
              </div>
            )}

            {currentFactor === "pin" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enter your 4-digit card PIN.
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={pin}
                    onChange={(v) => setPin(v.replace(/\D/g, ""))}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            )}

            {currentFactor === "password" && (
              <div className="space-y-2">
                <Label htmlFor="app-password">App login password</Label>
                <Input
                  id="app-password"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (currentIdx === 0) setStep("choose");
                  else setCurrentIdx(currentIdx - 1);
                }}
              >
                Back
              </Button>
              <Button onClick={submitCurrent} disabled={!currentValid()}>
                {currentIdx === selected.length - 1 ? "Verify & reveal" : "Next"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "revealed" && (
          <div className="space-y-3 py-2">
            <div className="rounded-lg border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Card number</Label>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="font-mono text-base tracking-wider">{details.pan}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => copy("Card number", details.pan)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-card p-4">
                <Label className="text-xs text-muted-foreground">Expiry</Label>
                <p className="mt-1 font-mono text-base">{details.expiry}</p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <Label className="text-xs text-muted-foreground">CVV</Label>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="font-mono text-base">
                    {showCvv ? details.cvv : "•••"}
                  </p>
                  <div className="flex items-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setShowCvv((v) => !v)}
                    >
                      {showCvv ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => copy("CVV", details.cvv)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Cardholder</Label>
              <p className="mt-1 text-sm font-medium">
                {card.cardName ?? member?.name ?? "—"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Details will be hidden automatically in 60 seconds.
            </p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
