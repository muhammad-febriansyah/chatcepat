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
import { ArrowLeft, Save, Info } from 'lucide-react';
import { FormEventHandler } from 'react';

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
}

interface Props {
    template?: Template;
}

export default function TemplateForm({ template }: Props) {
    const isEdit = !!template;

    const { data, setData, post, put, processing, errors } = useForm({
        name: template?.name || '',
        category: template?.category || 'greeting',
        platform: template?.platform || 'whatsapp',
        content: template?.content || '',
        variables: template?.variables || [],
        language: template?.language || 'id',
        is_system: template?.is_system || false,
        is_active: template?.is_active ?? true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(`/admin/meta/templates/${template.id}`);
        } else {
            post('/admin/meta/templates');
        }
    };

    const extractVariables = (content: string) => {
        const regex = /\{\{(\w+)\}\}/g;
        const matches = content.matchAll(regex);
        const vars = Array.from(matches, (m) => m[1]);
        return [...new Set(vars)];
    };

    const handleContentChange = (content: string) => {
        setData('content', content);
        const vars = extractVariables(content);
        setData('variables', vars);
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? 'Edit Template' : 'Create Template'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isEdit ? 'Edit Template' : 'Create Template'}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isEdit ? 'Update template details' : 'Add new message template'}
                        </p>
                    </div>
                    <Link href="/admin/meta/templates">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template Details</CardTitle>
                                    <CardDescription>Fill in the template information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Template Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., Welcome Message"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Category & Platform */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={data.category}
                                                onValueChange={(value) => setData('category', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="greeting">Greeting</SelectItem>
                                                    <SelectItem value="follow_up">Follow Up</SelectItem>
                                                    <SelectItem value="marketing">Marketing</SelectItem>
                                                    <SelectItem value="support">Support</SelectItem>
                                                    <SelectItem value="special">Special</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.category && (
                                                <p className="text-sm text-red-500">{errors.category}</p>
                                            )}
                                        </div>

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
                                                    <SelectItem value="all">All Platforms</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.platform && (
                                                <p className="text-sm text-red-500">{errors.platform}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Message Content *</Label>
                                        <Textarea
                                            id="content"
                                            value={data.content}
                                            onChange={(e) => handleContentChange(e.target.value)}
                                            placeholder="Hello {{name}}, welcome to our service!"
                                            rows={8}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Use {'{{variable}}'} for dynamic content (e.g., {'{{name}}'}, {'{{product}}'})
                                        </p>
                                        {errors.content && (
                                            <p className="text-sm text-red-500">{errors.content}</p>
                                        )}
                                    </div>

                                    {/* Language */}
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Language</Label>
                                        <Select
                                            value={data.language}
                                            onValueChange={(value) => setData('language', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="id">Indonesian</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.language && (
                                            <p className="text-sm text-red-500">{errors.language}</p>
                                        )}
                                    </div>

                                    {/* Status Switches */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_active">Active Status</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this template available for use
                                                </p>
                                            </div>
                                            <Switch
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                        </div>

                                        {!isEdit && (
                                            <div className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <Label htmlFor="is_system">System Template</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        System templates cannot be deleted
                                                    </p>
                                                </div>
                                                <Switch
                                                    id="is_system"
                                                    checked={data.is_system}
                                                    onCheckedChange={(checked) => setData('is_system', checked)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center gap-4 pt-4">
                                        <Button type="submit" disabled={processing} className="gap-2">
                                            <Save className="h-4 w-4" />
                                            {processing ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
                                        </Button>
                                        <Link href="/admin/meta/templates">
                                            <Button type="button" variant="outline">
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - Variables Preview */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        Variables Detected
                                    </CardTitle>
                                    <CardDescription>
                                        Variables found in your template
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {data.variables && data.variables.length > 0 ? (
                                        <div className="space-y-2">
                                            {data.variables.map((variable, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                                                >
                                                    <code className="text-sm font-mono">
                                                        {'{{' + variable + '}}'}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No variables detected. Use {'{{variable}}'} syntax to add dynamic content.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Preview</CardTitle>
                                    <CardDescription>How your message will look</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 rounded-lg bg-muted whitespace-pre-wrap text-sm">
                                        {data.content || 'Your message will appear here...'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
