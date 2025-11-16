import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import AdminNav from "./AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Shield, Scale, Save, AlertCircle } from "lucide-react";
import { Label } from "../components/ui/label";

export default function AdminLimits() {
  const { user } = useAuth();
  const utils = trpc.useContext();

  const get = trpc.admin.getSystemSetting;
  const upd = trpc.admin.updateSystemSetting;

  // Load current values
  const { data: maxOffersPerListingStr } = get.useQuery('max_offers_per_listing');
  const { data: maxOffersPerUserStr } = get.useQuery('max_offers_per_user');
  const { data: minOfferAmountStr } = get.useQuery('min_offer_amount');
  const { data: maxImagesStr } = get.useQuery('max_images_per_listing');
  const { data: maxImageSizeStr } = get.useQuery('max_image_size_mb');
  const { data: maxListingPriceStr } = get.useQuery('max_listing_price');
  const { data: minSellerRatingStr } = get.useQuery('min_seller_rating');

  const [maxOffersPerListing, setMaxOffersPerListing] = useState('');
  const [maxOffersPerUser, setMaxOffersPerUser] = useState('');
  const [minOfferAmount, setMinOfferAmount] = useState('');
  const [maxImages, setMaxImages] = useState('');
  const [maxImageSize, setMaxImageSize] = useState('');
  const [maxListingPrice, setMaxListingPrice] = useState('');
  const [minSellerRating, setMinSellerRating] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateSetting = upd.useMutation({
    onSuccess: () => {
      setSuccess('Einstellungen gespeichert');
      utils.admin.getSystemSetting.invalidate();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  });

  // Initialize
  if (maxOffersPerListingStr && !maxOffersPerListing) setMaxOffersPerListing(maxOffersPerListingStr);
  if (maxOffersPerUserStr && !maxOffersPerUser) setMaxOffersPerUser(maxOffersPerUserStr);
  if (minOfferAmountStr && !minOfferAmount) setMinOfferAmount(minOfferAmountStr);
  if (maxImagesStr && !maxImages) setMaxImages(maxImagesStr);
  if (maxImageSizeStr && !maxImageSize) setMaxImageSize(maxImageSizeStr);
  if (maxListingPriceStr && !maxListingPrice) setMaxListingPrice(maxListingPriceStr);
  if (minSellerRatingStr && !minSellerRating) setMinSellerRating(minSellerRatingStr);

  const handleSave = async (key: string, raw: string, type: 'int'|'float') => {
    const parsed = type === 'int' ? parseInt(raw) : parseFloat(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Bitte gültige Zahl eingeben');
      setTimeout(() => setError(''), 3000);
      return;
    }
    updateSetting.mutate({ key, value: String(parsed) });
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>Super Admin erforderlich</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <AdminNav />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold">Limits & Richtlinien</h1>
            <Badge variant="destructive" className="ml-2">Super Admin Only</Badge>
          </div>
          <p className="text-gray-600">Grenzwerte und Regeln der Plattform konfigurieren</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">✓ {success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Angebots-Limits</CardTitle>
              <CardDescription>Missbrauch vermeiden, Fairness sichern</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Max. Angebote pro Listing</Label>
                  <Input type="number" min="0" value={maxOffersPerListing} onChange={e=>setMaxOffersPerListing(e.target.value)} />
                  <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('max_offers_per_listing', maxOffersPerListing, 'int')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
                </div>
                <div>
                  <Label>Max. aktive Angebote pro Nutzer</Label>
                  <Input type="number" min="0" value={maxOffersPerUser} onChange={e=>setMaxOffersPerUser(e.target.value)} />
                  <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('max_offers_per_user', maxOffersPerUser, 'int')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Min. Angebotsbetrag (€)</Label>
                  <Input type="number" min="0" step="0.01" value={minOfferAmount} onChange={e=>setMinOfferAmount(e.target.value)} />
                  <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('min_offer_amount', minOfferAmount, 'float')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
                </div>
                <div>
                  <Label>Max. Listing-Preis (€)</Label>
                  <Input type="number" min="0" step="0.01" value={maxListingPrice} onChange={e=>setMaxListingPrice(e.target.value)} />
                  <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('max_listing_price', maxListingPrice, 'float')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medien-Limits</CardTitle>
              <CardDescription>Upload-Anforderungen steuern</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Max. Bilder pro Listing</Label>
                  <Input type="number" min="1" value={maxImages} onChange={e=>setMaxImages(e.target.value)} />
                  <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('max_images_per_listing', maxImages, 'int')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
                </div>
                <div>
                  <Label>Max. Bildgröße (MB)</Label>
                  <Input type="number" min="1" value={maxImageSize} onChange={e=>setMaxImageSize(e.target.value)} />
                  <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('max_image_size_mb', maxImageSize, 'int')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verkäufer-Qualität</CardTitle>
              <CardDescription>Mindestbewertung für Verkäufe</CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Min. Verkäufer-Bewertung</Label>
              <Input type="number" min="0" max="5" step="0.1" value={minSellerRating} onChange={e=>setMinSellerRating(e.target.value)} />
              <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('min_seller_rating', minSellerRating, 'float')}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Änderungen wirken sofort und werden überall verwendet, wo die Limits server- oder clientseitig validiert werden.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
