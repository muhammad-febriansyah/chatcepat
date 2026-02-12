import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

interface Props {
    data: any
    onBack: () => void
    onComplete: () => void
}

export default function Step5TestConnectInstagram({ data, onBack, onComplete }: Props) {
    const [testing, setTesting] = useState(false)
    const [saving, setSaving] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleTest = async () => {
        setTesting(true)
        setTestResult(null)

        try {
            const response = await axios.post('/user/crm-chat/connect/api/test-connection', {
                platform: 'instagram',
                instagram_account_id: data.instagramAccountId,
                page_id: data.pageId,
                access_token: data.pageAccessToken,
            })
            setTestResult({ success: true, message: response.data.message })
        } catch (err: any) {
            setTestResult({ success: false, message: err.response?.data?.message || 'Koneksi gagal. Periksa kembali credentials.' })
        } finally {
            setTesting(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await axios.post('/user/crm-chat/connect/api/save-connection', {
                platform: 'instagram',
                channel_name: data.channelName,
                instagram_account_id: data.instagramAccountId,
                page_id: data.pageId,
                access_token: data.pageAccessToken,
            })
            onComplete()
        } catch (err: any) {
            setTestResult({ success: false, message: err.response?.data?.message || 'Gagal menyimpan koneksi.' })
        } finally {
            setSaving(false)
        }
    }

    const checks = [
        { label: 'App ID dikonfigurasi', done: !!data.appId },
        { label: 'Webhook sudah di-verify', done: true },
        { label: 'Instagram Account ID diisi', done: !!data.instagramAccountId },
        { label: 'Facebook Page ID diisi', done: !!data.pageId },
        { label: 'Page Access Token diisi', done: !!data.pageAccessToken },
    ]

    const allChecked = checks.every(c => c.done)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Langkah 5: Test Koneksi</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Pastikan semua konfigurasi sudah benar sebelum menyimpan
                </p>
            </div>

            <div className="bg-gray-50 border rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-sm text-gray-700">Ringkasan Konfigurasi:</h3>
                <div className="space-y-2">
                    {checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            {check.done
                                ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            }
                            <span className={check.done ? 'text-gray-700' : 'text-red-500'}>{check.label}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 space-y-1.5 text-sm">
                    <div className="grid grid-cols-[160px,1fr] gap-2">
                        <span className="font-medium text-gray-600">Nama Channel</span>
                        <span>{data.channelName || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px,1fr] gap-2">
                        <span className="font-medium text-gray-600">Instagram Account ID</span>
                        <span className="font-mono text-xs">{data.instagramAccountId || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px,1fr] gap-2">
                        <span className="font-medium text-gray-600">Facebook Page ID</span>
                        <span className="font-mono text-xs">{data.pageId || '-'}</span>
                    </div>
                    <div className="grid grid-cols-[160px,1fr] gap-2">
                        <span className="font-medium text-gray-600">Page Access Token</span>
                        <span className="font-mono text-xs">{data.pageAccessToken ? '••••••••' + data.pageAccessToken.slice(-8) : '-'}</span>
                    </div>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={testing || !allChecked}
                className="w-full"
            >
                {testing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sedang menguji koneksi...</>
                ) : (
                    'Test Koneksi Instagram'
                )}
            </Button>

            {testResult && (
                <div className={`p-4 rounded-lg border text-sm flex gap-3 items-start ${
                    testResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {testResult.success
                        ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    }
                    <p>{testResult.message}</p>
                </div>
            )}

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack}>Kembali</Button>
                <Button
                    onClick={handleSave}
                    disabled={saving || !allChecked}
                    className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                    {saving ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menyimpan...</>
                    ) : (
                        'Simpan & Hubungkan Instagram'
                    )}
                </Button>
            </div>
        </div>
    )
}
