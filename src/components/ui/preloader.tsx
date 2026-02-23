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
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer ring */}
              <motion.circle
                cx="28"
                cy="28"
                r="26"
                stroke="url(#preloader-grad)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="163.36"
                strokeDashoffset="163.36"
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
              />
              {/* Inner B */}
              <motion.text
                x="28"
                y="35"
                textAnchor="middle"
                fill="url(#preloader-grad)"
                fontSize="26"
                fontWeight="700"
                fontFamily="Inter, sans-serif"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                B
              </motion.text>
              <defs>
                <linearGradient
                  id="preloader-grad"
                  x1="0"
                  y1="0"
                  x2="56"
                  y2="56"
                >
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Brand name */}
          <motion.h2
            className="preloader-brand"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          >
            BinaCodes
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
