import { Head, Link, router } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BroadcastProgressMonitor from '@/components/examples/BroadcastProgressMonitor';
import { ArrowLeft, Play, XCircle, Edit, Trash2, Calendar } from 'lucide-react';
import type { WhatsAppBroadcast } from '@/services/whatsapp-api.service';

interface Props {
  broadcast: WhatsAppBroadcast & {
    session: {
      id: number;
      name: string;
      phone_number: string;
    };
  };
}

export default function BroadcastShow({ broadcast }: Props) {
  const handleExecute = () => {
    if (confirm('Start this broadcast campaign?')) {
      router.post(`/admin/whatsapp/broadcasts/${broadcast.id}/execute`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ['broadcast'] });
        },
      });
    }
  };

  const handleCancel = () => {
    if (confirm('Cancel this broadcast campaign?')) {
      router.post(`/admin/whatsapp/broadcasts/${broadcast.id}/cancel`, {}, {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ['broadcast'] });
        },
      });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      router.delete(`/admin/whatsapp/broadcasts/${broadcast.id}`);
    }
  };

  const canStart = ['draft', 'scheduled'].includes(broadcast.status);
  const canCancel = ['processing', 'scheduled'].includes(broadcast.status);
  const canEdit = ['draft', 'scheduled'].includes(broadcast.status);
  const canDelete = broadcast.status === 'draft';

  return (
    <AdminLayout>
      <Head title={`Campaign: ${broadcast.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/whatsapp/broadcasts">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{broadcast.name}</h1>
              <p className="text-gray-600 mt-1">
                Campaign ID: #{broadcast.id}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {canStart && (
              <Button onClick={handleExecute}>
                <Play className="h-4 w-4 mr-2" />
                Start Campaign
              </Button>
            )}
            {canCancel && (
              <Button onClick={handleCancel} variant="outline">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
            {canEdit && (
              <Link href={`/admin/whatsapp/broadcasts/${broadcast.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button onClick={handleDelete} variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Campaign Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">WhatsApp Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{broadcast.session.name}</p>
              <p className="text-sm text-gray-500">{broadcast.session.phone_number}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Template Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="uppercase">
                {broadcast.template.type}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Batch Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                <span className="font-semibold">{broadcast.batch_size}</span> messages
              </p>
              <p className="text-sm text-gray-500">
                {broadcast.batch_delay_ms / 1000}s delay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              {broadcast.scheduled_at ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-sm">
                    {new Date(broadcast.scheduled_at).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not scheduled</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Progress Monitor */}
        <BroadcastProgressMonitor
          campaignId={broadcast.id}
          campaignName={broadcast.name}
          onCompleted={() => {
            router.reload({ only: ['broadcast'] });
          }}
          onFailed={(error) => {
            logger.error('Broadcast failed:', error);
            router.reload({ only: ['broadcast'] });
          }}
          showControls={false}
        />

        {/* Template Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Message Template</CardTitle>
            <CardDescription>
              This message will be sent to all recipients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {broadcast.template.mediaUrl && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Media</p>
                {broadcast.template.type === 'image' && (
                  <img
                    src={broadcast.template.mediaUrl}
                    alt="Template media"
                    className="max-w-md rounded border"
                  />
                )}
                {broadcast.template.type === 'document' && (
                  <a
                    href={broadcast.template.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {broadcast.template.mediaUrl}
                  </a>
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Message Content</p>
              <div className="bg-gray-50 p-4 rounded border whitespace-pre-wrap">
                {broadcast.template.content}
              </div>
            </div>

            {broadcast.template.variables && Object.keys(broadcast.template.variables).length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Variables</p>
                <div className="bg-gray-50 p-4 rounded border">
                  <pre className="text-sm">
                    {JSON.stringify(broadcast.template.variables, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {broadcast.error_message && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800 bg-red-50 p-4 rounded">
                {broadcast.error_message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(broadcast.created_at).toLocaleString()}
                </span>
              </div>
              {broadcast.started_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">
                    {new Date(broadcast.started_at).toLocaleString()}
                  </span>
                </div>
              )}
              {broadcast.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">
                    {new Date(broadcast.completed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
