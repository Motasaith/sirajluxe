"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { ArrowRight, Award, Globe, Heart, Zap } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const values = [
  {
    icon: Zap,
    title: "Innovation First",
    description:
      "We push boundaries with immersive 3D shopping experiences, AR try-ons, and AI-powered curation.",
  },
  {
    icon: Award,
    title: "Uncompromising Quality",
    description:
      "Every product on our platform undergoes rigorous vetting. We partner only with brands that share our standards.",
  },
  {
    icon: Globe,
    title: "Global Vision",
    description:
      "We serve customers in 120+ countries with localized experiences and carbon-neutral shipping worldwide.",
  },
  {
    icon: Heart,
    title: "Customer Obsessed",
    description:
      "From personalized recommendations to 24/7 concierge support, your satisfaction drives every decision.",
  },
];

const team = [
  { name: "Alex Rivera", role: "CEO & Founder", initials: "AR" },
  { name: "Maya Chen", role: "Head of Design", initials: "MC" },
  { name: "Jordan Blake", role: "CTO", initials: "JB" },
  { name: "Priya Sharma", role: "Head of Product", initials: "PS" },
];

export default function AboutPage() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-reveal",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".about-values",
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".team-reveal",
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".team-grid",
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageTransitionProvider>
      <Header />
      <main ref={sectionRef} className="min-h-screen">
        {/* Hero */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="gradient-orb gradient-orb-1 opacity-10" />
            <div className="gradient-orb gradient-orb-3 opacity-10" />
          </div>

          <div className="relative ultra-wide-padding">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-6">
                Our Story
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-bold text-heading leading-[1.05] mb-8">
                We&apos;re building the{" "}
                <span className="neon-text">future</span> of how people shop
                online.
              </h1>
              <p className="text-xl text-body leading-relaxed max-w-2xl">
                Founded in 2025, Siraj Luxe was born from a simple belief:
                online shopping should be as exciting as discovering a product
                in person. We combine cutting-edge 3D technology with
                world-class design to create experiences that delight.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 border-y border-[var(--border)]">
          <div className="ultra-wide-padding">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "50K+", label: "Happy Customers" },
                { value: "10K+", label: "Premium Products" },
                { value: "120+", label: "Countries Served" },
                { value: "99.9%", label: "Uptime SLA" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <p className="text-4xl md:text-5xl font-display font-bold text-heading mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-fg">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding">
          <div className="ultra-wide-padding">
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
                Our Values
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-heading">
                What drives <span className="neon-text">us</span>
              </h2>
            </motion.div>

            <div className="about-values grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="about-reveal glass-card p-8 group hover:border-neon-violet/30"
                >
                  <div className="w-12 h-12 rounded-2xl bg-neon-violet/10 flex items-center justify-center mb-6 group-hover:bg-neon-violet/20 transition-colors duration-300">
                    <value.icon className="w-6 h-6 text-neon-violet" />
                  </div>
                  <h3 className="text-lg font-semibold text-heading mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-fg leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding border-t border-[var(--border)]">
          <div className="ultra-wide-padding">
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-medium tracking-widest uppercase text-neon-violet mb-4">
                The Team
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-heading">
                Meet the <span className="neon-text">minds</span> behind it
              </h2>
            </motion.div>

            <div className="team-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="team-reveal glass-card p-8 text-center group hover:border-neon-violet/30"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-violet to-neon-purple flex items-center justify-center mx-auto mb-6 group-hover:shadow-neon transition-shadow duration-300">
                    <span className="text-xl font-bold text-white">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-heading mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-fg">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding">
          <div className="ultra-wide-padding text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-heading mb-6">
                Want to join the <span className="neon-text">journey</span>?
              </h2>
              <p className="text-lg text-body max-w-xl mx-auto mb-10">
                We&apos;re always looking for passionate people to join our team and
                help reshape the future of commerce.
              </p>
              <button className="magnetic-btn px-8 py-4">
                <span className="flex items-center gap-2 text-base">
                  View Open Roles
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransitionProvider>
  );
}
