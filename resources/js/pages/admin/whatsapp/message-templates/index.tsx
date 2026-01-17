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
import { Plus, Search, MoreVertical, Trash2, Edit, Eye, FileText, Image, FileIcon, Video } from 'lucide-react';

interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'video';
  category: string | null;
  is_active: boolean;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
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
  templates: PaginatedResponse<MessageTemplate>;
  filters: {
    search?: string;
    category?: string;
    type?: string;
    is_active?: string;
  };
}

export default function MessageTemplatesIndex({ templates, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || '');
  const [type, setType] = useState(filters.type || 'all');
  const [isActive, setIsActive] = useState(filters.is_active || 'all');

  const handleSearch = () => {
    router.get('/admin/whatsapp/message-templates', {
      search,
      category,
      type: type === 'all' ? '' : type,
      is_active: isActive === 'all' ? '' : isActive,
    }, { preserveState: true });
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      router.delete(`/admin/whatsapp/message-templates/${id}`, {
        preserveScroll: true,
      });
    }
  };

  const handleToggleActive = (id: number) => {
    router.post(`/admin/whatsapp/message-templates/${id}/toggle-active`, {}, {
      preserveScroll: true,
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      text: <FileText className="h-4 w-4" />,
      image: <Image className="h-4 w-4" />,
      document: <FileIcon className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
    };
    return icons[type] || icons.text;
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <AdminLayout>
      <Head title="Template Pesan WhatsApp" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Template Pesan</h1>
            <p className="text-gray-600 mt-1">
              Kelola template pesan WhatsApp untuk broadcast
            </p>
          </div>
          <Link href="/admin/whatsapp/message-templates/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Template Baru
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan nama, konten, atau kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={handleSearch}>Cari</Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Template ({templates.total})</CardTitle>
            <CardDescription>
              {templates.from}-{templates.to} dari {templates.total} template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Konten</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Penggunaan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Belum ada template. Buat template pertama Anda untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.data.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(template.type)}
                          <span className="capitalize">{template.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {truncateText(template.content)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {template.category ? (
                          <Badge variant="outline">{template.category}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{template.usage_count}x</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={template.is_active ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => handleToggleActive(template.id)}
                        >
                          {template.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
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
                              <Link href={`/admin/whatsapp/message-templates/${template.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(template.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {template.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(template.id)}
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
            {templates.last_page > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Halaman {templates.current_page} dari {templates.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={templates.current_page === 1}
                    onClick={() => router.get(`/admin/whatsapp/message-templates?page=${templates.current_page - 1}`)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={templates.current_page === templates.last_page}
                    onClick={() => router.get(`/admin/whatsapp/message-templates?page=${templates.current_page + 1}`)}
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
