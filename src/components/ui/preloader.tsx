"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = ["Curating", "Your", "Experience"];

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"counting" | "exiting">("counting");

  const finishLoading = useCallback(() => {
    setPhase("exiting");
    setTimeout(onComplete, 900);
  }, [onComplete]);

  /* Simulate a loading counter 0 → 100 */
  useEffect(() => {
    let current = 0;
    const step = () => {
      /* Accelerate-decelerate curve */
      const increment =
        current < 30 ? 3 : current < 70 ? 5 : current < 90 ? 3 : 1;
      current = Math.min(current + increment, 100);
      setProgress(current);

      if (current >= 100) {
        setTimeout(finishLoading, 400);
        return;
      }
      requestAnimationFrame(step);
    };

    /* Small initial delay so the screen paints first */
    const id = setTimeout(() => requestAnimationFrame(step), 200);
    return () => clearTimeout(id);
  }, [finishLoading]);

  return (
    <AnimatePresence>
      {phase !== "exiting" ? null : null}
      <motion.div
        key="preloader"
        className="preloader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={
          phase === "exiting"
            ? { opacity: 0, scale: 1.05 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Subtle gradient background blobs */}
        <div className="preloader-blob preloader-blob-1" />
        <div className="preloader-blob preloader-blob-2" />

        {/* Center content */}
        <div className="preloader-content">
          {/* Animated logo mark */}
          <motion.div
            className="preloader-logo"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1,
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="preloader-grad"
                  x1="0"
                  y1="0"
                  x2="64"
                  y2="64"
                >
                  <stop stopColor="#2563eb" />
                  <stop offset="0.5" stopColor="#1d4ed8" />
                  <stop offset="1" stopColor="#6d28d9" />
                </linearGradient>
              </defs>

              {/* Rounded shield / gem shape */}
              <motion.rect
                x="2"
                y="2"
                width="60"
                height="60"
                rx="16"
                fill="url(#preloader-grad)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* "S" letter */}
              <motion.path
                d="M24.5 20.5c0-1.5 1.2-3 3.5-3 3.2 0 5.5 1.8 5.5 4.2 0 2.8-2.5 3.8-5.2 4.8-3 1.2-5.8 2.5-5.8 6 0 3.5 2.8 5.5 6 5.5 2.5 0 4.2-1 5-2.2"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
              />

              {/* "L" letter */}
              <motion.path
                d="M37 19v18.5h7"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
              />

              {/* Diamond accent */}
              <motion.path
                d="M49 46l2.5-3 2.5 3-2.5 3z"
                fill="rgba(255,255,255,0.5)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              />
            </svg>
          </motion.div>

          {/* Brand name */}
          <motion.h2
            className="preloader-brand"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          >
            Siraj Luxe
          </motion.h2>

          {/* Animated word sequence */}
          <div className="preloader-words">
            {WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="preloader-word"
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.8 + i * 0.18,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                {word}
              </motion.span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="preloader-bar-track">
            <motion.div
              className="preloader-bar-fill"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>

          {/* Counter */}
          <motion.span
            className="preloader-counter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {progress}%
          </motion.span>
        </div>

        {/* Bottom tagline */}
        <motion.p
          className="preloader-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2 }}
        >
          The Future of Immersive Commerce
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
