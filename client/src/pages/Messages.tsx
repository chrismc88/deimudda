import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: conversations = [], isLoading } = trpc.chat.getConversations.useQuery(undefined, {
    refetchInterval: 10000,
  });

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Zugriff verweigert</CardTitle>
              <CardDescription>Sie müssen eingeloggt sein, um Ihre Nachrichten zu sehen.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>Zur Startseite</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Wichtige Hinweise zum Chat:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tauschen Sie <strong>keine illegalen Inhalte</strong> aus (Verkauf von Blütenständen ist verboten)</li>
                <li>
                  <strong>Geben Sie persönliche Daten</strong> (Telefonnummer, vollständige Adresse){" "}
                  <strong>erst nach Kaufabschluss</strong> weiter
                </li>
                <li>Der <strong>Standort des Verkäufers</strong> ist bereits auf der Plattform sichtbar</li>
                <li>
                  <strong>🔐 Empfehlung:</strong> Tauschen Sie sensible Daten (Adresse, Telefon) über{" "}
                  <strong>verschlüsselte Messenger</strong> (Signal, Telegram, WhatsApp) aus - nicht über diese Plattform
                </li>
                <li>Alle Nachrichten können von Moderatoren eingesehen werden</li>
              </ul>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Nachrichten</CardTitle>
                <CardDescription>Kommunizieren Sie mit Käufern und Verkäufern</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Lädt...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Keine Nachrichten</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Starten Sie eine Konversation, indem Sie auf &quot;Verkäufer kontaktieren&quot; bei einem Inserat klicken.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation: any) => {
                  const isUserBuyer = conversation.buyerId === user?.id;
                  const otherUserName = isUserBuyer ? conversation.sellerName : conversation.buyerName;
                  const role = isUserBuyer ? "Verkäufer" : "Käufer";
                  const lastMessageTime = conversation.lastMessage?.createdAt || conversation.lastMessageAt;
                  const lastMessageText = conversation.lastMessage?.content || "Keine Nachrichten";

                  return (
                    <div
                      key={conversation.id}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
                      onClick={() => setLocation(`/messages/${conversation.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {conversation.listingImage && (
                          <img
                            src={conversation.listingImage}
                            alt={conversation.listingStrain}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{conversation.listingStrain}</h3>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount} neu
                              </Badge>
                            )}
                            {conversation.locked && (
                              <Badge variant="outline" className="text-xs text-red-700 border-red-300">
                                Gesperrt
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {role}: {otherUserName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{lastMessageText}</p>
                          {lastMessageTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Letzte Nachricht:{" "}
                              {formatDistanceToNow(new Date(lastMessageTime), {
                                addSuffix: true,
                                locale: de,
                              })}
                            </p>
                          )}
                        </div>

                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          <Send className="h-4 w-4 mr-2" />
                          Öffnen
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
