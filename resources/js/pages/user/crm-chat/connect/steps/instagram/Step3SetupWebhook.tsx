import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CopyButton from '../../components/CopyButton'

interface Props {
    data: any
    updateData: (d: any) => void
    onNext: () => void
    onBack: () => void
    webhookUrl: string
    verifyToken: string
}

export default function Step3SetupWebhookInstagram({ data, updateData, onNext, onBack, webhookUrl, verifyToken }: Props) {
    const [checked1, setChecked1] = useState(false)
    const [checked2, setChecked2] = useState(false)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Langkah 3: Setup Webhook</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Webhook diperlukan agar ChatCepat dapat menerima pesan masuk dari Instagram
                </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Cara Setup Webhook Instagram:</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">1.</span>
                        <span>Di Meta Developer Console, klik <strong>Instagram</strong> lalu <strong>Configuration</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">2.</span>
                        <span>Cari section <strong>Webhook</strong> lalu klik <strong>Edit</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">3.</span>
                        <span>Copy dan paste data di bawah ke form webhook Meta</span>
                    </li>
                </ol>
            </div>

            <div className="space-y-3 p-5 bg-pink-50 border border-pink-200 rounded-lg">
                <h3 className="font-semibold text-sm text-pink-800">Data Webhook (copy ke Meta Developer Console):</h3>
                <CopyButton label="Callback URL" value={webhookUrl} />
                <CopyButton label="Verify Token" value={verifyToken} />
            </div>

            <div className="bg-gray-50 border rounded-lg p-5 space-y-2 text-sm text-gray-600">
                <ol className="space-y-2" start={4}>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">4.</span>
                        <span>Klik tombol <strong>Verify and Save</strong> di Meta</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">5.</span>
                        <span>Scroll ke bawah ke section <strong>Webhook fields</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">6.</span>
                        <span>Aktifkan (toggle ON) field <strong>messages</strong> di kolom Subscribe</span>
                    </li>
                </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p>
                    <strong>Info:</strong> Pastikan akun Instagram Anda (Business/Creator) sudah terhubung ke Facebook Page. Jika webhook verification berhasil, akan muncul notifikasi success di Meta.
                </p>
            </div>

            <div className="border-t pt-5 space-y-3">
                <p className="text-sm font-medium text-gray-700">Konfirmasi sebelum melanjutkan:</p>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="checkbox"
                        checked={checked1}
                        onChange={(e) => setChecked1(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">Webhook sudah verified (klik Verify and Save berhasil)</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="checkbox"
                        checked={checked2}
                        onChange={(e) => setChecked2(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">Field "messages" sudah dalam status Subscribed</span>
                </label>
            </div>

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack}>Kembali</Button>
                <Button onClick={onNext} disabled={!checked1 || !checked2}>Lanjutkan</Button>
            </div>
        </div>
    )
}
