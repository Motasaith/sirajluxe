import connectDB from "@/lib/mongodb";
import { ActivityLog } from "@/lib/models";

export async function logActivity(params: {
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  adminEmail?: string;
}) {
  try {
    await connectDB();
    await ActivityLog.create({
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || "",
      details: params.details || "",
      adminEmail: params.adminEmail || "",
    });
  } catch (error) {
    // Don't throw — logging should never break the main flow
    console.error("Failed to log activity:", error instanceof Error ? error.message : "Unknown error");
  }
}
