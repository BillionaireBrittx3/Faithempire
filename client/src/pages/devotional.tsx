import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Sparkles, Lock } from "lucide-react";
import devotionalData from "@/data/devotional.json";
import { useSubscription } from "@/lib/subscription";
import { usePaywall } from "@/components/paywall-modal";

const FREE_DAYS = 7;

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

const DAYS: DevotionalDay[] = devotionalData as DevotionalDay[];

const QUARTERS = [
  { name: "Root", subtitle: "Building the foundation of your faith", start: 1, end: 91 },
  { name: "Grow", subtitle: "Deepening your spiritual practices", start: 92, end: 182 },
  { name: "Bloom", subtitle: "Living out what is taking root", start: 183, end: 273 },
  { name: "Harvest", subtitle: "Walking in maturity and legacy", start: 274, end: 365 },
];

const START_DATE_KEY = "faith-empire-devotional-start";
const JOURNAL_KEY_PREFIX = "faith-empire-devotional-journal-";

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

function getQuarter(day: number) {
  return QUARTERS.find((q) => day >= q.start && day <= q.end) || QUARTERS[0];
}

export default function DevotionalPage() {
  const { isPremium } = useSubscription();
  const { open: openPaywall } = usePaywall();
  const todayDay = useMemo(() => getTodayDay(), []);
  const initialDay = isPremium ? todayDay : Math.min(todayDay, FREE_DAYS);
  const [currentDay, setCurrentDay] = useState<number>(initialDay);
  const [showPicker, setShowPicker] = useState(false);
  const [journalText, setJournalText] = useState("");

  const day = DAYS[currentDay - 1];
  const quarter = getQuarter(currentDay);
  const isToday = currentDay === todayDay;
  const isLocked = !isPremium && currentDay > FREE_DAYS;

  const tryGoTo = (d: number) => {
    if (!isPremium && d > FREE_DAYS) {
      openPaywall(`Day ${d} is part of premium`);
      return;
    }
    setCurrentDay(d);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(JOURNAL_KEY_PREFIX + currentDay);
      setJournalText(saved || "");
    } catch {
      setJournalText("");
    }
    window.scrollTo(0, 0);
  }, [currentDay]);

  const saveJournal = (text: string) => {
    setJournalText(text);
    try {
      if (text.trim()) {
        localStorage.setItem(JOURNAL_KEY_PREFIX + currentDay, text);
      } else {
        localStorage.removeItem(JOURNAL_KEY_PREFIX + currentDay);
      }
    } catch {}
  };

  const goPrev = () => {
    const target = currentDay <= 1 ? 365 : currentDay - 1;
    tryGoTo(target);
  };
  const goNext = () => {
    const target = currentDay >= 365 ? 1 : currentDay + 1;
    tryGoTo(target);
  };
  const goToday = () => tryGoTo(todayDay);

  return (
    <div className="min-h-screen bg-black text-white" data-testid="page-devotional">
      <div className="px-4 pt-4 pb-24">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFAC2A]">
              365 Days
            </p>
            <h1 className="font-serif text-2xl font-bold text-white" data-testid="text-page-title">
              Closer to God
            </h1>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1.5 rounded-full border border-[#DFAC2A]/40 bg-[#DFAC2A]/10 px-3 py-1.5 text-xs font-medium text-[#DFAC2A]"
            data-testid="button-open-picker"
          >
            <Calendar className="h-3.5 w-3.5" />
            All Days
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <button
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 active:bg-white/10"
            data-testid="button-prev-day"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-1 flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Quarter {QUARTERS.indexOf(quarter) + 1}: {quarter.name} · Week {day.week}
            </p>
            <p className="font-serif text-lg font-bold text-white" data-testid="text-day-number">
              Day {currentDay} of 365
            </p>
            {!isToday && (
              <button
                onClick={goToday}
                className="mt-0.5 text-[11px] font-medium text-[#DFAC2A] underline"
                data-testid="button-jump-today"
              >
                Jump to today (Day {todayDay})
              </button>
            )}
            {isToday && (
              <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-[#DFAC2A]">
                <Sparkles className="h-3 w-3" /> Today
              </span>
            )}
          </div>
          <button
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 active:bg-white/10"
            data-testid="button-next-day"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {!isPremium && (
          <div className="mb-3 rounded-xl border border-[#DFAC2A]/30 bg-[#DFAC2A]/10 px-3 py-2 text-center text-[11px] text-[#DFAC2A]">
            You're on day {Math.min(currentDay, FREE_DAYS)} of your 7 free days.
            {currentDay >= FREE_DAYS && " Subscribe to keep going past Day 7."}
          </div>
        )}

        <div className="mb-3 inline-flex rounded-full bg-[#DFAC2A]/15 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#DFAC2A]">
          Theme · {day.theme}
        </div>

        <h2 className="font-serif text-2xl font-bold leading-tight text-white" data-testid="text-day-title">
          {day.title}
        </h2>

        {isLocked && (
          <div className="mt-5 rounded-2xl border border-[#DFAC2A]/40 bg-gradient-to-br from-[#DFAC2A]/15 via-white/[0.03] to-black p-6 text-center" data-testid="card-day-locked">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#DFAC2A]/20">
              <Lock className="h-5 w-5 text-[#DFAC2A]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">Day {currentDay} is Premium</h3>
            <p className="mt-2 text-sm text-white/70">
              You've finished your 7 free days. Subscribe for $8.88/month to continue with all 365 days.
            </p>
            <button
              onClick={() => openPaywall(`Day ${currentDay} is part of premium`)}
              className="mt-4 w-full rounded-xl bg-[#DFAC2A] py-3 text-sm font-semibold text-black active:bg-[#c79925]"
              data-testid="button-locked-subscribe"
            >
              Unlock the rest — $8.88/mo
            </button>
            <button
              onClick={() => tryGoTo(FREE_DAYS)}
              className="mt-3 w-full text-xs text-white/55 underline"
              data-testid="button-back-to-free"
            >
              Go back to Day {FREE_DAYS}
            </button>
          </div>
        )}

        {!isLocked && <>
        <Section label="Scripture (KJV)" testId="section-scripture">
          <p className="font-serif italic leading-relaxed text-white">
            "{day.scriptureText}"
          </p>
          <p className="mt-2 text-sm font-semibold text-[#DFAC2A]">
            — {day.scriptureRef}
          </p>
        </Section>

        <Section label="Decoded (DMLV)" testId="section-decoded">
          <p className="leading-relaxed text-white/85">{day.decoded}</p>
        </Section>

        <Section label="Reflection" testId="section-reflection">
          <p className="whitespace-pre-line leading-relaxed text-white/85">
            {day.reflection}
          </p>
        </Section>

        <Section label="Prayer" testId="section-prayer">
          <p className="whitespace-pre-line leading-relaxed text-white/85">
            {day.prayer}
          </p>
        </Section>

        <Section label="Journal" testId="section-journal">
          <p className="mb-3 leading-relaxed text-white/85">{day.journal}</p>
          <textarea
            value={journalText}
            onChange={(e) => saveJournal(e.target.value)}
            placeholder="Write your honest answer here. It saves automatically."
            className="min-h-[140px] w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-white/40 focus:border-[#DFAC2A]/60 focus:outline-none"
            data-testid="input-journal"
          />
        </Section>

        <Section label={`Today's Activity · ${day.activityName}`} testId="section-activity">
          <p className="leading-relaxed text-white/85">{day.activity}</p>
        </Section>

        <div className="mt-6 flex gap-3">
          <button
            onClick={goPrev}
            className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-white/80 active:bg-white/5"
            data-testid="button-prev-day-bottom"
          >
            ← Day {currentDay <= 1 ? 365 : currentDay - 1}
          </button>
          <button
            onClick={goNext}
            className="flex-1 rounded-xl bg-[#DFAC2A] py-3 text-sm font-semibold text-black active:bg-[#c79925]"
            data-testid="button-next-day-bottom"
          >
            {!isPremium && currentDay >= FREE_DAYS ? "Unlock Day " + (currentDay + 1) : `Day ${currentDay >= 365 ? 1 : currentDay + 1} →`}
          </button>
        </div>
        </>}
      </div>

      {showPicker && (
        <DayPicker
          currentDay={currentDay}
          todayDay={todayDay}
          isPremium={isPremium}
          onSelect={(d) => {
            tryGoTo(d);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

function Section({
  label,
  testId,
  children,
}: {
  label: string;
  testId: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4" data-testid={testId}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DFAC2A]">
        {label}
      </p>
      {children}
    </section>
  );
}

function DayPicker({
  currentDay,
  todayDay,
  isPremium,
  onSelect,
  onClose,
}: {
  currentDay: number;
  todayDay: number;
  isPremium: boolean;
  onSelect: (d: number) => void;
  onClose: () => void;
}) {
  const [openQuarter, setOpenQuarter] = useState<number>(
    QUARTERS.findIndex((q) => currentDay >= q.start && currentDay <= q.end)
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      data-testid="overlay-day-picker"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-t border-[#DFAC2A]/30 bg-black p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-white">Choose a Day</h2>
          <button
            onClick={onClose}
            className="text-sm text-[#DFAC2A]"
            data-testid="button-close-picker"
          >
            Close
          </button>
        </div>

        {QUARTERS.map((q, qi) => {
          const isOpen = openQuarter === qi;
          return (
            <div key={q.name} className="mb-3 overflow-hidden rounded-2xl border border-white/10">
              <button
                onClick={() => setOpenQuarter(isOpen ? -1 : qi)}
                className="flex w-full items-center justify-between bg-white/5 px-4 py-3 text-left"
                data-testid={`button-quarter-${qi + 1}`}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#DFAC2A]">
                    Quarter {qi + 1}
                  </p>
                  <p className="font-serif text-base font-bold text-white">{q.name}</p>
                  <p className="text-[11px] text-white/55">
                    {q.subtitle} · Days {q.start}–{q.end}
                  </p>
                </div>
                <ChevronRight className={`h-4 w-4 text-white/50 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>
              {isOpen && (
                <div className="grid grid-cols-7 gap-1.5 bg-black/40 p-3">
                  {Array.from({ length: q.end - q.start + 1 }, (_, i) => q.start + i).map((d) => {
                    const isCurrent = d === currentDay;
                    const isToday = d === todayDay;
                    const isLockedDay = !isPremium && d > FREE_DAYS;
                    return (
                      <button
                        key={d}
                        onClick={() => onSelect(d)}
                        className={`relative flex h-9 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                          isCurrent
                            ? "bg-[#DFAC2A] text-black"
                            : isToday
                            ? "border border-[#DFAC2A]/60 text-[#DFAC2A]"
                            : isLockedDay
                            ? "bg-white/[0.02] text-white/30"
                            : "bg-white/5 text-white/70 active:bg-white/10"
                        }`}
                        data-testid={`button-day-${d}`}
                      >
                        {isLockedDay && (
                          <Lock className="absolute right-0.5 top-0.5 h-2 w-2 text-white/30" />
                        )}
                        {d}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
