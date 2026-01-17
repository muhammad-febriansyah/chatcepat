import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle2, XCircle, AlertCircle, Plus, ArrowRight } from 'lucide-react';

interface WhatsAppSession {
  id: number;
  name: string;
  status: string;
  phone_number: string | null;
}

interface WhatsAppStatusWidgetProps {
  sessions: WhatsAppSession[];
}

export function WhatsAppStatusWidget({ sessions }: WhatsAppStatusWidgetProps) {
  const totalSessions = sessions.length;
  const connectedSessions = sessions.filter(s => s.status === 'connected').length;
  const disconnectedSessions = sessions.filter(s => s.status === 'disconnected').length;
  const pendingSessions = sessions.filter(s => s.status === 'qr_pending').length;

  const hasConnectedSession = connectedSessions > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <CardTitle>WhatsApp Status</CardTitle>
          </div>
          {hasConnectedSession ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Terhubung
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Tidak Terhubung
            </Badge>
          )}
        </div>
        <CardDescription>
          Status koneksi WhatsApp Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-blue-600">{totalSessions}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{connectedSessions}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Mati</p>
            <p className="text-2xl font-bold text-red-600">{disconnectedSessions}</p>
          </div>
        </div>

        {/* Status Message */}
        {!hasConnectedSession && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 text-sm">
                  WhatsApp Belum Terhubung
                </h4>
                <p className="text-xs text-yellow-800 mt-1">
                  Anda perlu menghubungkan WhatsApp terlebih dahulu untuk menggunakan fitur broadcast dan messages.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connected Sessions List */}
        {connectedSessions > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Session Aktif:</p>
            {sessions
              .filter(s => s.status === 'connected')
              .slice(0, 3)
              .map(session => (
                <div key={session.id} className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{session.name}</p>
                      {session.phone_number && (
                        <p className="text-xs text-gray-600">{session.phone_number}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            {connectedSessions > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{connectedSessions - 3} session lainnya
              </p>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          {!hasConnectedSession ? (
            <Link href="/admin/whatsapp/sessions/create" className="flex-1">
              <Button className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Buat Session
              </Button>
            </Link>
          ) : (
            <Link href="/admin/whatsapp/sessions" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                Kelola Session
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
