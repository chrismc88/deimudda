import { useAuth } from "@/_core/hooks/useAuth";
import type { Notification } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Bell, Trash2, CheckCheck, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Header } from "@/components/Header";

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Get all notifications
  const { data: notifications = [], isLoading } = trpc.notifications.getMyNotifications.useQuery(undefined, { staleTime: 10000 });

  // Mark as read mutation
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getMyNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getMyNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("Alle Benachrichtigungen als gelesen markiert");
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = trpc.notifications.deleteNotification.useMutation({
    onSuccess: () => {
      utils.notifications.getMyNotifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success("Benachrichtigung gelöscht");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>
              Sie müssen eingeloggt sein, um Ihre Benachrichtigungen zu sehen.
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

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate to action URL if exists
    if (notification.link) {
      setLocation(notification.link);
    }
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'suspension':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'ban':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'unban':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'listing_approved':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'listing_rejected':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'offer_received':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'offer_accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'offer_rejected':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'message_received':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'system':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'warning':
        return 'Verwarnung';
      case 'suspension':
        return 'Sperrung';
      case 'ban':
        return 'Bann';
      case 'unban':
        return 'Entsperrung';
      case 'listing_approved':
        return 'Angebot genehmigt';
      case 'listing_rejected':
        return 'Angebot abgelehnt';
      case 'offer_received':
        return 'Angebot erhalten';
      case 'offer_accepted':
        return 'Angebot akzeptiert';
      case 'offer_rejected':
        return 'Angebot abgelehnt';
      case 'message_received':
        return 'Neue Nachricht';
      case 'system':
        return 'System';
      default:
        return type;
    }
  };

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Benachrichtigungen</CardTitle>
                  <CardDescription>
                    {unreadCount > 0
                      ? `${unreadCount} ungelesene Benachrichtigung${unreadCount > 1 ? 'en' : ''}`
                      : 'Alle Benachrichtigungen gelesen'}
                  </CardDescription>
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Alle als gelesen markieren
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Lädt...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">
                  Keine Benachrichtigungen
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Sie haben noch keine Benachrichtigungen erhalten.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                      !notification.isRead
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`${getNotificationTypeColor(notification.type)} text-xs`}
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: de,
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {notification.message}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
