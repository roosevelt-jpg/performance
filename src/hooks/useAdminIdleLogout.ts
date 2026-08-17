"use client";

import { useEffect, useRef } from "react";
import { ADMIN_SESSION_TTL_MS } from "@/lib/admin/idle";

const ACTIVITY_EVENTS = [
  "pointerdown",
  "keydown",
  "click",
  "scroll",
  "touchstart",
] as const;

const PING_EVERY_MS = 60 * 1000;

/**
 * After 10 minutes with no keyboard, click, or scroll, signs the admin out.
 * While they are working, pings /api/admin/me so the HttpOnly cookie stays fresh.
 */
export function useAdminIdleLogout(
  onIdle: () => void,
  enabled: boolean,
) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!enabled) return;

    let lastActivity = Date.now();
    let lastPing = 0;
    let signedOut = false;

    function expire() {
      if (signedOut) return;
      signedOut = true;
      onIdleRef.current();
    }

    function mark() {
      lastActivity = Date.now();
      if (Date.now() - lastPing < PING_EVERY_MS) return;
      lastPing = Date.now();
      void fetch("/api/admin/me", { credentials: "include" }).then((res) => {
        if (!res.ok) expire();
      });
    }

    function check() {
      if (Date.now() - lastActivity >= ADMIN_SESSION_TTL_MS) {
        expire();
      }
    }

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, mark, { passive: true });
    });
    const timer = window.setInterval(check, 5000);
    document.addEventListener("visibilitychange", check);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, mark);
      });
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [enabled]);
}
