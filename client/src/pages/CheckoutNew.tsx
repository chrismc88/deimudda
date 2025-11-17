import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, ShoppingCart, Package, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PayPalButton from "@/components/PayPalButton";

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cash'>('paypal');

  const listingId = parseInt(id || "0");
  const listing = trpc.listing.getById.useQuery(listingId, { enabled: !!id });
  const sellerProfile = trpc.seller.getProfileById.useQuery(listing.data?.sellerId || 0, {
    enabled: !!listing.data?.sellerId,
  });

  // Get dynamic fees from system settings
  const platformFee = trpc.system.getSettings.useQuery();
  const platformFeeFixed = platformFee.data?.find(s => s.key === 'platform_fee_fixed')?.value || '0.42';
  const paypalFeePercentage = platformFee.data?.find(s => s.key === 'paypal_fee_percentage')?.value || '2.49';
  const paypalFeeFixed = platformFee.data?.find(s => s.key === 'paypal_fee_fixed')?.value || '0.49';

  // Calculate totals
  const calculateTotals = () => {
    if (!listing.data) return { subtotal: 0, platformFee: 0, paypalFee: 0, total: 0 };

    const unitPrice =
      listing.data.priceType === "fixed"
        ? parseFloat(listing.data.fixedPrice || "0")
        : parseFloat(listing.data.auctionStartPrice || "0");

    const subtotal = unitPrice * quantity;
    const platformFeeAmount = parseFloat(platformFeeFixed) * quantity;
    const paypalFeeAmount = paymentMethod === 'paypal' 
      ? (subtotal * (parseFloat(paypalFeePercentage) / 100) + parseFloat(paypalFeeFixed))
      : 0;
    const total = subtotal + platformFeeAmount + paypalFeeAmount;

    return {
      subtotal,
      platformFee: platformFeeAmount,
      paypalFee: paypalFeeAmount,
      total,
    };
  };

  const totals = calculateTotals();

  // Redirect if not authenticated
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

  // Loading state
  if (listing.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Not found
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

  const canPurchase = ageVerified && termsAccepted;

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
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Produktdetails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {listing.data.images && listing.data.images.length > 0 && (
                    <img
                      src={listing.data.images[0]}
                      alt={listing.data.strain}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{listing.data.strain}</h3>
                    <p className="text-sm text-gray-600 mb-2">{listing.data.type}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        €{listing.data.priceType === "fixed" ? listing.data.fixedPrice : listing.data.auctionStartPrice}
                      </span>
                      <Badge variant="outline">pro Stück</Badge>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium mb-2">Menge</label>
                  <Input
                    type="number"
                    min="1"
                    max={listing.data.quantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, listing.data?.quantity || 1)))}
                    className="w-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Verfügbar: {listing.data.quantity} Stück
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Zahlungsmethode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PayPal Option */}
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
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
                    +€{totals.paypalFee.toFixed(2)} Gebühr
                  </Badge>
                </label>

                {/* Cash Option */}
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Barzahlung bei Abholung</div>
                    <div className="text-sm text-gray-500">Zahlung direkt beim Verkäufer</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Keine PayPal-Gebühr
                  </Badge>
                </label>

                {/* Terms & Conditions */}
                <div className="space-y-3 pt-4 border-t">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageVerified}
                      onChange={(e) => setAgeVerified(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      Ich bestätige, dass ich mindestens 18 Jahre alt bin und die{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Altersverifikation
                      </Link>{" "}
                      akzeptiere.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm">
                      Ich akzeptiere die{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Nutzungsbedingungen
                      </Link>
                      ,{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Datenschutzerklärung
                      </Link>{" "}
                      und{" "}
                      <Link href="/widerruf" className="text-blue-600 hover:underline">
                        Widerrufsbelehrung
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                {/* PayPal Button */}
                {paymentMethod === 'paypal' && canPurchase && (
                  <div className="pt-4">
                    <PayPalButton
                      listingId={listingId}
                      quantity={quantity}
                      onSuccess={(transactionId) => {
                        navigate(`/order/${transactionId}`);
                      }}
                      disabled={!canPurchase}
                    />
                  </div>
                )}

                {/* Cash Payment Info */}
                {paymentMethod === 'cash' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Bei Barzahlung kontaktieren Sie bitte den Verkäufer direkt, um die Übergabe zu vereinbaren.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Price Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Zwischensumme ({quantity}x)</span>
                  <span>€{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Plattformgebühr ({quantity}x €{platformFeeFixed})</span>
                  <span>€{totals.platformFee.toFixed(2)}</span>
                </div>
                {paymentMethod === 'paypal' && totals.paypalFee > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>PayPal-Gebühren</span>
                    <span>€{totals.paypalFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Gesamtbetrag</span>
                  <span className="text-green-600">€{totals.total.toFixed(2)}</span>
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
                    <p>✓ Nur Plattformgebühr von €{platformFeeFixed}</p>
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
