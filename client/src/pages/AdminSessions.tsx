import { useState } from "react";
import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import AdminNav from "./AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Clock, Save, AlertCircle, Shield } from "lucide-react";
import { Label } from "../components/ui/label";

export default function AdminSessions() {
  const { user } = useAuth();
  const utils = trpc.useContext();

  const get = trpc.admin.getSystemSetting;
  const upd = trpc.admin.updateSystemSetting;

  const { data: sessionDaysStr } = get.useQuery('session_lifetime_days');
  const { data: ipBlockHoursStr } = get.useQuery('ip_block_duration_hours');
  const { data: maxAttemptsStr } = get.useQuery('max_login_attempts');
  const { data: suspiciousStr } = get.useQuery('suspicious_activity_threshold');
  const { data: notifRetentionStr } = get.useQuery('notification_retention_days');

  const [sessionDays, setSessionDays] = useState('');
  const [ipBlockHours, setIpBlockHours] = useState('');
  const [maxAttempts, setMaxAttempts] = useState('');
  const [suspicious, setSuspicious] = useState('');
  const [notifRetention, setNotifRetention] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const updateSetting = upd.useMutation({
    onSuccess: () => {
      setSuccess('Einstellungen gespeichert');
      utils.admin.getSystemSetting.invalidate();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  });

  if (sessionDaysStr && !sessionDays) setSessionDays(sessionDaysStr);
  if (ipBlockHoursStr && !ipBlockHours) setIpBlockHours(ipBlockHoursStr);
  if (maxAttemptsStr && !maxAttempts) setMaxAttempts(maxAttemptsStr);
  if (suspiciousStr && !suspicious) setSuspicious(suspiciousStr);
  if (notifRetentionStr && !notifRetention) setNotifRetention(notifRetentionStr);

  const handleSave = (key: string, raw: string) => {
    const parsed = parseInt(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError('Bitte gültige Zahl eingeben');
      setTimeout(() => setError(''), 3000);
      return;
    }
    updateSetting.mutate({ key, value: String(parsed) });
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="w-full max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>Super Admin erforderlich</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <AdminNav />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold">Sessions & Timeouts</h1>
            <Badge variant="destructive" className="ml-2">Super Admin Only</Badge>
          </div>
          <p className="text-gray-600">Sitzungsdauer, IP-Block und Aufbewahrungsfristen</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">✓ {success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sitzungen</CardTitle>
              <CardDescription>Wie lange Nutzer angemeldet bleiben</CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Session-Lebensdauer (Tage)</Label>
              <Input type="number" min="1" value={sessionDays} onChange={e=>setSessionDays(e.target.value)} />
              <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('session_lifetime_days', sessionDays)}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sicherheit</CardTitle>
              <CardDescription>IP-Block und Login Limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>IP-Block Dauer (Stunden)</Label>
                <Input type="number" min="0" value={ipBlockHours} onChange={e=>setIpBlockHours(e.target.value)} />
                <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('ip_block_duration_hours', ipBlockHours)}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
              </div>
              <div>
                <Label>Max. Login-Versuche</Label>
                <Input type="number" min="1" value={maxAttempts} onChange={e=>setMaxAttempts(e.target.value)} />
                <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('max_login_attempts', maxAttempts)}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
              </div>
              <div>
                <Label>Verdächtige Aktivität Schwelle</Label>
                <Input type="number" min="0" value={suspicious} onChange={e=>setSuspicious(e.target.value)} />
                <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('suspicious_activity_threshold', suspicious)}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aufbewahrung</CardTitle>
              <CardDescription>Benachrichtigungen automatisch aufräumen</CardDescription>
            </CardHeader>
            <CardContent>
              <Label>Retention (Tage)</Label>
              <Input type="number" min="0" value={notifRetention} onChange={e=>setNotifRetention(e.target.value)} />
              <Button className="mt-2" disabled={updateSetting.isPending} onClick={()=>handleSave('notification_retention_days', notifRetention)}><Save className="h-4 w-4 mr-2"/>Speichern</Button>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Diese Werte werden vom Server direkt verwendet (Sessions, Rate-Limits, Cleanup-Jobs).
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
