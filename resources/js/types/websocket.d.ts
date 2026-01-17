/**
 * WebSocket Event Type Definitions
 *
 * Defines all real-time events emitted by the ChatCepat WhatsApp Gateway
 */

declare namespace WebSocketEvents {
  // ============================================================================
  // Session Events
  // ============================================================================

  /**
   * Emitted when a new QR code is generated for WhatsApp connection
   */
  interface SessionQRCodeEvent {
    sessionId: string;
    qrCodeDataURL: string;
    timestamp: string;
  }

  /**
   * Emitted when a WhatsApp session successfully connects
   */
  interface SessionConnectedEvent {
    sessionId: string;
    phoneNumber: string;
    timestamp: string;
  }

  /**
   * Emitted when a WhatsApp session disconnects
   */
  interface SessionDisconnectedEvent {
    sessionId: string;
    reason: string;
    timestamp: string;
  }

  // ============================================================================
  // Message Events
  // ============================================================================

  /**
   * Message object structure
   */
  interface Message {
    id: number;
    whatsappSessionId: number;
    messageId: string;
    fromNumber: string;
    toNumber: string;
    direction: 'incoming' | 'outgoing';
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact' | 'other';
    content: string | null;
    mediaMetadata: any | null;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    isAutoReply: boolean;
    autoReplySource: string | null;
    context: any | null;
    sentAt: string;
    deliveredAt: string | null;
    readAt: string | null;
    createdAt: string;
  }

  /**
   * Emitted when a new incoming message is received
   */
  interface IncomingMessageEvent {
    sessionId: string;
    message: Message;
    timestamp: string;
  }

  /**
   * Emitted when a message is sent (outgoing)
   */
  interface MessageSentEvent {
    sessionId: string;
    message: Message;
    timestamp: string;
  }

  /**
   * Emitted when a message status changes (sent -> delivered -> read)
   */
  interface MessageStatusEvent {
    sessionId: string;
    messageId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
  }

  // ============================================================================
  // Broadcast Events
  // ============================================================================

  /**
   * Emitted when a broadcast campaign starts
   */
  interface BroadcastStartedEvent {
    campaignId: number;
    timestamp: string;
  }

  /**
   * Emitted periodically (every 5 messages) during broadcast execution
   */
  interface BroadcastProgressEvent {
    campaignId: number;
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    progress: number; // Percentage (0-100)
    timestamp: string;
  }

  /**
   * Emitted when a broadcast campaign completes successfully
   */
  interface BroadcastCompletedEvent {
    campaignId: number;
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    timestamp: string;
  }

  /**
   * Emitted when a broadcast campaign fails
   */
  interface BroadcastFailedEvent {
    campaignId: number;
    error: string;
    timestamp: string;
  }

  // ============================================================================
  // Connection Events
  // ============================================================================

  /**
   * Connection status information
   */
  interface ConnectionStatus {
    isConnected: boolean;
    error: string | null;
    reconnectAttempts: number;
  }

  // ============================================================================
  // Subscription Events
  // ============================================================================

  /**
   * Subscribe to specific session events
   */
  interface SubscribeSessionPayload {
    sessionId: string;
  }

  /**
   * Subscribe to specific broadcast campaign events
   */
  interface SubscribeBroadcastPayload {
    campaignId: number;
  }
}

// Export for use in modules
export = WebSocketEvents;
export as namespace WebSocketEvents;
