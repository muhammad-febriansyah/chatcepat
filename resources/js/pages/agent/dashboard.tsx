import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    LogOut,
    Settings,
    Headset,
} from 'lucide-react';

interface HumanAgent {
    id: number;
    full_name: string;
    email: string;
    role: string;
    shift: string;
    is_online: boolean;
    last_active_at: string | null;
}

interface WhatsAppSession {
    id: number;
    name: string;
    phone_number: string;
    status: string;
}

interface Stats {
    total_chats: number;
    active_chats: number;
    pending_chats: number;
    resolved_today: number;
}

interface Props {
    agent: HumanAgent;
    assignedSessions: WhatsAppSession[];
    stats: Stats;
}

export default function AgentDashboard({ agent, assignedSessions, stats }: Props) {
    const handleLogout = () => {
        router.post(route('agent.logout'));
    };

    const getRoleBadge = (role: string) => {
        const variants: Record<string, string> = {
            admin: 'bg-red-100 text-red-700',
            supervisor: 'bg-blue-100 text-blue-700',
            agent: 'bg-green-100 text-green-700',
        };

        return (
            <Badge className={variants[role] || 'bg-gray-100 text-gray-700'}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Agent Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo & Title */}
                            <div className="flex items-center space-x-3">
                                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Headset className="size-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">ChatCepat Agent</h1>
                                    <p className="text-xs text-gray-500">Portal Customer Service</p>
                                </div>
                            </div>

                            {/* Agent Info & Actions */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {agent.full_name}
                                        </p>
                                        <div className="flex items-center justify-end space-x-2">
                                            {getRoleBadge(agent.role)}
                                            <div className="flex items-center">
                                                <div className="size-2 rounded-full bg-green-500 mr-1" />
                                                <span className="text-xs text-gray-500">Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Avatar className="size-10">
                                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-semibold">
                                            {agent.full_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <LogOut className="size-4 mr-1" />
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Selamat Datang, {agent.full_name}!
                            </h2>
                            <p className="text-gray-600">
                                Berikut adalah ringkasan chat dan tugas Anda hari ini
                            </p>
                        </div>
                        <Link href={route('agent.chat.index')}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <MessageSquare className="size-4 mr-2" />
                                Buka Chat Inbox
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                    <MessageSquare className="size-4 mr-2 text-blue-600" />
                                    Total Chat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">
                                    {stats.total_chats}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                    <Clock className="size-4 mr-2 text-orange-600" />
                                    Sedang Aktif
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-orange-600">
                                    {stats.active_chats}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                    <AlertCircle className="size-4 mr-2 text-red-600" />
                                    Menunggu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">
                                    {stats.pending_chats}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                                    <CheckCircle2 className="size-4 mr-2 text-green-600" />
                                    Selesai Hari Ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {stats.resolved_today}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Assigned WhatsApp Sessions */}
                    <Card className="border-0 shadow-sm mb-8">
                        <CardHeader>
                            <CardTitle>WhatsApp yang Ditugaskan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedSessions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {assignedSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">
                                                    {session.name}
                                                </h4>
                                                <Badge
                                                    className={
                                                        session.status === 'connected'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }
                                                >
                                                    {session.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {session.phone_number}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <MessageSquare className="size-12 mx-auto mb-3 opacity-50" />
                                    <p>Belum ada WhatsApp yang ditugaskan</p>
                                    <p className="text-sm mt-1">
                                        Hubungi administrator untuk mendapatkan assignment
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chat Inbox - Coming Soon */}
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Inbox Chat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-gray-500">
                                <MessageSquare className="size-12 mx-auto mb-3 opacity-50" />
                                <p className="font-semibold">Chat Interface Segera Hadir</p>
                                <p className="text-sm mt-1">
                                    Fitur chat inbox dan reply sedang dalam pengembangan
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
