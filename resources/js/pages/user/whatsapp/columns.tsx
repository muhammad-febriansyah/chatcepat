import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight, FileText, Image, Video, Music, File, MapPin, User, CheckCheck, Check, Clock, XCircle } from 'lucide-react';

export interface Message {
    id: number;
    message_id: string;
    from_number: string;
    to_number: string;
    direction: 'incoming' | 'outgoing';
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'contact' | 'other';
    content: string;
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    created_at: string;
}

const getDirectionBadge = (direction: 'incoming' | 'outgoing') => {
    if (direction === 'incoming') {
        return (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                <ArrowDownLeft className="size-3" />
                Masuk
            </Badge>
        );
    }
    return (
        <Badge className="flex items-center gap-1 w-fit bg-primary">
            <ArrowUpRight className="size-3" />
            Keluar
        </Badge>
    );
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'text':
            return <FileText className="size-4 text-blue-600" />;
        case 'image':
            return <Image className="size-4 text-green-600" />;
        case 'video':
            return <Video className="size-4 text-purple-600" />;
        case 'audio':
            return <Music className="size-4 text-orange-600" />;
        case 'document':
            return <File className="size-4 text-red-600" />;
        case 'location':
            return <MapPin className="size-4 text-pink-600" />;
        case 'contact':
            return <User className="size-4 text-indigo-600" />;
        default:
            return <FileText className="size-4 text-gray-600" />;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'read':
            return (
                <Badge className="flex items-center gap-1 w-fit bg-blue-500 hover:bg-blue-600">
                    <CheckCheck className="size-3" />
                    Dibaca
                </Badge>
            );
        case 'delivered':
            return (
                <Badge className="flex items-center gap-1 w-fit bg-green-500 hover:bg-green-600">
                    <CheckCheck className="size-3" />
                    Terkirim
                </Badge>
            );
        case 'sent':
            return (
                <Badge className="flex items-center gap-1 w-fit bg-emerald-500 hover:bg-emerald-600">
                    <Check className="size-3" />
                    Sent
                </Badge>
            );
        case 'pending':
            return (
                <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <Clock className="size-3" />
                    Pending
                </Badge>
            );
        case 'failed':
            return (
                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                    <XCircle className="size-3" />
                    Gagal
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const columns: ColumnDef<Message>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium w-12">{row.index + 1}</div>,
    },
    {
        accessorKey: 'direction',
        header: 'Arah',
        cell: ({ row }) => getDirectionBadge(row.getValue('direction')),
    },
    {
        id: 'contact',
        header: 'Kontak',
        cell: ({ row }) => {
            const message = row.original;
            const displayNumber = message.direction === 'outgoing'
                ? message.to_number
                : message.from_number;
            const label = message.direction === 'outgoing' ? 'Ke:' : 'Dari:';

            return (
                <div className="space-y-1 min-w-[120px] max-w-[160px]">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono truncate block">
                        {displayNumber}
                    </code>
                </div>
            );
        },
    },
    {
        accessorKey: 'type',
        header: 'Tipe',
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            return (
                <div className="flex items-center gap-2 min-w-[100px] max-w-[120px]">
                    {getTypeIcon(type)}
                    <span className="text-sm capitalize truncate">{type}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'content',
        header: 'Pesan',
        cell: ({ row }) => {
            const content = row.getValue('content') as string;
            if (!content) return <span className="text-muted-foreground text-sm italic">(Media/File)</span>;

            const truncated = content.length > 60
                ? content.substring(0, 60) + '...'
                : content;

            return (
                <div className="max-w-xs min-w-[200px]">
                    <p className="text-sm text-gray-700 break-words line-clamp-2">
                        {truncated}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
    },
    {
        accessorKey: 'created_at',
        header: 'Waktu',
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground min-w-[140px] max-w-[160px] whitespace-nowrap">
                {formatDate(row.getValue('created_at'))}
            </div>
        ),
    },
];
