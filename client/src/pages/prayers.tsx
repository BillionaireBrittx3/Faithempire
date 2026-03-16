import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function PrayersPage() {
  const [expandedPrayer, setExpandedPrayer] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  return (
    <div className="pb-20">
      <div className="px-4 pt-5 pb-3">
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
    </div>
  );
}
