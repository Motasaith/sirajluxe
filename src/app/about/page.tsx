"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { ArrowRight, Award, Globe, Heart, Zap } from "lucide-react";
import { useSiteContent } from "@/components/providers/site-content-provider";


const defaultValues = [
  {
    icon: Zap,
    title: "Quality First",
    description:
      "We select the highest quality garments and fabrics to ensure maximum comfort and long-lasting style.",
  },
  {
    icon: Award,
    title: "Uncompromising Standards",
    description:
      "Every product on our platform undergoes rigorous quality checks. We only partner with brands that share our values.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "We proudly offer worldwide shipping, bringing our carefully curated collections to your doorstep no matter where you are.",
  },
  {
    icon: Heart,
    title: "Customer Focused",
    description:
      "From personalized style recommendations to dedicated customer support, your satisfaction drives everything we do.",
  },
];

const defaultTeam = [
  { name: "Alex Rivera", role: "Creative Director", initials: "AR" },
  { name: "Maya Chen", role: "Head of Design", initials: "MC" },
  { name: "Jordan Blake", role: "Lead Stylist", initials: "JB" },
  { name: "Priya Sharma", role: "Head of Operations", initials: "PS" },
];

export default function AboutPage() {
  const { data: cms } = useSiteContent("about");

  const valueIcons = [Zap, Award, Globe, Heart];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = Array.isArray(cms?.values) && cms.values.length > 0
    ? cms.values.map((v: { title: string; description: string }, i: number) => ({ icon: valueIcons[i] || Zap, title: v.title, description: v.description }))
    : defaultValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const team: any[] = Array.isArray(cms?.team) && cms.team.length > 0 ? cms.team : defaultTeam;
  const stats = Array.isArray(cms?.stats) && cms.stats.length > 0
    ? cms.stats
    : [
        { value: "5K+", label: "Happy Customers" },
        { value: "500+", label: "Premium Products" },
        { value: "50+", label: "Countries Served" },
        { value: "24/7", label: "Customer Support" },
      ];



  return (
    <PageTransitionProvider>
      <Header />
      <main className="min-h-screen">
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
                {cms?.heroLabel || "Our Story"}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-bold text-heading leading-[1.05] mb-8">
                  {cms?.heroHeading || "Discover your next"}{" "}
                  <span className="neon-text">favorite</span> wardrobe staple
                  with us.
                </h1>
                <p className="text-xl text-body leading-relaxed max-w-2xl">
                  {cms?.heroBody || "Founded with a passion for fashion, Siraj Luxe was born from a simple belief: finding high-quality, elegant clothing should be effortless. We curate premium collections to ensure every piece you wear is a statement of style and comfort."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 border-y border-[var(--border)]">
          <div className="ultra-wide-padding">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat: { value: string; label: string }, i: number) => (
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
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="glass-card p-8 group hover:border-neon-violet/30"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                </motion.div>
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
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  className="glass-card p-8 text-center group hover:border-neon-violet/30"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                </motion.div>
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
                  {cms?.ctaHeading || "Want to join the"} <span className="neon-text">family</span>?
                </h2>
                <p className="text-lg text-body max-w-xl mx-auto mb-10">
                  {cms?.ctaBody || "We're always looking for passionate people to join our team of stylists and style enthusiasts."}
              </p>
              <button className="magnetic-btn px-8 py-4">
                <span className="flex items-center gap-2 text-base">
                  {cms?.ctaButtonText || "View Open Roles"}
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
