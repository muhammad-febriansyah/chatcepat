import { useEffect, useState, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { websocketService } from '@/services/websocket.service';
import { toast } from 'sonner';

/**
 * Broadcast Campaign Event Types
 */
export interface BroadcastStartedEvent {
  campaignId: number;
  timestamp: string;
}

export interface BroadcastProgressEvent {
  campaignId: number;
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  progress: number; // Percentage (0-100)
  timestamp: string;
}

export interface BroadcastCompletedEvent {
  campaignId: number;
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  timestamp: string;
}

export interface BroadcastFailedEvent {
  campaignId: number;
  error: string;
  timestamp: string;
}

/**
 * Broadcast Progress State
 */
export interface BroadcastProgress {
  campaignId: number | null;
  status: 'idle' | 'started' | 'processing' | 'completed' | 'failed';
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  progress: number; // Percentage
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * React Hook for Broadcast Campaign Real-time Progress
 *
 * Subscribe to real-time events for a broadcast campaign:
 * - Campaign started
 * - Progress updates (every 5 messages)
 * - Campaign completed
 * - Campaign failed
 *
 * @param campaignId - The broadcast campaign ID to track
 * @param options - Event handler callbacks and configuration
 *
 * @example
 * ```tsx
 * function BroadcastMonitor({ campaignId }: { campaignId: number }) {
 *   const { progress, status, sentCount, failedCount, totalRecipients } = useBroadcast(campaignId, {
 *     onProgress: (event) => {
 *       logger.log(`Progress: ${event.progress}%`);
 *     },
 *     onCompleted: (event) => {
 *       logger.log('Broadcast completed!', event);
 *     },
 *     showToasts: true,
 *   });
 *
 *   if (status === 'idle') {
 *     return <div>Waiting to start...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h3>Broadcast Progress: {progress}%</h3>
 *       <p>Sent: {sentCount} / {totalRecipients}</p>
 *       <p>Failed: {failedCount}</p>
 *       <progress value={progress} max={100} />
 *     </div>
 *   );
 * }
 * ```
 */
export interface UseBroadcastOptions {
  onStarted?: (event: BroadcastStartedEvent) => void;
  onProgress?: (event: BroadcastProgressEvent) => void;
  onCompleted?: (event: BroadcastCompletedEvent) => void;
  onFailed?: (event: BroadcastFailedEvent) => void;
  showToasts?: boolean; // Show automatic toast notifications (default: true)
  autoSubscribe?: boolean; // Auto-subscribe when campaignId changes (default: true)
}

export function useBroadcast(
  campaignId: number | null,
  options: UseBroadcastOptions = {}
) {
  const {
    onStarted,
    onProgress,
    onCompleted,
    onFailed,
    showToasts = true,
    autoSubscribe = true,
  } = options;

  const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress>({
    campaignId: null,
    status: 'idle',
    sentCount: 0,
    failedCount: 0,
    totalRecipients: 0,
    progress: 0,
    error: null,
    startedAt: null,
    completedAt: null,
  });

  /**
   * Subscribe to broadcast campaign
   */
  const subscribe = useCallback(() => {
    if (campaignId && websocketService.isConnected()) {
      websocketService.subscribeToBroadcast(campaignId);
    }
  }, [campaignId]);

  /**
   * Unsubscribe from broadcast campaign
   */
  const unsubscribe = useCallback(() => {
    if (campaignId) {
      websocketService.unsubscribeFromBroadcast(campaignId);
    }
  }, [campaignId]);

  /**
   * Subscribe to broadcast events
   */
  useEffect(() => {
    if (!campaignId || !websocketService.isConnected()) {
      return;
    }

    // Auto-subscribe if enabled
    if (autoSubscribe) {
      subscribe();
    }

    // Broadcast started event
    const handleStarted = (event: BroadcastStartedEvent) => {
      if (event.campaignId === campaignId) {
        setBroadcastProgress(prev => ({
          ...prev,
          campaignId: event.campaignId,
          status: 'started',
          startedAt: event.timestamp,
          error: null,
        }));
        if (showToasts) {
          toast.info('Broadcast campaign started');
        }
        onStarted?.(event);
      }
    };

    // Progress update event
    const handleProgress = (event: BroadcastProgressEvent) => {
      if (event.campaignId === campaignId) {
        setBroadcastProgress(prev => ({
          ...prev,
          campaignId: event.campaignId,
          status: 'processing',
          sentCount: event.sentCount,
          failedCount: event.failedCount,
          totalRecipients: event.totalRecipients,
          progress: event.progress,
        }));
        onProgress?.(event);
      }
    };

    // Broadcast completed event
    const handleCompleted = (event: BroadcastCompletedEvent) => {
      if (event.campaignId === campaignId) {
        setBroadcastProgress(prev => ({
          ...prev,
          campaignId: event.campaignId,
          status: 'completed',
          sentCount: event.sentCount,
          failedCount: event.failedCount,
          totalRecipients: event.totalRecipients,
          progress: 100,
          completedAt: event.timestamp,
        }));
        if (showToasts) {
          toast.success(
            `Broadcast completed! ${event.sentCount} sent, ${event.failedCount} failed`
          );
        }
        onCompleted?.(event);
      }
    };

    // Broadcast failed event
    const handleFailed = (event: BroadcastFailedEvent) => {
      if (event.campaignId === campaignId) {
        setBroadcastProgress(prev => ({
          ...prev,
          campaignId: event.campaignId,
          status: 'failed',
          error: event.error,
          completedAt: event.timestamp,
        }));
        if (showToasts) {
          toast.error(`Broadcast failed: ${event.error}`);
        }
        onFailed?.(event);
      }
    };

    // Register event listeners
    websocketService.on('broadcast:started', handleStarted);
    websocketService.on('broadcast:progress', handleProgress);
    websocketService.on('broadcast:completed', handleCompleted);
    websocketService.on('broadcast:failed', handleFailed);

    // Cleanup on unmount or campaignId change
    return () => {
      websocketService.off('broadcast:started', handleStarted);
      websocketService.off('broadcast:progress', handleProgress);
      websocketService.off('broadcast:completed', handleCompleted);
      websocketService.off('broadcast:failed', handleFailed);

      if (autoSubscribe && campaignId) {
        unsubscribe();
      }
    };
  }, [
    campaignId,
    autoSubscribe,
    subscribe,
    unsubscribe,
    onStarted,
    onProgress,
    onCompleted,
    onFailed,
    showToasts,
  ]);

  /**
   * Reset progress state
   */
  const reset = useCallback(() => {
    setBroadcastProgress({
      campaignId: null,
      status: 'idle',
      sentCount: 0,
      failedCount: 0,
      totalRecipients: 0,
      progress: 0,
      error: null,
      startedAt: null,
      completedAt: null,
    });
  }, []);

  return {
    ...broadcastProgress,
    subscribe,
    unsubscribe,
    reset,
  };
}

export default useBroadcast;
