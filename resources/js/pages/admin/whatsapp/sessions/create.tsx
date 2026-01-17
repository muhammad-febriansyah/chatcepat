import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SessionCreate() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    // Show loading toast
    const loadingToast = toast.loading('Membuat session WhatsApp...', {
      description: 'Menghubungkan ke gateway...',
    });

    post('/admin/whatsapp/sessions', {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        toast.success('Session berhasil dibuat!');
      },
      onError: (errors) => {
        toast.dismiss(loadingToast);
        const errorMessage = errors.error || 'Terjadi kesalahan saat membuat session';
        toast.error('Gagal membuat session', {
          description: errorMessage,
        });
      },
    });
  };

  return (
    <AdminLayout>
      <Head title="Buat Session WhatsApp" />

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/admin/whatsapp/sessions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Buat Session WhatsApp Baru</h1>
            <p className="text-gray-600 mt-1">
              Hubungkan WhatsApp Anda dengan aplikasi
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Setelah membuat session, QR code akan muncul. Scan dengan aplikasi WhatsApp di HP Anda untuk menghubungkan.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Session</CardTitle>
              <CardDescription>
                Berikan nama untuk session WhatsApp Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Session *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Contoh: Customer Support, Tim Sales"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
                <p className="text-sm text-gray-500">
                  Nama untuk mengidentifikasi session WhatsApp ini
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Langkah Selanjutnya
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Session WhatsApp baru akan dibuat</li>
                  <li>QR code akan muncul di layar</li>
                  <li>Buka WhatsApp di HP Anda</li>
                  <li>Pilih Pengaturan → Perangkat Tertaut → Tautkan Perangkat</li>
                  <li>Scan QR code yang muncul di layar</li>
                  <li>WhatsApp Anda siap digunakan!</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Link href="/admin/whatsapp/sessions">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {processing ? 'Membuat Session...' : 'Buat Session'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
