import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WhatsAppSessionMonitor from '@/components/examples/WhatsAppSessionMonitor';
import { ArrowLeft, Power, PowerOff, LogOut, Edit, Trash2 } from 'lucide-react';
import type { WhatsAppSession, WhatsAppMessage } from '@/services/whatsapp-api.service';

interface Props {
  session: WhatsAppSession;
  recentMessages: WhatsAppMessage[];
}

export default function SessionShow({ session, recentMessages }: Props) {
  // DEBUG: Cek sessionId
  console.log('🔍 SessionShow - session data:', {
    id: session.id,
    session_id: session.session_id,
    status: session.status,
    name: session.name,
  });

  // Track if WebSocket is connected (via child component communication)
  const [wsConnected, setWsConnected] = React.useState(false);
  const hasAutoConnected = React.useRef(false);

  // Auto-connect once WebSocket is ready
  React.useEffect(() => {
    // Only auto-connect if:
    // 1. Session needs connection (disconnected or qr_pending)
    // 2. WebSocket is connected
    // 3. Haven't already auto-connected (prevent loops)
    if (
      (session.status === 'disconnected' || session.status === 'qr_pending') &&
      wsConnected &&
      !hasAutoConnected.current
    ) {
      hasAutoConnected.current = true;
      console.log('🔄 Auto-connecting session to generate fresh QR code...');

      // Small delay to ensure WebSocket subscription is complete
      setTimeout(() => {
        router.post(`/admin/whatsapp/sessions/${session.id}/connect`, {}, {
          preserveScroll: true,
          preserveState: true,
          onError: (errors) => {
            console.error('❌ Connect failed:', errors);
            hasAutoConnected.current = false; // Allow retry on error
          },
        });
      }, 300);
    }
  }, [wsConnected, session.status, session.id]); // Re-run when WebSocket status changes

  const handleConnect = () => {
    router.post(`/admin/whatsapp/sessions/${session.id}/connect`, {}, {
      preserveScroll: true,
    });
  };

  const handleDisconnect = () => {
    if (confirm('Apakah Anda yakin ingin memutuskan session ini?')) {
      router.post(`/admin/whatsapp/sessions/${session.id}/disconnect`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus session ini? Tindakan ini tidak dapat dibatalkan.')) {
      router.delete(`/admin/whatsapp/sessions/${session.id}`);
    }
  };

  return (
    <AdminLayout>
      <Head title={`Session: ${session.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/admin/whatsapp/sessions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{session.name}</h1>
              <p className="text-gray-600 mt-1">
                Session ID: <code className="text-sm">{session.session_id}</code>
              </p>
            </div>

            <div className="flex gap-2">
              {session.status === 'disconnected' && (
                <Button onClick={handleConnect} variant="default">
                  <Power className="h-4 w-4 mr-2" />
                  Hubungkan
                </Button>
              )}
              {session.status === 'connected' && (
                <Button onClick={handleDisconnect} variant="outline">
                  <PowerOff className="h-4 w-4 mr-2" />
                  Putuskan
                </Button>
              )}
              <Link href={`/admin/whatsapp/sessions/${session.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={session.status === 'connected' ? 'default' : 'secondary'}>
                {session.status === 'connected' ? 'Terhubung' :
                 session.status === 'connecting' ? 'Menghubungkan...' :
                 'Terputus'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Nomor WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {session.phone_number || 'Belum terhubung'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Terakhir Terhubung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {session.last_connected_at
                  ? new Date(session.last_connected_at).toLocaleString('id-ID')
                  : 'Belum pernah'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Session Monitor */}
        <WhatsAppSessionMonitor
          sessionId={session.session_id}
          sessionDbId={session.id}
          sessionName={session.name}
          initialQrCode={session.qr_code || null}
          initialStatus={session.status}
          initialPhoneNumber={session.phone_number || null}
          onWebSocketConnected={(connected) => {
            console.log('🔌 WebSocket connection status changed:', connected);
            setWsConnected(connected);
          }}
          onConnected={() => {
            // Refresh page data when connected
            router.reload({ only: ['session'] });
          }}
          onDisconnected={() => {
            // Refresh page data when disconnected
            router.reload({ only: ['session'] });
          }}
        />
      </div>
    </AdminLayout>
  );
}
