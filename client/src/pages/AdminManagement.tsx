import { useAuth } from "@/_core/hooks/useAuth";
import type { User } from "@/../../shared/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, UserPlus, UserMinus, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

export default function AdminManagement() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: admins = [], isLoading } = trpc.admin.getAllAdmins.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "superadmin" || user?.role === "super_admin"),
  });

  const promoteToAdmin = trpc.admin.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Benutzer wurde zum Admin befördert!");
      utils.admin.getAllAdmins.invalidate();
    },
    onError: (error) => {
      console.error("[AdminManagement] Promote error:", error);
      toast.error("Fehler: " + error.message);
    },
  });

  const demoteAdmin = trpc.admin.demoteFromAdmin.useMutation({
    onSuccess: () => {
      toast.success("Admin-Rechte entzogen!");
      utils.admin.getAllAdmins.invalidate();
    },
    onError: (error) => {
      console.error("[AdminManagement] Demote error:", error);
      toast.error("Fehler: " + error.message);
    },
  });

  // Access check AFTER all hooks
  if (!isAuthenticated || (user?.role !== "superadmin" && user?.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
            <CardDescription>Nur Super-Admins haben Zugriff.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button>Zur Startseite</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton href="/admin" label="Zurück zum Dashboard" />
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Admin-Verwaltung</h1>
          </div>
          <p className="text-gray-600">Verwalten Sie Administrator-Rechte.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Admins</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.filter(a => a.role === "superadmin" || a.role === "super_admin").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reguläre Admins</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admins.filter(a => a.role === "admin").length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alle Administratoren</CardTitle>
            <CardDescription>Liste aller Benutzer mit Admin-Rechten</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12"><p className="text-muted-foreground">Lädt...</p></div>
            ) : admins.length === 0 ? (
              <div className="text-center py-12"><p className="text-muted-foreground">Keine Admins gefunden.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Benutzer</th>
                      <th className="text-left py-3 px-4">Rolle</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Letzter Login</th>
                      <th className="text-right py-3 px-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{admin.nickname || admin.name || "Unbekannt"}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {admin.role === "superadmin" || admin.role === "super_admin" ? (
                            <Badge className="bg-purple-600"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
                          ) : (
                            <Badge variant="secondary"><UserPlus className="h-3 w-3 mr-1" />Admin</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {admin.status === "active" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">Aktiv</Badge>
                          ) : admin.status === "warned" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Verwarnt</Badge>
                          ) : admin.status === "suspended" ? (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700">Gesperrt</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700">Gebannt</Badge>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {admin.lastSignedIn ? formatDistanceToNow(new Date(admin.lastSignedIn), { addSuffix: true, locale: de }) : "Nie"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {admin.role === "superadmin" || admin.role === "super_admin" ? (
                            <span className="text-sm text-gray-400">Keine Aktionen</span>
                          ) : (
                            <Button size="sm" variant="destructive" onClick={() => {
                              if (confirm("Admin-Rechte entziehen?")) demoteAdmin.mutate(admin.id);
                            }} disabled={demoteAdmin.isPending}>
                              <UserMinus className="h-4 w-4 mr-1" />Degradieren
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
