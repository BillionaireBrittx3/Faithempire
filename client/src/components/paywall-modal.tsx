import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { X, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription";
import { useLocation } from "wouter";

interface PaywallModalState {
  open: (reason?: string) => void;
  close: () => void;
  isOpen: boolean;
}

const PaywallModalContext = createContext<PaywallModalState>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function usePaywall() {
  return useContext(PaywallModalContext);
}

export function useRequirePremium(reason: string) {
  const { isPremium, isLoading } = useSubscription();
  const { open } = usePaywall();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isPremium) {
      open(reason);
      navigate("/");
    }
  }, [isPremium, isLoading, open, navigate, reason]);

  return { isPremium, isLoading };
}

export function PaywallModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const { isPremium, subscribe, restorePurchases, isLoading } = useSubscription();

  const open = useCallback((r?: string) => {
    if (isPremium) return;
    setReason(r);
    setIsOpen(true);
  }, [isPremium]);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (isPremium && isOpen) setIsOpen(false);
  }, [isPremium, isOpen]);

  return (
    <PaywallModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
          data-testid="overlay-paywall-modal"
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-[#DFAC2A]/40 bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between bg-black px-5 py-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#DFAC2A]">
                Premium Access
              </span>
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
                data-testid="button-close-paywall-modal"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DFAC2A]/15">
                <Crown className="h-7 w-7 text-[#DFAC2A]" />
              </div>
              <h2 className="font-serif text-2xl font-bold leading-tight text-white" data-testid="text-paywall-modal-title">
                {reason || "Unlock the full Faith Empire"}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                You have 7 free days of the devotional. Subscribe to unlock all 365 days plus everything below.
              </p>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-[#DFAC2A]">$8.88</span>
                <span className="text-sm text-white/60">/ month</span>
              </div>
              <p className="mt-1 text-xs text-white/40">Cancel anytime.</p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "All 365 days of Closer to God devotional",
                  "Full daily decoded verse + decoded books",
                  "Complete KJV Bible with search",
                  "Faith Empire Podcast — every episode",
                  "Daily prayers + reminders",
                  "Save, share, and revisit any verse",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#DFAC2A]" />
                    {item}
                  </li>
                ))}
              </ul>

              <Button
                onClick={subscribe}
                disabled={isLoading}
                className="mt-6 h-14 w-full rounded-xl bg-[#DFAC2A] text-base font-semibold text-black hover:bg-[#DFAC2A]/90"
                data-testid="button-paywall-modal-subscribe"
              >
                Subscribe — $8.88/month
              </Button>
              <button
                onClick={restorePurchases}
                className="mt-3 w-full text-center text-xs text-white/50 underline"
                data-testid="button-paywall-modal-restore"
              >
                Restore Purchases
              </button>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-white/30">
                $8.88/month. Auto-renews. Cancel anytime in Settings &gt; Apple ID &gt; Subscriptions
                at least 24 hours before renewal.
              </p>
            </div>
          </div>
        </div>
      )}
    </PaywallModalContext.Provider>
  );
}
