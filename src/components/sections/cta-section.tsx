"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
  const { data: cms, enabled } = useSiteContent("homepage.cta");
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-content",
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".cta-content",
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  if (!enabled) return null;

  return (
    <section ref={sectionRef} className="relative section-padding overflow-hidden">
      <div className="ultra-wide-padding">
        <div className="cta-content relative rounded-[2.5rem] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/20 via-background to-neon-blue/10" />
          <div className="absolute inset-0 glass !rounded-[2.5rem]" />

          {/* Gradient orbs */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-neon-violet/30 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-neon-blue/20 rounded-full blur-[100px]" />

          {/* Animated border */}
          <div className="absolute inset-0 rounded-[2.5rem] neon-border" />

          {/* Content */}
          <div className="relative z-10 px-8 py-20 md:px-16 md:py-28 text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-4 h-4 text-neon-violet" />
              <span className="text-xs font-medium tracking-widest uppercase text-body">
                {cms?.badge || "Join the movement"}
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white max-w-4xl mx-auto leading-[1.1] mb-8">
              {cms?.heading || "Ready to experience the"}{" "}
              <span className="neon-text">future</span> of shopping?
            </h2>

            <p className="text-lg text-body max-w-2xl mx-auto mb-12 leading-relaxed">
              {cms?.body || "Join 50,000+ customers who have already made the switch to immersive commerce. Your next favorite product is waiting."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="magnetic-btn px-8 py-4">
                <span className="flex items-center gap-2 text-base">
                  {cms?.primaryText || "Start Shopping"}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>

              <button className="group flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--border-strong)] text-white hover:bg-[var(--hover)] transition-all duration-300">
                <span className="text-sm font-medium">{cms?.secondaryText || "Learn More"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
