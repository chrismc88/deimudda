import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";
import { MessageIcon } from "@/components/MessageIcon";

/**
 * Global navigation header component
 * Displays logo, user info, messages, notifications, dashboard link, and logout
 * Should be used on all main pages for consistent navigation
 */
export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <img src="/seedling-logo.png" alt="deimudda Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-green-700">{APP_TITLE}</h1>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">Hallo, {user?.name}</span>
              <MessageIcon />
              <NotificationBell />
              {/* Admin-Link nur für Admins/Super-Admins */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Link href="/admin">
                  <Button variant="default" size="sm" className="bg-red-600 hover:bg-red-700">
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Login / Registrieren
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
