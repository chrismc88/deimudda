import { MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export function MessageIcon() {
  const [, setLocation] = useLocation();

  // Get unread message count
  const { data: unreadCount = 0 } = trpc.chat.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleClick = () => {
    setLocation("/messages");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative" 
      onClick={handleClick}
      title="Nachrichten"
    >
      <MessageCircle className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}

