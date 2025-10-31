import { useAuth } from "@/_core/hooks/useAuth";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    nickname: "",
    location: "",
    profileImageUrl: "",
  });

  // Load user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        location: user.location || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user]);

  const [sellerFormData, setSellerFormData] = useState({
    shopName: "",
    description: "",
  });

  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil erfolgreich aktualisiert!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error("Fehler beim Aktualisieren: " + error.message);
    },
  });

  const activateSeller = trpc.profile.activateSeller.useMutation({
    onSuccess: () => {
      toast.success("Verkäufer-Modus aktiviert!");
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast.error("Fehler beim Aktivieren: " + error.message);
    },
  });

  const deactivateSeller = trpc.profile.deactivateSeller.useMutation({
    onSuccess: () => {
      toast.success("Verkäufer-Modus deaktiviert!");
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast.error("Fehler beim Deaktivieren: " + error.message);
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleActivateSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerFormData.shopName) {
      toast.error("Shop-Name ist erforderlich");
      return;
    }
    activateSeller.mutate(sellerFormData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Mein Profil</h1>

        {/* Basic Profile */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profil-Informationen</CardTitle>
            <CardDescription>Verwalten Sie Ihre persönlichen Informationen</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="nickname">Nickname / Anzeigename</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="z.B. GreenThumb420"
                />
              </div>

              <div>
                <Label htmlFor="location">Standort (optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="z.B. Berlin, Deutschland"
                />
              </div>

              <ImageUpload
                label="Profilbild (optional)"
                currentImageUrl={formData.profileImageUrl}
                onImageUploaded={(url) => setFormData({ ...formData, profileImageUrl: url })}
                maxSizeMB={2}
              />

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Wird gespeichert..." : "Profil aktualisieren"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Buyer Dashboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Meine Käufe</CardTitle>
            <CardDescription>
              Verwalten Sie Ihre Bestellungen und geben Sie Bewertungen ab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/buyer/dashboard")} variant="default">
              Zu meinen Käufen
            </Button>
          </CardContent>
        </Card>

        {/* Seller Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Verkäufer-Modus</CardTitle>
            <CardDescription>
              {user.isSellerActive
                ? "Sie sind als Verkäufer aktiv und können Stecklinge anbieten"
                : "Aktivieren Sie den Verkäufer-Modus, um Stecklinge anzubieten"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.isSellerActive ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">✓ Verkäufer-Modus ist aktiv</p>
                  <p className="text-green-600 text-sm mt-1">
                    Sie können jetzt Angebote erstellen und verwalten
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setLocation("/seller/dashboard")} variant="default">
                    Zum Verkäufer-Dashboard
                  </Button>
                  <Button
                    onClick={() => deactivateSeller.mutate()}
                    variant="outline"
                    disabled={deactivateSeller.isPending}
                  >
                    {deactivateSeller.isPending ? "Wird deaktiviert..." : "Verkäufer-Modus deaktivieren"}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleActivateSeller} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 font-medium">Verkäufer werden</p>
                  <p className="text-blue-600 text-sm mt-1">
                    Erstellen Sie einen Shop-Namen und beginnen Sie, Stecklinge anzubieten
                  </p>
                </div>

                <div>
                  <Label htmlFor="shopName">Shop-Name *</Label>
                  <Input
                    id="shopName"
                    value={sellerFormData.shopName}
                    onChange={(e) => setSellerFormData({ ...sellerFormData, shopName: e.target.value })}
                    placeholder="z.B. German Kali"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Shop-Beschreibung (optional)</Label>
                  <Textarea
                    id="description"
                    value={sellerFormData.description}
                    onChange={(e) => setSellerFormData({ ...sellerFormData, description: e.target.value })}
                    placeholder="Beschreiben Sie Ihren Shop und Ihre Spezialitäten..."
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={activateSeller.isPending}>
                  {activateSeller.isPending ? "Wird aktiviert..." : "Verkäufer-Modus aktivieren"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

