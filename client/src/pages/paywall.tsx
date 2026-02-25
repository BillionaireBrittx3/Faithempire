import { Button } from "@/components/ui/button";
import { Crown, BookOpen, Headphones, Sparkles, Lock, ChevronLeft } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";

const premiumFeatures = [
  { icon: BookOpen, label: "Full KJV Breakdown", description: "Complete decoded translations" },
  { icon: BookOpen, label: "All Decoded Books", description: "Every book, every chapter" },
  { icon: Sparkles, label: "Exclusive Devotionals", description: "Premium daily content" },
  { icon: Headphones, label: "Members-Only Audio", description: "Full podcast access" },
  { icon: Crown, label: "Early Access", description: "New releases before anyone" },
];

export default function PaywallPage() {
  const { subscribe, restorePurchases, isLoading } = useSubscription();
  const [, navigate] = useLocation();

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
            Unlock Premium
          </h1>
          <p className="text-sm text-white/60 mt-2 max-w-xs mx-auto leading-relaxed">
            Get full access to all decoded books, exclusive devotionals, and members-only content
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
              <span className="text-sm font-semibold text-[#DFAC2A]">Premium Membership</span>
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
          <div className="text-center mb-1">
            <p className="text-3xl font-bold text-white" data-testid="text-paywall-price">
              $12.22<span className="text-base font-normal text-white/50">/month</span>
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="mt-8 text-center max-w-xs"
        >
          <div className="flex items-center justify-center gap-4 text-white/20 text-[10px]">
            <Lock className="h-3 w-3" />
            <span>Secure payment via Apple</span>
          </div>
          <p className="text-[10px] text-white/20 mt-2 leading-relaxed">
            Subscription automatically renews monthly. Cancel anytime in your Apple ID settings.
          </p>
        </motion.div>

        <div className="mt-6">
          <div className="border-t border-white/10 pt-4 mt-2">
            <p className="font-serif text-base font-semibold text-white/80 text-center mb-3">
              Free Features
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <span className="text-xs text-white/60">Daily Bible verse &amp; decoded message</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <span className="text-xs text-white/60">Limited decoded chapters</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <span className="text-xs text-white/60">Podcast previews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
