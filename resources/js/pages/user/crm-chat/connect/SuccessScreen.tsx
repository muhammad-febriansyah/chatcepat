import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { CheckCircle, MessageCircle, Zap, Radio } from 'lucide-react'

interface Props {
    data: any
}

export default function SuccessScreen({ data }: Props) {
    return (
        <div className="flex flex-col items-center text-center py-8 space-y-6">
            <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-900">WhatsApp Berhasil Terhubung</h2>
                <p className="text-gray-500 mt-2">
                    Channel <strong>{data.channelName}</strong> sudah aktif dan siap digunakan
                </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-5 w-full text-left space-y-2">
                <h3 className="font-semibold text-green-800 text-sm">Yang sudah berhasil dikonfigurasi:</h3>
                {[
                    'Webhook sudah terverifikasi',
                    'Phone Number ID tersimpan',
                    'Business Account ID tersimpan',
                    'Access Token tersimpan',
                    'Siap kirim dan terima pesan',
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        {item}
                    </div>
                ))}
            </div>

            <div className="w-full">
                <h3 className="font-semibold text-sm text-gray-700 mb-3 text-left">Langkah selanjutnya:</h3>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => router.visit('/user/crm-chat')}
                        className="p-4 border rounded-lg hover:bg-gray-50 text-center space-y-2 transition-all"
                    >
                        <MessageCircle className="w-6 h-6 text-blue-500 mx-auto" />
                        <p className="text-xs font-medium">Buka Chat</p>
                    </button>
                    <button
                        onClick={() => router.visit('/user/meta/auto-replies')}
                        className="p-4 border rounded-lg hover:bg-gray-50 text-center space-y-2 transition-all"
                    >
                        <Zap className="w-6 h-6 text-yellow-500 mx-auto" />
                        <p className="text-xs font-medium">Setup Auto Reply</p>
                    </button>
                    <button
                        onClick={() => router.visit('/user/meta/broadcasts')}
                        className="p-4 border rounded-lg hover:bg-gray-50 text-center space-y-2 transition-all"
                    >
                        <Radio className="w-6 h-6 text-purple-500 mx-auto" />
                        <p className="text-xs font-medium">Broadcast Pesan</p>
                    </button>
                </div>
            </div>

            <div className="flex gap-3 w-full">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.visit('/user/crm-chat/connect/whatsapp')}
                >
                    Tambah Channel Lain
                </Button>
                <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => router.visit('/user/crm-chat')}
                >
                    Ke Dashboard
                </Button>
            </div>
        </div>
    )
}
