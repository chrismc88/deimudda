import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

export default function BrowseListings() {
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "cutting" | "seed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");

  const listings = trpc.listing.getActive.useQuery({ limit, offset });

  const parsePriceValue = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const resolveListingPrice = (listing: any) => {
    return listing.priceType === "fixed"
      ? parsePriceValue(listing.fixedPrice)
      : parsePriceValue(listing.offerMinPrice);
  };

  // Filter and sort listings
  const filteredListings = listings.data
    ?.filter((listing) => {
      if (filterType !== "all" && listing.type !== filterType) return false;
      if (searchQuery && !listing.strain.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "price-low") {
        const priceA = resolveListingPrice(a);
        const priceB = resolveListingPrice(b);
        return priceA - priceB;
      }
      if (sortBy === "price-high") {
        const priceA = resolveListingPrice(a);
        const priceB = resolveListingPrice(b);
        return priceB - priceA;
      }
      return 0;
    }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Stecklinge & Samen durchsuchen</h1>
          <p className="text-gray-600">
            {filteredListings.length} Angebot{filteredListings.length !== 1 ? "e" : ""} verfügbar
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium">Sorte suchen</label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="z.B. Blue Dream"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium">Typ</label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="cutting">Stecklinge</SelectItem>
                    <SelectItem value="seed">Samen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium">Sortieren nach</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Neueste zuerst</SelectItem>
                    <SelectItem value="price-low">Preis: Niedrig zu Hoch</SelectItem>
                    <SelectItem value="price-high">Preis: Hoch zu Niedrig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                    setSortBy("newest");
                  }}
                >
                  Zurücksetzen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        {listings.isLoading ? (
          <p className="text-gray-500 text-center py-8">Lädt...</p>
        ) : filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">Keine Angebote gefunden</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
              >
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {/* Image */}
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.strain}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Kein Bild</p>
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2">{listing.strain}</CardTitle>
                    <CardDescription>
                      {listing.type === "cutting" ? "Steckling" : "Samen"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Description */}
                    {listing.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                    )}

                    {/* Quantity */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Verfügbar:</span>
                      <Badge variant="outline">{listing.quantity}</Badge>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t">
                      <p className="text-lg font-bold text-green-600">
                        {listing.priceType === "fixed"
                          ? `€${resolveListingPrice(listing).toFixed(2)}`
                          : listing.offerMinPrice
                          ? `Ab €${resolveListingPrice(listing).toFixed(2)}`
                          : "Verhandlungsbasis"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {listing.priceType === "fixed" ? "Festpreis" : "Verhandlungsbasis"}
                      </p>
                    </div>

                    {/* CTA */}
                    <Button className="w-full mt-2" size="sm">
                      Details anschauen
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredListings.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Zurück
            </Button>
            <span className="flex items-center text-gray-600">
              Seite {Math.floor(offset / limit) + 1}
            </span>
            <Button
              variant="outline"
              disabled={filteredListings.length < limit}
              onClick={() => setOffset(offset + limit)}
            >
              Weiter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
