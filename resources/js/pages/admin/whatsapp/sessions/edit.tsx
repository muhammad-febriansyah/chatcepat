import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface WhatsAppSession {
  id: number;
  name: string;
  webhook_url: string | null;
  settings: Record<string, any> | null;
}

interface Props {
  session: WhatsAppSession;
}

export default function SessionEdit({ session }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: session.name,
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(`/admin/whatsapp/sessions/${session.id}`);
  };

  return (
    <AdminLayout>
      <Head title="Edit Session WhatsApp" />

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
            <h1 className="text-3xl font-bold">Edit Session WhatsApp</h1>
            <p className="text-gray-600 mt-1">
              Ubah nama session WhatsApp Anda
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Session</CardTitle>
              <CardDescription>
                Perbarui nama session WhatsApp Anda
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
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Link href={`/admin/whatsapp/sessions/${session.id}`}>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
