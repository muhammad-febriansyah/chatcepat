import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketService, ConnectionStatus } from '@/services/websocket.service';
import { usePage } from '@inertiajs/react';

/**
 * React Hook for WebSocket Connection Management
 *
 * Automatically connects to WebSocket server using the authenticated user's ID
 * and manages connection lifecycle.
 *
 * @param autoConnect - Whether to auto-connect on mount (default: true)
 * @returns WebSocket connection state and control functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, error, connect, disconnect } = useWebSocket();
 *
 *   if (!isConnected) {
 *     return <div>Connecting to real-time server...</div>;
 *   }
 *
 *   return <div>Connected! Real-time updates active.</div>;
 * }
 * ```
 */
export function useWebSocket(autoConnect = true) {
  const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    error: null,
    reconnectAttempts: 0,
  });
  const hasInitialized = useRef(false);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!auth?.user?.id) {
      console.error('Cannot connect: No authenticated user');
      return;
    }

    const gatewayUrl = import.meta.env.VITE_WHATSAPP_GATEWAY_URL || 'http://localhost:3000';

    websocketService.connect({
      url: gatewayUrl,
      userId: auth.user.id,
      autoConnect: true,
    });

    // Update connection status when it changes
    websocketService.on('connection:status', (status: ConnectionStatus) => {
      setConnectionStatus(status);
    });
  }, [auth?.user?.id]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setConnectionStatus({
      isConnected: false,
      error: null,
      reconnectAttempts: 0,
    });
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect && !hasInitialized.current && auth?.user?.id) {
      hasInitialized.current = true;

      // Connect directly here to avoid dependency issues
      const gatewayUrl = import.meta.env.VITE_WHATSAPP_GATEWAY_URL || 'http://localhost:3000';

      websocketService.connect({
        url: gatewayUrl,
        userId: auth.user.id,
        autoConnect: true,
      });

      websocketService.on('connection:status', (status: ConnectionStatus) => {
        setConnectionStatus(status);
      });
    }

    // Cleanup ONLY when auth changes (user logs out)
    return () => {
      if (hasInitialized.current) {
        hasInitialized.current = false;
      }
    };
  }, [autoConnect, auth?.user?.id]);

  return {
    isConnected: connectionStatus.isConnected,
    error: connectionStatus.error,
    reconnectAttempts: connectionStatus.reconnectAttempts,
    connect,
    disconnect,
    connectionStatus,
  };
}

export default useWebSocket;
