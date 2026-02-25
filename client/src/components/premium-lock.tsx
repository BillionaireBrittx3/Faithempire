import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface PremiumLockProps {
  title?: string;
  description?: string;
}

export function PremiumLock({
  title = "Premium Content",
  description = "Subscribe to unlock full access",
}: PremiumLockProps) {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 px-6 py-12 text-center"
      data-testid="premium-lock-overlay"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Button
        onClick={() => navigate("/premium")}
        className="mt-2 bg-[#DFAC2A] hover:bg-[#DFAC2A]/90 text-black font-semibold"
        data-testid="button-unlock-premium"
      >
        <Crown className="h-4 w-4 mr-2" />
        Unlock Premium
      </Button>
    </motion.div>
  );
}

export function PremiumBadge() {
  const [, navigate] = useLocation();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate("/premium");
      }}
      className="inline-flex items-center gap-1 rounded-full bg-[#DFAC2A]/10 px-2 py-0.5 text-[10px] font-medium text-[#DFAC2A]"
      data-testid="badge-premium"
    >
      <Crown className="h-3 w-3" />
      Premium
    </button>
  );
}
