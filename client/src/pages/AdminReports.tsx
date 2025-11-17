import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Report } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import AdminNav from "./AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react";
import BackButton from "@/components/BackButton";
import { toast } from "sonner";

export default function AdminReports() {
  const { user } = useAuth();
  const { data: reports, refetch } = trpc.admin.getAllReports.useQuery(undefined, { staleTime: 60000 });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  // Mutations
  const updateStatusMutation = trpc.admin.updateReportStatus.useMutation({
    onSuccess: () => {
      toast.success("Report-Status aktualisiert");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf die Report-Verwaltung zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter reports
  const filteredReports = reports?.filter((report) => {
    const matchesSearch = searchQuery === "" || 
      report.reporterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.targetType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-800" },
      reviewing: { label: "In Bearbeitung", className: "bg-blue-100 text-blue-800" },
      resolved: { label: "Gelöst", className: "bg-green-100 text-green-800" },
      dismissed: { label: "Abgelehnt", className: "bg-gray-100 text-gray-800" },
    };
    
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      user: { label: "Nutzer", className: "bg-purple-100 text-purple-800" },
      listing: { label: "Listing", className: "bg-blue-100 text-blue-800" },
      review: { label: "Bewertung", className: "bg-green-100 text-green-800" },
    };
    
    const badge = badges[type] || { label: type, className: "bg-gray-100 text-gray-800" };
    return <Badge variant="outline" className={badge.className}>{badge.label}</Badge>;
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      spam: "Spam",
      inappropriate: "Unangemessener Inhalt",
      fraud: "Betrug",
      harassment: "Belästigung",
      fake: "Fake/Falsch",
      illegal: "Illegal",
      other: "Sonstiges",
    };
    return reasons[reason] || reason;
  };

  const handleStatusChange = (reportId: number, newStatus: 'pending' | 'reviewing' | 'resolved' | 'dismissed') => {
    updateStatusMutation.mutate({
      reportId,
      status: newStatus,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton href="/admin" label="Zurück zum Dashboard" />
      
      <AdminNav />
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report-Verwaltung</h1>
            <p className="text-gray-600">Bearbeiten Sie Nutzer-Meldungen</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gesamt</CardDescription>
            <CardTitle className="text-2xl">{reports?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ausstehend</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {reports?.filter((r: Report) => r.status === 'pending').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Bearbeitung</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {reports?.filter((r: Report) => r.status === 'reviewing').length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gelöst</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {reports?.filter((r: Report) => r.status === 'resolved').length || 0}
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
                  placeholder="Reporter, Beschreibung..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="reviewing">In Bearbeitung</SelectItem>
                  <SelectItem value="resolved">Gelöst</SelectItem>
                  <SelectItem value="dismissed">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Typ</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="user">Nutzer</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                  <SelectItem value="review">Bewertung</SelectItem>
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
                setStatusFilter("all");
                setTypeFilter("all");
              }}
            >
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports && filteredReports.length > 0 ? (
          filteredReports.map((report: Report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        Report #{report.id}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-medium">Grund:</span> {getReasonLabel(report.reason)}</p>
                      <p><span className="font-medium">Nachricht:</span> {report.message || 'Keine Nachricht'}</p>
                      <p><span className="font-medium">Reporter:</span> ID: {report.reporterId}</p>
                      <p><span className="font-medium">Ziel:</span> {report.reportedType} ID: {report.reportedId}</p>
                      <p><span className="font-medium">Erstellt:</span> {new Date(report.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                      {report.reviewedAt && (
                        <p><span className="font-medium">Bearbeitet:</span> {new Date(report.reviewedAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {report.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(report.id, 'reviewing')}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                    )}
                    
                    {report.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(report.id, 'resolved')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Lösen
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(report.id, 'dismissed')}
                          className="text-gray-600 border-gray-600 hover:bg-gray-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Ablehnen
                        </Button>
                      </>
                    )}
                    
                    {report.reportedType === 'listing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/listing/${report.reportedId}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ansehen
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-gray-500 text-center">Keine Reports gefunden</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

