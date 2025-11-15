import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Shield,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { staleTime: 300000 });

  // Check if user is admin or super_admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf das Admin-Dashboard zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/profile">
          <Button variant="outline" size="sm">
            ← Zurück zum Profil
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin-Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Willkommen, {user.name}
              {user.role === 'super_admin' ? (
                <Badge className="ml-2 bg-purple-600">Super Admin</Badge>
              ) : user.role === 'admin' ? (
                <Badge className="ml-2 bg-blue-600">Admin</Badge>
              ) : null}
            </p>
          </div>
          <Shield className="h-12 w-12 text-purple-600" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats?.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Plattformgebühren: €{stats?.platformFees?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transaktionen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Heute: {stats?.transactionsToday || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Verkäufer: {stats?.totalSellers || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeListings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt: {stats?.totalListings || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings & Reports */}
      {stats && (stats.pendingReports > 0 || stats.warnedUsers > 0 || stats.suspendedUsers > 0) && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Aktionen erforderlich
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.pendingReports > 0 && (
                <p className="text-yellow-700">
                  • {stats.pendingReports} offene Report(s) warten auf Bearbeitung
                </p>
              )}
              {stats.warnedUsers > 0 && (
                <p className="text-yellow-700">
                  • {stats.warnedUsers} verwarnte Nutzer
                </p>
              )}
              {stats.suspendedUsers > 0 && (
                <p className="text-yellow-700">
                  • {stats.suspendedUsers} gesperrte Nutzer
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Nutzer-Verwaltung
              </CardTitle>
              <CardDescription>
                Nutzer verwalten, verwarnen, sperren oder bannen
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/transactions">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Transaktionen
              </CardTitle>
              <CardDescription>
                Alle Plattform-Transaktionen und Gebühren einsehen
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/listings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Listing-Moderation
              </CardTitle>
              <CardDescription>
                Listings prüfen, deaktivieren oder löschen
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Reports
              </CardTitle>
              <CardDescription>
                Meldungen von Nutzern bearbeiten
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/stats">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Statistiken
              </CardTitle>
              <CardDescription>
                Detaillierte Plattform-Statistiken und Charts
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/logs">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Admin-Logs
              </CardTitle>
              <CardDescription>
                Alle Admin-Aktionen einsehen (Audit Trail)
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/security">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Sicherheit & IPs
              </CardTitle>
              <CardDescription>
                IP-Blocking und Login-Sicherheit verwalten
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Super Admin Only Section */}
      {user.role === 'super_admin' && (
        <div className="mt-8">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">Super Admin Funktionen</CardTitle>
              <CardDescription className="text-purple-600">
                Nur für Super Admins verfügbar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/admin/manage">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Admins ernennen/entfernen
                  </Button>
                </Link>
                <Link href="/admin/management">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Admin-Verwaltung
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System-Einstellungen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}