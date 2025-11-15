import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { AdminLog } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter } from "lucide-react";
import BackButton from "@/components/BackButton";

export default function AdminLogs() {
  const { user } = useAuth();
  const { data: logs } = trpc.admin.getAdminLogs.useQuery(undefined, { staleTime: 60000 });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf die Admin-Logs zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter logs
  const filteredLogs = logs?.filter((log) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Action filter
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const logDate = new Date(log.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const getActionBadge = (action: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      warn_user: { label: "Verwarnung", className: "bg-yellow-100 text-yellow-800" },
      suspend_user: { label: "Sperrung", className: "bg-orange-100 text-orange-800" },
      ban_user: { label: "Bann", className: "bg-red-100 text-red-800" },
      remove_warning: { label: "Verwarnung aufgehoben", className: "bg-green-100 text-green-800" },
      promote_admin: { label: "Admin ernannt", className: "bg-purple-100 text-purple-800" },
      demote_admin: { label: "Admin entzogen", className: "bg-gray-100 text-gray-800" },
    };
    
    const badge = badges[action] || { label: action, className: "bg-gray-100 text-gray-800" };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getTargetTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      user: { label: "Nutzer", className: "bg-blue-100 text-blue-800" },
      listing: { label: "Listing", className: "bg-green-100 text-green-800" },
      transaction: { label: "Transaktion", className: "bg-purple-100 text-purple-800" },
    };
    
    const badge = badges[type] || { label: type, className: "bg-gray-100 text-gray-800" };
    return <Badge variant="outline" className={badge.className}>{badge.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/admin" label="Zurück zum Dashboard" />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-pink-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin-Logs</h1>
            <p className="text-gray-600">Audit Trail aller Admin-Aktionen</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-2xl">{logs?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Heute</CardDescription>
            <CardTitle className="text-2xl">
              {logs?.filter((l: AdminLog) => {
                const logDate = new Date(l.createdAt);
                const today = new Date();
                return logDate.toDateString() === today.toDateString();
              }).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Diese Woche</CardDescription>
            <CardTitle className="text-2xl">
              {logs?.filter((l: AdminLog) => {
                const logDate = new Date(l.createdAt);
                const now = new Date();
                const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 7;
              }).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dieser Monat</CardDescription>
            <CardTitle className="text-2xl">
              {logs?.filter((l: AdminLog) => {
                const logDate = new Date(l.createdAt);
                const now = new Date();
                const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 30;
              }).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Suche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Details, Admin-Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Aktion</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktionen</SelectItem>
                  <SelectItem value="warn_user">Verwarnung</SelectItem>
                  <SelectItem value="suspend_user">Sperrung</SelectItem>
                  <SelectItem value="ban_user">Bann</SelectItem>
                  <SelectItem value="remove_warning">Verwarnung aufgehoben</SelectItem>
                  <SelectItem value="promote_admin">Admin ernannt</SelectItem>
                  <SelectItem value="demote_admin">Admin entzogen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Zeitraum</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="today">Heute</SelectItem>
                  <SelectItem value="week">Diese Woche</SelectItem>
                  <SelectItem value="month">Dieser Monat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setActionFilter("all");
                setDateFilter("all");
              }}
            >
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitäts-Log ({filteredLogs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs && filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log: AdminLog) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionBadge(log.action)}
                        {getTargetTypeBadge(log.targetType)}
                        <span className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Admin: {log.adminName || 'Unbekannt'}</span>
                        <span>Ziel-ID: {log.targetId}</span>
                        <span>Log-ID: {log.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Keine Logs gefunden</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

