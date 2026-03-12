import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/admin-auth";
import { AdminSidebar } from "./components/sidebar";
import { AdminToastProvider } from "./components/toast";
import { AdminRoleProvider } from "./components/role-context";

export const metadata = {
  title: "Admin | Siraj Luxe",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin check — non-admin users are immediately redirected
  const result = await getUserRole();
  if (!result) {
    redirect("/");
  }

  return (
    <AdminRoleProvider role={result.role}>
      <div className="min-h-screen bg-[#050505]">
        <AdminSidebar />
        <main className="md:ml-64 min-h-screen">
          <div className="p-4 md:p-8 pt-16 md:pt-8">{children}</div>
        </main>
        <AdminToastProvider />
      </div>
    </AdminRoleProvider>
  );
}
