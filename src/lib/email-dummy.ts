import * as Emails from "./email";

const dummyCustomerName = "Sarah Jenkins";
const dummyOrderNumber = "ORD-XR93V2";
const dummyTrackingNumber = "JD0002123999123";
const dummyCarrier = "Royal Mail";
const dummyTrackingUrl = "https://royalmail.com/track/JD0002123999123";
const dummyEmail = "sarah.j@example.test";
const dummyAmount = 145.00;

const dummyItems = [
  { name: "Silk Evening Gown", quantity: 1, price: 120.00, color: "Midnight Blue", size: "UK 10" },
  { name: "Pearl Drop Earrings", quantity: 1, price: 25.00, color: "Gold" },
];

const dummyShippingAddress = {
  line1: "123 High Street",
  line2: "Apartment 4B",
  city: "London",
  postalCode: "W1 2AB",
  country: "United Kingdom",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEmailDummyData(type: string): any {
  switch (type) {
    case "orderConfirmation":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
        items: dummyItems,
        subtotal: dummyAmount,
        shipping: 0,
        total: dummyAmount,
        shippingAddress: dummyShippingAddress,
      };
    case "orderShipped":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
        trackingNumber: dummyTrackingNumber,
        trackingCarrier: dummyCarrier,
        trackingUrl: dummyTrackingUrl,
      };
    case "trackingUpdate":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
        trackingNumber: dummyTrackingNumber,
        trackingCarrier: dummyCarrier,
        trackingUrl: dummyTrackingUrl,
      };
    case "orderDelivered":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
      };
    case "welcomeEmail":
      return {
        customerName: dummyCustomerName,
      };
    case "orderCancelled":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
        total: dummyAmount,
      };
    case "returnRequest":
      return {
        customerName: dummyCustomerName,
        customerEmail: dummyEmail,
        orderNumber: dummyOrderNumber,
        reason: "Does not fit properly (sizing runs small).",
        total: dummyAmount,
      };
    case "returnApproved":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
        total: dummyAmount,
        returnShippingAddress: "Siraj Luxe Returns\nUnit 5, Trading Estate\nManchester, M1 1AA",
        returnCarrier: "DPD Local",
        returnInstructions: "Please include original tags. Secure the box tightly and drop off at your local DPD parcel shop.",
      };
    case "returnDenied":
      return {
        customerName: dummyCustomerName,
        orderNumber: dummyOrderNumber,
      };
    case "abandonedCart":
      return {
        customerName: dummyCustomerName,
        items: dummyItems,
      };
    case "adminMessage":
      return {
        customerName: dummyCustomerName,
        subject: "Regarding your recent inquiry",
        message: "Hi Sarah,\n\nWe have looked into your query about the upcoming winter collection. The pieces you asked about will be dropping next Tuesday at 10 AM.\n\nLet us know if you need anything else!\n\nBest,\nSiraj Luxe Team",
      };
    case "lowStock":
      return {
        products: [
          { name: "Silk Evening Gown", inventory: 0, slug: "silk-evening-gown" },
          { name: "Gold Choker", inventory: 2, slug: "gold-choker" },
        ],
      };
    default:
      return null;
  }
}

export function getEmailHtml(type: string): string {
  const data = getEmailDummyData(type);
  if (!data) return "<h1>Template Not Found</h1>";

  switch (type) {
    case "orderConfirmation":
      return Emails.renderOrderConfirmation(data).html;
    case "orderShipped":
      return Emails.renderOrderShipped(data).html;
    case "trackingUpdate":
      return Emails.renderTrackingUpdate(data).html;
    case "orderDelivered":
      return Emails.renderOrderDelivered(data).html;
    case "welcomeEmail":
      return Emails.renderWelcomeEmail(data).html;
    case "orderCancelled":
      return Emails.renderOrderCancelled(data).html;
    case "returnRequest":
      return Emails.renderReturnRequest(data).html;
    case "returnApproved":
      return Emails.renderReturnApproved(data).html;
    case "returnDenied":
      return Emails.renderReturnDenied(data).html;
    case "abandonedCart":
      return Emails.renderAbandonedCartEmail(data).html;
    case "adminMessage":
      return Emails.renderAdminMessage(data).html;
    case "lowStock":
      return Emails.renderLowStockAlert(data).html;
    default:
      return "<h1>Template Not Found</h1>";
  }
}

export async function sendTestEmail(type: string, to: string) {
  const data = getEmailDummyData(type);
  if (!data) throw new Error("Invalid template type");

  switch (type) {
    case "orderConfirmation":
      await Emails.sendOrderConfirmation({ ...data, to });
      break;
    case "orderShipped":
      await Emails.sendOrderShipped({ ...data, to });
      break;
    case "trackingUpdate":
      await Emails.sendTrackingUpdate({ ...data, to });
      break;
    case "orderDelivered":
      await Emails.sendOrderDelivered({ ...data, to });
      break;
    case "welcomeEmail":
      await Emails.sendWelcomeEmail({ ...data, to });
      break;
    case "orderCancelled":
      await Emails.sendOrderCancelled({ ...data, to });
      break;
    case "returnRequest":
      // For returnRequest, the 'to' is overridden by ADMIN_EMAIL in the implementation, but let's override it or ignore it.
      // SendReturnRequest doesn't take 'to', it inherently sends to admin. So just call it.
      process.env.ADMIN_EMAIL = to; // temporary mock if permitted, otherwise we just let it send to the designated admin.
      await Emails.sendReturnRequest(data);
      break;
    case "returnApproved":
      await Emails.sendReturnApproved({ ...data, to });
      break;
    case "returnDenied":
      await Emails.sendReturnDenied({ ...data, to });
      break;
    case "abandonedCart":
      await Emails.sendAbandonedCartEmail({ ...data, to });
      break;
    case "adminMessage":
      await Emails.sendAdminMessage({ ...data, to });
      break;
    case "lowStock":
      process.env.ADMIN_EMAIL = to;
      await Emails.sendLowStockAlert(data);
      break;
  }
}
