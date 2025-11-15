import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface PayPalButtonProps {
  listingId: number;
  quantity: number;
  onSuccess: (transactionId: number) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export default function PayPalButton({ 
  listingId,
  quantity,
  onSuccess, 
  onError,
  disabled = false,
}: PayPalButtonProps) {
  const [transactionId, setTransactionId] = useState<number | null>(null);
  const createOrderMutation = trpc.paypal.createOrder.useMutation();
  const captureOrderMutation = trpc.paypal.captureOrder.useMutation();

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
    currency: "EUR",
    intent: "capture",
  };

  if (!import.meta.env.VITE_PAYPAL_CLIENT_ID) {
    return (
      <div className="text-red-600 text-sm">
        PayPal Client ID nicht konfiguriert. Bitte kontaktieren Sie den Support.
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          }}
          disabled={disabled}
          createOrder={async () => {
            try {
              const result = await createOrderMutation.mutateAsync({
                listingId,
                quantity,
              });
              setTransactionId(result.transactionId);
              return result.orderId;
            } catch (error) {
              console.error("[PayPal] Error creating order:", error);
              toast.error("Fehler beim Erstellen der Bestellung");
              throw error;
            }
          }}
          onApprove={async (data) => {
            try {
              if (!transactionId) {
                throw new Error("Transaction ID not found");
              }

              await captureOrderMutation.mutateAsync({
                orderId: data.orderID,
                transactionId,
              });
              
              toast.success("Zahlung erfolgreich!");
              onSuccess(transactionId);
            } catch (error) {
              console.error("[PayPal] Error capturing order:", error);
              toast.error("Fehler beim Abschließen der Zahlung");
              if (onError) {
                onError(error as Error);
              }
            }
          }}
          onError={(err) => {
            console.error("[PayPal] Button error:", err);
            toast.error("PayPal-Fehler aufgetreten");
            if (onError) {
              onError(err as Error);
            }
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}

