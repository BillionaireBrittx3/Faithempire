const STORAGE_KEY = "faith-empire-prayer-reminder";

export interface PrayerReminder {
  enabled: boolean;
  hour: number;
  minute: number;
}

export function getSavedReminder(): PrayerReminder | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveReminder(reminder: PrayerReminder) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminder));
}

export function clearReminder() {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getNotificationPermission(): string {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

let reminderTimeout: ReturnType<typeof setTimeout> | null = null;

function getMsUntilNextOccurrence(hour: number, minute: number): number {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, minute, 0, 0);

  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

function showNotification() {
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "PRAYER_REMINDER",
      title: "Time to Pray",
      body: "Your daily prayer is waiting. Take a moment to connect with God.",
    });
  } else {
    new Notification("Time to Pray", {
      body: "Your daily prayer is waiting. Take a moment to connect with God.",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: "prayer-reminder",
      renotify: true,
    });
  }
}

export function scheduleReminder(hour: number, minute: number) {
  cancelScheduledReminder();

  const ms = getMsUntilNextOccurrence(hour, minute);

  reminderTimeout = setTimeout(() => {
    showNotification();
    scheduleReminder(hour, minute);
  }, ms);
}

export function cancelScheduledReminder() {
  if (reminderTimeout !== null) {
    clearTimeout(reminderTimeout);
    reminderTimeout = null;
  }
}

export function initReminders() {
  const saved = getSavedReminder();
  if (saved?.enabled) {
    scheduleReminder(saved.hour, saved.minute);
  }
}
