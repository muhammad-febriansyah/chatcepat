import { Head } from '@inertiajs/react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Example Page - PageHeader Component Usage
 *
 * This page demonstrates various ways to use the PageHeader component
 * with different configurations and styling options.
 */
export default function ExamplePageHeader() {
    return (
        <>
            <Head title="PageHeader Examples" />

            {/* Example 1: Basic Usage */}
            <PageHeader
                title="Welcome to Dashboard"
                description="This is a basic example of the PageHeader component with title and description."
            />

            <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Example 2: With Breadcrumbs */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Example: With Breadcrumbs</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Code Example</CardTitle>
                            <CardDescription>PageHeader with breadcrumb navigation</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                <code>{`<PageHeader
    title="Product Details"
    description="View and manage product information"
    breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Products', href: '/products' },
        { name: 'Product Details' }
    ]}
/>`}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </section>

                {/* Example 3: With Action Buttons */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Example: With Action Buttons</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Code Example</CardTitle>
                            <CardDescription>PageHeader with custom action buttons</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                <code>{`<PageHeader
    title="User Management"
    description="Manage users and permissions"
>
    <div className="flex gap-3">
        <Button>Add User</Button>
        <Button variant="outline">Import Users</Button>
        <Button variant="outline">Export</Button>
    </div>
</PageHeader>`}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </section>

                {/* Example 4: Minimal */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Example: Minimal</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Code Example</CardTitle>
                            <CardDescription>Minimal PageHeader with only title</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                                <code>{`<PageHeader title="Settings" />`}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </section>

                {/* Architecture Overview */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Clean Architecture Overview</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Component Structure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">📁</span>
                                        <div>
                                            <strong>components/layout/</strong>
                                            <p className="text-muted-foreground">Reusable layout components</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">📄</span>
                                        <div>
                                            <strong>types/components/</strong>
                                            <p className="text-muted-foreground">TypeScript type definitions</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary">🎨</span>
                                        <div>
                                            <strong>SVG Pattern</strong>
                                            <p className="text-muted-foreground">Decorative background pattern</p>
                                        </div>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Key Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Fully typed with TypeScript
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Responsive design (mobile-first)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Customizable with className prop
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Accessible ARIA labels
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Inertia.js Link integration
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        Extensible with children slot
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Color System */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6">Color System</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Colors</CardTitle>
                            <CardDescription>Configured in resources/css/app.css</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div
                                        className="h-20 rounded-lg border"
                                        style={{ backgroundColor: '#2547F9' }}
                                    ></div>
                                    <div className="text-sm">
                                        <strong>Primary Color</strong>
                                        <p className="text-muted-foreground">#2547F9</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div
                                        className="h-20 rounded-lg border"
                                        style={{ backgroundColor: '#F7F8FD' }}
                                    ></div>
                                    <div className="text-sm">
                                        <strong>Background Color</strong>
                                        <p className="text-muted-foreground">#F7F8FD</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}
