import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import type { Transaction } from "@/../../shared/types";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/BackButton";
import { Euro, TrendingUp, ShoppingBag, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SellerTransactions() {
  const { user } = useAuth();
  const { data: transactions, isLoading, error } = trpc.transaction.getSellerTransactions.useQuery(undefined, { staleTime: 60000 });
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed', { staleTime: 300000 }); // 5min cache
  const { data: paypalFeePercentageStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_percentage', { staleTime: 300000 });
  const { data: paypalFeeFixedStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_fixed', { staleTime: 300000 });
  
  const PLATFORM_FEE = parseFloat(platformFeeStr || "0.42");
  const paypalPercentage = parseFloat(paypalFeePercentageStr || "2.49") / 100; // Convert to decimal
  const paypalFixed = parseFloat(paypalFeeFixedStr || "0.49");

  // Calculate statistics
  const totalSales = transactions?.length || 0;
  const totalRevenue = transactions?.reduce((sum, t) => sum + t.totalPrice, 0) || 0;
  const totalPlatformFees = totalSales * PLATFORM_FEE;
  const totalPaymentFees = transactions?.reduce((sum, t) => sum + (parseFloat(t.paymentFee || "0")), 0) || 0;
  const totalFees = totalPlatformFees + totalPaymentFees;
  const netRevenue = totalRevenue - totalFees;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Abgeschlossen</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Ausstehend</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Storniert</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <BackButton href="/seller/dashboard" label="Zurück zum Verkäufer-Dashboard" />
        
        <h1 className="text-3xl font-bold mb-6">Meine Verkäufe & Gebühren</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt-Verkäufe</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt-Umsatz</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt-Gebühren</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-€{totalFees.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                PayPal: -€{totalPaymentFees.toFixed(2)} | Plattform: -€{totalPlatformFees.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Netto-Einnahmen</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{netRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Gebühren-Struktur:</strong> PayPal-Gebühren ({(paypalPercentage * 100).toFixed(2)}% + €{paypalFixed.toFixed(2)}) + Plattform-Gebühr (€{PLATFORM_FEE.toFixed(2)}) werden automatisch bei Online-Zahlungen abgezogen. 
            Bei Offline-Zahlungen wird die Plattform-Gebühr monatlich abgerechnet.
          </AlertDescription>
        </Alert>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Verkäufe</CardTitle>
            <CardDescription>
              Übersicht über alle Ihre abgeschlossenen und ausstehenden Verkäufe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Lade Transaktionen...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Fehler beim Laden der Transaktionen: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {!isLoading && !error && transactions && transactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Sie haben noch keine Verkäufe getätigt.</p>
              </div>
            )}

            {!isLoading && !error && transactions && transactions.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Datum</th>
                      <th className="text-left py-3 px-4">Käufer</th>
                      <th className="text-left py-3 px-4">Artikel</th>
                      <th className="text-right py-3 px-4">Brutto</th>
                      <th className="text-right py-3 px-4">PayPal</th>
                      <th className="text-right py-3 px-4">Plattform</th>
                      <th className="text-right py-3 px-4">Netto</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction: Transaction) => {
                      const paymentFee = parseFloat(transaction.paymentFee || "0");
                      const netAmount = transaction.totalPrice - paymentFee - PLATFORM_FEE;
                      
                      return (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {new Date(transaction.createdAt).toLocaleDateString('de-DE')}
                          </td>
                          <td className="py-3 px-4">
                            {transaction.buyer?.name || 'Unbekannt'}
                          </td>
                          <td className="py-3 px-4">
                            {transaction.listing?.strain || 'Gelöscht'}
                          </td>
                          <td className="text-right py-3 px-4">
                            €{transaction.totalPrice.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-red-600">
                            -€{paymentFee.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 text-red-600">
                            -€{PLATFORM_FEE.toFixed(2)}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-green-600">
                            €{netAmount.toFixed(2)}
                          </td>
                          <td className="text-center py-3 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

