import { io, Socket } from 'socket.io-client';
import { logger } from '@/utils/logger';

/**
 * WebSocket Service for ChatCepat WhatsApp Gateway
 *
 * This service manages the Socket.IO connection to the Node.js gateway
 * and provides methods for subscribing to real-time events.
 */

export interface WebSocketConfig {
  url: string;
  userId: number;
  autoConnect?: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  error: string | null;
  reconnectAttempts: number;
}

class WebSocketService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    error: null,
    reconnectAttempts: 0,
  };
  private eventListeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize and connect to WebSocket server
   */
  connect(config: WebSocketConfig): Socket {
    if (this.socket?.connected) {
      logger.warn('WebSocket already connected');
      return this.socket;
    }

    const { url, userId, autoConnect = true } = config;
    this.userId = userId;

    // Create Socket.IO connection
    this.socket = io(url, {
      path: '/socket.io/',
      autoConnect,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      query: {
        userId: userId.toString(),
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();

    if (autoConnect) {
      this.socket.connect();
    }

    return this.socket;
  }

  /**
   * Setup core Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.log('✅ WebSocket connected');
      this.connectionStatus = {
        isConnected: true,
        error: null,
        reconnectAttempts: 0,
      };
      this.emit('connection:status', this.connectionStatus);
    });

    this.socket.on('disconnect', (reason) => {
      logger.log('❌ WebSocket disconnected:', reason);
      this.connectionStatus = {
        isConnected: false,
        error: reason,
        reconnectAttempts: this.connectionStatus.reconnectAttempts,
      };
      this.emit('connection:status', this.connectionStatus);
    });

    this.socket.on('connect_error', (error) => {
      logger.error('WebSocket connection error:', error);
      this.connectionStatus = {
        isConnected: false,
        error: error.message,
        reconnectAttempts: this.connectionStatus.reconnectAttempts + 1,
      };
      this.emit('connection:status', this.connectionStatus);
    });

    this.socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
      this.emit('connection:error', error);
    });

    // DEBUG: Log ALL incoming Socket.IO events
    this.socket.onAny((eventName, ...args) => {
      logger.log(`📥 WebSocket event received: "${eventName}"`, args);
    });
  }

  /**
   * Subscribe to a specific WhatsApp session
   */
  subscribeToSession(sessionId: string): void {
    if (!this.socket?.connected) {
      logger.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    this.socket.emit('subscribe:session', sessionId);
    logger.log(`📡 Subscribed to session: ${sessionId}`);
  }

  /**
   * Unsubscribe from a specific WhatsApp session
   */
  unsubscribeFromSession(sessionId: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit('unsubscribe:session', sessionId);
    logger.log(`🔌 Unsubscribed from session: ${sessionId}`);
  }

  /**
   * Subscribe to a specific broadcast campaign
   */
  subscribeToBroadcast(campaignId: number): void {
    if (!this.socket?.connected) {
      logger.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    this.socket.emit('subscribe:broadcast', campaignId);
    logger.log(`📡 Subscribed to broadcast: ${campaignId}`);
  }

  /**
   * Unsubscribe from a specific broadcast campaign
   */
  unsubscribeFromBroadcast(campaignId: number): void {
    if (!this.socket?.connected) return;

    this.socket.emit('unsubscribe:broadcast', campaignId);
    logger.log(`🔌 Unsubscribed from broadcast: ${campaignId}`);
  }

  /**
   * Register an event listener
   */
  on(event: string, callback: Function): void {
    if (!this.socket) {
      logger.warn('Socket not initialized. Call connect() first.');
      return;
    }

    // Register with Socket.IO
    this.socket.on(event, (...args: any[]) => {
      callback(...args);
    });

    // Track locally for cleanup
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Unregister an event listener
   */
  off(event: string, callback?: Function): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);
      this.eventListeners.get(event)?.delete(callback);
    } else {
      // Remove all listeners for this event
      this.socket.off(event);
      this.eventListeners.delete(event);
    }
  }

  /**
   * Emit an event to local listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Manually disconnect
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.eventListeners.clear();
      logger.log('🔌 WebSocket disconnected manually');
    }
  }

  /**
   * Get the raw Socket.IO instance (for advanced usage)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export class for testing or multiple instances
export default WebSocketService;
