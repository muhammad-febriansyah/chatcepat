import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FileText,
    Plus,
    Mail,
    MessageCircle,
    Edit,
    Trash2,
    Copy,
    Eye,
    MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageTemplate {
    id: number;
    name: string;
    type: 'whatsapp' | 'email';
    subject: string | null;
    content: string;
    category: string | null;
    description: string | null;
    usage_count: number;
    is_active: boolean;
    created_at: string;
}

interface TemplatesIndexProps {
    templates: {
        data: MessageTemplate[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        whatsapp: number;
        email: number;
    };
    currentType: 'whatsapp' | 'email' | null;
}

export default function TemplatesIndex({ templates, stats, currentType }: TemplatesIndexProps) {
    const [selectedType, setSelectedType] = useState<'whatsapp' | 'email'>(currentType || 'whatsapp');

    const handleTabChange = (value: string) => {
        setSelectedType(value as 'whatsapp' | 'email');
        router.get(`/user/templates?type=${value}`, {}, { preserveState: true });
    };

    const handleDelete = (templateId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            router.delete(`/user/templates/${templateId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleDuplicate = (templateId: number) => {
        router.post(`/user/templates/${templateId}/duplicate`, {}, {
            preserveScroll: true,
        });
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <UserLayout>
            <Head title="Template Pesan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Template Pesan
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Kelola template untuk WhatsApp dan Email dengan mudah
                            </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg">
                            <Link href={`/user/templates/create?type=${selectedType}`}>
                                <Plus className="size-4 mr-2" />
                                Buat Template
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Template</CardTitle>
                            <FileText className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Semua template
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Template WhatsApp</CardTitle>
                            <MessageCircle className="size-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.whatsapp}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Template WhatsApp
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Template Email</CardTitle>
                            <Mail className="size-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.email}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Template Email
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Templates List */}
                <Tabs value={selectedType} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="whatsapp" className="gap-2">
                            <MessageCircle className="size-4" />
                            WhatsApp
                        </TabsTrigger>
                        <TabsTrigger value="email" className="gap-2">
                            <Mail className="size-4" />
                            Email
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedType} className="mt-6 space-y-4">
                        {templates.data.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {templates.data.map((template) => (
                                    <Card key={template.id} className="group overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300">
                                        <CardHeader className="pb-3 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                                                        {template.name}
                                                    </CardTitle>
                                                    {template.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {template.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/user/templates/${template.id}/edit`}>
                                                                <Edit className="size-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                                                            <Copy className="size-4 mr-2" />
                                                            Duplikasi
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(template.id)}
                                                            className="text-destructive"
                                                        >
                                                            <Trash2 className="size-4 mr-2" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap">
                                                {template.category && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {template.category}
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant={template.is_active ? "default" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {template.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-4 space-y-3">
                                            {template.type === 'email' && template.subject && (
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                                                    <p className="text-sm font-medium truncate">{template.subject}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1.5">Preview Konten:</p>
                                                <div className="p-2 bg-muted/30 rounded-lg border border-dashed">
                                                    <p className="text-xs text-muted-foreground line-clamp-4 font-mono leading-relaxed">
                                                        {truncateText(template.content, 150)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="size-3" />
                                                        <span>{template.usage_count}x</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="h-7 text-xs"
                                                >
                                                    <Link href={`/user/templates/${template.id}/edit`}>
                                                        <Edit className="size-3 mr-1" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20">
                                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                                        <FileText className="size-12 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Belum Ada Template</h3>
                                    <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                                        Mulai buat template {selectedType === 'whatsapp' ? 'WhatsApp' : 'Email'} untuk mempermudah pengiriman pesan kepada customer Anda
                                    </p>
                                    <Button asChild size="lg" className="shadow-lg">
                                        <Link href={`/user/templates/create?type=${selectedType}`}>
                                            <Plus className="size-4 mr-2" />
                                            Buat Template Pertama
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
