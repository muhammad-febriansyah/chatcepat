import { Head, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Send, Loader2, CheckCircle2, XCircle, Upload, FileText, X, Image as ImageIcon, Video, FileAudio, File, Calendar, Clock } from 'lucide-react';
import { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface Session {
    id: number;
    session_id: string;
    name: string;
    status: string;
}

interface Group {
    id: string;
    name: string;
    participantCount: number;
    isAdmin: boolean;
}

interface GroupBroadcastProps {
    sessions: Session[];
}

export default function GroupBroadcast({ sessions }: GroupBroadcastProps) {
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [messageType, setMessageType] = useState<string>('text');
    const [messageText, setMessageText] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [broadcastType, setBroadcastType] = useState<'now' | 'scheduled'>('now');
    const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

    // Load groups when session changes
    useEffect(() => {
        if (selectedSession) {
            loadGroups();
        } else {
            setGroups([]);
            setSelectedGroups([]);
        }
    }, [selectedSession]);

    // Clean up preview when message type changes
    useEffect(() => {
        setImagePreview(null);
        setMediaFile(null);
        setCaption('');
    }, [messageType]);

    // Clean up preview on unmount
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const loadGroups = async () => {
        setIsLoadingGroups(true);
        try {
            const response = await fetch(`/user/broadcast/groups/list?session_id=${selectedSession}`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setGroups(data.data.groups || []);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal memuat grup',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat memuat grup',
            });
        } finally {
            setIsLoadingGroups(false);
        }
    };

    const handleSelectAllGroups = (checked: boolean) => {
        if (checked) {
            setSelectedGroups(groups.map(g => g.id));
        } else {
            setSelectedGroups([]);
        }
    };

    const handleGroupToggle = (groupId: string, checked: boolean) => {
        if (checked) {
            setSelectedGroups([...selectedGroups, groupId]);
        } else {
            setSelectedGroups(selectedGroups.filter(id => id !== groupId));
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            processFile(file);
        }
    };

    const handleClearImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setMediaFile(null);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type based on message type
            const validTypes = {
                image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
                audio: ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'],
                document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            };

            const allowedTypes = validTypes[messageType as keyof typeof validTypes] || [];

            if (allowedTypes.length === 0 || allowedTypes.includes(file.type)) {
                processFile(file);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: `Tipe file tidak sesuai dengan jenis pesan ${messageType}`
                });
            }
        }
    };

    const processFile = (file: File) => {
        setMediaFile(file);

        // Create preview for images
        if (messageType === 'image' && file.type.startsWith('image/')) {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        } else {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
        }
    };

    const getFileIcon = () => {
        switch (messageType) {
            case 'image':
                return <ImageIcon className="size-12 text-primary" />;
            case 'video':
                return <Video className="size-12 text-primary" />;
            case 'audio':
                return <FileAudio className="size-12 text-primary" />;
            case 'document':
                return <File className="size-12 text-primary" />;
            default:
                return <Upload className="size-12 text-primary" />;
        }
    };

    const getAcceptedFileTypes = () => {
        switch (messageType) {
            case 'image':
                return 'image/*';
            case 'video':
                return 'video/*';
            case 'audio':
                return 'audio/*';
            default:
                return '*/*';
        }
    };

    const handleSendBroadcast = async () => {
        if (!selectedSession) {
            setAlertMessage({ type: 'error', message: 'Pilih session terlebih dahulu' });
            return;
        }

        if (selectedGroups.length === 0) {
            setAlertMessage({ type: 'error', message: 'Pilih minimal 1 grup' });
            return;
        }

        if (messageType === 'text' && !messageText.trim()) {
            setAlertMessage({ type: 'error', message: 'Masukkan pesan teks' });
            return;
        }

        if (messageType !== 'text' && !mediaFile) {
            setAlertMessage({ type: 'error', message: 'Upload file media' });
            return;
        }

        if (broadcastType === 'scheduled' && !scheduledDate) {
            setAlertMessage({ type: 'error', message: 'Pilih tanggal dan waktu pengiriman' });
            return;
        }

        setIsSending(true);
        setAlertMessage(null);

        try {
            const formData = new FormData();
            formData.append('session_id', selectedSession);
            formData.append('message_type', messageType);
            formData.append('broadcast_type', broadcastType);

            if (broadcastType === 'scheduled' && scheduledDate) {
                formData.append('scheduled_at', scheduledDate.toISOString());
            }

            selectedGroups.forEach((groupId, index) => {
                formData.append(`group_jids[${index}]`, groupId);
            });

            if (messageType === 'text') {
                formData.append('message_text', messageText);
            } else {
                if (mediaFile) {
                    formData.append('media_file', mediaFile);
                }
                if (caption) {
                    formData.append('caption', caption);
                }
            }

            const response = await fetch('/user/broadcast/groups/send', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                const result = data.data;
                const successMessage = broadcastType === 'scheduled'
                    ? `Broadcast berhasil dijadwalkan untuk ${selectedGroups.length} grup`
                    : `Broadcast berhasil dikirim ke ${result.successCount} dari ${result.totalGroups} grup`;

                setAlertMessage({
                    type: 'success',
                    message: successMessage,
                });

                // Reset form
                setMessageText('');
                setCaption('');
                setMediaFile(null);
                setSelectedGroups([]);
                setBroadcastType('now');
                setScheduledDate(null);
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                }
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal mengirim broadcast',
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat mengirim broadcast',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <UserLayout>
            <Head title="Broadcast Grup WhatsApp" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Broadcast Grup WhatsApp
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Kirim pesan broadcast ke banyak grup WhatsApp sekaligus dengan support file
                        </p>
                    </div>
                </div>

                {alertMessage && (
                    <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'}>
                        <AlertDescription className="flex items-center gap-2">
                            {alertMessage.type === 'success' ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                <XCircle className="size-4" />
                            )}
                            {alertMessage.message}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Form */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Session & Group Selection */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pilih Session & Grup</CardTitle>
                                <CardDescription>Pilih session dan grup tujuan broadcast</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>WhatsApp Session</Label>
                                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih session..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sessions.map((session) => (
                                                <SelectItem key={session.id} value={session.session_id}>
                                                    {session.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {sessions.length === 0 && (
                                    <Alert>
                                        <AlertDescription>
                                            Tidak ada session aktif. Hubungkan WhatsApp terlebih dahulu.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {isLoadingGroups && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="size-6 animate-spin text-primary" />
                                        <span className="ml-2 text-sm">Memuat grup...</span>
                                    </div>
                                )}

                                {groups.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Grup ({selectedGroups.length}/{groups.length})</Label>
                                            <Checkbox
                                                checked={selectedGroups.length === groups.length}
                                                onCheckedChange={handleSelectAllGroups}
                                            />
                                        </div>

                                        <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
                                            {groups.map((group) => (
                                                <div key={group.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                                                    <Checkbox
                                                        checked={selectedGroups.includes(group.id)}
                                                        onCheckedChange={(checked) => handleGroupToggle(group.id, checked as boolean)}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{group.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {group.participantCount} anggota
                                                            {group.isAdmin && ' • Admin'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Message Composer */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Buat Pesan Broadcast</CardTitle>
                                <CardDescription>Pilih tipe pesan dan buat konten broadcast</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Tipe Pesan</Label>
                                    <Select value={messageType} onValueChange={setMessageType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Teks</SelectItem>
                                            <SelectItem value="image">Gambar</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="document">Dokumen</SelectItem>
                                            <SelectItem value="audio">Audio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {messageType === 'text' ? (
                                    <div className="space-y-2">
                                        <Label>Pesan</Label>
                                        <Textarea
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Tulis pesan broadcast Anda di sini..."
                                            rows={10}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {messageText.length} karakter
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Upload File</Label>

                                            {/* Drag & Drop Area */}
                                            {!mediaFile ? (
                                                <div
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    className={`
                                                        relative border-2 border-dashed rounded-lg p-8 transition-all duration-200
                                                        ${isDragging
                                                            ? 'border-primary bg-primary/5 scale-[1.02]'
                                                            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                                        }
                                                    `}
                                                >
                                                    <input
                                                        type="file"
                                                        id="file-upload"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept={getAcceptedFileTypes()}
                                                    />

                                                    <label
                                                        htmlFor="file-upload"
                                                        className="flex flex-col items-center justify-center cursor-pointer"
                                                    >
                                                        <div className="mb-4 p-3 rounded-full bg-primary/10">
                                                            {getFileIcon()}
                                                        </div>

                                                        <p className="text-base font-medium text-foreground mb-1">
                                                            {isDragging ? 'Lepaskan file di sini' : 'Drag & drop file atau klik untuk upload'}
                                                        </p>

                                                        <p className="text-sm text-muted-foreground">
                                                            {messageType === 'image' && 'PNG, JPG, GIF hingga 10MB'}
                                                            {messageType === 'video' && 'MP4, AVI, MOV hingga 10MB'}
                                                            {messageType === 'audio' && 'MP3, WAV, OGG hingga 10MB'}
                                                            {messageType === 'document' && 'PDF, DOC, DOCX hingga 10MB'}
                                                        </p>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="mt-4"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                document.getElementById('file-upload')?.click();
                                                            }}
                                                        >
                                                            <Upload className="mr-2 size-4" />
                                                            Pilih File
                                                        </Button>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-primary/20 bg-primary/5 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-primary/10">
                                                            {messageType === 'image' && <ImageIcon className="size-6 text-primary" />}
                                                            {messageType === 'video' && <Video className="size-6 text-primary" />}
                                                            {messageType === 'audio' && <FileAudio className="size-6 text-primary" />}
                                                            {messageType === 'document' && <File className="size-6 text-primary" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">
                                                                {mediaFile.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={handleClearImage}
                                                            className="shrink-0"
                                                        >
                                                            <X className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Image Preview */}
                                            {imagePreview && messageType === 'image' && (
                                                <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                                                    <div className="p-4">
                                                        <p className="text-xs font-medium text-muted-foreground mb-3">Preview Gambar:</p>
                                                        <div className="relative w-full bg-white/50 backdrop-blur-sm rounded-lg p-3 shadow-inner">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="w-full h-auto rounded-md"
                                                                style={{ maxHeight: '350px', objectFit: 'contain' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {(messageType === 'image' || messageType === 'video' || messageType === 'document') && (
                                            <div className="space-y-2">
                                                <Label>Caption (Opsional)</Label>
                                                <Textarea
                                                    value={caption}
                                                    onChange={(e) => setCaption(e.target.value)}
                                                    placeholder="Tambahkan caption untuk media..."
                                                    rows={4}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Broadcast Timing */}
                                <div className="space-y-4 border-t pt-6">
                                    <div className="space-y-2">
                                        <Label className="text-base font-semibold">Waktu Pengiriman</Label>
                                        <RadioGroup
                                            value={broadcastType}
                                            onValueChange={(value: 'now' | 'scheduled') => setBroadcastType(value)}
                                        >
                                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="now" id="group-now" />
                                                <Label htmlFor="group-now" className="flex-1 cursor-pointer">
                                                    <div className="font-medium">Kirim Sekarang ke {selectedGroups.length} Grup</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Broadcast akan langsung diproses dan dikirim
                                                    </div>
                                                </Label>
                                                <Send className="size-5 text-muted-foreground" />
                                            </div>

                                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="scheduled" id="group-scheduled" />
                                                <Label htmlFor="group-scheduled" className="flex-1 cursor-pointer">
                                                    <div className="font-medium">Broadcast Terjadwal ke {selectedGroups.length} Grup</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Tentukan tanggal dan waktu pengiriman
                                                    </div>
                                                </Label>
                                                <Calendar className="size-5 text-muted-foreground" />
                                            </div>
                                        </RadioGroup>

                                        {broadcastType === 'scheduled' && (
                                            <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2 mt-4">
                                                <Label>Tanggal & Waktu Pengiriman</Label>
                                                <DateTimePicker
                                                    selected={scheduledDate}
                                                    onChange={setScheduledDate}
                                                    placeholder="Pilih tanggal dan waktu"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Broadcast akan dikirim pada waktu yang ditentukan
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Alert>
                                    <AlertDescription>
                                        <strong>Catatan:</strong> Pesan akan dikirim dengan delay otomatis antar grup untuk menghindari spam detection.
                                    </AlertDescription>
                                </Alert>

                                <Button
                                    onClick={handleSendBroadcast}
                                    disabled={isSending || !selectedSession || selectedGroups.length === 0}
                                    className="w-full h-12 text-base"
                                    size="lg"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="mr-2 size-5 animate-spin" />
                                            {broadcastType === 'scheduled'
                                                ? `Menjadwalkan untuk ${selectedGroups.length} grup...`
                                                : `Mengirim ke ${selectedGroups.length} grup...`}
                                        </>
                                    ) : (
                                        <>
                                            {broadcastType === 'scheduled' ? (
                                                <>
                                                    <Calendar className="mr-2 size-5" />
                                                    Jadwalkan Broadcast ke {selectedGroups.length} Grup
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 size-5" />
                                                    Kirim Broadcast ke {selectedGroups.length} Grup
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
