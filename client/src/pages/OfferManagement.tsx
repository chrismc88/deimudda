import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, MessageSquare, Clock, Euro } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

type OfferStatus = "pending" | "accepted" | "rejected" | "countered" | "expired";

export default function OfferManagement() {
  const utils = trpc.useUtils();
  
  // State for incoming offers (als Verkäufer)
  const [incomingPage, setIncomingPage] = useState(1);
  const [incomingStatus, setIncomingStatus] = useState<OfferStatus | undefined>(undefined);
  
  // State for outgoing offers (als Käufer)
  const [outgoingPage, setOutgoingPage] = useState(1);
  const [outgoingStatus, setOutgoingStatus] = useState<OfferStatus | undefined>(undefined);

  // Dialog states
  const [counterDialog, setCounterDialog] = useState<{ open: boolean; offerId: number | null; currentAmount: number }>({
    open: false,
    offerId: null,
    currentAmount: 0,
  });
  const [counterAmount, setCounterAmount] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  // Queries
  const incomingQuery = trpc.offer.getIncoming.useQuery(
    { page: incomingPage, pageSize: 10, status: incomingStatus },
    { refetchInterval: 30000 } // Auto-refresh alle 30s
  );

  const outgoingQuery = trpc.offer.getMine.useQuery(
    { page: outgoingPage, pageSize: 10, status: outgoingStatus },
    { refetchInterval: 30000 }
  );

  // Mutations
  const acceptMutation = trpc.offer.accept.useMutation({
    onSuccess: () => {
      utils.offer.getIncoming.invalidate();
      utils.offer.getPending.invalidate();
    },
  });

  const rejectMutation = trpc.offer.reject.useMutation({
    onSuccess: () => {
      utils.offer.getIncoming.invalidate();
      utils.offer.getPending.invalidate();
    },
  });

  const counterMutation = trpc.offer.counter.useMutation({
    onSuccess: () => {
      utils.offer.getIncoming.invalidate();
      utils.offer.getPending.invalidate();
      setCounterDialog({ open: false, offerId: null, currentAmount: 0 });
      setCounterAmount("");
      setCounterMessage("");
    },
  });

  const respondToCounterMutation = trpc.offer.respondToCounter.useMutation({
    onSuccess: () => {
      utils.offer.getMine.invalidate();
      utils.offer.getPending.invalidate();
    },
  });

  const handleAccept = (offerId: number) => {
    if (confirm("Angebot wirklich annehmen?")) {
      acceptMutation.mutate({ offerId });
    }
  };

  const handleReject = (offerId: number) => {
    if (confirm("Angebot wirklich ablehnen?")) {
      rejectMutation.mutate({ offerId });
    }
  };

  const handleOpenCounterDialog = (offerId: number, currentAmount: number) => {
    setCounterDialog({ open: true, offerId, currentAmount });
    setCounterAmount(String(currentAmount + 5)); // Vorschlag: +5€
  };

  const handleSubmitCounter = () => {
    if (!counterDialog.offerId) return;
    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= counterDialog.currentAmount) {
      alert("Gegenangebot muss höher sein als das ursprüngliche Angebot");
      return;
    }
    counterMutation.mutate({
      offerId: counterDialog.offerId,
      counterAmount: amount,
      counterMessage: counterMessage || undefined,
    });
  };

  const handleRespondToCounter = (offerId: number, action: "accept" | "reject") => {
    if (action === "accept" && !confirm("Gegenangebot annehmen?")) return;
    if (action === "reject" && !confirm("Gegenangebot ablehnen?")) return;
    respondToCounterMutation.mutate({ offerId, action });
  };

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" />Ausstehend</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Angenommen</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50"><XCircle className="w-3 h-3 mr-1" />Abgelehnt</Badge>;
      case "countered":
        return <Badge variant="outline" className="bg-blue-50"><MessageSquare className="w-3 h-3 mr-1" />Gegenangebot</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-gray-50">Abgelaufen</Badge>;
    }
  };

  const renderOfferCard = (offer: any, isIncoming: boolean) => (
    <Card key={offer.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{offer.listingTitle}</CardTitle>
            <CardDescription>
              {isIncoming ? `Von: ${offer.buyerName || "Unbekannt"}` : `Verkäufer: ${offer.sellerShopName || "Unbekannt"}`}
              {" • "}
              {formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true, locale: de })}
            </CardDescription>
          </div>
          {getStatusBadge(offer.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-lg">{parseFloat(offer.offerAmount).toFixed(2)} €</span>
          {offer.counterAmount && (
            <span className="text-sm text-muted-foreground">
              (Gegenangebot: {parseFloat(offer.counterAmount).toFixed(2)} €)
            </span>
          )}
        </div>

        {offer.message && (
          <div className="text-sm bg-muted p-2 rounded">
            <span className="font-medium">Nachricht:</span> {offer.message}
          </div>
        )}

        {offer.counterMessage && (
          <div className="text-sm bg-blue-50 p-2 rounded">
            <span className="font-medium">Gegenangebot-Nachricht:</span> {offer.counterMessage}
          </div>
        )}

        {offer.expiresAt && offer.status === "pending" && (
          <div className="text-xs text-muted-foreground">
            Läuft ab: {formatDistanceToNow(new Date(offer.expiresAt), { addSuffix: true, locale: de })}
          </div>
        )}

        {/* Actions for incoming offers (Verkäufer) */}
        {isIncoming && offer.status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleAccept(offer.id)}
              disabled={acceptMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Annehmen
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenCounterDialog(offer.id, parseFloat(offer.offerAmount))}
              disabled={counterMutation.isPending}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Gegenangebot
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(offer.id)}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Ablehnen
            </Button>
          </div>
        )}

        {/* Actions for outgoing offers (Käufer) */}
        {!isIncoming && offer.status === "countered" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleRespondToCounter(offer.id, "accept")}
              disabled={respondToCounterMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Gegenangebot annehmen
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRespondToCounter(offer.id, "reject")}
              disabled={respondToCounterMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Ablehnen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Angebotsverwaltung</h1>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="incoming">
              Eingehende Angebote
              {incomingQuery.data && incomingQuery.data.total > 0 && (
                <Badge variant="secondary" className="ml-2">{incomingQuery.data.total}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="outgoing">
              Meine Angebote
              {outgoingQuery.data && outgoingQuery.data.total > 0 && (
                <Badge variant="secondary" className="ml-2">{outgoingQuery.data.total}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Eingehende Angebote (Verkäufer-Sicht) */}
          <TabsContent value="incoming">
            <div className="mb-4">
              <Label>Filter nach Status</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={incomingStatus || ""}
                onChange={(e) => {
                  setIncomingStatus(e.target.value as OfferStatus || undefined);
                  setIncomingPage(1);
                }}
              >
                <option value="">Alle</option>
                <option value="pending">Ausstehend</option>
                <option value="countered">Gegenangebot</option>
                <option value="accepted">Angenommen</option>
                <option value="rejected">Abgelehnt</option>
                <option value="expired">Abgelaufen</option>
              </select>
            </div>

            {incomingQuery.isLoading && <p>Lädt...</p>}
            {incomingQuery.error && <p className="text-red-500">Fehler: {incomingQuery.error.message}</p>}
            
            {incomingQuery.data && (
              <>
                {incomingQuery.data.items.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Keine eingehenden Angebote vorhanden.
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {incomingQuery.data.items.map((offer) => renderOfferCard(offer, true))}
                    
                    {/* Pagination */}
                    {incomingQuery.data.total > 10 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setIncomingPage(p => Math.max(1, p - 1))}
                          disabled={incomingPage === 1}
                        >
                          Zurück
                        </Button>
                        <span className="py-2 px-4">
                          Seite {incomingPage} von {Math.ceil(incomingQuery.data.total / 10)}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setIncomingPage(p => p + 1)}
                          disabled={incomingPage >= Math.ceil(incomingQuery.data.total / 10)}
                        >
                          Weiter
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </TabsContent>

          {/* Ausgehende Angebote (Käufer-Sicht) */}
          <TabsContent value="outgoing">
            <div className="mb-4">
              <Label>Filter nach Status</Label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={outgoingStatus || ""}
                onChange={(e) => {
                  setOutgoingStatus(e.target.value as OfferStatus || undefined);
                  setOutgoingPage(1);
                }}
              >
                <option value="">Alle</option>
                <option value="pending">Ausstehend</option>
                <option value="countered">Gegenangebot erhalten</option>
                <option value="accepted">Angenommen</option>
                <option value="rejected">Abgelehnt</option>
                <option value="expired">Abgelaufen</option>
              </select>
            </div>

            {outgoingQuery.isLoading && <p>Lädt...</p>}
            {outgoingQuery.error && <p className="text-red-500">Fehler: {outgoingQuery.error.message}</p>}
            
            {outgoingQuery.data && (
              <>
                {outgoingQuery.data.items.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Du hast noch keine Angebote gemacht.
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {outgoingQuery.data.items.map((offer) => renderOfferCard(offer, false))}
                    
                    {/* Pagination */}
                    {outgoingQuery.data.total > 10 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setOutgoingPage(p => Math.max(1, p - 1))}
                          disabled={outgoingPage === 1}
                        >
                          Zurück
                        </Button>
                        <span className="py-2 px-4">
                          Seite {outgoingPage} von {Math.ceil(outgoingQuery.data.total / 10)}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setOutgoingPage(p => p + 1)}
                          disabled={outgoingPage >= Math.ceil(outgoingQuery.data.total / 10)}
                        >
                          Weiter
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Counter-Dialog */}
        <Dialog open={counterDialog.open} onOpenChange={(open) => {
          if (!open) {
            setCounterDialog({ open: false, offerId: null, currentAmount: 0 });
            setCounterAmount("");
            setCounterMessage("");
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gegenangebot erstellen</DialogTitle>
              <DialogDescription>
                Aktuelles Angebot: {counterDialog.currentAmount.toFixed(2)} €
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="counterAmount">Dein Gegenangebot (€)</Label>
                <Input
                  id="counterAmount"
                  type="number"
                  step="0.01"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  placeholder={`Mindestens ${(counterDialog.currentAmount + 0.01).toFixed(2)}`}
                />
              </div>
              <div>
                <Label htmlFor="counterMessage">Nachricht (optional)</Label>
                <Textarea
                  id="counterMessage"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="z.B. Begründung für den Gegenwert..."
                  maxLength={500}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCounterDialog({ open: false, offerId: null, currentAmount: 0 })}
              >
                Abbrechen
              </Button>
              <Button onClick={handleSubmitCounter} disabled={counterMutation.isPending}>
                Gegenangebot senden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
