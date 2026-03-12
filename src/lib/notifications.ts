import connectDB from "./mongodb";
import { Notification } from "./models";
import type { NotificationType } from "./models/notification";

/**
 * Create an in-app admin notification.
 * Silently ignores errors so it never breaks the calling operation.
 */
export async function createNotification({
  type,
  message,
  link = "",
}: {
  type: NotificationType;
  message: string;
  link?: string;
}): Promise<void> {
  try {
    await connectDB();
    await Notification.create({ type, message, link });
  } catch (err) {
    // Non-critical — log and continue
    console.error("createNotification failed:", err instanceof Error ? err.message : "Unknown error");
  }
}
