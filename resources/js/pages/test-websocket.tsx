/**
 * WebSocket Test Page
 *
 * Halaman untuk testing WebSocket integration dengan Node.js gateway.
 *
 * Akses: /test-websocket (setelah route ditambahkan)
 */

import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WhatsAppSessionMonitor from '@/components/examples/WhatsAppSessionMonitor';
import BroadcastProgressMonitor from '@/components/examples/BroadcastProgressMonitor';
import { useWebSocket } from '@/hooks/use-websocket';
import { CheckCircle2, XCircle, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

export default function TestWebSocket() {
  const [sessionIdTest, setSessionIdTest] = useState('session_1');
  const [campaignIdTest, setCampaignIdTest] = useState('1');
  const [activeTab, setActiveTab] = useState('connection');

  const {
    isConnected,
    error,
    reconnectAttempts,
    connect,
    disconnect,
  } = useWebSocket();

  return (
    <>
      <Head title="WebSocket Test Page" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              🧪 WebSocket Integration Test
            </h1>
            <p className="mt-2 text-gray-600">
              Test halaman untuk mengecek koneksi WebSocket dan real-time features
            </p>
          </div>

          {/* Connection Status Banner */}
          <Alert className={isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-600" />
                    <div>
                      <AlertDescription className="text-green-800 font-semibold">
                        ✅ WebSocket Connected
                      </AlertDescription>
                      <p className="text-xs text-green-700">
                        Real-time communication is active
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-600" />
                    <div>
                      <AlertDescription className="text-red-800 font-semibold">
                        ❌ WebSocket Disconnected
                      </AlertDescription>
                      {error && (
                        <p className="text-xs text-red-700">Error: {error}</p>
                      )}
                      {reconnectAttempts > 0 && (
                        <p className="text-xs text-red-700">
                          Reconnect attempts: {reconnectAttempts}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={connect}
                  size="sm"
                  variant="outline"
                  disabled={isConnected}
                >
                  Connect
                </Button>
                <Button
                  onClick={disconnect}
                  size="sm"
                  variant="outline"
                  disabled={!isConnected}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </Alert>

          {/* Main Content */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="connection">Connection</TabsTrigger>
                <TabsTrigger value="session">WhatsApp Session</TabsTrigger>
                <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
              </TabsList>

              {/* Tab 1: Connection Test */}
              <TabsContent value="connection" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Connection Status</CardTitle>
                    <CardDescription>
                      Check WebSocket connection to Node.js gateway
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Connection</p>
                        <div className="flex items-center gap-2">
                          {isConnected ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-semibold">
                            {isConnected ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Reconnect Attempts</p>
                        <p className="text-2xl font-bold">{reconnectAttempts}</p>
                      </div>
                    </div>

                    {/* Gateway URL */}
                    <div>
                      <Label>Gateway URL</Label>
                      <Input
                        value={import.meta.env.VITE_WHATSAPP_GATEWAY_URL || 'http://localhost:3000'}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Configured in .env: VITE_WHATSAPP_GATEWAY_URL
                      </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        📌 Testing Instructions
                      </h4>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Make sure Node.js gateway is running at port 3000</li>
                        <li>Check if .env has VITE_WHATSAPP_GATEWAY_URL set</li>
                        <li>Click "Connect" to establish WebSocket connection</li>
                        <li>Status should change to "Connected"</li>
                        <li>Try "Disconnect" and verify auto-reconnect</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: WhatsApp Session Test */}
              <TabsContent value="session" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Monitor Test</CardTitle>
                    <CardDescription>
                      Test real-time WhatsApp session events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Session ID Input */}
                    <div>
                      <Label>Session ID</Label>
                      <div className="flex gap-2">
                        <Input
                          value={sessionIdTest}
                          onChange={(e) => setSessionIdTest(e.target.value)}
                          placeholder="e.g., session_1"
                        />
                        <Button onClick={() => setSessionIdTest('session_' + Date.now())}>
                          Generate
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Format: session_[number]
                      </p>
                    </div>

                    {/* Warning if not connected */}
                    {!isConnected && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          WebSocket not connected. Go to "Connection" tab to connect first.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Session Monitor Component */}
                {isConnected && sessionIdTest && (
                  <WhatsAppSessionMonitor
                    sessionId={sessionIdTest}
                    sessionName={`Test Session (${sessionIdTest})`}
                  />
                )}

                {/* Instructions */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      🧪 How to Test Session
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Make sure WebSocket is connected (check Connection tab)</li>
                      <li>Enter a session ID (e.g., "session_1")</li>
                      <li>Create the session via API or use existing one</li>
                      <li>Monitor will show QR code when session generates one</li>
                      <li>Scan QR code with WhatsApp to connect</li>
                      <li>Watch real-time connection status changes</li>
                      <li>Send messages to see incoming message events</li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Broadcast Test */}
              <TabsContent value="broadcast" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Broadcast Progress Test</CardTitle>
                    <CardDescription>
                      Test real-time broadcast campaign tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Campaign ID Input */}
                    <div>
                      <Label>Campaign ID</Label>
                      <Input
                        type="number"
                        value={campaignIdTest}
                        onChange={(e) => setCampaignIdTest(e.target.value)}
                        placeholder="e.g., 1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter an existing campaign ID
                      </p>
                    </div>

                    {/* Warning if not connected */}
                    {!isConnected && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          WebSocket not connected. Go to "Connection" tab to connect first.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Broadcast Monitor Component */}
                {isConnected && campaignIdTest && (
                  <BroadcastProgressMonitor
                    campaignId={parseInt(campaignIdTest)}
                    campaignName={`Test Campaign #${campaignIdTest}`}
                    showControls={true}
                  />
                )}

                {/* Instructions */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      🧪 How to Test Broadcast
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Make sure WebSocket is connected</li>
                      <li>Create a broadcast campaign via API (POST /api/broadcasts)</li>
                      <li>Enter the campaign ID above</li>
                      <li>Start the campaign (POST /api/broadcasts/:id/execute)</li>
                      <li>Watch real-time progress updates every 5 messages</li>
                      <li>Monitor sent/failed counts and progress percentage</li>
                      <li>See completion or failure events</li>
                    </ol>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: System Info */}
              <TabsContent value="info" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>
                      Configuration and environment details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Environment */}
                    <div>
                      <h4 className="font-semibold mb-2">Environment</h4>
                      <div className="bg-gray-100 rounded p-3 font-mono text-sm space-y-1">
                        <p>Gateway URL: {import.meta.env.VITE_WHATSAPP_GATEWAY_URL || 'Not set'}</p>
                        <p>Mode: {import.meta.env.DEV ? 'Development' : 'Production'}</p>
                        <p>App URL: {window.location.origin}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold mb-2">Available Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="outline" className="justify-center py-2">
                          ✅ WebSocket Connection
                        </Badge>
                        <Badge variant="outline" className="justify-center py-2">
                          ✅ Session Events
                        </Badge>
                        <Badge variant="outline" className="justify-center py-2">
                          ✅ Message Events
                        </Badge>
                        <Badge variant="outline" className="justify-center py-2">
                          ✅ Broadcast Progress
                        </Badge>
                        <Badge variant="outline" className="justify-center py-2">
                          ✅ Auto-reconnect
                        </Badge>
                        <Badge variant="outline" className="justify-center py-2">
                          ✅ Toast Notifications
                        </Badge>
                      </div>
                    </div>

                    {/* Hooks */}
                    <div>
                      <h4 className="font-semibold mb-2">Available React Hooks</h4>
                      <div className="space-y-2">
                        <div className="border rounded p-3">
                          <p className="font-mono text-sm font-semibold">useWebSocket()</p>
                          <p className="text-xs text-gray-600">Global WebSocket connection management</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-mono text-sm font-semibold">useWhatsAppSession(sessionId)</p>
                          <p className="text-xs text-gray-600">Session events: QR, connect, messages</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="font-mono text-sm font-semibold">useBroadcast(campaignId)</p>
                          <p className="text-xs text-gray-600">Broadcast progress tracking</p>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">
                        📋 Next Steps
                      </h4>
                      <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        <li>Backend & WebSocket infrastructure: ✅ Complete</li>
                        <li>Admin UI pages: ❌ Need to be created</li>
                        <li>Routes: ❌ Need to be added to web.php</li>
                        <li>Sidebar menu: ❌ Need WhatsApp section</li>
                        <li>Full CRUD interfaces: ❌ Pending development</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
