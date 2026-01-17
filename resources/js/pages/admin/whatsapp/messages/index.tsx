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
import { Search, MessageCircle, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';

interface WhatsAppMessage {
  id: number;
  whatsapp_session_id: number;
  from_number: string;
  to_number: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  media_type: string | null;
  media_url: string | null;
  sent_at: string;
  session: {
    id: number;
    name: string;
  };
}

interface WhatsAppSession {
  id: number;
  name: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  messages: PaginatedResponse<WhatsAppMessage>;
  sessions: WhatsAppSession[];
  filters: {
    search?: string;
    session_id?: string;
    direction?: string;
  };
}

export default function MessagesIndex({ messages, sessions, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [sessionId, setSessionId] = useState(filters.session_id || 'all');
  const [direction, setDirection] = useState(filters.direction || 'all');

  const handleSearch = () => {
    router.get('/admin/whatsapp/messages', {
      search,
      session_id: sessionId === 'all' ? '' : sessionId,
      direction: direction === 'all' ? '' : direction,
    }, { preserveState: true });
  };

  const getDirectionBadge = (direction: string) => {
    if (direction === 'incoming') {
      return (
        <Badge variant="secondary" className="flex items-center w-fit gap-1">
          <ArrowDownLeft className="h-3 w-3" />
          Masuk
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center w-fit gap-1">
        <ArrowUpRight className="h-3 w-3" />
        Keluar
      </Badge>
    );
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <Head title="Pesan WhatsApp" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pesan WhatsApp</h1>
            <p className="text-gray-600 mt-1">
              Lihat semua pesan masuk dan keluar dari sessions Anda
            </p>
          </div>
          <MessageCircle className="h-10 w-10 text-gray-400" />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari pesan, nomor telepon..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sessionId} onValueChange={setSessionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Session</SelectItem>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Arah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Arah</SelectItem>
                  <SelectItem value="incoming">Pesan Masuk</SelectItem>
                  <SelectItem value="outgoing">Pesan Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch}>Cari</Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pesan ({messages.total})</CardTitle>
            <CardDescription>
              {messages.from}-{messages.to} dari {messages.total} pesan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Arah</TableHead>
                  <TableHead>Dari</TableHead>
                  <TableHead>Ke</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Tipe Media</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Belum ada pesan. Pesan akan muncul di sini setelah ada aktivitas WhatsApp.
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.data.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <Badge variant="outline">{message.session.name}</Badge>
                      </TableCell>
                      <TableCell>{getDirectionBadge(message.direction)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {message.from_number}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {message.to_number}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-gray-700">
                          {truncateText(message.content)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {message.media_type ? (
                          <Badge variant="secondary" className="capitalize">
                            {message.media_type}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">Text</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(message.sent_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {messages.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Halaman {messages.current_page} dari {messages.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={messages.current_page === 1}
                    onClick={() => router.get(`/admin/whatsapp/messages?page=${messages.current_page - 1}`)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={messages.current_page === messages.last_page}
                    onClick={() => router.get(`/admin/whatsapp/messages?page=${messages.current_page + 1}`)}
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
