import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "./components/sidebar";
import { AdminToastProvider } from "./components/toast";

export const metadata = {
  title: "Admin | Siraj Luxe",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check — non-admin users are immediately redirected
  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>
      <AdminToastProvider />
    </div>
  );
}
