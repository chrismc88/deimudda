import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import BackButton from '@/components/BackButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Basic shape copied from server schema for typing hints (runtime types come from tRPC)
interface Offer {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  offerAmount: string; // stored as string decimal
  message?: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  counterAmount?: string | null;
  counterMessage?: string | null;
  expiresAt?: string | null;
  respondedAt?: string | null;
  createdAt?: string | null;
}

export default function OfferManagement() {
  // Pagination & Filter state
  const [incomingPage, setIncomingPage] = useState(1);
  const [minePage, setMinePage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilterIncoming, setStatusFilterIncoming] = useState<string>('');
  const [statusFilterMine, setStatusFilterMine] = useState<string>('');

  const incoming = trpc.offer.getIncoming.useQuery({ page: incomingPage, pageSize, status: statusFilterIncoming || undefined }, { keepPreviousData: true });
  const mine = trpc.offer.getMine.useQuery({ page: minePage, pageSize, status: statusFilterMine || undefined }, { keepPreviousData: true });
  const pending = trpc.offer.getPending.useQuery(undefined, { staleTime: 30_000 });

  const createMutation = trpc.offer.create.useMutation({
    onSuccess: () => {
      toast.success('Angebot erstellt');
      mine.refetch();
      setCreateOpen(false);
      setCreateForm({ listingId: '', amount: '', message: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const acceptMutation = trpc.offer.accept.useMutation({
    onSuccess: () => {
      toast.success('Angebot akzeptiert');
      incoming.refetch();
      pending.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectMutation = trpc.offer.reject.useMutation({
    onSuccess: () => {
      toast.success('Angebot abgelehnt');
      incoming.refetch();
      pending.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const counterMutation = trpc.offer.counter.useMutation({
    onSuccess: () => {
      toast.success('Gegenangebot gesendet');
      incoming.refetch();
      pending.refetch();
      setCounterOpen(false);
      setCounterForm({ offerId: null, amount: '', message: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const respondCounterMutation = trpc.offer.respondToCounter.useMutation({
    onSuccess: () => {
      toast.success('Reaktion gespeichert');
      mine.refetch();
      pending.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const [tab, setTab] = useState<'incoming' | 'mine' | 'actions' | 'create'>('incoming');
  const [createOpen, setCreateOpen] = useState(false);
  const [counterOpen, setCounterOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ listingId: '', amount: '', message: '' });
  const [counterForm, setCounterForm] = useState<{ offerId: number | null; amount: string; message: string }>({ offerId: null, amount: '', message: '' });

  const handleCreate = () => {
    const listingId = parseInt(createForm.listingId, 10);
    const amount = parseFloat(createForm.amount);
    if (!listingId || !amount) {
      toast.error('Listing-ID und Betrag erforderlich');
      return;
    }
    createMutation.mutate({ listingId, offerAmount: amount, message: createForm.message || undefined });
  };

  const handleCounter = () => {
    if (!counterForm.offerId) return;
    const amount = parseFloat(counterForm.amount);
    if (!amount) {
      toast.error('Gegen-Betrag erforderlich');
      return;
    }
    counterMutation.mutate({ offerId: counterForm.offerId, counterAmount: amount, counterMessage: counterForm.message || undefined });
  };

  const format = (value?: string | null) => {
    if (!value) return '-';
    return value;
  };

  const renderOfferRow = (o: Offer, role: 'seller' | 'buyer') => {
    const isPending = o.status === 'pending';
    const isCountered = o.status === 'countered';
    return (
      <div key={o.id} className="grid grid-cols-12 gap-2 py-2 border-b text-sm">
        <div className="col-span-1">#{o.id}</div>
        <div className="col-span-2">Listing {o.listingId}</div>
        <div className="col-span-2">{o.offerAmount} €</div>
        <div className="col-span-2">{format(o.counterAmount)}</div>
        <div className="col-span-2">
          <Badge variant={o.status === 'pending' ? 'outline' : o.status === 'accepted' ? 'default' : o.status === 'rejected' ? 'destructive' : 'secondary'}>
            {o.status}
          </Badge>
        </div>
        <div className="col-span-3 flex gap-2 justify-end">
          {role === 'seller' && isPending && (
            <>
              <Button size="xs" variant="default" onClick={() => acceptMutation.mutate({ offerId: o.id })} disabled={acceptMutation.isLoading}>Akzeptieren</Button>
              <Button size="xs" variant="secondary" onClick={() => rejectMutation.mutate({ offerId: o.id })} disabled={rejectMutation.isLoading}>Ablehnen</Button>
              <Button size="xs" variant="outline" onClick={() => { setCounterOpen(true); setCounterForm({ offerId: o.id, amount: '', message: '' }); }}>Gegenangebot</Button>
            </>
          )}
          {role === 'buyer' && isCountered && (
            <>
              <Button size="xs" variant="default" onClick={() => respondCounterMutation.mutate({ offerId: o.id, action: 'accept' })}>Annehmen</Button>
              <Button size="xs" variant="secondary" onClick={() => respondCounterMutation.mutate({ offerId: o.id, action: 'reject' })}>Ablehnen</Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton href="/seller/dashboard" label="Zurück" />
          <h1 className="text-2xl font-semibold">Offer Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'incoming' ? 'default' : 'outline'} onClick={() => setTab('incoming')}>Eingehend</Button>
          <Button variant={tab === 'mine' ? 'default' : 'outline'} onClick={() => setTab('mine')}>Ausgehend</Button>
          <Button variant={tab === 'actions' ? 'default' : 'outline'} onClick={() => setTab('actions')}>Aktionen</Button>
          <Button variant={tab === 'create' ? 'default' : 'outline'} onClick={() => setTab('create')}>Neu</Button>
        </div>
      </div>

      {tab === 'incoming' && (
        <Card>
          <CardHeader>
            <CardTitle>Eingehende Angebote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-xs">Status:</label>
                <select className="border rounded px-2 py-1 text-xs" value={statusFilterIncoming} onChange={e => { setStatusFilterIncoming(e.target.value); setIncomingPage(1); }}>
                  <option value="">Alle</option>
                  <option value="pending">pending</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                  <option value="countered">countered</option>
                  <option value="expired">expired</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs">PageSize:</label>
                <select className="border rounded px-2 py-1 text-xs" value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value, 10)); setIncomingPage(1); setMinePage(1); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 font-semibold border-b pb-2 text-xs">
              <div>#</div><div className="col-span-2">Listing</div><div className="col-span-2">Angebot</div><div className="col-span-2">Gegenangebot</div><div className="col-span-2">Status</div><div className="col-span-3 text-right">Aktionen</div>
            </div>
            {incoming.data?.items?.length ? incoming.data.items.map(o => renderOfferRow(o as any, 'seller')) : <p className="py-4 text-sm">Keine Angebote</p>}
            <div className="flex justify-between items-center mt-4 text-xs">
              <span>Seite {incomingPage} / {Math.max(1, Math.ceil((incoming.data?.total || 0) / pageSize))}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" disabled={incomingPage === 1} onClick={() => setIncomingPage(p => p - 1)}>Zurück</Button>
                <Button variant="outline" size="xs" disabled={(incoming.data?.total || 0) <= incomingPage * pageSize} onClick={() => setIncomingPage(p => p + 1)}>Weiter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'mine' && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Meine Angebote</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-xs">Status:</label>
                <select className="border rounded px-2 py-1 text-xs" value={statusFilterMine} onChange={e => { setStatusFilterMine(e.target.value); setMinePage(1); }}>
                  <option value="">Alle</option>
                  <option value="pending">pending</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                  <option value="countered">countered</option>
                  <option value="expired">expired</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 font-semibold border-b pb-2 text-xs">
              <div>#</div><div className="col-span-2">Listing</div><div className="col-span-2">Angebot</div><div className="col-span-2">Gegenangebot</div><div className="col-span-2">Status</div><div className="col-span-3 text-right">Aktionen</div>
            </div>
            {mine.data?.items?.length ? mine.data.items.map(o => renderOfferRow(o as any, 'buyer')) : <p className="py-4 text-sm">Keine Angebote</p>}
            <div className="flex justify-between items-center mt-4 text-xs">
              <span>Seite {minePage} / {Math.max(1, Math.ceil((mine.data?.total || 0) / pageSize))}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" disabled={minePage === 1} onClick={() => setMinePage(p => p - 1)}>Zurück</Button>
                <Button variant="outline" size="xs" disabled={(mine.data?.total || 0) <= minePage * pageSize} onClick={() => setMinePage(p => p + 1)}>Weiter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'actions' && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Aktionen erforderlich</CardTitle></CardHeader>
          <CardContent>
            <h3 className="text-sm font-medium mb-2">Als Verkäufer (pending)</h3>
            <div className="space-y-1 mb-4">
              {pending.data?.seller?.length ? pending.data.seller.map(o => renderOfferRow(o as any, 'seller')) : <p className="text-xs">Keine offenen Verkäufer-Aktionen</p>}
            </div>
            <Separator />
            <h3 className="text-sm font-medium my-2">Als Käufer (countered)</h3>
            <div className="space-y-1">
              {pending.data?.buyer?.length ? pending.data.buyer.map(o => renderOfferRow(o as any, 'buyer')) : <p className="text-xs">Keine offenen Käufer-Aktionen</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'create' && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Neues Angebot erstellen</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium">Listing ID</label>
              <Input value={createForm.listingId} onChange={e => setCreateForm(f => ({ ...f, listingId: e.target.value }))} placeholder="z.B. 12" />
            </div>
            <div>
              <label className="text-xs font-medium">Betrag (€)</label>
              <Input value={createForm.amount} onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} placeholder="z.B. 19.99" />
            </div>
            <div>
              <label className="text-xs font-medium">Nachricht (optional)</label>
              <Textarea value={createForm.message} onChange={e => setCreateForm(f => ({ ...f, message: e.target.value }))} rows={4} />
            </div>
            <Button onClick={handleCreate} disabled={createMutation.isLoading}>Angebot senden</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={counterOpen} onOpenChange={setCounterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gegenangebot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium">Neuer Betrag (€)</label>
              <Input value={counterForm.amount} onChange={e => setCounterForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium">Nachricht (optional)</label>
              <Textarea value={counterForm.message} onChange={e => setCounterForm(f => ({ ...f, message: e.target.value }))} rows={3} />
            </div>
            <Button onClick={handleCounter} disabled={counterMutation.isLoading}>Senden</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
