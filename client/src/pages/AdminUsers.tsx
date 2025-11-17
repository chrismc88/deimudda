import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { User } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminNav from "./AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search,
  AlertTriangle,
  Ban,
  UserX,
  Shield,
  CheckCircle,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminUsers() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, refetch } = trpc.admin.getAllUsers.useQuery(undefined, { staleTime: 60000 });
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [warnDialogOpen, setWarnDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [warningsDialogOpen, setWarningsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Form states
  const [warnReason, setWarnReason] = useState("tos_violation");
  const [warnMessage, setWarnMessage] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState("7");
  const [banReason, setBanReason] = useState("");

  // Mutations - MUST be declared before any conditional returns
  const warnUserMutation = trpc.admin.warnUser.useMutation({
    onSuccess: () => {
      toast.success("Nutzer wurde erfolgreich verwarnt");
      refetch();
      setWarnDialogOpen(false);
      setWarnMessage("");
      setWarnReason("tos_violation");
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Fehler beim Verwarnen: ${error.message}`);
      console.error("Warn user error:", error);
    },
  });

  const suspendUserMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("Nutzer wurde erfolgreich gesperrt");
      refetch();
      setSuspendDialogOpen(false);
      setSuspendReason("");
      setSuspendDays("7");
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Fehler beim Sperren: ${error.message}`);
    },
  });

  const banUserMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => {
      toast.success("Nutzer wurde erfolgreich gebannt");
      refetch();
      setBanDialogOpen(false);
      setBanReason("");
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Fehler beim Bannen: ${error.message}`);
    },
  });

  const unsuspendUserMutation = trpc.admin.unsuspendUser.useMutation({
    onSuccess: () => {
      toast.success("Sperrung wurde erfolgreich aufgehoben");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Entsperren: ${error.message}`);
    },
  });

  const unbanUserMutation = trpc.admin.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("Bann wurde erfolgreich aufgehoben");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Entbannen: ${error.message}`);
    },
  });

  const promoteToAdminMutation = trpc.admin.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Nutzer wurde erfolgreich zum Admin ernannt");
      refetch();
      setPromoteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Fehler beim Ernennen: ${error.message}`);
    },
  });

  const demoteFromAdminMutation = trpc.admin.demoteFromAdmin.useMutation({
    onSuccess: () => {
      toast.success("Admin-Rechte wurden erfolgreich entzogen");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler beim Entziehen: ${error.message}`);
    },
  });

  // Check if user is admin or super_admin (after all hooks)
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf die Nutzer-Verwaltung zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users?.filter((u: any) => {
    const matchesSearch = searchQuery === "" || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  // Helper functions
  const handleWarnDialogOpenChange = (open: boolean) => {
    setWarnDialogOpen(open);
    if (!open) {
      setWarnMessage("");
      setWarnReason("tos_violation");
      setSelectedUser(null);
    }
  };

  const handleSuspendDialogOpenChange = (open: boolean) => {
    setSuspendDialogOpen(open);
    if (!open) {
      setSuspendReason("");
      setSuspendDays("7");
      setSelectedUser(null);
    }
  };

  const handleBanDialogOpenChange = (open: boolean) => {
    setBanDialogOpen(open);
    if (!open) {
      setBanReason("");
      setSelectedUser(null);
    }
  };

  const handlePromoteDialogOpenChange = (open: boolean) => {
    setPromoteDialogOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const openWarnDialog = (targetUser: any) => {
    setSelectedUser(targetUser);
    setWarnDialogOpen(true);
  };

  const openSuspendDialog = (targetUser: any) => {
    setSelectedUser(targetUser);
    setSuspendDialogOpen(true);
  };

  const openBanDialog = (targetUser: any) => {
    setSelectedUser(targetUser);
    setBanDialogOpen(true);
  };

  const openPromoteDialog = (targetUser: any) => {
    setSelectedUser(targetUser);
    setPromoteDialogOpen(true);
  };

  const handleWarnUser = () => {
    if (!selectedUser || !warnMessage.trim()) {
      toast.error("Bitte geben Sie eine Warnung ein");
      return;
    }

    warnUserMutation.mutate({
      userId: selectedUser.id,
      reason: warnReason as any,
      message: warnMessage.trim(),
    });
  };

  const handleSuspendUser = () => {
    if (!selectedUser || !suspendReason.trim()) {
      toast.error("Bitte geben Sie einen Grund für die Sperrung ein");
      return;
    }

    suspendUserMutation.mutate({
      userId: selectedUser.id,
      reason: suspendReason.trim(),
      days: parseInt(suspendDays, 10),
    });
  };

  const handleBanUser = () => {
    if (!selectedUser || !banReason.trim()) {
      toast.error("Bitte geben Sie einen Grund für den Bann ein");
      return;
    }

    banUserMutation.mutate({
      userId: selectedUser.id,
      reason: banReason.trim(),
    });
  };

  const handlePromoteToAdmin = () => {
    if (!selectedUser) return;

    promoteToAdminMutation.mutate(selectedUser.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Aktiv</Badge>;
      case 'warned':
        return <Badge className="bg-yellow-600">Verwarnt</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-600">Gesperrt</Badge>;
      case 'banned':
        return <Badge className="bg-red-600">Gebannt</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-600">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600">Admin</Badge>;
      case 'user':
        return <Badge variant="outline">Nutzer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            ← Zurück zum Admin-Dashboard
          </Button>
        </Link>
      </div>

      <AdminNav />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nutzer-Verwaltung</h1>
          <p className="text-gray-600 mt-2">
            Verwalten Sie alle Plattform-Nutzer und deren Berechtigungen
          </p>
        </div>
        <Users className="h-12 w-12 text-blue-600" />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Suche nach Name oder E-Mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rolle filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="user">Nutzer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="warned">Verwarnt</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
                <SelectItem value="banned">Gebannt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Nutzer ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Nutzer gefunden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((targetUser: any) => (
                <div key={targetUser.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{targetUser.name || 'Unbekannt'}</h3>
                          {getRoleBadge(targetUser.role)}
                          {getStatusBadge(targetUser.status || 'active')}
                        </div>
                        <p className="text-sm text-gray-600">{targetUser.email}</p>
                        <p className="text-xs text-gray-500">
                          Registriert: {new Date(targetUser.createdAt).toLocaleDateString('de-DE')}
                        </p>
                        {targetUser.warningCount > 0 && (
                          <p className="text-xs text-yellow-600">
                            Warnungen: {targetUser.warningCount}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Admin Actions */}
                      {targetUser.id !== user.id && (
                        <>
                          {targetUser.status !== 'banned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openWarnDialog(targetUser)}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
                              Verwarnen
                            </Button>
                          )}

                          {targetUser.status === 'suspended' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unsuspendUserMutation.mutate(targetUser.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Entsperren
                            </Button>
                          ) : targetUser.status !== 'banned' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSuspendDialog(targetUser)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <Clock className="h-4 w-4" />
                              Sperren
                            </Button>
                          )}

                          {targetUser.status === 'banned' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unbanUserMutation.mutate(targetUser.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Entbannen
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openBanDialog(targetUser)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Ban className="h-4 w-4" />
                              Bannen
                            </Button>
                          )}

                          {/* Super Admin only */}
                          {user.role === 'super_admin' && (
                            <>
                              {targetUser.role === 'user' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openPromoteDialog(targetUser)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Shield className="h-4 w-4" />
                                  Zum Admin
                                </Button>
                              ) : targetUser.role === 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => demoteFromAdminMutation.mutate(targetUser.id)}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  <UserX className="h-4 w-4" />
                                  Entziehen
                                </Button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warn User Dialog */}
      <Dialog open={warnDialogOpen} onOpenChange={handleWarnDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nutzer verwarnen</DialogTitle>
            <DialogDescription>
              Verwarnen Sie {selectedUser?.name} wegen eines Regelverstoßes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Grund</Label>
              <Select value={warnReason} onValueChange={setWarnReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tos_violation">Nutzungsbedingungen verletzt</SelectItem>
                  <SelectItem value="fraud">Betrug</SelectItem>
                  <SelectItem value="harassment">Belästigung</SelectItem>
                  <SelectItem value="fake_listing">Fake-Angebot</SelectItem>
                  <SelectItem value="illegal_products">Illegale Produkte</SelectItem>
                  <SelectItem value="non_delivery">Nicht geliefert</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nachricht an den Nutzer</Label>
              <Textarea
                placeholder="Erklären Sie dem Nutzer, warum er verwarnt wird..."
                value={warnMessage}
                onChange={(e) => setWarnMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleWarnDialogOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleWarnUser}
              disabled={warnUserMutation.isPending || !warnMessage.trim()}
            >
              {warnUserMutation.isPending ? "Wird verwarnt..." : "Verwarnen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={handleSuspendDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nutzer temporär sperren</DialogTitle>
            <DialogDescription>
              Sperren Sie {selectedUser?.name} für eine bestimmte Anzahl von Tagen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dauer (Tage)</Label>
              <Select value={suspendDays} onValueChange={setSuspendDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Tag</SelectItem>
                  <SelectItem value="3">3 Tage</SelectItem>
                  <SelectItem value="7">1 Woche</SelectItem>
                  <SelectItem value="14">2 Wochen</SelectItem>
                  <SelectItem value="30">1 Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grund</Label>
              <Textarea
                placeholder="Grund für die temporäre Sperrung..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleSuspendDialogOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSuspendUser}
              disabled={suspendUserMutation.isPending || !suspendReason.trim()}
            >
              {suspendUserMutation.isPending ? "Wird gesperrt..." : "Sperren"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={handleBanDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nutzer permanent bannen</DialogTitle>
            <DialogDescription>
              ⚠️ Bannen Sie {selectedUser?.name} permanent von der Plattform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Grund</Label>
              <Textarea
                placeholder="Grund für den permanenten Bann..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleBanDialogOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleBanUser}
              disabled={banUserMutation.isPending || !banReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {banUserMutation.isPending ? "Wird gebannt..." : "Permanent bannen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promote to Admin Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={handlePromoteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zum Admin ernennen</DialogTitle>
            <DialogDescription>
              Ernennen Sie {selectedUser?.name} zum Admin mit erweiterten Berechtigungen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Admin-Berechtigungen:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Nutzer verwarnen, sperren und bannen</li>
                <li>• Listings moderieren und löschen</li>
                <li>• Transaktionen einsehen</li>
                <li>• Reports bearbeiten</li>
                <li>• System-Logs einsehen</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handlePromoteToAdmin}
              disabled={promoteToAdminMutation.isPending}
            >
              {promoteToAdminMutation.isPending ? "Wird ernannt..." : "Zum Admin ernennen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}