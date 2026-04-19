import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Lock, ChevronRight, Sparkles, BookOpen, Headphones, HandHeart, Bookmark, Library } from "lucide-react";
import { useSubscription } from "@/lib/subscription";
import { usePaywall } from "@/components/paywall-modal";
import devotionalData from "@/data/devotional.json";
import type { Verse } from "@shared/schema";

interface DevotionalDay {
  day: number;
  week: number;
  theme: string;
  title: string;
  scriptureText: string;
  scriptureRef: string;
  decoded: string;
  reflection: string;
  prayer: string;
  journal: string;
  activity: string;
  activityName: string;
}

const DAYS = devotionalData as DevotionalDay[];
const FREE_DAYS = 7;
const START_DATE_KEY = "faith-empire-devotional-start";

function getStartDate(): Date {
  try {
    const stored = localStorage.getItem(START_DATE_KEY);
    if (stored) {
      const d = new Date(parseInt(stored));
      if (!isNaN(d.getTime())) return d;
    }
  } catch {}
  const now = new Date();
  try {
    localStorage.setItem(START_DATE_KEY, now.getTime().toString());
  } catch {}
  return now;
}

function getTodayDay(): number {
  const start = getStartDate();
  const now = new Date();
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((nowMidnight.getTime() - startMidnight.getTime()) / 86400000);
  return ((diffDays % 365) + 365) % 365 + 1;
}

