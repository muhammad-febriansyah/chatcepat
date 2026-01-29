import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
    MessageSquare,
    Plus,
    Edit,
    Trash2,
    Eye,
    Copy,
    Search,
    Filter,
} from 'lucide-react';
import { useState } from 'react';

interface Template {
    id: number;
    name: string;
    category: string;
    platform: string;
    content: string;
    variables: string[] | null;
    language: string;
    is_system: boolean;
    is_active: boolean;
    usage_count: number;
    created_at: string;
}

interface Stats {
    total: number;
    by_category: Record<string, number>;
    by_platform: Record<string, number>;
}

interface Props {
    templates: Template[];
    stats: Stats;
    filters: {
        category?: string;
        platform?: string;
        search?: string;
    };
}

const categoryConfig = {
    greeting: { label: 'Greeting', color: 'bg-blue-100 text-blue-700' },
    follow_up: { label: 'Follow Up', color: 'bg-purple-100 text-purple-700' },
    marketing: { label: 'Marketing', color: 'bg-green-100 text-green-700' },
    support: { label: 'Support', color: 'bg-orange-100 text-orange-700' },
    special: { label: 'Special', color: 'bg-pink-100 text-pink-700' },
};

const platformConfig = {
    whatsapp: { label: 'WhatsApp', color: 'bg-green-100 text-green-700' },
    instagram: { label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
    facebook: { label: 'Facebook', color: 'bg-blue-100 text-blue-700' },
    all: { label: 'All Platforms', color: 'bg-gray-100 text-gray-700' },
};

export default function TemplatesIndex({ templates, stats, filters }: Props) {
    const [processing, setProcessing] = useState<number | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [platform, setPlatform] = useState(filters.platform || 'all');

    const handleFilter = () => {
        router.get(
            '/admin/meta/templates',
            {
                search: search || undefined,
                category: category !== 'all' ? category : undefined,
                platform: platform !== 'all' ? platform : undefined,
            },
            { preserveState: true }
        );
    };

    const handleToggle = (id: number) => {
        setProcessing(id);
        router.post(
            `/admin/meta/templates/${id}/toggle`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            }
        );
    };

    const handleDuplicate = (id: number) => {
        router.post(`/admin/meta/templates/${id}/duplicate`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number, name: string, isSystem: boolean) => {
        if (isSystem) {
            alert('Cannot delete system template');
            return;
        }
        if (confirm(`Apakah Anda yakin ingin menghapus template "${name}"?`)) {
            router.delete(`/admin/meta/templates/${id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Message Templates Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-400/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                <MessageSquare className="h-8 w-8 text-purple-500" />
                                Message Templates
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage reusable message templates
                            </p>
                        </div>
                        <Link href="/admin/meta/templates/create">
                            <Button size="lg" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Template
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Greeting</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.by_category.greeting || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Follow Up</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.by_category.follow_up || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.by_category.marketing || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.by_category.support || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Search templates..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="greeting">Greeting</SelectItem>
                                        <SelectItem value="follow_up">Follow Up</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                        <SelectItem value="support">Support</SelectItem>
                                        <SelectItem value="special">Special</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Select value={platform} onValueChange={setPlatform}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Platforms</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="gap-2">
                                <Search className="h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Templates List</CardTitle>
                        <CardDescription>
                            All message templates with usage statistics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {templates.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Platform</TableHead>
                                        <TableHead>Variables</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.map((template) => {
                                        const cat = categoryConfig[template.category as keyof typeof categoryConfig];
                                        const plat = platformConfig[template.platform as keyof typeof platformConfig];
                                        return (
                                            <TableRow key={template.id}>
                                                <TableCell>
                                                    <div>
                                                        <span className="font-medium">{template.name}</span>
                                                        {template.is_system && (
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                System
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                                                        {template.content.substring(0, 50)}...
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cat.color}>{cat.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={plat.color}>{plat.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {template.variables && template.variables.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {template.variables.slice(0, 2).map((v, i) => (
                                                                <code key={i} className="text-xs bg-muted px-1 rounded">
                                                                    {v}
                                                                </code>
                                                            ))}
                                                            {template.variables.length > 2 && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    +{template.variables.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">None</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{template.usage_count}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggle(template.id)}
                                                        disabled={processing === template.id}
                                                    >
                                                        {template.is_active ? (
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
                                                        <Link href={`/admin/meta/templates/${template.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/meta/templates/${template.id}/edit`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDuplicate(template.id)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(template.id, template.name, template.is_system)
                                                            }
                                                            disabled={template.is_system}
                                                        >
                                                            <Trash2
                                                                className={`h-4 w-4 ${template.is_system ? 'text-muted-foreground' : 'text-red-500'
                                                                    }`}
                                                            />
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
                                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">No templates found</p>
                                <Link href="/admin/meta/templates/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create First Template
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
