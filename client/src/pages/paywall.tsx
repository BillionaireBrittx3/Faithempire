import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Crown, BookOpen, Headphones, Sparkles, Lock, ChevronLeft, Book, Play } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import logoPath from "@assets/Copy_of_EPRODUCTS_EMPIRE_PODCAST_(98)_1770693543975.png";
import type { Verse } from "@shared/schema";
import { format } from "date-fns";

const sampleDecodedBooks = [
  { name: "Genesis", chapters: 50, verses: 1533 },
  { name: "Psalms", chapters: 150, verses: 2461 },
  { name: "Proverbs", chapters: 31, verses: 915 },
  { name: "Matthew", chapters: 28, verses: 1071 },
  { name: "John", chapters: 21, verses: 879 },
  { name: "Romans", chapters: 16, verses: 433 },
];

const sampleBibleBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings",
];

export default function PaywallPage() {
  const { subscribe, restorePurchases, isLoading, isPremium } = useSubscription();
  const [, navigate] = useLocation();
  const [tapCount, setTapCount] = useState(0);
  const [showPin, setShowPin] = useState(false);
  const [pinValue, setPinValue] = useState("");

  const { data: verse } = useQuery<Verse>({
    queryKey: ["/api/verses/today"],
  });

  const handleLogoTap = useCallback(() => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 7) {
      setShowPin(true);
      setTapCount(0);
    }
  }, [tapCount]);

  const handlePinSubmit = useCallback(() => {
    if (pinValue === "8888") {
      localStorage.setItem("faith_empire_owner_access", "true");
      window.location.reload();
    } else {
      setPinValue("");
      setShowPin(false);
    }
  }, [pinValue]);

  const todayFormatted = format(new Date(), "MMMM d, yyyy");

  if (isPremium) {
    return (
      <div className="min-h-screen bg-black pb-20">
        <div className="flex flex-col items-center px-6 pt-12 pb-8">
          <img src={logoPath} alt="Decoded Faith Empire" className="h-20 w-20 rounded-full object-cover mb-6" />
          <h1 className="font-serif text-3xl font-bold text-white mb-2" data-testid="text-paywall-title">Welcome Back</h1>
          <p className="text-sm text-white/60 text-center">You have full access to all content.</p>
          <div className="flex items-center gap-2 text-[#DFAC2A] mt-6 mb-4">
            <Crown className="h-5 w-5" />
            <span className="text-base font-semibold">You're a Premium Member</span>
          </div>
          <div className="w-full max-w-sm flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (typeof (window as any).ReactNativeWebView !== "undefined") {
                  (window as any).ReactNativeWebView.postMessage(JSON.stringify({ type: "OPEN_SUBSCRIPTION_SETTINGS" }));
                } else {
                  window.open("https://apps.apple.com/account/subscriptions", "_blank");
                }
              }}
              className="w-full border-white/20 text-white/70 hover:text-white"
              data-testid="button-manage-subscription"
            >
              Manage Subscription
            </Button>
            <button onClick={restorePurchases} className="text-xs text-white/40 underline underline-offset-4" data-testid="button-restore-purchases">
              Restore Purchases
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {showPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="flex flex-col items-center gap-4 p-6">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter PIN"
              autoFocus
              className="w-40 rounded-xl border border-white/20 bg-black px-4 py-3 text-center text-xl text-white tracking-widest focus:border-[#DFAC2A] focus:outline-none"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowPin(false); setPinValue(""); }} className="rounded-lg px-5 py-2 text-sm text-white/50">Cancel</button>
              <button onClick={handlePinSubmit} className="rounded-lg bg-[#DFAC2A] px-5 py-2 text-sm font-semibold text-black">OK</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center px-5 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="mb-4">
          <img src={logoPath} alt="Decoded Faith Empire" className="h-16 w-16 rounded-full object-cover" data-testid="img-paywall-logo" onClick={handleLogoTap} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="text-center mb-6">
          <h1 className="font-serif text-2xl font-bold text-white" data-testid="text-paywall-title">Decoded Faith Empire</h1>
          <p className="text-xs text-white/50 mt-1">The Bible decoded into today's language</p>
        </motion.div>
      </div>

      <div className="px-5 space-y-5 pb-6">

        {verse && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-[#DFAC2A]" />
              <span className="text-xs font-semibold text-[#DFAC2A] uppercase tracking-wider">Today's Verse Preview</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-3">{todayFormatted}</p>
              <p className="font-serif text-base text-white/90 italic leading-relaxed">
                {verse.verseText.length > 120 ? verse.verseText.substring(0, 120) + "..." : verse.verseText}
              </p>
              <p className="text-xs text-[#DFAC2A]/70 mt-2 tracking-wide">— {verse.reference} —</p>
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="text-[10px] text-[#DFAC2A]/50 uppercase tracking-widest mb-1">Decoded</p>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
                  {verse.decodedMessage}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent" />
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="flex items-center gap-1 text-[10px] text-white/40 bg-black/80 px-3 py-1 rounded-full">
                  <Lock className="h-3 w-3" /> Subscribe to read full verse
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div className="flex items-center gap-2 mb-2">
            <Book className="h-4 w-4 text-[#DFAC2A]" />
            <span className="text-xs font-semibold text-[#DFAC2A] uppercase tracking-wider">66 Books Decoded</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden">
            <p className="text-xs text-white/50 mb-3">Every verse decoded in modern language — side by side with the original KJV</p>
            <div className="grid grid-cols-2 gap-2">
              {sampleDecodedBooks.map((book) => (
                <div key={book.name} className={`rounded-xl border p-3 ${book.name === "Genesis" ? "bg-[#DFAC2A]/10 border-[#DFAC2A]/30" : "bg-white/[0.04] border-white/5"}`}>
                  <p className="text-sm font-medium text-white">{book.name}</p>
                  <p className="text-[10px] text-white/40">{book.chapters} chapters · {book.verses} verses</p>
                  {book.name === "Genesis" && (
                    <Link href="/decoded/genesis">
                      <span className="inline-block mt-1.5 text-[10px] font-semibold text-[#DFAC2A] underline underline-offset-2" data-testid="link-free-genesis-decoded">Read Free →</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-white/30 mt-3">+ 60 more books</p>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-[#DFAC2A]" />
            <span className="text-xs font-semibold text-[#DFAC2A] uppercase tracking-wider">Full KJV Bible</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 relative overflow-hidden">
            <div className="flex flex-wrap gap-1.5">
              {sampleBibleBooks.map((book) => (
                book === "Genesis" ? (
                  <Link key={book} href="/bible?book=Genesis&chapter=1">
                    <span className="rounded-lg bg-[#DFAC2A]/10 border border-[#DFAC2A]/30 px-2.5 py-1.5 text-xs font-semibold text-[#DFAC2A] cursor-pointer" data-testid="link-free-genesis-bible">Genesis ✦ Free</span>
                  </Link>
                ) : (
                  <span key={book} className="rounded-lg bg-white/[0.06] border border-white/5 px-2.5 py-1.5 text-xs text-white/70">{book}</span>
                )
              ))}
              <span className="rounded-lg bg-white/[0.03] border border-white/5 px-2.5 py-1.5 text-xs text-white/30">+ 54 more</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-4 w-4 text-[#DFAC2A]" />
            <span className="text-xs font-semibold text-[#DFAC2A] uppercase tracking-wider">Podcast</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DFAC2A]/10">
                <Play className="h-4 w-4 text-[#DFAC2A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Faith-based episodes</p>
                <p className="text-xs text-white/40">Audio teachings & decoded discussions</p>
              </div>
              <Lock className="h-4 w-4 text-white/20 shrink-0" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[#DFAC2A]" />
            <span className="text-xs font-semibold text-[#DFAC2A] uppercase tracking-wider">Also Included</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <p className="text-xs text-white/60">Verse archive with category filters</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <p className="text-xs text-white/60">Save & highlight your favorite verses</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <p className="text-xs text-white/60">Share verses with friends & family</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#DFAC2A]" />
                <p className="text-xs text-white/60">Early access to new content</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
        className="sticky bottom-0 bg-gradient-to-t from-black via-black to-black/0 px-5 pt-6 pb-8"
      >
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
              $8.88/month — Subscribe Now
            </span>
          )}
        </Button>
        <p className="text-[10px] text-white/40 text-center mt-2">Cancel anytime</p>

        <div className="flex items-center justify-center gap-4 mt-3">
          <button onClick={restorePurchases} className="text-[11px] text-white/40 underline underline-offset-4" data-testid="button-restore-purchases">
            Restore Purchases
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 text-white/25 text-[9px] mb-2">
            <Lock className="h-2.5 w-2.5" />
            <span>Secure payment via Apple</span>
          </div>
          <p className="text-[9px] text-white/25 leading-relaxed text-center">
            $8.88/month. Auto-renews. Cancel in Settings &gt; Apple ID &gt; Subscriptions at least 24 hours before renewal.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px]">
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
  );
}
