import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata = {
  title: "Contact Us | Siraj Luxe",
  description: "Get in touch with Siraj Luxe — we're here to help with orders, returns, and general enquiries.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-4">Contact Us</h1>
          <p className="text-body mb-12">We&apos;d love to hear from you. Reach out with any questions, feedback, or support requests.</p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card p-8 text-center">
              <Mail className="w-8 h-8 text-neon-violet mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-heading mb-2">Email</h2>
              <p className="text-body mb-4">For orders, returns, and general enquiries</p>
              <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline font-medium">
                support@sirajluxe.com
              </a>
            </div>

            <div className="glass-card p-8 text-center">
              <MessageSquare className="w-8 h-8 text-neon-violet mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-heading mb-2">Response Time</h2>
              <p className="text-body">We typically respond within <strong>24 hours</strong> during business days (Mon–Fri, 9am–5pm GMT).</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-heading mb-6">Send us a Message</h2>
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
