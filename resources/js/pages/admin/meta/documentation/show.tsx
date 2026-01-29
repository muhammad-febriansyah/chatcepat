import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, User, Hash, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Documentation {
    id: number;
    platform: string;
    title: string;
    slug: string;
    content: string;
    video_url: string | null;
    icon: string | null;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    documentation: Documentation;
}

export default function ShowDocumentation({ documentation }: Props) {
    const platformColors: Record<string, string> = {
        whatsapp: 'bg-green-100 text-green-800 border-green-200',
        instagram: 'bg-pink-100 text-pink-800 border-pink-200',
        facebook: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    return (
        <AdminLayout>
            <Head title={`Documentation: ${documentation.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{documentation.title}</h1>
                        <p className="text-muted-foreground mt-1">View documentation details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/meta/documentation/${documentation.id}/edit`}>
                            <Button className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Link href="/admin/meta/documentation">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Content Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Content</CardTitle>
                                <CardDescription>Documentation content in Markdown format</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{documentation.content}</ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Video Card */}
                        {documentation.video_url && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Tutorial</CardTitle>
                                    <CardDescription>Embedded video guide</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                                        <iframe
                                            src={documentation.video_url}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Active</span>
                                    <Badge variant={documentation.is_active ? 'default' : 'secondary'}>
                                        {documentation.is_active ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Platform</span>
                                    <Badge className={platformColors[documentation.platform] || 'bg-gray-100 text-gray-800'}>
                                        {documentation.platform}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">ID:</span>
                                        <span className="text-muted-foreground">{documentation.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Slug:</span>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {documentation.slug}
                                        </code>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Order:</span>
                                        <span className="text-muted-foreground">{documentation.order}</span>
                                    </div>
                                    {documentation.icon && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">Icon:</span>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {documentation.icon}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timestamps Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Timestamps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Created</p>
                                        <p className="text-muted-foreground text-xs">
                                            {new Date(documentation.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Last Updated</p>
                                        <p className="text-muted-foreground text-xs">
                                            {new Date(documentation.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
