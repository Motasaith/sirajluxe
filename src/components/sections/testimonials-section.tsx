"use client";

import { motion } from "framer-motion";
import { useSiteContent } from "@/components/providers/site-content-provider";

const defaultBrands = [
  "VOIDWARE",
  "NEBULA",
  "PHANTOM",
  "AETHER",
  "OBSIDIAN",
  "QUANTUM",
  "CARBON",
  "AURORA",
  "NEXUS",
  "ZENITH",
];

const defaultTestimonials = [
  {
    text: "The most seamless shopping experience I've ever had. The quality of the products is truly unmatched.",
    author: "Sarah Chen",
    role: "Creative Director",
    avatar: "SC",
  },
  {
    text: "Siraj Luxe doesn't just sell, they deliver excellence. Every detail is meticulously crafted.",
    author: "Marcus Webb",
    role: "Tech Journalist",
    avatar: "MW",
  },
  {
    text: "Finally, an e-commerce store that feels as premium as the products it sells. Outstanding.",
    author: "Aisha Patel",
    role: "Fashion Editor",
    avatar: "AP",
  },
];

export function TestimonialsSection() {
  const { data: cms, enabled } = useSiteContent("homepage.testimonials");

  if (!enabled) return null;

  const brands = Array.isArray(cms?.brands) && cms.brands.length > 0 ? cms.brands : defaultBrands;
  const testimonials = Array.isArray(cms?.items) && cms.items.length > 0 ? cms.items : defaultTestimonials;

  return (
    <section className="relative section-padding overflow-hidden">
      {/* Brand Marquee */}
      <div className="mb-32 overflow-hidden">
        <div className="mb-12 ultra-wide-padding">
          <p className="text-sm font-medium tracking-widest uppercase text-subtle-fg text-center">
            {cms?.brandsLabel || "Trusted by industry leaders"}
          </p>
        </div>

        {/* Marquee Row 1 */}
        <div className="overflow-hidden py-6 border-y border-[var(--border)]">
          <motion.div
            className="marquee-track flex gap-16 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          >
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={`${brand}-${i}`}
                className="text-3xl md:text-4xl font-display font-bold text-dim-fg hover:text-neon-violet transition-colors duration-300 cursor-default select-none"
              >
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative ultra-wide-padding">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
            {cms?.label || "What people are saying"}
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-heading">
            {cms?.heading || "Loved by"} <span className="neon-text">thousands</span>
          </h2>
        </motion.div>

        <div className="testimonials-grid grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="testimonial-card glass-card p-8 flex flex-col justify-between"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <span key={j} className="text-amber-400 text-sm">
                    ★
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-body leading-relaxed mb-8 flex-1">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-violet to-neon-purple flex items-center justify-center text-white text-xs font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-heading">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-subtle-fg">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
