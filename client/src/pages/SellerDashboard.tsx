import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Edit2, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

type ListingFormState = {
  type: "cutting" | "seed";
  strain: string;
  listingDescription: string;
  quantity: number;
  priceType: "fixed" | "offer";
  fixedPrice: number;
  offerMinPrice: number;
  imageUrl: string;
  images: string[];
  shippingVerified: boolean;
  shippingPickup: boolean;
  genetics: "sativa" | "indica" | "hybrid" | "";
  seedBank: string;
  growMethod: "hydro" | "bio" | "soil" | "";
  seedType: "feminized" | "regular" | "autoflower" | "";
  thcContent: string;
  cbdContent: string;
  floweringTime: string;
  yieldInfo: string;
  flavorProfile: string;
  origin: string;
};

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [createImageFieldError, setCreateImageFieldError] = useState<string | null>(null);

  // Queries
  const sellerProfile = trpc.seller.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const myListings = trpc.listing.getMine.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations
  const createProfile = trpc.seller.createProfile.useMutation({
    onSuccess: () => {
      toast.success("Verkaufer-Profil erfolgreich erstellt!");
      sellerProfile.refetch();
    },
    onError: (error) => {
      toast.error("Fehler beim Erstellen des Profils: " + error.message);
    },
  });

  const createListing = trpc.listing.create.useMutation({
    onSuccess: () => {
      toast.success("Angebot erfolgreich erstellt!");
      myListings.refetch();
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      setCreateImageFieldError(null);
    },
    onError: (error) => {
      const zodError = (error?.data as any)?.zodError;
      const imageFieldError = zodError?.fieldErrors?.imageUrl?.[0] ?? null;
      setCreateImageFieldError(imageFieldError);
      toast.error("Fehler beim Erstellen des Angebots: " + error.message);
    },
  });

  const updateListing = trpc.listing.update.useMutation({
    onSuccess: () => {
      myListings.refetch();
    },
  });

  const deleteListing = trpc.listing.delete.useMutation({
    onSuccess: () => {
      toast.success("Angebot erfolgreich geloscht!");
      myListings.refetch();
    },
    onError: (error) => {
      toast.error("Fehler beim Loschen: " + error.message);
    },
  });

  // Form state
  const initialFormData: ListingFormState = {
    type: "cutting",
    strain: "",
    listingDescription: "",
    quantity: 1,
    priceType: "fixed",
    fixedPrice: 0,
    offerMinPrice: 0,
    imageUrl: "",
    images: [],
    shippingVerified: true,
    shippingPickup: false,
    genetics: "",
    seedBank: "",
    growMethod: "",
    seedType: "",
    thcContent: "",
    cbdContent: "",
    floweringTime: "",
    yieldInfo: "",
    flavorProfile: "",
    origin: "",
  };

  const [formData, setFormData] = useState<ListingFormState>(initialFormData);
  const [profileFormData, setProfileFormData] = useState({
    shopName: "",
    description: "",
    location: "",
  });
  const [ageVerifiedSeller, setAgeVerifiedSeller] = useState(false);

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateDialogOpen(open);
    if (!open) {
      setCreateImageFieldError(null);
    }
  };

  // Handle edit button click - open edit dialog
  const handleEditClick = (listing: any) => {
    setEditingListing(listing);
    
    // Parse images array if it's a JSON string
    let imagesArray: string[] = [];
    if (listing.images) {
      try {
        imagesArray = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
      } catch (e) {
        imagesArray = [];
      }
    }
    const nextPriceType = listing.priceType || (listing.acceptsOffers ? "offer" : "fixed");
    const parsedFixedPrice = listing.fixedPrice ? parseFloat(listing.fixedPrice) : 0;
    const parsedOfferMin = listing.offerMinPrice ? parseFloat(listing.offerMinPrice) : 0;
    
    setFormData(prev => ({
      ...prev,
      type: listing.type,
      strain: listing.strain,
      listingDescription: listing.description,
      quantity: listing.quantity,
      priceType: nextPriceType,
      fixedPrice: nextPriceType === "fixed" ? parsedFixedPrice : 0,
      offerMinPrice: nextPriceType === "offer" ? parsedOfferMin : 0,
      imageUrl: listing.imageUrl || "",
      images: imagesArray,
      shippingVerified: listing.shippingVerified ?? true,
      shippingPickup: listing.shippingPickup ?? false,
      // Additional fields
      genetics: listing.genetics || "",
      seedBank: listing.seedBank || "",
      growMethod: listing.growMethod || "",
      seedType: listing.seedType || "",
      thcContent: listing.thcContent || "",
      cbdContent: listing.cbdContent || "",
      floweringTime: listing.floweringTime || "",
      yieldInfo: listing.yieldInfo || "",
      origin: listing.origin || "",
      flavorProfile: listing.flavorProfile || "",
    }));
    setIsEditDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>Bitte melden Sie sich an, um auf das Seller-Dashboard zuzugreifen.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (sellerProfile.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Profil...</p>
        </div>
      </div>
    );
  }

  // Show profile creation if user doesn't have a seller profile
  if (!sellerProfile.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Verkäufer-Profil erstellen</CardTitle>
              <CardDescription>
                Erstellen Sie Ihr Verkäufer-Profil, um Stecklinge und Samen anzubieten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!profileFormData.shopName.trim()) {
                    alert('Bitte geben Sie einen Shop-Namen ein');
                    return;
                  }
                  createProfile.mutate(profileFormData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium">Shop-Name *</label>
                  <Input
                    placeholder="z.B. Meine Cannabis-Stecklinge"
                    value={profileFormData.shopName}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, shopName: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea
                    placeholder="Beschreiben Sie Ihren Shop und Ihre Spezialitäten..."
                    value={profileFormData.description}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Standort</label>
                  <Input
                    placeholder="z.B. Berlin, Deutschland"
                    value={profileFormData.location}
                    onChange={(e) =>
                      setProfileFormData({ ...profileFormData, location: e.target.value })
                    }
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Indem Sie ein Verkäufer-Profil erstellen, erklären Sie sich damit einverstanden, dass Ihre Stecklinge und Samen den Anforderungen des Konsumcannabisgesetzes (KCanG) entsprechen und keine Blüten oder Fruchtstände haben.
                  </AlertDescription>
                </Alert>

                {createProfile.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{(createProfile.error as any)?.message || 'Fehler beim Erstellen des Profils'}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageVerifiedSeller}
                      onChange={(e) => setAgeVerifiedSeller(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-blue-900">
                      <strong>Altersbestaetigung:</strong> Ich bestaettige, dass ich mindestens 18 Jahre alt bin und dass alle Stecklinge und Samen, die ich anbiete, den Anforderungen des Konsumcannabisgesetzes (KCanG) entsprechen und keine Blueten, Fruchtstande oder verarbeitete Produkte sind.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={createProfile.isPending || !profileFormData.shopName.trim() || !ageVerifiedSeller}
                  className="w-full"
                >
                  {createProfile.isPending ? "Wird erstellt..." : "Profil erstellen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre Stecklinge und Samen auf der deimudda-Plattform.
          </p>
        </div>

        {/* Profile Card */}
        {sellerProfile.data && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{sellerProfile.data.shopName}</CardTitle>
              <CardDescription>{sellerProfile.data.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bewertung</p>
                  <p className="text-2xl font-bold">
                    {parseFloat(sellerProfile.data.rating as any).toFixed(1)} ⭐
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bewertungen</p>
                  <p className="text-2xl font-bold">{sellerProfile.data.totalReviews}</p>
                </div>
              </div>
              {sellerProfile.data.description && (
                <p className="mt-4 text-gray-700">{sellerProfile.data.description}</p>
              )}
              <Badge className="mt-4" variant={sellerProfile.data.verificationStatus === "verified" ? "default" : "outline"}>
                {sellerProfile.data.verificationStatus === "verified" ? "✓ Verifiziert" : "Ausstehend"}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Create Listing Button */}
        <div className="mb-8">
          <Dialog open={isCreateDialogOpen} onOpenChange={handleCreateDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Neues Angebot erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neues Angebot erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie ein neues Angebot für Stecklinge oder Samen.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  // Validation
                  if (!formData.strain.trim()) {
                    toast.error("Bitte geben Sie eine Sorte ein");
                    return;
                  }
                  if (formData.quantity <= 0) {
                    toast.error("Menge muss grosser als 0 sein");
                    return;
                  }
                  if (String(formData.priceType) === "fixed" && formData.fixedPrice <= 0) {
                    toast.error("Preis muss grosser als 0 sein");
                    return;
                  }
                  if (String(formData.priceType) === "offer" && formData.offerMinPrice <= 0) {
                    toast.error("Mindestpreis muss grosser als 0 sein");
                    return;
                  }

                  const isOfferListing = formData.priceType === "offer";
                  createListing.mutate({
                    type: formData.type as any,
                    strain: formData.strain,
                    description: formData.listingDescription,
                    quantity: formData.quantity,
                    priceType: formData.priceType as any,
                    fixedPrice: !isOfferListing ? formData.fixedPrice || undefined : undefined,
                    offerMinPrice: isOfferListing ? formData.offerMinPrice || undefined : undefined,
                    imageUrl: formData.imageUrl || undefined,
                    images: formData.images.length ? formData.images : undefined,
                    shippingVerified: formData.shippingVerified,
                    shippingPickup: formData.shippingPickup,
                    // Additional optional fields
                    genetics: formData.genetics || undefined,
                    seedBank: formData.seedBank || undefined,
                    growMethod: formData.growMethod || undefined,
                    seedType: formData.seedType || undefined,
                    thcContent: formData.thcContent || undefined,
                    cbdContent: formData.cbdContent || undefined,
                    floweringTime: formData.floweringTime || undefined,
                    yieldInfo: formData.yieldInfo || undefined,
                    flavorProfile: formData.flavorProfile || undefined,
                    origin: formData.origin || undefined,
                  });
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Typ *</label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cutting">Steckling</SelectItem>
                        <SelectItem value="seed">Samen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sorte *</label>
                    <Input
                      placeholder="z.B. Blue Dream"
                      value={formData.strain}
                      onChange={(e) => setFormData({ ...formData, strain: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea
                    placeholder="Beschreiben Sie Ihre Stecklinge/Samen..."
                    value={formData.listingDescription}
                    onChange={(e) => setFormData({ ...formData, listingDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Menge *</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Verkaufstyp *</label>
                    <Select value={formData.priceType} onValueChange={(value: any) => setFormData({ ...formData, priceType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Festpreis</SelectItem>
                        <SelectItem value="offer">Verhandlungsbasis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {String(formData.priceType) === "fixed" && (
                  <div>
                    <label className="text-sm font-medium">Preis pro Stück (€) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fixedPrice}
                      onChange={(e) => setFormData({ ...formData, fixedPrice: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                )}

                {String(formData.priceType) === "offer" && (
                  <div>
                    <label className="text-sm font-medium">Mindestpreis (€) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.offerMinPrice}
                      onChange={(e) => setFormData({ ...formData, offerMinPrice: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                )}

                {/* Additional Optional Fields */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">Zusätzliche Details (optional)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Genetik</label>
                      <Select value={formData.genetics} onValueChange={(value: any) => setFormData({ ...formData, genetics: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sativa">Sativa</SelectItem>
                          <SelectItem value="indica">Indica</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Samenbank/Breeder</label>
                      <Input
                        value={formData.seedBank}
                        onChange={(e) => setFormData({ ...formData, seedBank: e.target.value })}
                        placeholder="z.B. Dutch Passion"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Anbaumethode</label>
                      <Select value={formData.growMethod} onValueChange={(value: any) => setFormData({ ...formData, growMethod: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hydro">Hydro</SelectItem>
                          <SelectItem value="bio">Bio</SelectItem>
                          <SelectItem value="soil">Soil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Samentyp</label>
                      <Select value={formData.seedType} onValueChange={(value: any) => setFormData({ ...formData, seedType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feminized">Feminisiert</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="autoflower">Autoflower</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">THC-Gehalt</label>
                      <Input
                        value={formData.thcContent}
                        onChange={(e) => setFormData({ ...formData, thcContent: e.target.value })}
                        placeholder="z.B. 15-20%"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">CBD-Gehalt</label>
                      <Input
                        value={formData.cbdContent}
                        onChange={(e) => setFormData({ ...formData, cbdContent: e.target.value })}
                        placeholder="z.B. < 1%"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Blütezeit</label>
                      <Input
                        value={formData.floweringTime}
                        onChange={(e) => setFormData({ ...formData, floweringTime: e.target.value })}
                        placeholder="z.B. 8-9 Wochen"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ertrag</label>
                      <Input
                        value={formData.yieldInfo}
                        onChange={(e) => setFormData({ ...formData, yieldInfo: e.target.value })}
                        placeholder="z.B. 400-500g/m²"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Herkunft</label>
                      <Input
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="z.B. Kalifornien, USA"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Geschmack/Aroma</label>
                      <Input
                        value={formData.flavorProfile}
                        onChange={(e) => setFormData({ ...formData, flavorProfile: e.target.value })}
                        placeholder="z.B. Zitrus, Diesel, Erdig"
                      />
                    </div>
                  </div>
                </div>

                <MultiImageUpload
                  label="Produktbilder (optional)"
                  currentImages={formData.images}
                  maxImages={5}
                  maxSizeMB={5}
                  errorMessage={createImageFieldError}
                  onImagesChange={(urls) => {
                    setCreateImageFieldError(null);
                    setFormData({ ...formData, images: urls, imageUrl: urls[0] || "" });
                  }}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">Versandarten * (mindestens eine auswählen)</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shippingVerified}
                        onChange={(e) => setFormData({ ...formData, shippingVerified: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm">Versand mit Altersverifikation (DHL/DPD/Hermes)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shippingPickup}
                        onChange={(e) => setFormData({ ...formData, shippingPickup: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm">Persönliche Abholung (lokal)</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Sie können beide Optionen anbieten. Altersverifikation schützt Sie rechtlich und ist empfohlen.</p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Stellen Sie sicher, dass Ihre Stecklinge/Samen den KCanG-Anforderungen entsprechen (keine Blueten oder Fruchtstande).
                  </AlertDescription>
                </Alert>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-1"
                    />
                    <span className="text-sm text-green-900">
                      <strong>Bestaetigung:</strong> Ich bestaettige, dass diese Stecklinge/Samen den KCanG-Anforderungen entsprechen und keine Blueten, Fruchtstande oder verarbeitete Produkte enthalten.
                    </span>
                  </label>
                </div>

                <Button type="submit" disabled={createListing.isPending} className="w-full">
                  {createListing.isPending ? "Wird erstellt..." : "Angebot erstellen"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Angebot bearbeiten</DialogTitle>
                <DialogDescription>Aktualisieren Sie die Details Ihres Angebots</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingListing) {
                    const isOfferListing = formData.priceType === "offer";
                    updateListing.mutate({
                      listingId: editingListing.id,
                      strain: formData.strain,
                      description: formData.listingDescription,
                      quantity: formData.quantity,
                      priceType: formData.priceType as any,
                      fixedPrice: !isOfferListing ? formData.fixedPrice : undefined,
                      offerMinPrice: isOfferListing ? formData.offerMinPrice : undefined,
                    });
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Typ *</label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cutting">Steckling</SelectItem>
                        <SelectItem value="seed">Samen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sorte *</label>
                    <Input
                      value={formData.strain}
                      onChange={(e) => setFormData({ ...formData, strain: e.target.value })}
                      placeholder="z.B. Blue Dream"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea
                    value={formData.listingDescription}
                    onChange={(e) => setFormData({ ...formData, listingDescription: e.target.value })}
                    placeholder="Beschreiben Sie Ihr Angebot..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Menge *</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Verkaufstyp *</label>
                    <Select value={formData.priceType} onValueChange={(value: any) => setFormData({ ...formData, priceType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Festpreis</SelectItem>
                        <SelectItem value="offer">Verhandlungsbasis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {String(formData.priceType) === "fixed" && (
                  <div>
                    <label className="text-sm font-medium">Preis pro Stück (€) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fixedPrice}
                      onChange={(e) => setFormData({ ...formData, fixedPrice: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                )}

                {String(formData.priceType) === "offer" && (
                  <div>
                    <label className="text-sm font-medium">Mindestpreis (€) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.offerMinPrice}
                      onChange={(e) => setFormData({ ...formData, offerMinPrice: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                )}

                {/* Additional Optional Fields */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3">Zusätzliche Details (optional)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Genetik</label>
                      <Select value={formData.genetics} onValueChange={(value: any) => setFormData({ ...formData, genetics: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sativa">Sativa</SelectItem>
                          <SelectItem value="indica">Indica</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Samenbank/Breeder</label>
                      <Input
                        value={formData.seedBank}
                        onChange={(e) => setFormData({ ...formData, seedBank: e.target.value })}
                        placeholder="z.B. Dutch Passion"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Anbaumethode</label>
                      <Select value={formData.growMethod} onValueChange={(value: any) => setFormData({ ...formData, growMethod: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hydro">Hydro</SelectItem>
                          <SelectItem value="bio">Bio</SelectItem>
                          <SelectItem value="soil">Soil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Samentyp</label>
                      <Select value={formData.seedType} onValueChange={(value: any) => setFormData({ ...formData, seedType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feminized">Feminisiert</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="autoflower">Autoflower</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">THC-Gehalt</label>
                      <Input
                        value={formData.thcContent}
                        onChange={(e) => setFormData({ ...formData, thcContent: e.target.value })}
                        placeholder="z.B. 15-20%"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">CBD-Gehalt</label>
                      <Input
                        value={formData.cbdContent}
                        onChange={(e) => setFormData({ ...formData, cbdContent: e.target.value })}
                        placeholder="z.B. < 1%"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Blütezeit</label>
                      <Input
                        value={formData.floweringTime}
                        onChange={(e) => setFormData({ ...formData, floweringTime: e.target.value })}
                        placeholder="z.B. 8-9 Wochen"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Ertrag</label>
                      <Input
                        value={formData.yieldInfo}
                        onChange={(e) => setFormData({ ...formData, yieldInfo: e.target.value })}
                        placeholder="z.B. 400-500g/m²"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Herkunft</label>
                      <Input
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="z.B. Kalifornien, USA"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Geschmack/Aroma</label>
                      <Input
                        value={formData.flavorProfile}
                        onChange={(e) => setFormData({ ...formData, flavorProfile: e.target.value })}
                        placeholder="z.B. Zitrus, Diesel, Erdig"
                      />
                    </div>
                  </div>
                </div>

                <MultiImageUpload
                  label="Produktbilder (optional)"
                  currentImages={formData.images}
                  maxImages={5}
                  maxSizeMB={5}
                  onImagesChange={(urls) => setFormData({ ...formData, images: urls, imageUrl: urls[0] || "" })}
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">Versandarten * (mindestens eine auswählen)</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shippingVerified}
                        onChange={(e) => setFormData({ ...formData, shippingVerified: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm">Versand mit Altersverifikation (DHL/DPD/Hermes)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.shippingPickup}
                        onChange={(e) => setFormData({ ...formData, shippingPickup: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm">Persönliche Abholung (lokal)</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Sie können beide Optionen anbieten. Altersverifikation schützt Sie rechtlich und ist empfohlen.</p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Stellen Sie sicher, dass Ihre Stecklinge/Samen den KCanG-Anforderungen entsprechen (keine Blueten oder Fruchtstande).
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={updateListing.isPending} className="w-full">
                  {updateListing.isPending ? "Wird aktualisiert..." : "Angebot aktualisieren"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Meine Angebote</CardTitle>
            <CardDescription>
              {myListings.data?.length || 0} Angebot{(myListings.data?.length || 0) !== 1 ? "e" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myListings.isLoading ? (
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : myListings.data?.length === 0 ? (
              <p className="text-gray-500">Keine Angebote vorhanden. Erstellen Sie Ihr erstes Angebot!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-4">Sorte</th>
                      <th className="text-left py-2 px-4">Typ</th>
                      <th className="text-left py-2 px-4">Menge</th>
                      <th className="text-left py-2 px-4">Preis</th>
                      <th className="text-left py-2 px-4">Status</th>
                      <th className="text-right py-2 px-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myListings.data?.map((listing) => (
                      <tr key={listing.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-4 font-medium">{listing.strain}</td>
                        <td className="py-2 px-4">
                          {listing.type === "cutting" ? "Steckling" : "Samen"}
                        </td>
                        <td className="py-2 px-4">{listing.quantity}</td>
                        <td className="py-2 px-4">
                          {String(listing.priceType) === "fixed"
                            ? `€${parseFloat(listing.fixedPrice as any).toFixed(2)}`
                            : listing.offerMinPrice
                            ? `Ab €${parseFloat(listing.offerMinPrice as any).toFixed(2)}`
                            : "Verhandlungsbasis"}
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                            {listing.status === "active" ? "Aktiv" : listing.status === "sold" ? "Verkauft" : "Beendet"}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updateListing.isPending}
                            onClick={() => handleEditClick(listing)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deleteListing.isPending}
                            onClick={() => deleteListing.mutate(listing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}
