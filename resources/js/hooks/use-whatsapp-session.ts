import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';
import { websocketService } from '@/services/websocket.service';
import { toast } from 'sonner';

/**
 * WhatsApp Session Event Types
 */
export interface SessionQRCodeEvent {
  sessionId: string;
  qrCodeDataURL: string;
  timestamp: string;
}

export interface SessionConnectedEvent {
  sessionId: string;
  phoneNumber: string;
  timestamp: string;
}

export interface SessionDisconnectedEvent {
  sessionId: string;
  reason: string;
  timestamp: string;
}

export interface IncomingMessageEvent {
  sessionId: string;
  message: {
    id: number;
    messageId: string;
    fromNumber: string;
    toNumber: string;
    type: string;
    content: string | null;
    status: string;
    sentAt: string;
  };
  timestamp: string;
}

export interface MessageStatusEvent {
  sessionId: string;
  messageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
}

/**
 * React Hook for WhatsApp Session Real-time Events
 *
 * Subscribe to real-time events for a specific WhatsApp session:
 * - QR code updates
 * - Connection status changes
 * - Incoming messages
 * - Message status updates
 *
 * @param sessionId - The WhatsApp session ID to subscribe to
 * @param options - Event handler callbacks
 *
 * @example
 * ```tsx
 * function SessionMonitor({ sessionId }: { sessionId: string }) {
 *   const [qrCode, setQrCode] = useState<string | null>(null);
 *   const [messages, setMessages] = useState<any[]>([]);
 *
 *   useWhatsAppSession(sessionId, {
 *     onQRCode: (event) => {
 *       setQrCode(event.qrCodeDataURL);
 *     },
 *     onConnected: (event) => {
 *       toast.success(`Connected: ${event.phoneNumber}`);
 *       setQrCode(null);
 *     },
 *     onIncomingMessage: (event) => {
 *       setMessages(prev => [...prev, event.message]);
 *     },
 *     onDisconnected: (event) => {
 *       toast.error(`Disconnected: ${event.reason}`);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {qrCode && <img src={qrCode} alt="QR Code" />}
 *       {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
 *     </div>
 *   );
 * }
 * ```
 */
export interface UseWhatsAppSessionOptions {
  initialQrCode?: string | null;
  initialPhoneNumber?: string | null;
  initialIsConnected?: boolean;
  onQRCode?: (event: SessionQRCodeEvent) => void;
  onConnected?: (event: SessionConnectedEvent) => void;
  onDisconnected?: (event: SessionDisconnectedEvent) => void;
  onIncomingMessage?: (event: IncomingMessageEvent) => void;
  onMessageStatus?: (event: MessageStatusEvent) => void;
  showToasts?: boolean; // Show automatic toast notifications (default: true)
}

export function useWhatsAppSession(
  sessionId: string | null,
  options: UseWhatsAppSessionOptions = {}
) {
  const {
    initialQrCode = null,
    initialPhoneNumber = null,
    initialIsConnected = false,
    onQRCode,
    onConnected,
    onDisconnected,
    onIncomingMessage,
    onMessageStatus,
    showToasts = true,
  } = options;

  const [qrCode, setQrCode] = useState<string | null>(initialQrCode);
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(initialPhoneNumber);
  const [lastDisconnectReason, setLastDisconnectReason] = useState<string | null>(null);

  // Use refs to store callbacks to avoid re-registering listeners
  const callbacksRef = useRef({
    onQRCode,
    onConnected,
    onDisconnected,
    onIncomingMessage,
    onMessageStatus,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      onQRCode,
      onConnected,
      onDisconnected,
      onIncomingMessage,
      onMessageStatus,
    };
  }, [onQRCode, onConnected, onDisconnected, onIncomingMessage, onMessageStatus]);

  /**
   * Subscribe to session events
   */
  useEffect(() => {
    if (!sessionId || !websocketService.isConnected()) {
      return;
    }

    // Subscribe to this session's events
    websocketService.subscribeToSession(sessionId);

    // QR Code event
    const handleQRCode = (event: SessionQRCodeEvent) => {
      logger.log('🔔 useWhatsAppSession: handleQRCode called', {
        eventSessionId: event.sessionId,
        subscribedSessionId: sessionId,
        matches: event.sessionId === sessionId,
        hasQRCode: !!event.qrCodeDataURL,
        qrCodeLength: event.qrCodeDataURL?.length,
      });

      if (event.sessionId === sessionId) {
        logger.log('✅ Setting QR code state:', event.qrCodeDataURL.substring(0, 50) + '...');
        setQrCode(event.qrCodeDataURL);
        setIsConnected(false);
        // Toast removed per user request
        callbacksRef.current.onQRCode?.(event);
      } else {
        logger.log('❌ Session ID mismatch - ignoring QR code event');
      }
    };

    // Connected event
    const handleConnected = (event: SessionConnectedEvent) => {
      if (event.sessionId === sessionId) {
        setIsConnected(true);
        setIsReconnecting(false);
        setPhoneNumber(event.phoneNumber);
        setQrCode(null);
        if (showToasts) {
          toast.success(`WhatsApp terhubung: ${event.phoneNumber}`);
        }
        callbacksRef.current.onConnected?.(event);
      }
    };

    // Disconnected event
    const handleDisconnected = (event: SessionDisconnectedEvent) => {
      if (event.sessionId === sessionId) {
        setIsConnected(false);
        setPhoneNumber(null);
        setLastDisconnectReason(event.reason);

        // Cek apakah sedang dalam proses reconnect otomatis
        const isAutoReconnecting = event.reason?.toLowerCase().includes('reconnect');
        setIsReconnecting(isAutoReconnecting);

        if (showToasts) {
          if (isAutoReconnecting) {
            toast.warning(`WhatsApp terputus, sedang mencoba menghubungkan ulang...`);
          } else {
            toast.error(`WhatsApp terputus: ${event.reason}`);
          }
        }
        callbacksRef.current.onDisconnected?.(event);
      }
    };

    // Incoming message event
    const handleIncomingMessage = (event: IncomingMessageEvent) => {
      if (event.sessionId === sessionId) {
        if (showToasts) {
          toast.info(`Pesan baru dari ${event.message.fromNumber}`);
        }
        callbacksRef.current.onIncomingMessage?.(event);
      }
    };

    // Message status event
    const handleMessageStatus = (event: MessageStatusEvent) => {
      if (event.sessionId === sessionId) {
        callbacksRef.current.onMessageStatus?.(event);
      }
    };

    // Register event listeners
    logger.log(`📡 useWhatsAppSession: Registering event listeners for session: ${sessionId}`);
    websocketService.on('session:qr', handleQRCode);
    websocketService.on('session:connected', handleConnected);
    websocketService.on('session:disconnected', handleDisconnected);
    websocketService.on('message:incoming', handleIncomingMessage);
    websocketService.on('message:status', handleMessageStatus);
    logger.log('✅ Event listeners registered');

    // Cleanup on unmount or sessionId change
    return () => {
      websocketService.off('session:qr', handleQRCode);
      websocketService.off('session:connected', handleConnected);
      websocketService.off('session:disconnected', handleDisconnected);
      websocketService.off('message:incoming', handleIncomingMessage);
      websocketService.off('message:status', handleMessageStatus);

      if (sessionId) {
        websocketService.unsubscribeFromSession(sessionId);
      }
    };
  }, [sessionId, showToasts]); // Only sessionId and showToasts in deps, callbacks are in ref

  return {
    qrCode,
    isConnected,
    isReconnecting,
    phoneNumber,
    lastDisconnectReason,
  };
}

export default useWhatsAppSession;
