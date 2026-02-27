import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import connectDB from "@/lib/mongodb";
import { SiteContent } from "@/lib/models";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Find answers to common questions about Siraj Luxe — shipping, returns, payments, orders, accounts, and more.",
};

const defaultFaqs = [
  {
    question: "Where do you deliver?",
    answer:
      "We currently deliver to UK addresses only. International shipping is not yet available, but we hope to expand in the future.",
  },
  {
    question: "How much does shipping cost?",
    answer:
      "Standard shipping costs £3.99 and takes 3–5 business days. New customers get FREE shipping on their first order with no minimum spend! After that, orders over £10 qualify for free shipping — applied automatically at checkout.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 3–5 business days within the UK. Orders placed before 2pm on business days are dispatched the same day.",
  },
  {
    question: "Do you offer express or next-day delivery?",
    answer:
      "We currently only offer standard delivery (3–5 business days). Express and next-day options are not available at this time.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy on all items, including sale items. Items must be unused, undamaged, and in their original packaging. Email support@sirajluxe.com with your order number to start a return.",
  },
  {
    question: "How long do refunds take?",
    answer:
      "Once we receive and inspect your return, refunds are processed within 5–10 business days. The refund goes back to your original payment method.",
  },
  {
    question: "Can I exchange an item?",
    answer:
      "We don't currently offer direct exchanges. Please return the item for a refund and place a new order for the item you'd like instead.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, American Express) securely processed through Stripe. We do not accept PayPal, cash on delivery, or bank transfers.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Absolutely. All payments are securely processed by Stripe, one of the world's leading payment processors. We never see or store your card details.",
  },
  {
    question: "Do your prices include VAT?",
    answer:
      "Yes, all prices displayed on our website are in British Pounds (£ GBP) and include VAT where applicable.",
  },
  {
    question: "How do I track my order?",
    answer:
      "Once your order is dispatched, you'll receive tracking information via email. You can also check your order status on your Orders page at sirajluxe.com/orders.",
  },
  {
    question: "My order hasn't arrived. What should I do?",
    answer:
      "If your order hasn't arrived within 5 business days of dispatch, please email us at support@sirajluxe.com with your order number and we'll investigate immediately.",
  },
  {
    question: "Do I need an account to place an order?",
    answer:
      "Yes, you'll need to create a free account to place an order. This allows you to track orders, view order history, and manage returns easily.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "To request account deletion, email us at support@sirajluxe.com. We'll process your request in line with UK GDPR regulations.",
  },
  {
    question: "Do your products come with a warranty?",
    answer:
      "Yes, all products sold on Siraj Luxe come with a 2-year warranty covering manufacturing defects. See our Warranty page for full details.",
  },
  {
    question: "I received a damaged or wrong item. What do I do?",
    answer:
      "We're sorry about that! Email us at support@sirajluxe.com with your order number and a photo of the issue. We'll arrange a return and full refund, including shipping costs.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "Email us at support@sirajluxe.com or use the live chat on our website. Our support team is available Monday–Friday, 9am–5pm GMT, and typically responds within 24 hours.",
  },
  {
    question: "Do you have a loyalty or rewards programme?",
    answer:
      "We don't currently have a loyalty programme, but we're always working on ways to reward our customers. Subscribe to our newsletter for updates on future offers.",
  },
];

export default async function FAQPage() {
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faqContent = await SiteContent.findOne({ key: "faq" }).lean() as any;
  const cmsData = faqContent?.data || {};
  const faqs = Array.isArray(cmsData?.items) && cmsData.items.length > 0 ? cmsData.items : defaultFaqs;
  const pageTitle = cmsData?.title || "Frequently Asked Questions";
  const pageSubtitle = cmsData?.subtitle || null;

  // JSON-LD structured data for FAQ (rich results in Google)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq: { question: string; answer: string }) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-4">
            {pageTitle}
          </h1>
          <p className="text-muted-fg mb-12">
            {pageSubtitle || <>Can&apos;t find what you&apos;re looking for? Contact us at{" "}
            <a
              href="mailto:support@sirajluxe.com"
              className="text-neon-violet hover:underline"
            >
              support@sirajluxe.com
            </a></>}
          </p>

          <div className="space-y-6">
            {faqs.map((faq: { question: string; answer: string }, i: number) => (
              <details
                key={i}
                className="group rounded-xl border border-[var(--border)] bg-[var(--overlay)] overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-heading font-medium hover:bg-white/[0.02] transition-colors">
                  <span>{faq.question}</span>
                  <span className="ml-4 text-muted-fg group-open:rotate-45 transition-transform text-xl leading-none">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-body text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
