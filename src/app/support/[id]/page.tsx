import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TicketDetail } from "./ticket-detail";

export const metadata = { title: "Support Ticket | Siraj Luxe" };

export default function TicketDetailPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <TicketDetail />
        </div>
      </main>
      <Footer />
    </>
  );
}
