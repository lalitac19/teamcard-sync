import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Copy, Eye, EyeOff, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type { Card as CardModel } from "@/lib/mockData";
import { memberById } from "@/lib/mockData";

interface Props {
  card: CardModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Demo-only: deterministic fake card details derived from last4
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

// Mock masked phone — in production this would come from member profile
function maskedPhone(memberId: string) {
  const tail = (parseInt(memberId.replace(/\D/g, ""), 10) || 1) * 1117;
  return `+971 •• ••• ${String(tail % 10000).padStart(4, "0")}`;
}

export function CardDetailsRevealDialog({ card, open, onOpenChange }: Props) {
  const [step, setStep] = useState<"request" | "verify" | "revealed">("request");
  const [otp, setOtp] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const member = memberById(card.memberId);
  const phone = maskedPhone(card.memberId);
  const details = fakeDetails(card);

  useEffect(() => {
    if (!open) {
      setStep("request");
      setOtp("");
      setShowCvv(false);
      setSecondsLeft(0);
    }
  }, [open]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // Auto-hide reveal after 60s
  useEffect(() => {
    if (step !== "revealed") return;
    const t = setTimeout(() => onOpenChange(false), 60_000);
    return () => clearTimeout(t);
  }, [step, onOpenChange]);

  const sendOtp = () => {
    setStep("verify");
    setSecondsLeft(30);
    toast.success(`OTP sent to ${phone}`);
  };

  const verify = () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    // Demo: accept any 6 digits
    setStep("revealed");
    toast.success("Identity verified");
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
            For your security, card details are masked by default.
          </DialogDescription>
        </DialogHeader>

        {step === "request" && (
          <div className="space-y-4 py-2">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="text-muted-foreground">Card</p>
              <p className="font-medium capitalize">
                {card.type.replace("-", " ")} •••• {card.last4}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-md border p-3">
              <Smartphone className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p>We'll send a 6-digit code to your registered phone:</p>
                <p className="mt-1 font-mono text-foreground">{phone}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={sendOtp}>Send code</Button>
            </DialogFooter>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4 py-2">
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
                onClick={sendOtp}
                className="text-xs text-primary disabled:text-muted-foreground"
              >
                {secondsLeft > 0
                  ? `Resend code in ${secondsLeft}s`
                  : "Resend code"}
              </button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("request")}>
                Back
              </Button>
              <Button onClick={verify} disabled={otp.length !== 6}>
                Verify & reveal
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
