import { Head } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralReport from '@/components/user/reports/general-report';
import BroadcastReport from '@/components/user/reports/broadcast-report';
import ScrapingReport from '@/components/user/reports/scraping-report';
import ChatbotReport from '@/components/user/reports/chatbot-report';
import { BarChart3 } from 'lucide-react';

export default function ReportsIndex() {
    return (
        <UserLayout>
            <Head title="Laporan" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <h1 className="text-3xl font-bold">Laporan</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Pantau dan analisis aktivitas bisnis Anda dengan laporan komprehensif
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">Umum</TabsTrigger>
                        <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
                        <TabsTrigger value="scraping">Scraping</TabsTrigger>
                        <TabsTrigger value="chatbot">Chatbot & Reply</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4">
                        <GeneralReport />
                    </TabsContent>

                    <TabsContent value="broadcast" className="space-y-4">
                        <BroadcastReport />
                    </TabsContent>

                    <TabsContent value="scraping" className="space-y-4">
                        <ScrapingReport />
                    </TabsContent>

                    <TabsContent value="chatbot" className="space-y-4">
                        <ChatbotReport />
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
