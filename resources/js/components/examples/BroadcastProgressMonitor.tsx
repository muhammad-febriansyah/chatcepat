/**
 * Broadcast Progress Monitor Component
 *
 * Contoh implementasi lengkap monitoring broadcast campaign dengan real-time progress.
 * Component ini mendemonstrasikan penggunaan useBroadcast hook.
 *
 * Features:
 * - Real-time progress tracking
 * - Visual progress bar
 * - Live statistics (sent, failed, total)
 * - Status badges
 * - Auto-refresh on completion
 *
 * Usage:
 * <BroadcastProgressMonitor campaignId={123} />
 */

import { useEffect, useState } from 'react';
import { logger } from '@/utils/logger';
import { useBroadcast } from '@/hooks/use-broadcast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface BroadcastProgressMonitorProps {
  campaignId: number;
  campaignName?: string;
  onCompleted?: () => void;
  onFailed?: (error: string) => void;
  showControls?: boolean;
}

export function BroadcastProgressMonitor({
  campaignId,
  campaignName = 'Broadcast Campaign',
  onCompleted,
  onFailed,
  showControls = false,
}: BroadcastProgressMonitorProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  // Broadcast progress state and events
  const {
    status,
    progress,
    sentCount,
    failedCount,
    totalRecipients,
    error,
    startedAt,
    completedAt,
    subscribe,
    unsubscribe,
    reset,
  } = useBroadcast(campaignId, {
    onStarted: (event) => {
      logger.log('🚀 Broadcast started:', event);
      setStartTime(new Date(event.timestamp));
    },
    onProgress: (event) => {
      logger.log(`📊 Progress: ${event.progress}%`, event);
    },
    onCompleted: (event) => {
      logger.log('✅ Broadcast completed:', event);
      onCompleted?.();
    },
    onFailed: (event) => {
      logger.error('❌ Broadcast failed:', event);
      onFailed?.(event.error);
    },
    showToasts: true,
    autoSubscribe: true,
  });

  // Calculate elapsed time
  useEffect(() => {
    if (!startTime || status === 'completed' || status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, status]);

  // Calculate success rate
  const successRate = totalRecipients > 0
    ? Math.round((sentCount / totalRecipients) * 100)
    : 0;

  // Calculate estimated time remaining
  const estimatedTimeRemaining = (() => {
    if (status !== 'processing' || !startTime || sentCount === 0) {
      return null;
    }

    const elapsed = new Date().getTime() - startTime.getTime();
    const avgTimePerMessage = elapsed / sentCount;
    const remaining = (totalRecipients - sentCount - failedCount) * avgTimePerMessage;
    const minutes = Math.ceil(remaining / 60000);

    return minutes;
  })();

  // Status badge component
  const StatusBadge = () => {
    switch (status) {
      case 'idle':
        return <Badge variant="outline">⏸️ Idle</Badge>;
      case 'started':
        return <Badge variant="default" className="bg-blue-600">🚀 Starting...</Badge>;
      case 'processing':
        return (
          <Badge variant="default" className="bg-yellow-600">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="default" className="bg-red-600">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {campaignName}
            </CardTitle>
            <StatusBadge />
          </div>
          <CardDescription>
            Campaign ID: {campaignId}
            {startedAt && (
              <span className="ml-2">
                • Started: {new Date(startedAt).toLocaleString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {status === 'failed' && error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Broadcast Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Card */}
      {status !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-bold text-blue-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              {estimatedTimeRemaining && status === 'processing' && (
                <p className="text-xs text-gray-500 mt-2">
                  Estimated time remaining: ~{estimatedTimeRemaining} minutes
                </p>
              )}
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Recipients */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                <p className="text-xs text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-blue-600">{totalRecipients}</p>
              </div>

              {/* Sent Count */}
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-600" />
                <p className="text-xs text-gray-600 mb-1">Sent</p>
                <p className="text-2xl font-bold text-green-600">{sentCount}</p>
                {totalRecipients > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{successRate}%</p>
                )}
              </div>

              {/* Failed Count */}
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <XCircle className="h-5 w-5 mx-auto mb-2 text-red-600" />
                <p className="text-xs text-gray-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                {totalRecipients > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((failedCount / totalRecipients) * 100)}%
                  </p>
                )}
              </div>

              {/* Pending Count */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-600">
                  {totalRecipients - sentCount - failedCount}
                </p>
              </div>
            </div>

            {/* Elapsed Time */}
            {startTime && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Elapsed Time</p>
                <p className="text-3xl font-mono font-bold text-gray-800">
                  {elapsedTime}
                </p>
              </div>
            )}

            {/* Completion Info */}
            {status === 'completed' && completedAt && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Broadcast completed successfully!</strong>
                  <br />
                  Finished at: {new Date(completedAt).toLocaleString()}
                  <br />
                  Success rate: {successRate}% ({sentCount}/{totalRecipients})
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Idle State */}
      {status === 'idle' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Ready to Broadcast
              </h3>
              <p className="text-gray-500">
                Start the campaign to begin sending messages
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls (Optional) */}
      {showControls && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={subscribe}
                variant="outline"
                size="sm"
                disabled={status === 'processing'}
              >
                Subscribe
              </Button>
              <Button
                onClick={unsubscribe}
                variant="outline"
                size="sm"
              >
                Unsubscribe
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                size="sm"
                disabled={status === 'processing'}
              >
                Reset
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
                  campaignId,
                  status,
                  progress,
                  sentCount,
                  failedCount,
                  totalRecipients,
                  successRate,
                  error,
                  startedAt,
                  completedAt,
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

export default BroadcastProgressMonitor;
