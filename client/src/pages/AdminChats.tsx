import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import AdminNav from "@/pages/AdminNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Lock, MessageSquare, ShieldCheck, Unlock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminChats() {
  const { user, isAuthenticated } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [lockReason, setLockReason] = useState("");

  const canModerate = Boolean(user && ["admin", "super_admin"].includes(user.role));

  const {
    data: conversations = [],
    isLoading: isConversationsLoading,
    refetch: refetchConversations,
  } = trpc.admin.getChatConversations.useQuery({ limit: 100 }, { enabled: canModerate });

  const {
    data: messages = [],
    isFetching: isMessagesLoading,
    refetch: refetchMessages,
  } = trpc.admin.getChatMessages.useQuery(
    { conversationId: selectedConversationId ?? 0 },
    { enabled: canModerate && Boolean(selectedConversationId) }
  );

  const lockConversation = trpc.admin.lockConversation.useMutation({
    onSuccess: () => {
      toast.success("Konversation gesperrt");
      refetchConversations();
      refetchMessages();
      setLockReason("");
    },
    onError: (error) => toast.error(error.message),
  });

  const unlockConversation = trpc.admin.unlockConversation.useMutation({
    onSuccess: () => {
      toast.success("Konversation entsperrt");
      refetchConversations();
      refetchMessages();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMessage = trpc.admin.deleteChatMessage.useMutation({
    onSuccess: () => {
      toast.success("Nachricht entfernt");
      refetchMessages();
    },
    onError: (error) => toast.error(error.message),
  });

  const restoreMessage = trpc.admin.restoreChatMessage.useMutation({
    onSuccess: () => {
      toast.success("Nachricht wiederhergestellt");
      refetchMessages();
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  if (!isAuthenticated || !canModerate) {
    return (
      <DashboardLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Kein Zugriff</CardTitle>
              <CardDescription>Nur Admins oder Super-Admins können Chat-Monitoring nutzen.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AdminNav />
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>Konversationen</CardTitle>
            <CardDescription>Überwachen Sie laufende Chats (max. 100)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {isConversationsLoading ? (
              <p className="text-sm text-muted-foreground">Lädt...</p>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Gespräche.</p>
            ) : (
              conversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversationId;
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-semibold text-sm truncate">{conversation.listingStrain}</div>
                      <Badge variant={conversation.locked ? "destructive" : "secondary"} className="text-xs">
                        {conversation.locked ? "Gesperrt" : "Aktiv"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      Käufer: {conversation.buyerName} · Verkäufer: {conversation.sellerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Letzte Aktivität:{" "}
                      {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true, locale: de })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Nachrichten: {conversation.messageCount} · Ungelesen:{conversation.unreadCount ?? 0}
                    </p>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-7">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Moderation</CardTitle>
                <CardDescription>
                  {selectedConversation ? `Listing #${selectedConversation.listingId}` : "Wählen Sie eine Konversation"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedConversation ? (
              <p className="text-sm text-muted-foreground">Keine Konversation ausgewählt.</p>
            ) : (
              <>
                <div className="rounded-lg border p-3 bg-slate-50 space-y-1">
                  <p className="text-sm">
                    <strong>Listing:</strong> {selectedConversation.listingStrain}
                  </p>
                  <p className="text-sm">
                    <strong>Käufer:</strong> {selectedConversation.buyerName} (ID {selectedConversation.buyerId})
                  </p>
                  <p className="text-sm">
                    <strong>Verkäufer:</strong> {selectedConversation.sellerName} (ID {selectedConversation.sellerId})
                  </p>
                  {selectedConversation.locked && (
                    <p className="text-sm text-red-700">
                      <strong>Gesperrt:</strong> {selectedConversation.lockedReason || "Kein Grund angegeben"}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedConversation.locked ? (
                      <ShieldCheck className="h-4 w-4 text-red-600" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    )}
                    <p className="font-semibold text-sm">
                      {selectedConversation.locked ? "Konversation gesperrt" : "Konversation aktiv"}
                    </p>
                  </div>
                  {selectedConversation.locked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={unlockConversation.isPending}
                      onClick={() =>
                        selectedConversationId &&
                        unlockConversation.mutate({ conversationId: selectedConversationId })
                      }
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Entsperren
                    </Button>
                  ) : (
                    <form
                      className="space-y-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!lockReason.trim() || !selectedConversationId) return;
                        lockConversation.mutate({
                          conversationId: selectedConversationId,
                          reason: lockReason.trim(),
                        });
                      }}
                    >
                      <Textarea
                        placeholder="Grund für Sperrung"
                        value={lockReason}
                        onChange={(event) => setLockReason(event.target.value)}
                        rows={2}
                      />
                      <Button type="submit" size="sm" disabled={!lockReason.trim() || lockConversation.isPending}>
                        <Lock className="h-4 w-4 mr-2" />
                        Konversation sperren
                      </Button>
                    </form>
                  )}
                </div>

                <div className="max-h-[45vh] overflow-y-auto border rounded-lg divide-y">
                  {isMessagesLoading ? (
                    <p className="text-sm text-muted-foreground p-4">Nachrichten werden geladen...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4">Keine Nachrichten vorhanden.</p>
                  ) : (
                    messages.map((message) => {
                      const isDeleted = Boolean(message.deletedAt);
                      return (
                        <div key={message.id} className={`p-4 ${isDeleted ? "bg-red-50" : "bg-white"}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {message.senderName} → {message.receiverName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.createdAt), {
                                  addSuffix: true,
                                  locale: de,
                                })}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {isDeleted ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => restoreMessage.mutate({ messageId: message.id })}
                                  disabled={restoreMessage.isPending}
                                >
                                  Wiederherstellen
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const inputReason = prompt("Grund für Löschung?");
                                    const cleanedReason = inputReason?.trim();
                                    if (!cleanedReason) return;
                                    deleteMessage.mutate({ messageId: message.id, reason: cleanedReason });
                                  }}
                                  disabled={deleteMessage.isPending}
                                >
                                  Löschen
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          {message.moderationReason && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Moderationsgrund: {message.moderationReason}
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
