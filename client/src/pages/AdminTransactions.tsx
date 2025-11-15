import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Transaction } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, Filter, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function AdminTransactions() {
  const { user } = useAuth();
  const { data: transactions } = trpc.admin.getAllTransactions.useQuery(undefined, { staleTime: 60000 });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Check if user is admin
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Zugriff verweigert</CardTitle>
            <CardDescription className="text-red-600">
              Sie haben keine Berechtigung, auf die Transaktions-Überwachung zuzugreifen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter transactions
  const filteredTransactions = transactions?.filter((tx: any) => {
    const matchesSearch = searchQuery === "" || 
      tx.id.toString().includes(searchQuery) ||
      tx.listingId.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24));
      
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
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate stats
  const totalRevenue = transactions?.reduce((sum: number, tx: any) => 
    tx.status === 'completed' ? sum + (Number(tx.totalAmount) || 0) : sum, 0) || 0;
  
  const totalFees = transactions?.reduce((sum: number, tx: any) => 
    tx.status === 'completed' ? sum + (Number(tx.platformFee) || 0) : sum, 0) || 0;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-800" },
      completed: { label: "Abgeschlossen", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Storniert", className: "bg-gray-100 text-gray-800" },
      refunded: { label: "Erstattet", className: "bg-blue-100 text-blue-800" },
    };
    
    const badge = badges[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={badge.className}>{badge.label}</Badge>;
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
      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaktions-Überwachung</h1>
            <p className="text-gray-600">Überwachen Sie alle Zahlungen und Gebühren</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Gesamtumsatz
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">
              €{totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Plattformgebühren
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              €{totalFees.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Transaktionen</CardDescription>
            <CardTitle className="text-2xl">{transactions?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Abgeschlossen</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {transactions?.filter((t: any) => t.status === 'completed').length || 0}
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
                  placeholder="Transaktions-ID, Listing-ID..."
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
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                  <SelectItem value="refunded">Erstattet</SelectItem>
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
                setStatusFilter("all");
                setDateFilter("all");
              }}
            >
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transaktionen ({filteredTransactions?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((tx: any) => (
                <div key={tx.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">Transaktion #{tx.id}</h3>
                        {getStatusBadge(tx.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Listing-ID: {tx.listingId}</p>
                        <p>Käufer-ID: {tx.buyerId} | Verkäufer-ID: {tx.sellerId}</p>
                        <p>Menge: {tx.quantity}</p>
                        <p>Datum: {new Date(tx.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">Gesamtbetrag</p>
                        <p className="text-lg font-bold text-gray-900">
                          €{parseFloat(tx.totalAmount || "0").toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="text-blue-600 font-medium">
                          Plattformgebühr: €{parseFloat(tx.platformFee || "0").toFixed(2)}
                        </p>
                        <p className="text-green-600 font-medium">
                          Verkäufer: €{parseFloat(tx.sellerAmount || "0").toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {tx.stripeChargeId && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Stripe Charge ID: {tx.stripeChargeId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Transaktionen gefunden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}