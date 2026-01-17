import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Calendar, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
    id: number
    name: string
    email: string
    subject: string
    message: string
    is_read: boolean
    created_at: string
}

interface ContactShowProps {
    contact: Contact
}

export default function ContactShow({ contact }: ContactShowProps) {
    const handleBack = () => {
        router.visit('/admin/contacts')
    }

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
            router.delete(`/admin/contacts/${contact.id}`, {
                onSuccess: () => {
                    toast.success('Pesan berhasil dihapus')
                },
                onError: () => {
                    toast.error('Gagal menghapus pesan')
                },
            })
        }
    }

    return (
        <AdminLayout>
            <Head title={`Pesan dari ${contact.name}`} />

            <PageHeader
                title="Detail Pesan"
                description="Lihat detail pesan dari formulir kontak"
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                        </Button>
                    </div>
                }
            />

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl">{contact.subject}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(contact.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        </div>
                        {!contact.is_read && (
                            <Badge variant="default">Baru</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Sender Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <User className="h-4 w-4" />
                                Nama Pengirim
                            </div>
                            <p className="text-lg font-semibold">{contact.name}</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                Email
                            </div>
                            <a
                                href={`mailto:${contact.email}`}
                                className="text-lg font-semibold text-primary hover:underline"
                            >
                                {contact.email}
                            </a>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground">Pesan</div>
                        <div className="rounded-lg border bg-muted/30 p-6">
                            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                                {contact.message}
                            </p>
                        </div>
                    </div>

                    {/* Reply Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button asChild>
                            <a href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Balas via Email
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
