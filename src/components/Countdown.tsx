"use client";

import React, { useEffect, useState } from "react";

export default function Countdown() {
  const targetDate = new Date("2026-10-15T08:30:00+05:30").getTime();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isMounted) {
    return (
      <div className="countdown-box" id="comfest-countdown">
        <div className="countdown-label">FESTIVAL COUNTDOWN • 15–17 OCTOBER 2026</div>
        <div className="countdown-grid">
          <div className="countdown-unit"><div className="countdown-val">--</div><div className="countdown-txt">Days</div></div>
          <div className="countdown-unit"><div className="countdown-val">--</div><div className="countdown-txt">Hours</div></div>
          <div className="countdown-unit"><div className="countdown-val">--</div><div className="countdown-txt">Minutes</div></div>
          <div className="countdown-unit"><div className="countdown-val">--</div><div className="countdown-txt">Seconds</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-box" id="comfest-countdown">
      <div className="countdown-label">FESTIVAL COUNTDOWN • 15–17 OCTOBER 2026</div>
      <div className="countdown-grid">
        <div className="countdown-unit">
          <div className="countdown-val">{timeLeft.days}</div>
          <div className="countdown-txt">Days</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-val">{String(timeLeft.hours).padStart(2, "0")}</div>
          <div className="countdown-txt">Hours</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-val">{String(timeLeft.minutes).padStart(2, "0")}</div>
          <div className="countdown-txt">Minutes</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-val">{String(timeLeft.seconds).padStart(2, "0")}</div>
          <div className="countdown-txt">Seconds</div>
        </div>
      </div>
    </div>
  );
}
