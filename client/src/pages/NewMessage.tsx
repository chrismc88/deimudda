import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";

export default function NewMessage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Get query params
  const params = new URLSearchParams(window.location.search);
  const listingId = parseInt(params.get("listingId") || "0");
  const sellerId = parseInt(params.get("sellerId") || "0");

  // Create or get conversation
  const createConversationMutation = trpc.chat.getOrCreateConversation.useMutation({
    onSuccess: (conversation) => {
      if (!conversation?.id) {
        toast.error("Konversation konnte nicht erstellt werden.");
        return;
      }
      setLocation(`/messages/${conversation.id}`);
    },
    onError: (error) => {
      toast.error("Fehler beim Erstellen der Konversation: " + error.message);
    },
  });

  useEffect(() => {
    if (isAuthenticated && listingId > 0 && sellerId > 0) {
      // Automatically create conversation
      createConversationMutation.mutate({
        listingId,
        sellerId,
      });
    }
  }, [isAuthenticated, listingId, sellerId]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie müssen eingeloggt sein, um Nachrichten zu senden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>Zur Startseite</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Chat wird geöffnet...</CardTitle>
          <CardDescription>
            Bitte warten Sie einen Moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Konversation wird erstellt...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
