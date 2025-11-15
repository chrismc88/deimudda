import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Listing } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Package, Search, Filter, Ban, CheckCircle, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminListings() {
  const { user } = useAuth();
  const { data: listings, refetch } = trpc.listing.getAll.useQuery(undefined, { staleTime: 60000 });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Dialog states
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  
  // Form states
  const [blockReason, setBlockReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf die Listing-Moderation zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Mutations
  const blockListingMutation = trpc.admin.blockListing.useMutation({
    onSuccess: () => {
      toast.success("Listing erfolgreich gesperrt");
      refetch();
      setBlockDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const unblockListingMutation = trpc.admin.unblockListing.useMutation({
    onSuccess: () => {
      toast.success("Listing-Sperrung aufgehoben");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const deleteListingMutation = trpc.admin.deleteListing.useMutation({
    onSuccess: () => {
      toast.success("Listing erfolgreich gelöscht");
      refetch();
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Filter listings
  const filteredListings = listings?.filter((listing: any) => {
    const matchesSearch = searchQuery === "" || 
      listing.strain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    const matchesType = typeFilter === "all" || listing.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Helper functions
  const openBlockDialog = (listing: any) => {
    setSelectedListing(listing);
    setBlockDialogOpen(true);
  };

  const openDeleteDialog = (listing: any) => {
    setSelectedListing(listing);
    setDeleteDialogOpen(true);
  };

  const handleBlockListing = () => {
    if (!selectedListing || !blockReason.trim()) {
      toast.error("Bitte geben Sie einen Grund für die Sperrung ein");
      return;
    }

    blockListingMutation.mutate({
      listingId: selectedListing.id,
      reason: blockReason.trim(),
    });
  };

  const handleDeleteListing = () => {
    if (!selectedListing || !deleteReason.trim()) {
      toast.error("Bitte geben Sie einen Grund für die Löschung ein");
      return;
    }

    deleteListingMutation.mutate({
      listingId: selectedListing.id,
      reason: deleteReason.trim(),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Aktiv</Badge>;
      case 'blocked':
        return <Badge className="bg-red-600">Gesperrt</Badge>;
      case 'deleted':
        return <Badge className="bg-gray-600">Gelöscht</Badge>;
      case 'sold':
        return <Badge className="bg-blue-600">Verkauft</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500">Beendet</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'cutting':
        return <Badge variant="outline">Steckling</Badge>;
      case 'seed':
        return <Badge variant="outline">Samen</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            ← Zurück zum Admin-Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listing-Moderation</h1>
          <p className="text-gray-600 mt-2">
            Moderieren Sie alle Produktangebote auf der Plattform
          </p>
        </div>
        <Package className="h-12 w-12 text-green-600" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-2xl">{listings?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aktiv</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {listings?.filter((l: any) => l.status === 'active').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesperrt</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {listings?.filter((l: any) => l.status === 'blocked').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Verkauft</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {listings?.filter((l: any) => l.status === 'sold').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Suche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Strain, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="blocked">Gesperrt</SelectItem>
                  <SelectItem value="deleted">Gelöscht</SelectItem>
                  <SelectItem value="sold">Verkauft</SelectItem>
                  <SelectItem value="ended">Beendet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Typ</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="cutting">Stecklingen</SelectItem>
                  <SelectItem value="seed">Samen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listings List */}
      <Card>
        <CardHeader>
          <CardTitle>Listings ({filteredListings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredListings.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Listings gefunden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing: any) => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {listing.imageUrl && (
                        <img
                          src={listing.imageUrl}
                          alt={listing.strain}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{listing.strain}</h3>
                          {getTypeBadge(listing.type)}
                          {getStatusBadge(listing.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>ID:</strong> {listing.id}</p>
                          <p><strong>Verkäufer-ID:</strong> {listing.sellerId}</p>
                          <p><strong>Menge:</strong> {listing.quantity}</p>
                          <p><strong>Preis:</strong> {listing.priceType === 'fixed' && listing.fixedPrice ? 
                            `€${parseFloat(listing.fixedPrice).toFixed(2)} (Fix)` : 
                            listing.priceType === 'offer' && listing.offerMinPrice ? 
                            `Ab €${parseFloat(listing.offerMinPrice).toFixed(2)} (Angebot)` : 
                            'Nicht angegeben'}</p>
                          <p><strong>Erstellt:</strong> {new Date(listing.createdAt).toLocaleDateString('de-DE')}</p>
                          {listing.description && (
                            <p><strong>Beschreibung:</strong> {listing.description.slice(0, 100)}{listing.description.length > 100 ? '...' : ''}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* View Listing */}
                      <Link href={`/listing/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                          Ansehen
                        </Button>
                      </Link>

                      {/* Admin Actions */}
                      {listing.status === 'blocked' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unblockListingMutation.mutate(listing.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Entsperren
                        </Button>
                      ) : listing.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBlockDialog(listing)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Ban className="h-4 w-4" />
                          Sperren
                        </Button>
                      )}

                      {/* Delete (Super Admin only) */}
                      {user.role === 'super_admin' && listing.status !== 'deleted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(listing)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Löschen
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block Listing Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listing sperren</DialogTitle>
            <DialogDescription>
              Sperren Sie das Listing "{selectedListing?.strain}" wegen eines Verstoßes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Grund für die Sperrung</Label>
              <Textarea
                placeholder="Erklären Sie, warum dieses Listing gesperrt wird..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleBlockListing}
              disabled={blockListingMutation.isPending || !blockReason.trim()}
            >
              {blockListingMutation.isPending ? "Wird gesperrt..." : "Sperren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Listing Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listing löschen</DialogTitle>
            <DialogDescription>
              ⚠️ Löschen Sie das Listing "{selectedListing?.strain}" permanent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Grund für die Löschung</Label>
              <Textarea
                placeholder="Erklären Sie, warum dieses Listing gelöscht wird..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleDeleteListing}
              disabled={deleteListingMutation.isPending || !deleteReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteListingMutation.isPending ? "Wird gelöscht..." : "Permanent löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}