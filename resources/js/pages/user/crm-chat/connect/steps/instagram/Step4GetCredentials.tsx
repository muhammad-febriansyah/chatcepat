import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ExternalLink, AlertCircle, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

interface Props {
    data: any
    updateData: (d: any) => void
    onNext: () => void
    onBack: () => void
}

export default function Step4GetCredentialsInstagram({ data, updateData, onNext, onBack }: Props) {
    const [showToken, setShowToken] = useState(false)
    const [validating, setValidating] = useState(false)
    const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string; page_name?: string } | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!data.channelName) newErrors.channelName = 'Nama channel wajib diisi'
        if (!data.instagramAccountId) newErrors.instagramAccountId = 'Instagram Business Account ID wajib diisi'
        if (!data.pageId) newErrors.pageId = 'Facebook Page ID wajib diisi'
        if (!data.pageAccessToken) newErrors.pageAccessToken = 'Page Access Token wajib diisi'
        return newErrors
    }

    const handleValidate = async () => {
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setValidating(true)
        setValidationResult(null)

        try {
            const response = await axios.post('/user/crm-chat/connect/api/validate-credentials', {
                platform: 'instagram',
                instagram_account_id: data.instagramAccountId,
                page_id: data.pageId,
                access_token: data.pageAccessToken,
            })
            setValidationResult({ valid: true, message: response.data.message, page_name: response.data.page_name })
        } catch (err: any) {
            setValidationResult({ valid: false, message: err.response?.data?.message || 'Validasi gagal. Periksa kembali credentials.' })
        } finally {
            setValidating(false)
        }
    }

    const handleNext = () => {
        const newErrors = validate()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }
        onNext()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold">Langkah 4: Masukkan Kredensial API</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Ambil data berikut dari Instagram - API Setup di Meta Developer Console
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Cara mendapatkan data ini:</strong>
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                    <li>
                        Buka{' '}
                        <a
                            href={`https://developers.facebook.com/apps/${data.appId || ''}/instagram-basic-display/basic-display`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline inline-flex items-center gap-1"
                        >
                            Instagram API Setup
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </li>
                    <li>Di sidebar, klik <strong>Instagram</strong> lalu <strong>API Setup with Instagram Login</strong></li>
                    <li>Hubungkan akun Instagram Business Anda dan copy <strong>Instagram Business Account ID</strong></li>
                    <li>
                        Di{' '}
                        <a
                            href="https://business.facebook.com/settings/pages"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline inline-flex items-center gap-1"
                        >
                            Meta Business Suite
                            <ExternalLink className="w-3 h-3" />
                        </a>
                        {' '}copy <strong>Facebook Page ID</strong>
                    </li>
                    <li>Generate <strong>Page Access Token</strong> dengan permission <code className="bg-blue-100 px-1 rounded">instagram_manage_messages</code></li>
                </ol>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="channelName">Nama Channel</Label>
                    <Input
                        id="channelName"
                        placeholder="Contoh: Instagram Bisnis Utama"
                        value={data.channelName || ''}
                        onChange={(e) => { updateData({ channelName: e.target.value }); setErrors(p => ({ ...p, channelName: '' })) }}
                        className={errors.channelName ? 'border-red-400' : ''}
                    />
                    {errors.channelName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.channelName}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="instagramAccountId">Instagram Business Account ID</Label>
                    <Input
                        id="instagramAccountId"
                        placeholder="Contoh: 17841400123456789"
                        value={data.instagramAccountId || ''}
                        onChange={(e) => { updateData({ instagramAccountId: e.target.value }); setErrors(p => ({ ...p, instagramAccountId: '' })) }}
                        className={errors.instagramAccountId ? 'border-red-400' : ''}
                    />
                    <p className="text-xs text-muted-foreground">ID akun Instagram Business (bukan username)</p>
                    {errors.instagramAccountId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.instagramAccountId}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="pageId">Facebook Page ID</Label>
                    <Input
                        id="pageId"
                        placeholder="Contoh: 123456789012345"
                        value={data.pageId || ''}
                        onChange={(e) => { updateData({ pageId: e.target.value }); setErrors(p => ({ ...p, pageId: '' })) }}
                        className={errors.pageId ? 'border-red-400' : ''}
                    />
                    <p className="text-xs text-muted-foreground">ID halaman Facebook yang terhubung ke akun Instagram</p>
                    {errors.pageId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.pageId}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="pageAccessToken">Page Access Token</Label>
                    <div className="relative">
                        <Input
                            id="pageAccessToken"
                            type={showToken ? 'text' : 'password'}
                            placeholder="Masukkan page access token"
                            value={data.pageAccessToken || ''}
                            onChange={(e) => { updateData({ pageAccessToken: e.target.value }); setErrors(p => ({ ...p, pageAccessToken: '' })) }}
                            className={`pr-10 ${errors.pageAccessToken ? 'border-red-400' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Token dengan permission instagram_manage_messages dan pages_messaging</p>
                    {errors.pageAccessToken && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.pageAccessToken}</p>}
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleValidate}
                    disabled={validating}
                    className="w-full"
                >
                    {validating ? 'Memvalidasi...' : 'Validasi Credentials'}
                </Button>

                {validationResult && (
                    <div className={`p-4 rounded-lg border text-sm flex gap-3 items-start ${
                        validationResult.valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                        {validationResult.valid
                            ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        }
                        <div>
                            <p className="font-medium">{validationResult.message}</p>
                            {validationResult.page_name && (
                                <p className="text-xs mt-1">Halaman: {validationResult.page_name}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={onBack}>Kembali</Button>
                <Button onClick={handleNext}>Lanjutkan</Button>
            </div>
        </div>
    )
}
