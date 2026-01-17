/**
 * WhatsApp Session Monitor Component
 *
 * Contoh implementasi lengkap monitoring session WhatsApp dengan real-time updates.
 * Component ini mendemonstrasikan penggunaan semua WebSocket hooks.
 *
 * Features:
 * - Real-time QR code display
 * - Connection status monitoring
 * - Live incoming messages
 * - Message status updates
 * - Auto-reconnect handling
 *
 * Usage:
 * <WhatsAppSessionMonitor sessionId="session_1" />
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useWhatsAppSession, type IncomingMessageEvent } from '@/hooks/use-whatsapp-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Phone, QrCode, MessageSquare, WifiOff, PowerOff, Image, Video, Mic, FileText, RefreshCw } from 'lucide-react';
import { router } from '@inertiajs/react';

interface WhatsAppSessionMonitorProps {
  sessionId: string;
  sessionName?: string;
  initialQrCode?: string | null;
  initialStatus?: string;
  initialPhoneNumber?: string | null;
  sessionDbId?: number; // Database ID for refresh endpoint
  onWebSocketConnected?: (connected: boolean) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function WhatsAppSessionMonitor({
  sessionId,
  sessionName = 'WhatsApp Session',
  initialQrCode = null,
  initialStatus = 'disconnected',
  initialPhoneNumber = null,
  sessionDbId,
  onWebSocketConnected,
  onConnected,
  onDisconnected,
}: WhatsAppSessionMonitorProps) {
  // DEBUG: Log props
  console.log('🔍 WhatsAppSessionMonitor - props:', {
    sessionId,
    sessionName,
    initialQrCode: initialQrCode ? 'present' : 'null',
    initialStatus,
    initialPhoneNumber,
  });

  // Use initial QR code if it exists and status is qr_pending or connecting
  // This allows immediate display while waiting for WebSocket connection
  // If QR is expired, it will be auto-refreshed by the timer logic
  const shouldUseInitialQrCode = (initialStatus === 'qr_pending' || initialStatus === 'connecting') && initialQrCode;

  // WebSocket connection state
  const {
    isConnected: wsConnected,
    error: wsError,
    reconnectAttempts,
  } = useWebSocket();

  // DEBUG: Log WebSocket status
  console.log('🔍 WhatsAppSessionMonitor - WebSocket status:', {
    wsConnected,
    wsError,
  });

  // Notify parent component when WebSocket connection status changes
  React.useEffect(() => {
    onWebSocketConnected?.(wsConnected);
  }, [wsConnected, onWebSocketConnected]);

  // Local state for messages
  const [messages, setMessages] = useState<IncomingMessageEvent['message'][]>([]);
  const [messageStatuses, setMessageStatuses] = useState<Map<string, string>>(new Map());

  // QR Code expiry countdown (60 seconds)
  const [qrExpirySeconds, setQrExpirySeconds] = useState<number>(60);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WhatsApp session state and events
  const {
    qrCode,
    isConnected: sessionConnected,
    phoneNumber,
    lastDisconnectReason,
  } = useWhatsAppSession(sessionId, {
    initialQrCode: shouldUseInitialQrCode ? initialQrCode : null, // Don't use old QR code
    initialPhoneNumber,
    initialIsConnected: initialStatus === 'connected',
    onQRCode: (event) => {
      console.log('📱 New QR code generated', {
        sessionId: event.sessionId,
        hasQRCode: !!event.qrCodeDataURL,
        qrCodeLength: event.qrCodeDataURL?.length,
      });
    },
    onConnected: (event) => {
      console.log('✅ Session connected:', event.phoneNumber);
      setMessages([]); // Clear messages on reconnect
      onConnected?.();
    },
    onDisconnected: (event) => {
      console.log('❌ Session disconnected:', event.reason);
      onDisconnected?.();
    },
    onIncomingMessage: (event) => {
      console.log('📨 Incoming message:', event.message);
      setMessages(prev => [event.message, ...prev]);
    },
    onMessageStatus: (event) => {
      console.log('📊 Message status update:', event);
      setMessageStatuses(prev => new Map(prev.set(event.messageId, event.status)));
    },
    showToasts: true, // Show automatic toast notifications
  });

  // DEBUG: Log session state
  console.log('🔍 WhatsAppSessionMonitor - Session state:', {
    hasQRCode: !!qrCode,
    qrCodeLength: qrCode?.length,
    sessionConnected,
    phoneNumber,
  });

  // QR Code countdown timer
  useEffect(() => {
    if (qrCode && !sessionConnected) {
      // Reset countdown when new QR code appears
      setQrExpirySeconds(60);

      const interval = setInterval(() => {
        setQrExpirySeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrCode, sessionConnected]);

  // Auto-refresh QR when expired
  useEffect(() => {
    if (qrExpirySeconds === 0 && qrCode && !sessionConnected && sessionDbId) {
      console.log('⏰ QR Code expired, auto-refreshing...');
      handleRefreshQR();
    }
  }, [qrExpirySeconds]);

  // Refresh QR Code handler
  const handleRefreshQR = () => {
    if (!sessionDbId) {
      console.error('❌ Cannot refresh: sessionDbId not provided');
      return;
    }

    setIsRefreshing(true);
    router.post(`/admin/whatsapp/sessions/${sessionDbId}/connect`, {}, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        console.log('✅ QR refresh request sent');
        setIsRefreshing(false);
      },
      onError: (errors) => {
        console.error('❌ QR refresh failed:', errors);
        setIsRefreshing(false);
      },
    });
  };

  // Render WebSocket connection error
  if (!wsConnected && wsError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-5 w-5" />
            Kesalahan Koneksi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {wsError}
              {reconnectAttempts > 0 && (
                <p className="mt-2 text-sm">
                  Percobaan koneksi ulang: {reconnectAttempts}
                </p>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Render WebSocket connecting state
  if (!wsConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Menghubungkan ke server...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              {sessionName}
            </CardTitle>
            <Badge variant={sessionConnected ? 'default' : 'secondary'} className="flex items-center gap-1">
              {sessionConnected ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Terhubung
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  Terputus
                </>
              )}
            </Badge>
          </div>
          {phoneNumber && (
            <CardDescription>
              Nomor WhatsApp: {phoneNumber}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          {/* DEBUG: Show render conditions */}
          {import.meta.env.DEV && (
            <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <strong>DEBUG Render Conditions:</strong>
              <div>sessionConnected: {sessionConnected ? 'true' : 'false'}</div>
              <div>hasQRCode: {qrCode ? 'true' : 'false'}</div>
              <div>qrCodeLength: {qrCode?.length || 0}</div>
              <div>shouldShowQR: {(!sessionConnected && qrCode) ? 'true' : 'false'}</div>
            </div>
          )}

          {/* QR Code Display */}
          {!sessionConnected && qrCode && (
            <div className="space-y-4">
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Scan QR code ini dengan WhatsApp di HP Anda untuk menghubungkan</span>
                  {qrExpirySeconds > 0 && (
                    <Badge variant={qrExpirySeconds <= 10 ? 'destructive' : 'secondary'}>
                      {qrExpirySeconds}s
                    </Badge>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    className={`w-64 h-64 border-4 rounded-lg shadow-lg transition-opacity ${
                      qrExpirySeconds === 0 ? 'opacity-50 border-red-300' : 'border-gray-200'
                    }`}
                  />
                  {qrExpirySeconds === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="text-center text-white">
                        <p className="font-semibold mb-2">QR Code Kadaluarsa</p>
                        <p className="text-sm">Sedang membuat QR baru...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <p className="text-center text-sm text-gray-500">
                  Buka WhatsApp di HP → Pengaturan → Perangkat Tertaut → Tautkan Perangkat
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshQR}
                  disabled={isRefreshing || !sessionDbId}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Memuat QR Baru...' : 'Refresh QR Code'}
                </Button>

                {qrExpirySeconds <= 10 && qrExpirySeconds > 0 && (
                  <Alert variant="destructive" className="max-w-md">
                    <AlertDescription className="text-sm">
                      QR code akan kadaluarsa dalam {qrExpirySeconds} detik. QR baru akan dimuat otomatis.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Connected State */}
          {sessionConnected && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-600 mb-2">
                WhatsApp Terhubung!
              </h3>
              <p className="text-gray-600">
                WhatsApp Anda siap mengirim dan menerima pesan
              </p>
            </div>
          )}

          {/* Disconnected State */}
          {!sessionConnected && !qrCode && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <PowerOff className="h-10 w-10 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Terputus
              </h3>
              {lastDisconnectReason && (
                <p className="text-sm text-gray-500">
                  Alasan: {lastDisconnectReason}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Menunggu QR code...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Messages Card */}
      {sessionConnected && messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pesan Masuk
              <Badge variant="outline">{messages.length}</Badge>
            </CardTitle>
            <CardDescription>
              Pesan yang diterima secara real-time
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm">
                          {message.fromNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(message.sentAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {message.type}
                        </Badge>
                        {message.isAutoReply && (
                          <Badge variant="secondary" className="text-xs">
                            Balas Otomatis
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="mt-2">
                      {message.type === 'text' && message.content && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.type === 'image' && (
                        <p className="text-sm text-gray-500 italic flex items-center gap-1">
                          <Image className="h-4 w-4" /> Gambar
                        </p>
                      )}
                      {message.type === 'video' && (
                        <p className="text-sm text-gray-500 italic flex items-center gap-1">
                          <Video className="h-4 w-4" /> Video
                        </p>
                      )}
                      {message.type === 'audio' && (
                        <p className="text-sm text-gray-500 italic flex items-center gap-1">
                          <Mic className="h-4 w-4" /> Audio
                        </p>
                      )}
                      {message.type === 'document' && (
                        <p className="text-sm text-gray-500 italic flex items-center gap-1">
                          <FileText className="h-4 w-4" /> Dokumen
                        </p>
                      )}
                    </div>

                    {/* Message Status */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {messageStatuses.get(message.messageId) || message.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Clear Messages Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessages([])}
                className="w-full"
              >
                Hapus Semua Pesan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info (Development Only) */}
      {import.meta.env.DEV && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(
                {
                  sessionId,
                  wsConnected,
                  sessionConnected,
                  phoneNumber,
                  messageCount: messages.length,
                  hasQRCode: !!qrCode,
                  lastDisconnectReason,
                },
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WhatsAppSessionMonitor;
