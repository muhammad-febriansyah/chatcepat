import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface Props {
    data: any
    updateData: (d: any) => void
    onNext: () => void
    onBack: () => void
}

export default function Step2AddProductInstagram({ data, updateData, onNext, onBack }: Props) {
    const [checked1, setChecked1] = useState(false)
    const [checked2, setChecked2] = useState(false)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Langkah 2: Tambahkan Product Instagram</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Aktifkan Instagram di aplikasi Meta Anda
                </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-5 space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">Cara Menambahkan Product Instagram:</h3>
                <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">1.</span>
                        <span>
                            Buka aplikasi Anda di{' '}
                            <a
                                href={`https://developers.facebook.com/apps/${data.appId || ''}`}
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
                        <span>Di sidebar kiri, klik <strong>Add Product</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">3.</span>
                        <span>Cari <strong>Instagram</strong> lalu klik <strong>Set up</strong></span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">4.</span>
                        <span>Menu <strong>Instagram</strong> akan muncul di sidebar kiri</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="font-bold text-blue-500 min-w-[20px]">5.</span>
                        <span>Pastikan akun Instagram Anda adalah <strong>Instagram Business Account</strong> dan terhubung ke Facebook Page</span>
                    </li>
                </ol>
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
                    <span className="text-sm">Product Instagram sudah ditambahkan ke aplikasi</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="checkbox"
                        checked={checked2}
                        onChange={(e) => setChecked2(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <span className="text-sm">Akun Instagram Business sudah terhubung ke Facebook Page</span>
                </label>
            </div>

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack}>Kembali</Button>
                <Button onClick={onNext} disabled={!checked1 || !checked2}>Lanjutkan</Button>
            </div>
        </div>
    )
}
