import { useParams, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShoppingCart, Gavel, MapPin, User } from "lucide-react";
import { ImageGallery } from "@/components/ImageGallery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NotFound from "./NotFound";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const listingId = parseInt(id || "0");

  const listing = trpc.listing.getById.useQuery(listingId, {
    enabled: !!id,
  });

  const sellerProfile = trpc.seller.getProfileById.useQuery(listing.data?.sellerId || 0, {
    enabled: !!listing.data?.sellerId,
  });

  const reviews = trpc.review.getBySellerId.useQuery(listing.data?.sellerId || 0, {
    enabled: !!listing.data?.sellerId,
  });

  if (listing.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Lädt...</p>
      </div>
    );
  }

  if (!listing.data) {
    return <NotFound />;
  }

  const data = listing.data;
  const parsePriceValue = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };
  const resolvedPrice = data.priceType === "fixed"
    ? parsePriceValue(data.fixedPrice as any)
    : parsePriceValue(data.offerMinPrice as any);

  // Parse images field (can be JSON string or array)
  const getImages = (): string[] => {
    if (data.images) {
      // If images is a string, try to parse it as JSON
      if (typeof data.images === 'string') {
        try {
          const parsed = JSON.parse(data.images);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      // If images is already an array
      if (Array.isArray(data.images)) {
        return data.images;
      }
    }
    // Fallback to imageUrl if no images array
    return data.imageUrl ? [data.imageUrl] : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <a href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Zurück
        </a>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Image Gallery */}
            <Card className="mb-6 overflow-hidden p-4">
              <ImageGallery 
                images={getImages()} 
                altText={data.strain}
              />
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-3xl">{data.strain}</CardTitle>
                    <CardDescription>
                      {data.type === "cutting" ? "Steckling" : "Samen"}
                    </CardDescription>
                  </div>
                  <Badge variant={data.status === "active" ? "default" : "secondary"}>
                    {data.status === "active" ? "Verfügbar" : "Nicht verfügbar"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                {data.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Beschreibung</h3>
                    <p className="text-gray-700">{data.description}</p>
                  </div>
                )}

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Verfügbare Menge</p>
                    <p className="text-2xl font-bold">{data.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preis</p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.priceType === "fixed"
                        ? `€${resolvedPrice.toFixed(2)}`
                        : data.offerMinPrice
                        ? `Ab €${resolvedPrice.toFixed(2)}`
                        : "Verhandlungsbasis"}
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                {(data.genetics || data.seedBank || data.growMethod || data.seedType || data.thcContent || data.cbdContent || data.floweringTime || data.yieldInfo || data.flavorProfile || data.origin) && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Zusätzliche Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {data.genetics && (
                        <div>
                          <p className="text-sm text-gray-600">Genetik</p>
                          <p className="font-medium capitalize">{data.genetics}</p>
                        </div>
                      )}
                      {data.seedBank && (
                        <div>
                          <p className="text-sm text-gray-600">Samenbank/Breeder</p>
                          <p className="font-medium">{data.seedBank}</p>
                        </div>
                      )}
                      {data.growMethod && (
                        <div>
                          <p className="text-sm text-gray-600">Anbaumethode</p>
                          <p className="font-medium capitalize">{data.growMethod}</p>
                        </div>
                      )}
                      {data.seedType && (
                        <div>
                          <p className="text-sm text-gray-600">Samentyp</p>
                          <p className="font-medium capitalize">{data.seedType}</p>
                        </div>
                      )}
                      {data.thcContent && (
                        <div>
                          <p className="text-sm text-gray-600">THC-Gehalt</p>
                          <p className="font-medium">{data.thcContent}</p>
                        </div>
                      )}
                      {data.cbdContent && (
                        <div>
                          <p className="text-sm text-gray-600">CBD-Gehalt</p>
                          <p className="font-medium">{data.cbdContent}</p>
                        </div>
                      )}
                      {data.floweringTime && (
                        <div>
                          <p className="text-sm text-gray-600">Blütezeit</p>
                          <p className="font-medium">{data.floweringTime}</p>
                        </div>
                      )}
                      {data.yieldInfo && (
                        <div>
                          <p className="text-sm text-gray-600">Ertrag</p>
                          <p className="font-medium">{data.yieldInfo}</p>
                        </div>
                      )}
                      {data.origin && (
                        <div>
                          <p className="text-sm text-gray-600">Herkunft</p>
                          <p className="font-medium">{data.origin}</p>
                        </div>
                      )}
                      {data.flavorProfile && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Geschmack/Aroma</p>
                          <p className="font-medium">{data.flavorProfile}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Legal Notice */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Stecklinge sind legales Vermehrungsmaterial nach dem Konsumcannabisgesetz (KCanG).
                    Sie dürfen keine Blüten oder Fruchtstände haben.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            {sellerProfile.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verkäufer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {sellerProfile.data.profileImageUrl ? (
                      <img
                        src={sellerProfile.data.profileImageUrl}
                        alt={sellerProfile.data.shopName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{sellerProfile.data.shopName}</p>
                      <p className="text-sm text-gray-600">
                        {parseFloat(sellerProfile.data.rating as any).toFixed(1)} ⭐ ({sellerProfile.data.totalReviews})
                      </p>
                    </div>
                  </div>

                  {sellerProfile.data.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {sellerProfile.data.location}
                    </div>
                  )}

                  {sellerProfile.data.description && (
                    <p className="text-sm text-gray-700">{sellerProfile.data.description}</p>
                  )}

                  <Link href={`/seller/${data.sellerId}`}>
                    <Button variant="outline" className="w-full">
                      Zum Shop
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.data && reviews.data.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bewertungen</CardTitle>
                  <CardDescription>
                    {reviews.data.length} Bewertung{reviews.data.length !== 1 ? 'en' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.data.map((review) => (
                    <div key={review.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.buyerName || 'Anonym'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle>Kaufen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bitte melden Sie sich an, um zu kaufen.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    {data.status === "active" ? (
                      <>
                        {data.priceType === "fixed" ? (
                          <a href={`/checkout/${data.id}`}>
                            <Button className="w-full gap-2" size="lg">
                              <ShoppingCart className="w-5 h-5" />
                              Jetzt kaufen
                            </Button>
                          </a>
                        ) : (
                          <Button className="w-full gap-2" size="lg" variant="outline">
                            <Gavel className="w-5 h-5" />
                            Angebot senden
                          </Button>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                          Sichere Zahlung mit PayPal
                        </p>
                      </>                   ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Dieses Angebot ist nicht mehr verfügbar.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Teilen</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.share({
                      title: data.strain,
                      text: `Schauen Sie sich diese ${data.type === "cutting" ? "Steckling" : "Samen"} an!`,
                      url: window.location.href,
                    });
                  }}
                >
                  Teilen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
