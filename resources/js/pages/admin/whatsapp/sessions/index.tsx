import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/use-websocket';
import { websocketService } from '@/services/websocket.service';
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
import { Plus, Search, MoreVertical, Wifi, WifiOff, Trash2, Edit, Eye } from 'lucide-react';
import type { WhatsAppSession, PaginatedResponse } from '@/services/whatsapp-api.service';

interface Props {
  sessions: PaginatedResponse<WhatsAppSession>;
  filters: {
    search?: string;
    status?: string;
  };
}

export default function SessionsIndex({ sessions, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');

  // Connect to WebSocket for real-time status updates
  const { isConnected: wsConnected } = useWebSocket();

  // Listen for session status changes
  useEffect(() => {
    if (!wsConnected) return;

    const handleSessionConnected = (event: any) => {
      console.log('🔔 Session connected event received:', event);
      // Reload page data to show updated status
      router.reload({ only: ['sessions'], preserveScroll: true });
    };

    const handleSessionDisconnected = (event: any) => {
      console.log('🔔 Session disconnected event received:', event);
      // Reload page data to show updated status
      router.reload({ only: ['sessions'], preserveScroll: true });
    };

    const handleSessionStatus = (event: any) => {
      console.log('🔔 Session status event received:', event);
      // Reload page data to show updated status
      router.reload({ only: ['sessions'], preserveScroll: true });
    };

    // Register event listeners
    websocketService.on('session:connected', handleSessionConnected);
    websocketService.on('session:disconnected', handleSessionDisconnected);
    websocketService.on('session:status', handleSessionStatus);

    console.log('✅ Registered real-time status listeners for sessions index');

    // Cleanup on unmount
    return () => {
      websocketService.off('session:connected', handleSessionConnected);
      websocketService.off('session:disconnected', handleSessionDisconnected);
      websocketService.off('session:status', handleSessionStatus);
      console.log('🧹 Cleaned up real-time status listeners');
    };
  }, [wsConnected]);

  const handleSearch = () => {
    router.get('/admin/whatsapp/sessions', {
      search,
      status: status === 'all' ? '' : status
    }, { preserveState: true });
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus session ini?')) {
      router.delete(`/admin/whatsapp/sessions/${id}`, {
        preserveScroll: true,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="flex items-center w-fit">
            <Wifi className="h-3 w-3 mr-1" />
            Terhubung
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary" className="flex items-center w-fit">
            <WifiOff className="h-3 w-3 mr-1" />
            Menghubungkan
          </Badge>
        );
      case 'qr_ready':
        return (
          <Badge variant="secondary" className="flex items-center w-fit">
            QR Siap
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="flex items-center w-fit">
            Gagal
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center w-fit">
            <WifiOff className="h-3 w-3 mr-1" />
            Terputus
          </Badge>
        );
    }
  };

  return (
    <AdminLayout>
      <Head title="Session WhatsApp" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session WhatsApp</h1>
            <p className="text-gray-600 mt-1">
              Kelola koneksi dan session WhatsApp Anda
            </p>
          </div>
          <Link href="/admin/whatsapp/sessions/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Session Baru
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
                    placeholder="Cari berdasarkan nama, session ID, atau nomor telepon..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="connected">Terhubung</SelectItem>
                  <SelectItem value="connecting">Menghubungkan</SelectItem>
                  <SelectItem value="disconnected">Terputus</SelectItem>
                  <SelectItem value="qr_ready">QR Siap</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch}>Cari</Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Session ({sessions.total})</CardTitle>
            <CardDescription>
              Menampilkan {sessions.from}-{sessions.to} dari {sessions.total} session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Nomor WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Terakhir Terhubung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Belum ada session. Buat session WhatsApp pertama Anda untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.data.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {session.session_id}
                        </code>
                      </TableCell>
                      <TableCell>{session.phone_number || '-'}</TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell>
                        {session.last_connected_at
                          ? new Date(session.last_connected_at).toLocaleString('id-ID')
                          : '-'}
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
                              <Link href={`/admin/whatsapp/sessions/${session.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/whatsapp/sessions/${session.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(session.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {sessions.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Halaman {sessions.current_page} dari {sessions.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sessions.current_page === 1}
                    onClick={() => router.get(`/admin/whatsapp/sessions?page=${sessions.current_page - 1}`)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sessions.current_page === sessions.last_page}
                    onClick={() => router.get(`/admin/whatsapp/sessions?page=${sessions.current_page + 1}`)}
                  >
                    Selanjutnya
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
