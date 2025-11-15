import { useAuth } from "@/_core/hooks/useAuth";
import type { Message } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function ChatWindow() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams<{ id: string }>();
  const conversationId = parseInt(params.id || "0");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Get messages
  const { data: messages = [], isLoading } = trpc.chat.getMessages.useQuery(conversationId, {
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 10000, // 10s - Real-time
    enabled: conversationId > 0,
  });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      utils.chat.getMessages.invalidate();
      utils.chat.getConversations.invalidate();
      utils.chat.getUnreadCount.invalidate();
    },
    onError: (error) => {
      toast.error("Fehler beim Senden: " + error.message);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessageMutation.mutate({
      conversationId,
      message: messageText.trim(),
    });
  };

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Zugriff verweigert</CardTitle>
              <CardDescription>
                Sie müssen eingeloggt sein, um Nachrichten zu sehen.
              </CardDescription>
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/messages">
            <Button variant="outline" size="sm" className="hidden">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zu Nachrichten
            </Button>
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Datenschutz-Hinweis:</p>
              <p className="mb-2">Geben Sie <strong>persönliche Daten</strong> (Telefonnummer, vollständige Adresse) <strong>erst nach Kaufabschluss</strong> weiter. Der Standort des Verkäufers ist bereits auf der Plattform sichtbar.</p>
              <p className="text-xs"><strong>🔒 Empfehlung:</strong> Nutzen Sie <strong>verschlüsselte Messenger</strong> (Signal, Telegram, WhatsApp) für den Austausch sensibler Daten außerhalb dieser Plattform.</p>
            </div>
          </div>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              {messages.length > 0 && `${messages.length} Nachricht${messages.length > 1 ? "en" : ""}`}
            </CardDescription>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Lädt...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Noch keine Nachrichten. Schreiben Sie die erste Nachricht!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message: Message) => {
                  const isOwnMessage = message.senderId === user?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-xs font-semibold ${isOwnMessage ? "text-blue-100" : "text-gray-600"}`}>
                            {isOwnMessage ? "Sie" : message.senderName}
                          </p>
                          <p className={`text-xs ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </p>
                        </div>
                        <p className="text-sm whitespace-pre-line break-words">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Nachricht schreiben..."
                maxLength={5000}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!messageText.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Senden
              </Button>
            </form>
          </div>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

