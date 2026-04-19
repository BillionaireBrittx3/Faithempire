import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronDown, ChevronUp, ChevronRight, Bell, BellRing, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  getSavedReminder,
  saveReminder,
  clearReminder,
  formatTime,
  requestNotificationPermission,
  getNotificationPermission,
  scheduleReminder,
  cancelScheduledReminder,
  type PrayerReminder,
} from "@/lib/prayer-reminder";

interface Prayer {
  id: number;
  prayerTitle: string;
  prayerText: string;
  prayerSection: string;
}

interface PrayersBySection {
  [section: string]: Prayer[];
}

const SECTION_ORDER = [
  "Prayers of Protection",
  "Prayers Against Mental Warfare",
  "Prayers for Purpose and Destiny",
  "Prayers for Family and Relationships",
  "Prayers for Finances and Provision",
  "Prayers for Health and Healing",
  "Prayers for Faith and Trust",
  "Prayers for Forgiveness and Deliverance",
  "Prayers for Business and Ministry",
  "Prayers of Victory and Praise",
  "Prayers of Surrender and Alignment",
  "Prayers for Financial Breakthrough",
  "Prayers for Favor",
  "Prayers for Blessings",
  "Prayers for Multiplication",
  "Prayers for Purpose, Legacy, and Stewardship",
];

