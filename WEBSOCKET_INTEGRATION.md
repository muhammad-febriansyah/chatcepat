# WebSocket Integration Guide

Panduan lengkap integrasi real-time WebSocket antara Laravel frontend (React + Inertia.js) dengan Node.js WhatsApp Gateway.

## 📋 Daftar Isi

1. [Setup Awal](#setup-awal)
2. [Konfigurasi Environment](#konfigurasi-environment)
3. [Penggunaan Hooks](#penggunaan-hooks)
4. [Contoh Implementasi](#contoh-implementasi)
5. [API Events](#api-events)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Awal

### 1. Install Dependencies

Socket.IO client sudah terinstall otomatis. Jika belum, jalankan:

```bash
npm install socket.io-client
```

### 2. File Structure

Semua file WebSocket integration sudah dibuat di:

```
resources/js/
├── services/
│   └── websocket.service.ts      # Core WebSocket service
├── hooks/
│   ├── use-websocket.ts           # Connection hook
│   ├── use-whatsapp-session.ts    # Session events hook
│   └── use-broadcast.ts           # Broadcast progress hook
└── types/
    └── websocket.d.ts             # TypeScript definitions
```

---

## ⚙️ Konfigurasi Environment

### Laravel `.env`

Tambahkan URL Node.js gateway:

```bash
VITE_WHATSAPP_GATEWAY_URL=http://localhost:3000
```

### Node.js Gateway

Pastikan server gateway sudah berjalan di port 3000:

```bash
cd /Applications/javascript/chatcepat-wa
npm run dev
```

---

## 🎣 Penggunaan Hooks

### 1. `useWebSocket` - Koneksi WebSocket

Hook ini mengelola koneksi ke WebSocket server.

```tsx
import { useWebSocket } from '@/hooks/use-websocket';

function App() {
  const { isConnected, error, reconnectAttempts } = useWebSocket();

  if (!isConnected) {
    return <div>Menghubungkan ke server real-time...</div>;
  }

  return <div>✅ Terhubung!</div>;
}
```

**Props & Return Values:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `autoConnect` | boolean | `true` | Auto-connect saat component mount |

| Return Value | Type | Description |
|--------------|------|-------------|
| `isConnected` | boolean | Status koneksi |
| `error` | string \| null | Error message jika ada |
| `reconnectAttempts` | number | Jumlah percobaan reconnect |
| `connect()` | function | Manual connect |
| `disconnect()` | function | Manual disconnect |

---

### 2. `useWhatsAppSession` - Event Session WhatsApp

Hook untuk subscribe ke event session WhatsApp (QR code, connect, disconnect, messages).

```tsx
import { useWhatsAppSession } from '@/hooks/use-whatsapp-session';

function SessionMonitor({ sessionId }: { sessionId: string }) {
  const { qrCode, isConnected, phoneNumber } = useWhatsAppSession(sessionId, {
    onQRCode: (event) => {
      console.log('QR Code baru:', event.qrCodeDataURL);
    },
    onConnected: (event) => {
      console.log('Terhubung:', event.phoneNumber);
    },
    onDisconnected: (event) => {
      console.log('Terputus:', event.reason);
    },
    onIncomingMessage: (event) => {
      console.log('Pesan masuk:', event.message);
    },
    showToasts: true, // Tampilkan notifikasi otomatis
  });

  return (
    <div>
      {qrCode && (
        <div>
          <h3>Scan QR Code</h3>
          <img src={qrCode} alt="QR Code" className="w-64 h-64" />
        </div>
      )}

      {isConnected && (
        <div className="text-green-600">
          ✅ Terhubung: {phoneNumber}
        </div>
      )}
    </div>
  );
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `onQRCode` | function | Callback saat QR code baru |
| `onConnected` | function | Callback saat session connected |
| `onDisconnected` | function | Callback saat session disconnect |
| `onIncomingMessage` | function | Callback saat ada pesan masuk |
| `onMessageStatus` | function | Callback saat status pesan berubah |
| `showToasts` | boolean | Tampilkan toast notification (default: true) |

**Return Values:**

| Value | Type | Description |
|-------|------|-------------|
| `qrCode` | string \| null | QR code data URL |
| `isConnected` | boolean | Status koneksi session |
| `phoneNumber` | string \| null | Nomor WA yang terhubung |
| `lastDisconnectReason` | string \| null | Alasan disconnect terakhir |

---

### 3. `useBroadcast` - Tracking Progress Broadcast

Hook untuk track progress broadcast campaign secara real-time.

```tsx
import { useBroadcast } from '@/hooks/use-broadcast';

function BroadcastProgress({ campaignId }: { campaignId: number }) {
  const {
    status,
    progress,
    sentCount,
    failedCount,
    totalRecipients,
  } = useBroadcast(campaignId, {
    onProgress: (event) => {
      console.log(`Progress: ${event.progress}%`);
    },
    onCompleted: (event) => {
      console.log('Broadcast selesai!', event);
    },
    onFailed: (event) => {
      console.error('Broadcast gagal:', event.error);
    },
    showToasts: true,
  });

  if (status === 'idle') {
    return <div>Menunggu broadcast dimulai...</div>;
  }

  return (
    <div className="space-y-4">
      <h3>Broadcast Progress</h3>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Terkirim</p>
          <p className="text-2xl font-bold text-green-600">{sentCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Gagal</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold">{totalRecipients}</p>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <span className="text-lg font-semibold">{progress}%</span>
      </div>
    </div>
  );
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `onStarted` | function | Callback saat broadcast dimulai |
| `onProgress` | function | Callback setiap update progress |
| `onCompleted` | function | Callback saat broadcast selesai |
| `onFailed` | function | Callback saat broadcast gagal |
| `showToasts` | boolean | Tampilkan toast notification |
| `autoSubscribe` | boolean | Auto-subscribe ke campaign (default: true) |

**Return Values:**

| Value | Type | Description |
|-------|------|-------------|
| `status` | string | 'idle' \| 'started' \| 'processing' \| 'completed' \| 'failed' |
| `progress` | number | Progress persentase (0-100) |
| `sentCount` | number | Jumlah pesan terkirim |
| `failedCount` | number | Jumlah pesan gagal |
| `totalRecipients` | number | Total penerima |
| `error` | string \| null | Error message jika gagal |
| `subscribe()` | function | Manual subscribe ke campaign |
| `unsubscribe()` | function | Manual unsubscribe |
| `reset()` | function | Reset state ke idle |

---

## 📝 Contoh Implementasi

### Contoh 1: Dashboard dengan Real-time Stats

```tsx
import { useWebSocket } from '@/hooks/use-websocket';
import { useWhatsAppSession } from '@/hooks/use-whatsapp-session';
import { useBroadcast } from '@/hooks/use-broadcast';

function Dashboard() {
  // Koneksi WebSocket global
  const { isConnected } = useWebSocket();

  // Monitor session WhatsApp
  const sessions = usePage<{ sessions: any[] }>().props.sessions;

  return (
    <div>
      <div className="mb-4">
        {isConnected ? (
          <span className="text-green-600">🟢 Real-time Active</span>
        ) : (
          <span className="text-red-600">🔴 Offline</span>
        )}
      </div>

      {sessions.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

function SessionCard({ session }) {
  const { isConnected, phoneNumber } = useWhatsAppSession(session.session_id);

  return (
    <div className="border p-4 rounded">
      <h3>{session.name}</h3>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      {phoneNumber && <p>Phone: {phoneNumber}</p>}
    </div>
  );
}
```

---

### Contoh 2: Halaman Setup Session dengan QR Code

```tsx
import { useState } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useWhatsAppSession } from '@/hooks/use-whatsapp-session';
import { router } from '@inertiajs/react';

function SessionSetup({ session }) {
  const { isConnected: wsConnected } = useWebSocket();
  const [messages, setMessages] = useState<any[]>([]);

  const { qrCode, isConnected, phoneNumber } = useWhatsAppSession(
    session.session_id,
    {
      onConnected: (event) => {
        // Redirect ke dashboard setelah connected
        router.visit('/dashboard');
      },
      onIncomingMessage: (event) => {
        setMessages(prev => [event.message, ...prev]);
      },
    }
  );

  if (!wsConnected) {
    return (
      <div className="text-center p-8">
        <p>Menghubungkan ke server...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8">
      {!isConnected && qrCode && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Scan QR Code</h2>
          <p className="text-gray-600 mb-4">
            Scan dengan WhatsApp di HP kamu
          </p>
          <img
            src={qrCode}
            alt="QR Code"
            className="w-64 h-64 mx-auto border-4 border-gray-200 rounded-lg"
          />
        </div>
      )}

      {isConnected && (
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Terhubung!
          </h2>
          <p className="text-gray-600">
            WhatsApp: {phoneNumber}
          </p>
        </div>
      )}

      {/* Live Messages */}
      {messages.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold mb-2">Pesan Terbaru:</h3>
          <div className="space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className="border p-2 rounded">
                <p className="text-sm text-gray-600">{msg.fromNumber}</p>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Contoh 3: Halaman Broadcast dengan Progress Real-time

```tsx
import { useState } from 'react';
import { useBroadcast } from '@/hooks/use-broadcast';
import { router } from '@inertiajs/react';

function BroadcastDetail({ campaign }) {
  const {
    status,
    progress,
    sentCount,
    failedCount,
    totalRecipients,
  } = useBroadcast(campaign.id, {
    onCompleted: () => {
      // Refresh data campaign
      router.reload({ only: ['campaign'] });
    },
  });

  const handleStart = () => {
    router.post(`/api/broadcasts/${campaign.id}/execute`);
  };

  const handleCancel = () => {
    router.post(`/api/broadcasts/${campaign.id}/cancel`);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{campaign.name}</h1>

      {/* Control Buttons */}
      <div className="mb-6 flex gap-4">
        {status === 'idle' && (
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🚀 Mulai Broadcast
          </button>
        )}

        {status === 'processing' && (
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ⏹️ Stop Broadcast
          </button>
        )}
      </div>

      {/* Progress Display */}
      {status !== 'idle' && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Progress</h2>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-300"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600 mb-1">Terkirim</p>
              <p className="text-3xl font-bold text-green-600">{sentCount}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded">
              <p className="text-sm text-gray-600 mb-1">Gagal</p>
              <p className="text-3xl font-bold text-red-600">{failedCount}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-3xl font-bold text-blue-600">{totalRecipients}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            {status === 'processing' && (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                ⚡ Sedang Berjalan...
              </span>
            )}
            {status === 'completed' && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                ✅ Selesai
              </span>
            )}
            {status === 'failed' && (
              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
                ❌ Gagal
              </span>
            )}
          </div>
        </div>
      )}

      {/* Campaign Details */}
      <div className="mt-6 bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">Detail Campaign</h3>
        <p>Template: {campaign.template.type}</p>
        <p>Total Penerima: {campaign.total_recipients}</p>
        <p>Batch Size: {campaign.batch_size}</p>
      </div>
    </div>
  );
}
```

---

## 📡 API Events

### Session Events

| Event | Payload | Description |
|-------|---------|-------------|
| `session:qr` | `SessionQRCodeEvent` | QR code baru untuk scan |
| `session:connected` | `SessionConnectedEvent` | Session berhasil connect |
| `session:disconnected` | `SessionDisconnectedEvent` | Session disconnect |

### Message Events

| Event | Payload | Description |
|-------|---------|-------------|
| `message:incoming` | `IncomingMessageEvent` | Pesan masuk baru |
| `message:sent` | `MessageSentEvent` | Pesan keluar terkirim |
| `message:status` | `MessageStatusEvent` | Status pesan berubah |

### Broadcast Events

| Event | Payload | Description |
|-------|---------|-------------|
| `broadcast:started` | `BroadcastStartedEvent` | Broadcast dimulai |
| `broadcast:progress` | `BroadcastProgressEvent` | Update progress (tiap 5 pesan) |
| `broadcast:completed` | `BroadcastCompletedEvent` | Broadcast selesai |
| `broadcast:failed` | `BroadcastFailedEvent` | Broadcast gagal |

Lihat detail payload di `/resources/js/types/websocket.d.ts`

---

## 🔧 Troubleshooting

### Problem: WebSocket tidak terhubung

**Solusi:**

1. Pastikan Node.js gateway berjalan di `http://localhost:3000`
2. Cek `.env` Laravel: `VITE_WHATSAPP_GATEWAY_URL=http://localhost:3000`
3. Restart Vite dev server: `npm run dev`
4. Cek console browser untuk error

### Problem: Event tidak diterima

**Solusi:**

1. Pastikan sudah subscribe ke session/broadcast:
   ```tsx
   useWhatsAppSession(sessionId) // Auto-subscribe
   // atau
   const { subscribe } = useBroadcast(campaignId, { autoSubscribe: false });
   subscribe(); // Manual subscribe
   ```
2. Cek apakah WebSocket connected: `isConnected === true`
3. Cek Network tab browser untuk WebSocket connection

### Problem: QR Code tidak muncul

**Solusi:**

1. Pastikan session belum connected
2. Restart session di Node.js gateway
3. Hapus folder session auth jika corrupt:
   ```bash
   rm -rf /Applications/javascript/chatcepat-wa/storage/whatsapp-sessions/session_*
   ```

### Problem: Broadcast progress tidak update

**Solusi:**

1. Pastikan campaign status = 'processing'
2. Subscribe ke broadcast campaign dengan `useBroadcast(campaignId)`
3. Cek console Node.js gateway untuk log progress

---

## 🎯 Best Practices

### 1. Global WebSocket Connection

Buat koneksi WebSocket di root layout/app:

```tsx
// resources/js/app.tsx atau layout
function AppLayout({ children }) {
  useWebSocket(); // Connect once globally

  return <div>{children}</div>;
}
```

### 2. Cleanup Subscriptions

Hooks otomatis cleanup, tapi untuk manual subscription:

```tsx
useEffect(() => {
  websocketService.subscribeToSession('session_1');

  return () => {
    websocketService.unsubscribeFromSession('session_1');
  };
}, []);
```

### 3. Error Handling

```tsx
const { error, reconnectAttempts } = useWebSocket();

if (error && reconnectAttempts > 3) {
  return <ErrorPage message="Tidak dapat terhubung ke server" />;
}
```

### 4. Optimistic Updates

Gunakan WebSocket events untuk update UI tanpa polling:

```tsx
const [messages, setMessages] = useState([]);

useWhatsAppSession(sessionId, {
  onIncomingMessage: (event) => {
    // Langsung update UI tanpa refresh
    setMessages(prev => [event.message, ...prev]);
  },
});
```

---

## 📚 Resources

- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [React Hooks](https://react.dev/reference/react)
- [Inertia.js](https://inertiajs.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 🤝 Support

Jika ada masalah atau pertanyaan, silakan hubungi tim development atau buat issue di repository project.

Happy coding! 🚀
