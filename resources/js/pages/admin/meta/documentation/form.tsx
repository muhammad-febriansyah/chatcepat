import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

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
}

interface Props {
    documentation?: Documentation;
}

export default function DocumentationForm({ documentation }: Props) {
    const isEdit = !!documentation;

    const { data, setData, post, put, processing, errors } = useForm({
        platform: documentation?.platform || 'whatsapp',
        title: documentation?.title || '',
        slug: documentation?.slug || '',
        content: documentation?.content || '',
        video_url: documentation?.video_url || '',
        icon: documentation?.icon || '',
        order: documentation?.order || 0,
        is_active: documentation?.is_active ?? true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/meta/documentation/${documentation.id}`);
        } else {
            post('/admin/meta/documentation');
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? 'Edit Documentation' : 'Create Documentation'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEdit ? 'Edit Documentation' : 'Create Documentation'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEdit ? 'Update documentation details' : 'Add new platform documentation'}
                        </p>
                    </div>
                    <Link href="/admin/meta/documentation">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentation Details</CardTitle>
                            <CardDescription>
                                Fill in the documentation information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Platform */}
                            <div className="space-y-2">
                                <Label htmlFor="platform">Platform *</Label>
                                <Select
                                    value={data.platform}
                                    onValueChange={(value) => setData('platform', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.platform && (
                                    <p className="text-sm text-red-500">{errors.platform}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => {
                                        setData('title', e.target.value);
                                        if (!isEdit) {
                                            setData('slug', generateSlug(e.target.value));
                                        }
                                    }}
                                    placeholder="e.g., Getting Started with WhatsApp"
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="getting-started-whatsapp"
                                />
                                <p className="text-xs text-muted-foreground">
                                    URL-friendly identifier (auto-generated from title)
                                </p>
                                {errors.slug && (
                                    <p className="text-sm text-red-500">{errors.slug}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Content (Markdown) *</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Write your documentation content in Markdown format..."
                                    rows={12}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Supports Markdown formatting
                                </p>
                                {errors.content && (
                                    <p className="text-sm text-red-500">{errors.content}</p>
                                )}
                            </div>

                            {/* Video URL */}
                            <div className="space-y-2">
                                <Label htmlFor="video_url">Video URL (Optional)</Label>
                                <Input
                                    id="video_url"
                                    type="url"
                                    value={data.video_url}
                                    onChange={(e) => setData('video_url', e.target.value)}
                                    placeholder="https://drive.google.com/file/d/..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Google Drive embed URL or YouTube URL
                                </p>
                                {errors.video_url && (
                                    <p className="text-sm text-red-500">{errors.video_url}</p>
                                )}
                            </div>

                            {/* Icon */}
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon (Optional)</Label>
                                <Input
                                    id="icon"
                                    value={data.icon}
                                    onChange={(e) => setData('icon', e.target.value)}
                                    placeholder="e.g., BookOpen, FileText, HelpCircle"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lucide icon name (see lucide.dev)
                                </p>
                                {errors.icon && (
                                    <p className="text-sm text-red-500">{errors.icon}</p>
                                )}
                            </div>

                            {/* Order */}
                            <div className="space-y-2">
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="0"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lower numbers appear first
                                </p>
                                {errors.order && (
                                    <p className="text-sm text-red-500">{errors.order}</p>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Make this documentation visible to users
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Saving...' : isEdit ? 'Update Documentation' : 'Create Documentation'}
                                </Button>
                                <Link href="/admin/meta/documentation">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AdminLayout>
    );
}