function ReminderModal({
  onClose,
  currentReminder,
  onSave,
  onRemove,
}: {
  onClose: () => void;
  currentReminder: PrayerReminder | null;
  onSave: (hour: number, minute: number) => void;
  onRemove: () => void;
}) {
  const [hour, setHour] = useState(currentReminder?.hour ?? 7);
  const [minute, setMinute] = useState(currentReminder?.minute ?? 0);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? "PM" : "AM";

  function togglePeriod() {
    setHour((h) => (h >= 12 ? h - 12 : h + 12));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-[#111] border border-[#DFAC2A]/20 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#DFAC2A]" />
            <h2 className="font-serif text-lg font-bold text-white">Prayer Reminder</h2>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white" data-testid="button-close-reminder">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-white/60 mb-5">
          Choose a time to receive your daily prayer notification.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setHour((h) => (h + 1) % 24)}
              className="text-white/40 hover:text-white p-1"
              data-testid="button-hour-up"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <div className="w-16 h-14 flex items-center justify-center rounded-xl bg-black border border-[#DFAC2A]/30">
              <span className="text-2xl font-bold text-white" data-testid="text-reminder-hour">
                {displayHour.toString().padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={() => setHour((h) => (h - 1 + 24) % 24)}
              className="text-white/40 hover:text-white p-1"
              data-testid="button-hour-down"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <span className="text-2xl font-bold text-[#DFAC2A] mt-[-4px]">:</span>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setMinute((m) => (m + 5) % 60)}
              className="text-white/40 hover:text-white p-1"
              data-testid="button-minute-up"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <div className="w-16 h-14 flex items-center justify-center rounded-xl bg-black border border-[#DFAC2A]/30">
              <span className="text-2xl font-bold text-white" data-testid="text-reminder-minute">
                {minute.toString().padStart(2, "0")}
              </span>
            </div>
            <button
              onClick={() => setMinute((m) => (m - 5 + 60) % 60)}
              className="text-white/40 hover:text-white p-1"
              data-testid="button-minute-down"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={togglePeriod}
              className="w-16 h-14 flex items-center justify-center rounded-xl bg-[#DFAC2A]/10 border border-[#DFAC2A]/30 mt-[2px]"
              data-testid="button-toggle-period"
            >
              <span className="text-lg font-bold text-[#DFAC2A]">{period}</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => onSave(hour, minute)}
          className="w-full rounded-xl bg-[#DFAC2A] py-3 text-sm font-semibold text-black mb-2"
          data-testid="button-save-reminder"
        >
          Set Daily Reminder
        </button>

        {currentReminder?.enabled && (
          <button
            onClick={onRemove}
            className="w-full rounded-xl border border-white/10 py-3 text-sm font-medium text-white/60"
            data-testid="button-remove-reminder"
          >
            Remove Reminder
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

import { useRequirePremium } from "@/components/paywall-modal";

export default function PrayersPage() {
  useRequirePremium("Unlock daily prayers & reminders");
  const [expandedPrayer, setExpandedPrayer] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminder, setReminder] = useState<PrayerReminder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setReminder(getSavedReminder());
  }, []);

  const { data: prayers, isLoading } = useQuery<Prayer[]>({
    queryKey: ["/api/prayers"],
  });

  const grouped: PrayersBySection = {};
  if (prayers) {
    for (const p of prayers) {
      const section = p.prayerSection || "Other";
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(p);
    }
  }

  const sections = SECTION_ORDER.filter((s) => grouped[s]?.length);
  const otherSections = Object.keys(grouped).filter((s) => !SECTION_ORDER.includes(s));
  const allSections = [...sections, ...otherSections];

  async function handleSaveReminder(hour: number, minute: number) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings to set a prayer reminder.",
        variant: "destructive",
      });
      return;
    }

    const newReminder: PrayerReminder = { enabled: true, hour, minute };
    saveReminder(newReminder);
    scheduleReminder(hour, minute);
    setReminder(newReminder);
    setShowReminderModal(false);

    toast({
      title: "Reminder Set",
      description: `You'll receive a daily prayer reminder at ${formatTime(hour, minute)}.`,
    });
  }

  function handleRemoveReminder() {
    clearReminder();
    cancelScheduledReminder();
    setReminder(null);
    setShowReminderModal(false);

    toast({
      title: "Reminder Removed",
      description: "Your daily prayer reminder has been turned off.",
    });
  }

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground" data-testid="text-prayers-title">
              Prayer Book
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No Weapon Formed & When God Multiplies
            </p>
            {prayers && (
              <p className="mt-1 text-xs text-muted-foreground/70">
                {prayers.length} prayers in {allSections.length} sections
              </p>
            )}
          </div>
          <button
            onClick={() => setShowReminderModal(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            data-testid="button-prayer-reminder"
          >
            {reminder?.enabled ? (
              <BellRing className="h-5 w-5 text-[#DFAC2A]" />
            ) : (
              <Bell className="h-5 w-5 text-[#DFAC2A]/60" />
            )}
            {reminder?.enabled && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#DFAC2A] border-2 border-background" />
            )}
          </button>
        </div>
        {reminder?.enabled && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#DFAC2A]/10 px-3 py-1.5">
            <BellRing className="h-3.5 w-3.5 text-[#DFAC2A]" />
            <span className="text-xs text-[#DFAC2A]" data-testid="text-reminder-time">
              Daily reminder at {formatTime(reminder.hour, reminder.minute)}
            </span>
          </div>
        )}
      </div>

      {!reminder?.enabled && (
        <div className="mx-4 mb-4">
          <Card
            className="border-[#DFAC2A]/20 bg-gradient-to-r from-[#DFAC2A]/5 to-[#DFAC2A]/10 p-4 cursor-pointer"
            onClick={() => setShowReminderModal(true)}
            data-testid="card-reminder-instructions"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DFAC2A]/15 shrink-0 mt-0.5">
                <Bell className="h-5 w-5 text-[#DFAC2A]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#DFAC2A] mb-1">Set Your Daily Prayer Reminder</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Never miss your prayer time. Tap the <span className="text-[#DFAC2A] font-semibold">bell icon</span> in the top right corner or tap here to choose a time, and you'll get a daily notification reminding you to pray.
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-[#DFAC2A]/80 font-medium">TAP TO SET UP</span>
                  <ChevronRight className="h-3 w-3 text-[#DFAC2A]/80" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3 px-4 py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 py-2">
        {allSections.map((section) => {
          const sectionPrayers = grouped[section];
          const isOpen = expandedSection === section;
          return (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-visible">
                <button
                  className="flex w-full items-center justify-between gap-3 p-4"
                  onClick={() => setExpandedSection(isOpen ? null : section)}
                  data-testid={`button-section-${section.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-foreground">{section}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {sectionPrayers.length} {sectionPrayers.length === 1 ? "prayer" : "prayers"}
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 px-4 pb-4">
                        {sectionPrayers.map((prayer) => {
                          const isExpanded = expandedPrayer === prayer.id;
                          return (
                            <div
                              key={prayer.id}
                              className="rounded-lg border border-primary/10 bg-primary/5 p-3 cursor-pointer"
                              onClick={() => setExpandedPrayer(isExpanded ? null : prayer.id)}
                              data-testid={`card-prayer-${prayer.id}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">
                                  {prayer.prayerTitle}
                                </p>
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3 text-primary shrink-0" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 text-primary shrink-0" />
                                )}
                              </div>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                  >
                                    <p
                                      className="mt-3 text-sm leading-relaxed text-foreground/85 whitespace-pre-line"
                                      style={{ fontFamily: "'Lora', serif" }}
                                    >
                                      {prayer.prayerText}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showReminderModal && (
          <ReminderModal
            onClose={() => setShowReminderModal(false)}
            currentReminder={reminder}
            onSave={handleSaveReminder}
            onRemove={handleRemoveReminder}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
