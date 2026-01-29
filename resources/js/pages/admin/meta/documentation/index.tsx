import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Eye,
    Power,
    FileText,
    Instagram,
    Facebook,
    MessageCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Documentation {
    id: number;
    platform: 'whatsapp' | 'instagram' | 'facebook';
    title: string;
    slug: string;
    content: string;
    video_url: string | null;
    icon: string | null;
    order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    documentations: Documentation[];
}

const platformConfig = {
    whatsapp: { label: 'WhatsApp', color: 'bg-green-100 text-green-700', icon: MessageCircle },
    instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700', icon: Instagram },
    facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-700', icon: Facebook },
};

export default function DocumentationIndex({ documentations }: Props) {
    const [processing, setProcessing] = useState<number | null>(null);

    const handleToggle = (id: number) => {
        setProcessing(id);
        router.post(
            `/admin/meta/documentation/${id}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            }
        );
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus dokumentasi "${title}"?`)) {
            router.delete(`/admin/meta/documentation/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Meta Documentation Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-400/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                <BookOpen className="h-8 w-8 text-blue-500" />
                                Meta Documentation
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage platform documentation and guides
                            </p>
                        </div>
                        <Link href="/admin/meta/documentation/create">
                            <Button size="lg" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Documentation
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Docs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{documentations.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">
                                {documentations.filter((d) => d.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {documentations.filter((d) => d.platform === 'whatsapp').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {documentations.filter((d) => d.platform === 'instagram').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documentation List</CardTitle>
                        <CardDescription>
                            All platform documentation and user guides
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {documentations.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Order</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Video</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documentations.map((doc) => {
                                        const platform = platformConfig[doc.platform];
                                        const Icon = platform.icon;
                                        return (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    {doc.order}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {doc.icon && (
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                        <span className="font-medium">{doc.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={platform.color}>
                                                        <Icon className="h-3 w-3 mr-1" />
                                                        {platform.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {doc.slug}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {doc.video_url ? (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Yes
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">
                                                            No
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggle(doc.id)}
                                                        disabled={processing === doc.id}
                                                    >
                                                        {doc.is_active ? (
                                                            <Badge variant="default" className="bg-green-500">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Inactive</Badge>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/admin/meta/documentation/${doc.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/meta/documentation/${doc.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(doc.id, doc.title)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-12">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">
                                    No documentation found
                                </p>
                                <Link href="/admin/meta/documentation/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Documentation
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
