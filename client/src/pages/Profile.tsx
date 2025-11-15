import { useAuth } from "@/_core/hooks/useAuth";
import ImageUpload from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";

export default function Profile() {
  const { user, loading, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    nickname: "",
    location: "",
    profileImageUrl: "",
  });

  // Update formData when user data is loaded
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
    onSuccess: async () => {
      toast.success("Profil erfolgreich aktualisiert!");
      // Invalidate and refetch user data (no need for refresh())
      await utils.auth.me.invalidate();
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

  const deleteAccount = trpc.profile.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Account erfolgreich gelöscht!");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    },
    onError: (error) => {
      console.error("[Profile] Delete account error:", error);
      toast.error("Fehler beim Löschen: " + error.message);
    },
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Profile] Submitting update with formData:", formData);
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container max-w-4xl py-8">
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

        {/* Hinweis Nickname vs Verkäufername (optional, kein Debug mehr) */}
        {user.isSellerActive && (
          <div className="mb-6 text-xs text-gray-600 bg-white border rounded p-3">
            <strong>Hinweis:</strong> Dein öffentlicher Verkäufername (Shop) wird separat im Verkäufer-Dashboard verwaltet. Im Chat später: <code>{`ShopName (Nickname)`}</code>.
          </div>
        )}

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
                <div className="flex gap-4 flex-wrap">
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

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Gefahrenzone</CardTitle>
            <CardDescription>Account unwiderruflich löschen (DSGVO-konform)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">⚠️ Warnung: Diese Aktion kann nicht rückgängig gemacht werden!</p>
              <p className="text-red-600 text-sm mt-2">
                Alle Ihre Daten werden permanent gelöscht:
              </p>
              <ul className="text-red-600 text-sm mt-2 ml-4 list-disc">
                <li>Profil und Verkäufer-Informationen</li>
                <li>Alle Listings und Angebote</li>
                <li>Transaktionen und Bewertungen</li>
                <li>Nachrichten und Benachrichtigungen</li>
                <li>Verwarnungen und Admin-Logs</li>
              </ul>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  Account löschen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Account wirklich löschen?</DialogTitle>
                  <DialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre Daten werden permanent aus unserer Datenbank entfernt.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Bitte bestätigen Sie, dass Sie verstehen:
                  </p>
                  <ul className="text-yellow-700 text-sm mt-2 ml-4 list-disc">
                    <li>Ihr Account wird sofort gelöscht</li>
                    <li>Sie werden ausgeloggt</li>
                    <li>Alle Daten sind unwiederbringlich verloren</li>
                    <li>Laufende Transaktionen werden abgebrochen</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteAccount.mutate();
                      setIsDeleteDialogOpen(false);
                    }}
                    disabled={deleteAccount.isPending}
                  >
                    {deleteAccount.isPending ? "Lösche..." : "Ja, Account löschen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

