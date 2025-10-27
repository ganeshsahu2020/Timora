// src/hooks/useReminderTicker.js
import { useEffect, useRef } from "react";
import { listReminders, upsertReminder } from "../services/reminderStore";

function isDue(rem, now) {
  if (!rem.enabled) return false;

  // Parse scheduled time (HH:mm, 24h)
  const [hh, mm] = (rem.time || "09:00").split(":").map((n) => parseInt(n, 10));
  const at = new Date(now);
  at.setHours(hh, mm, 0, 0);

  const sameDayOfWeek =
    rem.recurrence === "weekly"
      ? new Date(rem.startDate || now).getDay() === now.getDay()
      : true;

  const isWeekday =
    rem.recurrence !== "weekdays" || (now.getDay() >= 1 && now.getDay() <= 5);

  const isCorrectDay =
    rem.recurrence === "once"
      ? new Date(rem.startDate).toDateString() === now.toDateString()
      : rem.recurrence === "weekly"
      ? sameDayOfWeek
      : true;

  if (!isCorrectDay || !isWeekday) return false;

  // Window of 60s so we don't miss by a few seconds
  const diff = Math.abs(now.getTime() - at.getTime());
  return diff <= 60 * 1000;
}

async function ensurePermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const p = await Notification.requestPermission();
    return p === "granted";
  } catch {
    return false;
  }
}

export default function useReminderTicker(toast) {
  const ticking = useRef(false);

  useEffect(() => {
    let timer;

    const tick = async () => {
      if (ticking.current) return;
      ticking.current = true;

      const now = new Date();

      // ✅ SAFE: always resolve to an array
      const result = await listReminders().catch(() => []);
      const reminders = Array.isArray(result) ? result : [];

      for (const rem of reminders) {
        if (isDue(rem, now)) {
          // Toast in-app
          toast({
            title: rem.title || "Reminder",
            description: rem.message || "It's time!",
            status: "info",
            duration: 6000,
            isClosable: true,
          });

          // Native notification (if allowed)
          if (await ensurePermission()) {
            try {
              const reg = await navigator.serviceWorker?.getRegistration();
              if (reg?.showNotification) {
                reg.showNotification(rem.title || "Reminder", {
                  body: rem.message || "",
                  icon: "/icons/icon-192.png",
                  badge: "/icons/icon-192.png",
                });
              } else if ("Notification" in window) {
                // Fallback to direct Notification API
                // eslint-disable-next-line no-new
                new Notification(rem.title || "Reminder", {
                  body: rem.message || "",
                });
              }
            } catch {
              // ignore notify errors
            }
          }

          // For one-time reminders, disable after firing
          if (rem.recurrence === "once") {
            upsertReminder({ ...rem, enabled: false });
          }
        }
      }

      ticking.current = false;
    };

    // run now + every 30s
    tick();
    timer = setInterval(tick, 30 * 1000);
    return () => clearInterval(timer);
  }, [toast]);
}
