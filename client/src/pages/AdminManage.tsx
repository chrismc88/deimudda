import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { User } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, UserMinus, Crown } from "lucide-react";
import BackButton from "@/components/BackButton";
import { toast } from "sonner";

export default function AdminManage() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: allUsers } = trpc.admin.getAllUsers.useQuery(undefined, { staleTime: 60000 });
  const { data: admins, refetch: refetchAdmins } = trpc.admin.getAllAdmins.useQuery(undefined, { staleTime: 60000 });
  
  // Mutations
  const promoteToAdminMutation = trpc.admin.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Nutzer erfolgreich zum Admin ernannt");
      refetchAdmins();
      utils.auth.me.invalidate(); // Refresh session for affected user
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const demoteFromAdminMutation = trpc.admin.demoteFromAdmin.useMutation({
    onSuccess: () => {
      toast.success("Admin-Rechte erfolgreich entzogen");
      refetchAdmins();
      utils.auth.me.invalidate(); // Refresh session for affected user
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Check if user is super admin
  if (!user || user.role !== 'super_admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf die Admin-Verwaltung zuzugreifen. Nur Super-Admins können Admins ernennen oder entfernen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1 inline" />Super Admin</Badge>;
    }
    if (role === 'admin') {
      return <Badge className="bg-blue-100 text-blue-800"><Shield className="h-3 w-3 mr-1 inline" />Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  const handlePromote = (userId: number) => {
    if (confirm("Möchten Sie diesen Nutzer wirklich zum Admin ernennen?")) {
      promoteToAdminMutation.mutate(userId);
    }
  };

  const handleDemote = (userId: number) => {
    if (confirm("Möchten Sie diesem Nutzer wirklich die Admin-Rechte entziehen?")) {
      demoteFromAdminMutation.mutate(userId);
    }
  };

  // Get regular users (for promotion)
  const regularUsers = allUsers?.filter((u: User) => u.role === 'user') || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/admin" label="Zurück zum Dashboard" />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin-Verwaltung</h1>
            <p className="text-gray-600">Verwalten Sie Admin-Rechte (nur Super Admin)</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Super Admins</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {admins?.filter((a: User) => a.role === 'super_admin').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {admins?.filter((a: User) => a.role === 'admin').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-2xl">
              {admins?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Current Admins */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Aktuelle Admins
          </CardTitle>
          <CardDescription>Alle Nutzer mit Admin- oder Super-Admin-Rechten</CardDescription>
        </CardHeader>
        <CardContent>
          {admins && admins.length > 0 ? (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{admin.name || 'Unbekannt'}</h3>
                      {getRoleBadge(admin.role)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">ID:</span> {admin.id}</p>
                      <p><span className="font-medium">Email:</span> {admin.email || 'Keine Email'}</p>
                      <p><span className="font-medium">Erstellt:</span> {new Date(admin.createdAt).toLocaleDateString('de-DE')}</p>
                      <p><span className="font-medium">Letzter Login:</span> {new Date(admin.lastSignedIn).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {admin.role === 'admin' && admin.id !== user.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDemote(admin.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Rechte entziehen
                      </Button>
                    )}
                    
                    {admin.role === 'super_admin' && (
                      <Badge className="bg-purple-100 text-purple-800">
                        Kann nicht geändert werden
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Keine Admins gefunden</p>
          )}
        </CardContent>
      </Card>

      {/* Promote Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Nutzer zu Admin ernennen
          </CardTitle>
          <CardDescription>Wählen Sie einen Nutzer aus, um ihn zum Admin zu ernennen</CardDescription>
        </CardHeader>
        <CardContent>
          {regularUsers.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {regularUsers.map((u: User) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{u.name || 'Unbekannt'}</p>
                    <p className="text-sm text-gray-600">ID: {u.id} • {u.email || 'Keine Email'}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handlePromote(u.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Zum Admin ernennen
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Keine Nutzer zum Ernennen verfügbar</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

