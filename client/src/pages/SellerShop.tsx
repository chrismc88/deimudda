import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Star, User, ArrowLeft } from "lucide-react";

export default function SellerShop() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const sellerIdNum = parseInt(sellerId || "0", 10);

  const sellerProfile = trpc.seller.getProfileById.useQuery(sellerIdNum);
  const listings = trpc.listing.getBySellerID.useQuery(sellerIdNum);

  if (sellerProfile.isLoading || listings.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Laden...</p>
      </div>
    );
  }

  if (sellerProfile.isError || !sellerProfile.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-600">Verkäufer nicht gefunden</p>
      </div>
    );
  }

  const seller = sellerProfile.data;
  const activeListings = listings.data?.filter((l) => l.status === "active") || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Startseite
      </Link>

      {/* Seller Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {seller.profileImageUrl ? (
                <img
                  src={seller.profileImageUrl}
                  alt={seller.shopName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-green-100">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{seller.shopName}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{parseFloat(seller.rating || "0").toFixed(1)}</span>
                  <span className="text-gray-600">({seller.totalReviews || 0} Bewertungen)</span>
                </div>
                
                {seller.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{seller.location}</span>
                  </div>
                )}
              </div>

              {seller.description && (
                <p className="text-gray-700 whitespace-pre-wrap">{seller.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Angebote ({activeListings.length})
        </h2>
      </div>

      {activeListings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-600">
            <p>Dieser Verkäufer hat derzeit keine aktiven Angebote.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeListings.map((listing) => {
            const images = typeof listing.images === 'string' 
              ? (listing.images ? JSON.parse(listing.images) : [listing.imageUrl].filter(Boolean))
              : (listing.images || [listing.imageUrl].filter(Boolean));
            const mainImage = images[0] || listing.imageUrl;

            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/listing/${listing.id}`}>
                  {mainImage && (
                    <img
                      src={mainImage}
                      alt={listing.strain}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{listing.strain}</CardTitle>
                    <p className="text-sm text-gray-600 capitalize">{listing.type === "cutting" ? "Steckling" : "Samen"}</p>
                  </CardHeader>
                  <CardContent>
                    {listing.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {listing.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Verfügbar</p>
                        <p className="font-semibold">{listing.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Preis</p>
                        <p className="text-2xl font-bold text-green-600">
                          {listing.priceType === "fixed"
                            ? `€${parseFloat(listing.fixedPrice || "0").toFixed(2)}`
                            : listing.offerMinPrice
                            ? `Ab €${parseFloat(listing.offerMinPrice || "0").toFixed(2)}`
                            : "Verhandlungsbasis"}
                        </p>
                      </div>
                    </div>

                    <Button className="w-full mt-4">
                      Details
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
