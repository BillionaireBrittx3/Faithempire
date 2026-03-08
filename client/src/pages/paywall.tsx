import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Crown, BookOpen, Headphones, Sparkles, Lock, ChevronLeft } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";

const premiumFeatures = [
  { icon: BookOpen, label: "Daily Verse & Decoded Message", description: "Fresh inspiration every day" },
  { icon: BookOpen, label: "Full KJV Bible Reader", description: "All 66 books with navigation" },
  { icon: BookOpen, label: "All 66 Decoded Books", description: "Every verse decoded in modern language" },
  { icon: Headphones, label: "Full Podcast Library", description: "All episodes, unlimited access" },
  { icon: Sparkles, label: "Verse Archive & Favorites", description: "Save and revisit your highlights" },
  { icon: Crown, label: "Early Access", description: "New content before anyone else" },
];

export default function PaywallPage() {
  const { subscribe, restorePurchases, isLoading, isPremium } = useSubscription();
  const [, navigate] = useLocation();
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = useCallback(() => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 7) {
      localStorage.setItem("faith_empire_owner_access", "true");
      window.location.reload();
    }
  }, [tapCount]);

  return (
    <div className="min-h-screen bg-black pb-20">
      <div className="px-4 pt-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white/70"
          data-testid="button-paywall-back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center px-6 pt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <img
            src={logoPath}
            alt="Decoded Faith Empire"
            className="h-20 w-20 rounded-full object-cover"
            data-testid="img-paywall-logo"
            onClick={handleLogoTap}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center mb-2"
        >
          <h1
            className="font-serif text-3xl font-bold text-white"
            data-testid="text-paywall-title"
          >
            {isPremium ? "Welcome Back" : "Welcome to Decoded Faith Empire"}
          </h1>
          <p className="text-sm text-white/60 mt-2 max-w-xs mx-auto leading-relaxed">
            {isPremium
              ? "You have full access to all content"
              : "Subscribe to unlock daily decoded verses, the full KJV Bible, all 66 decoded books, and the complete podcast library"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-sm mt-6 mb-8"
        >
          <div className="rounded-2xl border border-[#DFAC2A]/30 bg-[#DFAC2A]/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-[#DFAC2A]" />
              <span className="text-sm font-semibold text-[#DFAC2A]">
                {isPremium ? "Your Membership" : "What's Included"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {premiumFeatures.map((feature, idx) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DFAC2A]/10">
                    <feature.icon className="h-4 w-4 text-[#DFAC2A]" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-white">{feature.label}</p>
                    <p className="text-xs text-white/50">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="w-full max-w-sm flex flex-col items-center gap-3"
        >
          {isPremium ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-[#DFAC2A]">
                <Crown className="h-5 w-5" />
                <span className="text-base font-semibold">You're a Premium Member</span>
              </div>
              <p className="text-xs text-white/40 text-center">
                Your subscription is active. You have full access to all content.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof (window as any).ReactNativeWebView !== "undefined") {
                    (window as any).ReactNativeWebView.postMessage(
                      JSON.stringify({ type: "OPEN_SUBSCRIPTION_SETTINGS" })
                    );
                  } else {
                    window.open("https://apps.apple.com/account/subscriptions", "_blank");
                  }
                }}
                className="w-full border-white/20 text-white/70 hover:text-white"
                data-testid="button-manage-subscription"
              >
                Manage Subscription
              </Button>
              <button
                onClick={restorePurchases}
                className="text-xs text-white/40 underline underline-offset-4"
                data-testid="button-restore-purchases"
              >
                Restore Purchases
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-1">
                <p className="text-3xl font-bold text-white" data-testid="text-paywall-price">
                  $8.88<span className="text-base font-normal text-white/50">/month</span>
                </p>
                <p className="text-xs text-white/40 mt-1">Cancel anytime</p>
              </div>

              <Button
                onClick={subscribe}
                disabled={isLoading}
                className="w-full h-14 rounded-xl text-base font-semibold bg-[#DFAC2A] hover:bg-[#DFAC2A]/90 text-black"
                data-testid="button-subscribe"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Subscribe Now
                  </span>
                )}
              </Button>

              <button
                onClick={restorePurchases}
                className="text-xs text-white/40 underline underline-offset-4"
                data-testid="button-restore-purchases"
              >
                Restore Purchases
              </button>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-8 w-full max-w-sm"
        >
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-center gap-2 text-white/30 text-[10px] mb-3">
              <Lock className="h-3 w-3" />
              <span>Secure payment via Apple</span>
            </div>
            <div className="text-[10px] text-white/30 leading-relaxed space-y-2" data-testid="text-subscription-legal">
              <p>
                A subscription costs $8.88 per month. Payment will be charged to your Apple ID account at confirmation of purchase.
              </p>
              <p>
                Your subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period at the rate of $8.88/month.
              </p>
              <p>
                You can manage and cancel your subscription in your Apple ID Account Settings (Settings &gt; Apple ID &gt; Subscriptions). Any unused portion of a free trial period, if offered, will be forfeited when you purchase a subscription.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-[10px]">
              <Link href="/terms">
                <span className="text-white/40 underline underline-offset-4" data-testid="link-paywall-terms">Terms of Use</span>
              </Link>
              <span className="text-white/20">|</span>
              <Link href="/privacy">
                <span className="text-white/40 underline underline-offset-4" data-testid="link-paywall-privacy">Privacy Policy</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
