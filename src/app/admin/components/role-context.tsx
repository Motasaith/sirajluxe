"use client";

import { createContext, useContext } from "react";
import type { AdminRole } from "@/lib/admin-auth";

const RoleContext = createContext<AdminRole>("support");

export function AdminRoleProvider({
  role,
  children,
}: {
  role: AdminRole;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useAdminRole() {
  return useContext(RoleContext);
}
