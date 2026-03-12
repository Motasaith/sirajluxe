import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SupportTickets } from "./support-tickets";

export const metadata = {
  title: "Support | Siraj Luxe",
  description: "View and manage your support tickets.",
};

export default function SupportPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-2">Support Centre</h1>
          <p className="text-body mb-10">Submit a support request or check the status of your existing tickets.</p>
          <SupportTickets />
        </div>
      </main>
      <Footer />
    </>
  );
}
