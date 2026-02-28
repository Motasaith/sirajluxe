import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Siraj Luxe size guide — find your perfect fit with our detailed sizing charts for clothing, footwear, and accessories.",
};

export default function SizeGuidePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <div className="ultra-wide-padding max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-heading mb-4">Size Guide</h1>
          <p className="text-muted-fg mb-12">
            Use the charts below to find your perfect fit. If you&apos;re between sizes, we recommend sizing up for comfort.
          </p>

          <div className="prose dark:prose-invert prose-sm max-w-none space-y-10 text-body">
            {/* Clothing */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">Clothing</h2>
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--overlay)] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Chest (in)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Waist (in)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["XS", "32–34", "26–28", "34–36"],
                      ["S", "34–36", "28–30", "36–38"],
                      ["M", "38–40", "32–34", "38–40"],
                      ["L", "42–44", "36–38", "42–44"],
                      ["XL", "46–48", "40–42", "46–48"],
                      ["2XL", "50–52", "44–46", "50–52"],
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-heading">{row[0]}</td>
                        <td className="px-4 py-3">{row[1]}</td>
                        <td className="px-4 py-3">{row[2]}</td>
                        <td className="px-4 py-3">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Footwear */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">Footwear</h2>
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--overlay)] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">UK Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">EU Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">US Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Foot Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["6", "39", "7", "24.5"],
                      ["7", "40", "8", "25.4"],
                      ["8", "42", "9", "26.2"],
                      ["9", "43", "10", "27.1"],
                      ["10", "44", "11", "27.9"],
                      ["11", "45", "12", "28.8"],
                      ["12", "46", "13", "29.6"],
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-heading">{row[0]}</td>
                        <td className="px-4 py-3">{row[1]}</td>
                        <td className="px-4 py-3">{row[2]}</td>
                        <td className="px-4 py-3">{row[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Accessories */}
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">Watch Straps</h2>
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--overlay)] border-b border-[var(--border)]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-fg uppercase">Wrist Circumference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Small", "14–16 cm"],
                      ["Medium", "16–18 cm"],
                      ["Large", "18–21 cm"],
                      ["X-Large", "21–23 cm"],
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0">
                        <td className="px-4 py-3 font-medium text-heading">{row[0]}</td>
                        <td className="px-4 py-3">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* How to Measure */}
            <section className="rounded-xl border border-[var(--border)] bg-[var(--overlay)] p-6">
              <h2 className="text-xl font-bold text-heading mb-4">How to Measure</h2>
              <ul className="space-y-3 text-body">
                <li><strong className="text-heading">Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
                <li><strong className="text-heading">Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</li>
                <li><strong className="text-heading">Hip:</strong> Measure around the fullest part of your hips.</li>
                <li><strong className="text-heading">Foot:</strong> Stand on a piece of paper and trace your foot. Measure from heel to the tip of your longest toe.</li>
              </ul>
            </section>

            <section>
              <p className="text-muted-fg text-sm">
                Need help choosing the right size? Email us at{" "}
                <a href="mailto:support@sirajluxe.com" className="text-neon-violet hover:underline">
                  support@sirajluxe.com
                </a>{" "}
                with the product name and your measurements, and we&apos;ll recommend the best size for you.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
