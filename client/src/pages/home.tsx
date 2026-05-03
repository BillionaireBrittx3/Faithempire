import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Lock, ChevronRight, Sparkles, BookOpen, Headphones, HandHeart, Bookmark, Library, Check, CheckCircle2 } from "lucide-react";
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
const COMPLETED_KEY = "faith-empire-devotional-completed";
const JOURNAL_KEY_PREFIX = "faith-empire-devotional-journal-";

function loadCompleted(): Set<number> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((n) => typeof n === "number"));
  } catch {}
  return new Set();
}

function saveCompleted(set: Set<number>) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function nextUncompletedDay(completed: Set<number>): number {
  for (let i = 1; i <= 365; i++) if (!completed.has(i)) return i;
  return 1;
}

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
  const [completed, setCompleted] = useState<Set<number>>(() => loadCompleted());
  const initialDay = useMemo(() => {
    const target = nextUncompletedDay(completed);
    return isPremium ? target : Math.min(target, FREE_DAYS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [accessibleDay, setAccessibleDay] = useState<number>(initialDay);
  const day = DAYS[accessibleDay - 1];
  const isCompleted = completed.has(accessibleDay);

  const [journalText, setJournalText] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_KEY_PREFIX + accessibleDay);
      setJournalText(saved || "");
    } catch {
      setJournalText("");
    }
  }, [accessibleDay]);
  const saveJournal = (val: string) => {
    setJournalText(val);
    try {
      localStorage.setItem(JOURNAL_KEY_PREFIX + accessibleDay, val);
    } catch {}
  };

  const [justCompleted, setJustCompleted] = useState(false);
  const markCompleteAndContinue = () => {
    const next = new Set(completed);
    next.add(accessibleDay);
    setCompleted(next);
    saveCompleted(next);
    setJustCompleted(true);
    const nextDay = accessibleDay >= 365 ? 1 : accessibleDay + 1;
    if (!isPremium && nextDay > FREE_DAYS) {
      openPaywall(`Day ${nextDay} is part of premium`);
      setTimeout(() => setJustCompleted(false), 600);
      return;
    }
    setTimeout(() => {
      setAccessibleDay(nextDay);
      setJustCompleted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  const { data: verse } = useQuery<Verse>({
    queryKey: ["/api/verses/today"],
  });

  const handleLockedClick = (reason: string) => {
    openPaywall(reason);
  };

  return (
    <div className="min-h-screen bg-black pb-8" data-testid="page-home">
      <div className="px-4 pt-4">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#DFAC2A]">
            Today's Decoded Verse
          </p>
          <h1 className="heading-display text-gradient-gold-strong mt-2 text-4xl" data-testid="text-todays-verse-ref">
            {verse?.reference || "Loading…"}
          </h1>
        </div>

        <article className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6" data-testid="card-todays-verse-full">
          <DevSection label="Scripture (KJV)" testId="section-today-scripture">
            <p className="font-serif italic leading-relaxed text-white">
              {verse ? `"${verse.verseText}"` : "Loading…"}
            </p>
            {verse && (
              <p className="mt-2 text-sm font-semibold text-[#DFAC2A]">— {verse.reference}</p>
            )}
          </DevSection>

          <DevSection label="Decoded (DMLV)" testId="section-today-decoded">
            <p className="leading-relaxed text-white/85">
              {verse?.decodedMessage || "Loading…"}
            </p>
          </DevSection>

          {verse?.prayerText && (
            <DevSection
              label={verse.prayerTitle ? `Prayer · ${verse.prayerTitle}` : "Prayer"}
              testId="section-today-prayer"
            >
              <p className="whitespace-pre-line leading-relaxed text-white/85">
                {verse.prayerText}
              </p>
            </DevSection>
          )}
        </article>

        <div className="mt-8 mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#DFAC2A]">
              365 Days · Closer to God
            </p>
            <h2 className="heading-display text-gradient-gold mt-1.5 text-3xl" data-testid="text-day-title">
              Day {accessibleDay} of 365
            </h2>
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

        <article className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6">
          <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#DFAC2A]">
            Theme · {day.theme}
          </p>
          <h2 className="heading-display mt-2 text-3xl text-white" data-testid="text-devotional-title">
            {day.title}
          </h2>

          <DevSection label="Scripture (KJV)" testId="section-scripture">
            <p className="font-serif italic leading-relaxed text-white">"{day.scriptureText}"</p>
            <p className="mt-2 text-sm font-semibold text-[#DFAC2A]">— {day.scriptureRef}</p>
          </DevSection>

          <DevSection label="Decoded (DMLV)" testId="section-decoded">
            <p className="leading-relaxed text-white/85">{day.decoded}</p>
          </DevSection>

          <DevSection label="Reflection" testId="section-reflection">
            <p className="whitespace-pre-line leading-relaxed text-white/85">{day.reflection}</p>
          </DevSection>

          <DevSection label="Prayer" testId="section-prayer">
            <p className="whitespace-pre-line leading-relaxed text-white/85">{day.prayer}</p>
          </DevSection>

          <DevSection label="Journal" testId="section-journal">
            <p className="mb-3 leading-relaxed text-white/85">{day.journal}</p>
            <textarea
              value={journalText}
              onChange={(e) => saveJournal(e.target.value)}
              placeholder="Write your honest answer here. It saves automatically."
              className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-[#DFAC2A]/60 focus:outline-none"
              data-testid="input-journal"
            />
          </DevSection>

          <DevSection label={`Today's Activity · ${day.activityName}`} testId="section-activity">
            <p className="leading-relaxed text-white/85">{day.activity}</p>
          </DevSection>

          {!isCompleted && !justCompleted && (
            <p className="mt-5 text-center text-[11px] uppercase tracking-[0.2em] text-[#DFAC2A]/80" data-testid="text-complete-hint">
              Complete today to unlock Day {accessibleDay >= 365 ? 1 : accessibleDay + 1}
            </p>
          )}

          <button
            onClick={markCompleteAndContinue}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors ${
              justCompleted
                ? "bg-[#1f8a3a] text-white"
                : isCompleted
                ? "border border-[#DFAC2A]/40 bg-[#DFAC2A]/10 text-[#DFAC2A]"
                : "bg-[#DFAC2A] text-black active:bg-[#c79925]"
            }`}
            data-testid="button-complete-continue"
          >
            {justCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Marked complete · loading next day…
              </>
            ) : isCompleted ? (
              <>
                <Check className="h-4 w-4" /> Completed · Continue to Day {accessibleDay >= 365 ? 1 : accessibleDay + 1}
              </>
            ) : (
              <>Mark complete · Continue to Day {accessibleDay >= 365 ? 1 : accessibleDay + 1}</>
            )}
          </button>

          <button
            onClick={() => navigate("/devotional")}
            className="mt-3 w-full text-center text-[11px] text-white/55 underline"
            data-testid="button-open-devotional"
          >
            Browse all 365 days
          </button>
        </article>

        {!isPremium && (
          <button
            onClick={() => openPaywall("Unlock everything")}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-[#DFAC2A]/40 bg-[#DFAC2A]/10 px-4 py-3 text-left active:bg-[#DFAC2A]/15"
            data-testid="button-upsell-banner"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#DFAC2A] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Unlock everything</p>
                <p className="text-[11px] text-white/60">Full Bible, Decoded Bible, Podcast, 365 Days to get Closer to God & more</p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-bold text-[#DFAC2A]">$8.88/mo</span>
          </button>
        )}

        <h3 className="mt-6 mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
          More from Faith Empire
        </h3>

        <div className="space-y-3">
          <FeatureTeaser
            icon={Library}
            label="The Original Verse of the King James Bible"
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
            label="Decoded Version of the Bible"
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

  const showLock = !isPremium && href !== "/decoded" && href !== "/prayers";

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
            {showLock ? (
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
    </button>
  );
}

function DevSection({
  label,
  testId,
  children,
}: {
  label: string;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-4" data-testid={testId}>
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-6 bg-[#DFAC2A]/60" />
        <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#DFAC2A]">
          {label}
        </p>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="text-[15px] leading-[1.7]">{children}</div>
    </section>
  );
}
