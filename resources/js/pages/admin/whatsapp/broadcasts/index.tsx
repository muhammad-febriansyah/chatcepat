import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Play, XCircle } from 'lucide-react';
import type { WhatsAppBroadcast, WhatsAppSession, PaginatedResponse } from '@/services/whatsapp-api.service';

interface Props {
  broadcasts: PaginatedResponse<WhatsAppBroadcast & { session: WhatsAppSession }>;
  sessions: WhatsAppSession[];
  filters: {
    search?: string;
    status?: string;
    session_id?: string;
  };
}

export default function BroadcastsIndex({ broadcasts, sessions, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [sessionId, setSessionId] = useState(filters.session_id || 'all');

  const handleSearch = () => {
    router.get('/admin/whatsapp/broadcasts', {
      search,
      status: status === 'all' ? '' : status,
      session_id: sessionId === 'all' ? '' : sessionId
    }, { preserveState: true });
  };

  const handleExecute = (id: number) => {
    if (confirm('Start this broadcast campaign?')) {
      router.post(`/admin/whatsapp/broadcasts/${id}/execute`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleCancel = (id: number) => {
    if (confirm('Cancel this broadcast campaign?')) {
      router.post(`/admin/whatsapp/broadcasts/${id}/cancel`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this broadcast?')) {
      router.delete(`/admin/whatsapp/broadcasts/${id}`, {
        preserveScroll: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      draft: { variant: 'outline', label: 'Draft' },
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      processing: { variant: 'default', label: 'Processing' },
      completed: { variant: 'default', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };

    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProgress = (broadcast: WhatsAppBroadcast) => {
    if (broadcast.total_recipients === 0) return 0;
    return Math.round(((broadcast.sent_count + broadcast.failed_count) / broadcast.total_recipients) * 100);
  };

  return (
    <AdminLayout>
      <Head title="Broadcast Campaigns" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Broadcast Campaigns</h1>
            <p className="text-gray-600 mt-1">
              Create and manage WhatsApp broadcast campaigns
            </p>
          </div>
          <Link href="/admin/whatsapp/broadcasts/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sessionId} onValueChange={setSessionId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Sessions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sessions</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Campaigns ({broadcasts.total})</CardTitle>
            <CardDescription>
              {broadcasts.from}-{broadcasts.to} of {broadcasts.total} campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No campaigns found. Create your first broadcast campaign.
                    </TableCell>
                  </TableRow>
                ) : (
                  broadcasts.data.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell className="font-medium">{broadcast.name}</TableCell>
                      <TableCell>{broadcast.session?.name || '-'}</TableCell>
                      <TableCell>{getStatusBadge(broadcast.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={getProgress(broadcast)} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {broadcast.sent_count + broadcast.failed_count} / {broadcast.total_recipients}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-green-600">✓ {broadcast.sent_count}</div>
                          {broadcast.failed_count > 0 && (
                            <div className="text-red-600">✗ {broadcast.failed_count}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(broadcast.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/whatsapp/broadcasts/${broadcast.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>

                            {['draft', 'scheduled'].includes(broadcast.status) && (
                              <>
                                <DropdownMenuItem onClick={() => handleExecute(broadcast.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Campaign
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/whatsapp/broadcasts/${broadcast.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                              </>
                            )}

                            {['processing', 'scheduled'].includes(broadcast.status) && (
                              <DropdownMenuItem onClick={() => handleCancel(broadcast.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            )}

                            {broadcast.status === 'draft' && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(broadcast.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {broadcasts.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Page {broadcasts.current_page} of {broadcasts.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={broadcasts.current_page === 1}
                    onClick={() => router.get(`/admin/whatsapp/broadcasts?page=${broadcasts.current_page - 1}`)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={broadcasts.current_page === broadcasts.last_page}
                    onClick={() => router.get(`/admin/whatsapp/broadcasts?page=${broadcasts.current_page + 1}`)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
