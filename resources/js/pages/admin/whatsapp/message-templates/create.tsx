import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Info } from 'lucide-react';

export default function MessageTemplateCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    content: '',
    type: 'text',
    category: '',
    media_url: '',
    is_active: true,
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/admin/whatsapp/message-templates');
  };

  return (
    <AdminLayout>
      <Head title="Buat Template Pesan" />

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/admin/whatsapp/message-templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Buat Template Pesan</h1>
            <p className="text-gray-600 mt-1">
              Tambah template pesan baru untuk broadcast WhatsApp
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Gunakan variabel seperti {'{'}nama{'}'}, {'{'}nomor{'}'}, {'{'}tanggal{'}'} untuk personalisasi pesan.
            Variabel akan diganti otomatis saat mengirim pesan.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detail Template</CardTitle>
              <CardDescription>
                Isi informasi template pesan WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Template *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Misal: Ucapan Selamat Datang"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
                <p className="text-sm text-gray-500">
                  Nama untuk mengidentifikasi template ini
                </p>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipe *</Label>
                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  placeholder="Misal: greeting, promo, follow-up"
                />
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
                <p className="text-sm text-gray-500">
                  Kategori untuk mengelompokkan template (opsional)
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Konten Pesan *</Label>
                <Textarea
                  id="content"
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  placeholder="Halo {nama}, selamat datang di layanan kami..."
                  rows={6}
                  required
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content}</p>
                )}
                <p className="text-sm text-gray-500">
                  Isi pesan template. Gunakan {'{'}variabel{'}'} untuk personalisasi
                </p>
              </div>

              {/* Media URL - Only show if type is not text */}
              {data.type !== 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="media_url">URL Media</Label>
                  <Input
                    id="media_url"
                    type="url"
                    value={data.media_url}
                    onChange={(e) => setData('media_url', e.target.value)}
                    placeholder="https://example.com/media/file.jpg"
                  />
                  {errors.media_url && (
                    <p className="text-sm text-red-600">{errors.media_url}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    URL file {data.type} yang akan dikirim
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Variabel yang tersedia:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><code className="bg-white px-1 rounded">{'{'}nama{'}'}</code> - Nama penerima</li>
                  <li><code className="bg-white px-1 rounded">{'{'}nomor{'}'}</code> - Nomor telepon</li>
                  <li><code className="bg-white px-1 rounded">{'{'}tanggal{'}'}</code> - Tanggal hari ini</li>
                  <li><code className="bg-white px-1 rounded">{'{'}waktu{'}'}</code> - Waktu saat ini</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  Variabel akan diganti secara otomatis saat mengirim broadcast
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Link href="/admin/whatsapp/message-templates">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? 'Menyimpan...' : 'Simpan Template'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