export default function Home() {
  const { isPremium } = useSubscription();
  const { open: openPaywall } = usePaywall();
  const [, navigate] = useLocation();

  const todayDay = useMemo(() => getTodayDay(), []);
  const accessibleDay = isPremium ? todayDay : Math.min(todayDay, FREE_DAYS);
  const day = DAYS[accessibleDay - 1];

  const { data: verse } = useQuery<Verse>({
    queryKey: ["/api/verses/today"],
  });

  const handleDevotionalContinue = () => {
    navigate("/devotional");
  };

  const handleLockedClick = (reason: string) => {
    openPaywall(reason);
  };

  return (
    <div className="min-h-screen bg-black pb-8" data-testid="page-home">
      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFAC2A]">
              365 Days · Closer to God
            </p>
            <h1 className="font-serif text-2xl font-bold text-white" data-testid="text-day-title">
              Day {accessibleDay} of 365
            </h1>
          </div>
          {!isPremium && (
            <span className="rounded-full border border-[#DFAC2A]/40 bg-[#DFAC2A]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#DFAC2A]">
              {Math.min(todayDay, FREE_DAYS)} of {FREE_DAYS} free
            </span>
          )}
        </div>

        {!isPremium && (
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#DFAC2A] transition-all"
              style={{ width: `${(Math.min(todayDay, FREE_DAYS) / FREE_DAYS) * 100}%` }}
            />
          </div>
        )}

        <article className="rounded-2xl border border-[#DFAC2A]/30 bg-gradient-to-br from-[#DFAC2A]/10 via-white/[0.02] to-black p-5">
          <div className="mb-2 inline-flex rounded-full bg-[#DFAC2A]/15 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#DFAC2A]">
            Theme · {day.theme}
          </div>
          <h2 className="font-serif text-xl font-bold leading-snug text-white" data-testid="text-devotional-title">
            {day.title}
          </h2>
          <p className="mt-3 font-serif italic leading-relaxed text-white/90">
            "{day.scriptureText}"
          </p>
          <p className="mt-1 text-xs font-semibold text-[#DFAC2A]">— {day.scriptureRef}</p>

          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DFAC2A]">
              Decoded
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">{day.decoded}</p>
          </div>

          <button
            onClick={handleDevotionalContinue}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#DFAC2A] py-3 text-sm font-semibold text-black active:bg-[#c79925]"
            data-testid="button-open-devotional"
          >
            Read today's full devotional
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isPremium && todayDay > FREE_DAYS && (
            <p className="mt-3 text-center text-[11px] text-white/50">
              You've used your 7 free days. Subscribe to continue with Day {todayDay}.
            </p>
          )}
        </article>

        {!isPremium && (
          <button
            onClick={() => openPaywall("Unlock all 365 days + every feature")}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-[#DFAC2A]/40 bg-[#DFAC2A]/10 px-4 py-3 text-left active:bg-[#DFAC2A]/15"
            data-testid="button-upsell-banner"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#DFAC2A]" />
              <div>
                <p className="text-sm font-semibold text-white">Unlock everything</p>
                <p className="text-[11px] text-white/60">All 365 days, full Bible, podcast & more</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[#DFAC2A]">$8.88/mo</span>
          </button>
        )}

        <h3 className="mt-6 mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          More from Faith Empire
        </h3>

        <div className="space-y-3">
          <FeatureTeaser
            icon={BookOpen}
            label="Today's Decoded Verse"
            preview={verse ? `"${verse.verseText.slice(0, 110)}${verse.verseText.length > 110 ? '…' : ''}"` : "Loading..."}
            sub={verse?.reference || ""}
            isPremium={isPremium}
            reason="Read today's full decoded verse"
            href={null}
            onLocked={handleLockedClick}
            testId="card-todays-verse"
          />
          <FeatureTeaser
            icon={Library}
            label="KJV Bible"
            preview="Read every chapter of the King James Bible — searchable, with highlighting."
            sub="66 books · Old & New Testament"
            isPremium={isPremium}
            reason="Unlock the full KJV Bible"
            href="/bible"
            onLocked={handleLockedClick}
            testId="card-bible"
          />
          <FeatureTeaser
            icon={Headphones}
            label="Faith Empire Podcast"
            preview="Audio teachings & decoded discussions, refreshed weekly."
            sub="New episodes every week"
            isPremium={isPremium}
            reason="Listen to every podcast episode"
            href="/podcast"
            onLocked={handleLockedClick}
            testId="card-podcast"
          />
          <FeatureTeaser
            icon={Bookmark}
            label="66 Decoded Books"
            preview="Genesis to Revelation — every chapter rewritten in plain modern language."
            sub="Genesis · Psalms · Matthew · Romans …"
            isPremium={isPremium}
            reason="Unlock all 66 decoded books"
            href="/decoded"
            onLocked={handleLockedClick}
            testId="card-decoded"
          />
          <FeatureTeaser
            icon={HandHeart}
            label="Daily Prayers"
            preview="Prayers for every season — anxiety, gratitude, healing, peace."
            sub="With daily reminders"
            isPremium={isPremium}
            reason="Unlock daily prayers & reminders"
            href="/prayers"
            onLocked={handleLockedClick}
            testId="card-prayers"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureTeaser({
  icon: Icon,
  label,
  preview,
  sub,
  isPremium,
  reason,
  href,
  onLocked,
  testId,
}: {
  icon: any;
  label: string;
  preview: string;
  sub: string;
  isPremium: boolean;
  reason: string;
  href: string | null;
  onLocked: (r: string) => void;
  testId: string;
}) {
  const [, navigate] = useLocation();
  const handleClick = () => {
    if (!isPremium) {
      onLocked(reason);
      return;
    }
    if (href) navigate(href);
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left active:bg-white/[0.05]"
      data-testid={testId}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DFAC2A]/10">
          <Icon className="h-5 w-5 text-[#DFAC2A]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">{label}</p>
            {!isPremium ? (
              <Lock className="h-3.5 w-3.5 text-white/40" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/65 line-clamp-2">
            {preview}
          </p>
          {sub && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/40">
              {sub}
            </p>
          )}
        </div>
      </div>
      {!isPremium && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-[#DFAC2A]/10 px-3 py-2">
          <span className="text-[11px] font-medium text-[#DFAC2A]">
            Subscribe to read more
          </span>
          <span className="text-[11px] font-bold text-[#DFAC2A]">$8.88/mo →</span>
        </div>
      )}
    </button>
  );
}
