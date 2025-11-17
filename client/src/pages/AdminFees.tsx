import { useEffect, useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import AdminNav from "./AdminNav";
import BackButton from "@/components/BackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { DollarSign, Save, RefreshCw, Shield, AlertCircle } from "lucide-react";
import { Label } from "../components/ui/label";

export default function AdminFees() {
  const { user } = useAuth();
  const utils = trpc.useContext();
  
  // Load current settings
  const { data: platformFeeStr } = trpc.admin.getSystemSetting.useQuery('platform_fee_fixed');
  const { data: paypalPercStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_percentage');
  const { data: paypalFixedStr } = trpc.admin.getSystemSetting.useQuery('paypal_fee_fixed');
  
  // Local state for editing
  const [platformFee, setPlatformFee] = useState('');
  const [paypalPerc, setPaypalPerc] = useState('');
  const [paypalFixed, setPaypalFixed] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Update mutation
  const updateSetting = trpc.admin.updateSystemSetting.useMutation({
    onSuccess: () => {
      setSuccess('Gebühren erfolgreich aktualisiert!');
      utils.admin.getSystemSetting.invalidate();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  });
  
  // Initialize form values when data loads
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    if (platformFeeStr === undefined || paypalPercStr === undefined || paypalFixedStr === undefined) {
      return;
    }
    setPlatformFee(platformFeeStr || "");
    setPaypalPerc(paypalPercStr || "");
    setPaypalFixed(paypalFixedStr || "");
    setInitialized(true);
  }, [initialized, platformFeeStr, paypalPercStr, paypalFixedStr]);
  
  const handleSave = async (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setError('Bitte gültige positive Zahl eingeben');
      setTimeout(() => setError(''), 3000);
      return;
    }
    updateSetting.mutate({ key, value });
  };
  
  // Check if user is super admin
  if (user?.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Super Admin access required to manage fees.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Calculate example with current values
  const examplePrice = 20;
  const calcPlatformFee = parseFloat(platformFee || '0');
  const calcPaypalPerc = parseFloat(paypalPerc || '0') / 100;
  const calcPaypalFixed = parseFloat(paypalFixed || '0');
  const calcPaypalTotal = examplePrice * calcPaypalPerc + calcPaypalFixed;
  const calcTotal = calcPlatformFee + calcPaypalTotal;
  const sellerReceives = examplePrice - calcTotal;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton href="/admin" label="Zurück zum Dashboard" />
        <AdminNav />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold">Gebühren-Verwaltung</h1>
            <Badge variant="destructive" className="ml-2">Super Admin Only</Badge>
          </div>
          <p className="text-gray-600">
            Passe Plattform- und PayPal-Gebühren an
          </p>
        </div>
        
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              ✓ {success}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6">
          {/* Platform Fee */}
          <Card>
            <CardHeader>
              <CardTitle>Plattformgebühr (fix)</CardTitle>
              <CardDescription>
                Fixe Gebühr in Euro, die bei jedem Verkauf anfällt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="platform-fee">Betrag (€)</Label>
                    <Input
                      id="platform-fee"
                      type="number"
                      step="0.01"
                      min="0"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(e.target.value)}
                      placeholder="0.42"
                    />
                  </div>
                  <Button 
                    onClick={() => handleSave('platform_fee_fixed', platformFee)}
                    disabled={updateSetting.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Aktuell: <span className="font-bold">€{parseFloat(platformFee || '0').toFixed(2)}</span> pro Artikel
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* PayPal Percentage Fee */}
          <Card>
            <CardHeader>
              <CardTitle>PayPal Prozentgebühr</CardTitle>
              <CardDescription>
                Prozentsatz der Transaktionssumme (offizieller PayPal-Satz)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="paypal-perc">Prozentsatz (%)</Label>
                    <Input
                      id="paypal-perc"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={paypalPerc}
                      onChange={(e) => setPaypalPerc(e.target.value)}
                      placeholder="2.49"
                    />
                  </div>
                  <Button 
                    onClick={() => handleSave('paypal_fee_percentage', paypalPerc)}
                    disabled={updateSetting.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Aktuell: <span className="font-bold">{parseFloat(paypalPerc || '0').toFixed(2)}%</span> der Transaktionssumme
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* PayPal Fixed Fee */}
          <Card>
            <CardHeader>
              <CardTitle>PayPal Fixgebühr</CardTitle>
              <CardDescription>
                Fester Betrag pro Transaktion (offizieller PayPal-Satz)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Label htmlFor="paypal-fixed">Betrag (€)</Label>
                    <Input
                      id="paypal-fixed"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paypalFixed}
                      onChange={(e) => setPaypalFixed(e.target.value)}
                      placeholder="0.49"
                    />
                  </div>
                  <Button 
                    onClick={() => handleSave('paypal_fee_fixed', paypalFixed)}
                    disabled={updateSetting.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Aktuell: <span className="font-bold">€{parseFloat(paypalFixed || '0').toFixed(2)}</span> pro Transaktion
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Example Calculation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Beispiel-Rechnung</CardTitle>
              <CardDescription>
                Bei einem Artikel-Preis von €{examplePrice.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Artikel-Preis:</span>
                  <span className="font-semibold">€{examplePrice.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plattformgebühr:</span>
                    <span className="text-red-600 font-semibold">-€{calcPlatformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">PayPal-Gebühren:</span>
                    <span className="text-red-600 font-semibold">-€{calcPaypalTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    ({examplePrice} × {(calcPaypalPerc * 100).toFixed(2)}% + €{calcPaypalFixed.toFixed(2)})
                  </div>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Verkäufer erhält:</span>
                    <span className="text-green-600">€{sellerReceives.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Hinweis:</strong> Änderungen werden sofort auf der gesamten Plattform wirksam.
              Die Gebühren werden in Echtzeit aus den System Settings geladen.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
