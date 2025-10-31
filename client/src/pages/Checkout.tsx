import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageVerified, setAgeVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cash'>('paypal');

  const listingId = parseInt(id || "0");
  const listing = trpc.listing.getById.useQuery(listingId, { enabled: !!id });
  const sellerProfile = trpc.seller.getProfileById.useQuery(listing.data?.sellerId || 0, {
    enabled: !!listing.data?.sellerId,
  });

  // Load PayPal SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=EUR`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render PayPal buttons
  useEffect(() => {
    if (!window.paypal || !listing.data || !isAuthenticated) return;

    const totalAmount = calculateTotal();

    window.paypal
      .Buttons({
        createOrder: async () => {
          setIsLoading(true);
          setError(null);

          try {
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                listingId: listing.data.id,
                quantity,
                amount: totalAmount,
                buyerId: user?.id,
                sellerId: listing.data.sellerId,
              }),
            });

            if (!response.ok) {
              throw new Error("Failed to create order");
            }

            const data = await response.json();
            return data.id;
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create order");
            setIsLoading(false);
            throw err;
          }
        },
        onApprove: async (data: any) => {
          setIsLoading(true);

          try {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });

            if (!response.ok) {
              throw new Error("Failed to capture order");
            }

            const result = await response.json();
            navigate(`/order/${result.transactionId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to complete payment");
            setIsLoading(false);
          }
        },
        onError: (err: any) => {
          setError("PayPal error: " + err.message);
          setIsLoading(false);
        },
      })
      .render("#paypal-button-container");
  }, [window.paypal, listing.data, isAuthenticated, quantity, user?.id]);

  const calculateTotal = () => {
    if (!listing.data) return "0.00";

    const unitPrice =
      listing.data.priceType === ("fixed" as any)
        ? parseFloat(listing.data.fixedPrice as any)
        : parseFloat(listing.data.auctionStartPrice as any);

    const subtotal = unitPrice * quantity;
    const platformFee = 0.42 * quantity; // €0.42 per item
    const paypalFee = paymentMethod === 'paypal' ? (subtotal * 0.0249 + 0.49) : 0; // Only for PayPal
    const total = subtotal + platformFee + paypalFee;

    return total.toFixed(2);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentifizierung erforderlich</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um zu kaufen.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/")}>
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (listing.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!listing.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Angebot nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/browse")}>
              Zurück zum Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unitPrice =
    listing.data.priceType === ("fixed" as any)
      ? parseFloat(listing.data.fixedPrice as any)
      : parseFloat(listing.data.auctionStartPrice as any);

  const subtotal = unitPrice * quantity;
  const platformFee = 0.42 * quantity; // €0.42 per item
  const paypalFee = paymentMethod === 'paypal' ? (subtotal * 0.0249 + 0.49) : 0; // Only for PayPal
  const total = subtotal + platformFee + paypalFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Listing Info */}
            <Card>
              <CardHeader>
                <CardTitle>{listing.data.strain}</CardTitle>
                <CardDescription>
                  {listing.data.type === "cutting" ? "Steckling" : "Samen"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.data.imageUrl && (
                  <img
                    src={listing.data.imageUrl}
                    alt={listing.data.strain}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Preis pro Stück</p>
                    <p className="text-lg font-bold">€{unitPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verfügbar</p>
                    <p className="text-lg font-bold">{listing.data.quantity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            {sellerProfile.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verkäufer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {sellerProfile.data.profileImageUrl ? (
                      <img
                        src={sellerProfile.data.profileImageUrl}
                        alt={sellerProfile.data.shopName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300" />
                    )}
                    <div>
                      <p className="font-semibold">{sellerProfile.data.shopName}</p>
                      <p className="text-sm text-gray-600">
                        {parseFloat(sellerProfile.data.rating as any).toFixed(1)} ⭐
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Menge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={listing.data.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.min(listing.data.quantity, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Age Verification */}
            {listing.data.shippingVerified && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-900">Altersverifikation erforderlich</CardTitle>
                </CardHeader>
                <CardContent>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageVerified}
                      onChange={(e) => setAgeVerified(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-amber-900">
                      Ich bestaetige, dass ich mindestens 18 Jahre alt bin. Der Versand erfolgt mit Altersverifikation (Ausweiskontrolle beim Empfaenger). Dies schuetzt beide Seiten rechtlich.
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zahlungsart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method Selector - Only show for pickup */}
                {listing.data.shippingPickup && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Barzahlung bei Übergabe</div>
                        <div className="text-sm text-gray-500">Zahlung erfolgt bei persönlicher Übergabe</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Nur €0,42 Gebühr
                      </Badge>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-gray-500">Sichere Online-Zahlung mit Käuferschutz</div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        +€0,89 Gebühr
                      </Badge>
                    </label>
                  </div>
                )}

                {/* PayPal Button - Show for verified shipping or when PayPal is selected for pickup */}
                {(listing.data.shippingVerified || paymentMethod === 'paypal') && (
                  <div>
                    <div id="paypal-button-container" className="min-h-[60px]">
                      {isLoading && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Cash Payment Confirmation - Show when cash is selected */}
                {listing.data.shippingPickup && paymentMethod === 'cash' && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Barzahlung ausgewählt.</strong> Bitte zahlen Sie den Betrag bei der persönlichen Übergabe in bar. Die Plattformgebühr von €0,42 wird separat abgerechnet.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Price Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme ({quantity}x)</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Plattformgebühr ({quantity}x €0,42)</span>
                    <span>€{platformFee.toFixed(2)}</span>
                  </div>
                  {paymentMethod === 'paypal' && paypalFee > 0 && (
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>PayPal-Gebühren</span>
                      <span>€{paypalFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Gesamtbetrag</span>
                    <span className="text-lg text-green-600">€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {paymentMethod === 'paypal' 
                      ? 'Die PayPal-Gebühren werden zum Gesamtbetrag hinzugerechnet.'
                      : 'Die Plattformgebühr wird zum Gesamtbetrag hinzugerechnet.'}
                  </AlertDescription>
                </Alert>

                {paymentMethod === 'paypal' && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Sichere Zahlung mit PayPal</p>
                    <p>✓ Käuferschutz garantiert</p>
                    <p>✓ Versand nach Zahlungsbestätigung</p>
                  </div>
                )}
                {paymentMethod === 'cash' && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ Barzahlung bei Übergabe</p>
                    <p>✓ Keine zusätzlichen PayPal-Gebühren</p>
                    <p>✓ Nur Plattformgebühr von €0,42</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

