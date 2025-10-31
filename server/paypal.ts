import axios from "axios";

const PAYPAL_API_BASE = process.env.NODE_ENV === "production"
  ? "https://api.paypal.com"
  : "https://api.sandbox.paypal.com";

const PAYPAL_CLIENT_ID = process.env.NODE_ENV === "production"
  ? process.env.PAYPAL_CLIENT_ID_LIVE
  : process.env.PAYPAL_CLIENT_ID_SANDBOX;

const PAYPAL_CLIENT_SECRET = process.env.NODE_ENV === "production"
  ? process.env.PAYPAL_CLIENT_SECRET_LIVE
  : process.env.PAYPAL_CLIENT_SECRET_SANDBOX;

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Get PayPal access token
 */
export async function getPayPalAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in * 1000; // Convert to milliseconds

    cachedAccessToken = {
      token,
      expiresAt: Date.now() + expiresIn - 60000, // Refresh 1 minute before expiry
    };

    return token;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    throw new Error("PayPal authentication failed");
  }
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(params: {
  amount: string;
  description: string;
  listingId: number;
  buyerId: number;
  sellerId: number;
  quantity: number;
}) {
  const accessToken = await getPayPalAccessToken();

  const orderData = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: `listing-${params.listingId}`,
        amount: {
          currency_code: "EUR",
          value: params.amount,
          breakdown: {
            item_total: {
              currency_code: "EUR",
              value: params.amount,
            },
          },
        },
        description: params.description,
        custom_id: JSON.stringify({
          listingId: params.listingId,
          buyerId: params.buyerId,
          sellerId: params.sellerId,
          quantity: params.quantity,
        }),
      },
    ],
    application_context: {
      brand_name: "deimudda",
      locale: "de-DE",
      user_action: "PAY_NOW",
      return_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/order/success`,
      cancel_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/order/cancel`,
    },
  };

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to create PayPal order:", error);
    throw new Error("Failed to create PayPal order");
  }
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to capture PayPal order:", error);
    throw new Error("Failed to capture PayPal order");
  }
}

/**
 * Refund a PayPal capture
 */
export async function refundPayPalCapture(captureId: string, amount: string) {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
      {
        amount: {
          currency_code: "EUR",
          value: amount,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to refund PayPal capture:", error);
    throw new Error("Failed to refund PayPal capture");
  }
}

/**
 * Verify webhook signature
 */
export async function verifyPayPalWebhookSignature(
  webhookId: string,
  eventBody: string,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  authAlgo: string,
  transmissionSig: string
): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
      {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: JSON.parse(eventBody),
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Failed to verify webhook signature:", error);
    return false;
  }
}

