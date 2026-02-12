import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink, AlertCircle } from 'lucide-react'

interface Props {
    data: any
    updateData: (d: any) => void
    onNext: () => void
    onBack: () => void
}

export default function Step1CreateMetaApp({ data, updateData, onNext, onBack }: Props) {
    const [error, setError] = useState('')

    const handleNext = () => {
        if (!data.appId || data.appId.trim().length < 5) {
            setError('Masukkan App ID yang valid dari Meta Developer Console.')
            return
        }
        setError('')
        onNext()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Langkah 1: Buat Meta Developer App</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Anda perlu membuat aplikasi di Meta Developer Console untuk menggunakan WhatsApp Business API.
                </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Cara Membuat Meta App:</h3>
                <ol className="space-y-2 text-sm text-gray-600">
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">1.</span>
                        <span>
                            Buka{' '}
                            <a
                                href="https://developers.facebook.com/apps"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                Meta Developer Console
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">2.</span>
                        <span>Klik <strong>My Apps</strong> lalu <strong>Create App</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">3.</span>
                        <span>Pilih type: <strong>Business</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">4.</span>
                        <span>Isi nama app, contoh: <code className="bg-white border px-1 rounded text-xs">WhatsApp - Nama Bisnis Anda</code></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">5.</span>
                        <span>Klik <strong>Create App</strong></span>
                    </li>
                </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p>
                    <strong>Info:</strong> App ID berbentuk angka panjang (15-16 digit). Bisa ditemukan di bagian atas dashboard app atau di App Settings - Basic.
                </p>
            </div>

            <div className="space-y-2 border-t pt-5">
                <Label htmlFor="appId">
                    Setelah app dibuat, masukkan App ID Anda:
                </Label>
                <Input
                    id="appId"
                    placeholder="Contoh: 2210262782822425"
                    value={data.appId || ''}
                    onChange={(e) => {
                        updateData({ appId: e.target.value })
                        setError('')
                    }}
                    className={error ? 'border-red-400' : ''}
                />
                {error && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </p>
                )}
            </div>

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack}>Kembali</Button>
                <Button onClick={handleNext}>Lanjutkan</Button>
            </div>
        </div>
    )
}
