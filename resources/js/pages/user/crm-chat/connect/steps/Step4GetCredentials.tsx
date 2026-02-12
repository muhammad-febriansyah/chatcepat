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

export default function Step4GetCredentials({ data, updateData, onNext, onBack }: Props) {
    const [showToken, setShowToken] = useState(false)
    const [validating, setValidating] = useState(false)
    const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string; phone_number?: string } | null>(null)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!data.channelName) newErrors.channelName = 'Nama channel wajib diisi'
        if (!data.phoneNumberId) newErrors.phoneNumberId = 'Phone Number ID wajib diisi'
        if (!data.businessAccountId) newErrors.businessAccountId = 'Business Account ID wajib diisi'
        if (!data.accessToken) newErrors.accessToken = 'Access Token wajib diisi'
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
                platform: 'whatsapp',
                phone_number_id: data.phoneNumberId,
                business_account_id: data.businessAccountId,
                access_token: data.accessToken,
            })

            setValidationResult({ valid: true, message: response.data.message, phone_number: response.data.phone_number })
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
                    Ambil data berikut dari WhatsApp - API Setup di Meta Developer Console
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Cara mendapatkan data ini:</strong>
                <ol className="mt-2 ml-4 list-decimal space-y-1">
                    <li>
                        Buka{' '}
                        <a
                            href={`https://developers.facebook.com/apps/${data.appId || ''}/whatsapp-business/wa-dev-console`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline inline-flex items-center gap-1"
                        >
                            WhatsApp API Setup
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </li>
                    <li>Scroll ke section <strong>Send and receive messages</strong></li>
                    <li>Di bagian <strong>From</strong>, pilih nomor WhatsApp Anda</li>
                    <li>Copy <strong>Phone Number ID</strong> dan <strong>WhatsApp Business Account ID</strong></li>
                    <li>Klik <strong>Generate access token</strong> lalu copy tokennya</li>
                </ol>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="channelName">Nama Channel</Label>
                    <Input
                        id="channelName"
                        placeholder="Contoh: WhatsApp Bisnis Utama"
                        value={data.channelName || ''}
                        onChange={(e) => { updateData({ channelName: e.target.value }); setErrors(p => ({ ...p, channelName: '' })) }}
                        className={errors.channelName ? 'border-red-400' : ''}
                    />
                    {errors.channelName && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.channelName}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                    <Input
                        id="phoneNumberId"
                        placeholder="Contoh: 123456789012345"
                        value={data.phoneNumberId || ''}
                        onChange={(e) => { updateData({ phoneNumberId: e.target.value }); setErrors(p => ({ ...p, phoneNumberId: '' })) }}
                        className={errors.phoneNumberId ? 'border-red-400' : ''}
                    />
                    <p className="text-xs text-muted-foreground">Dapatkan dari WhatsApp - API Setup - section "From"</p>
                    {errors.phoneNumberId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phoneNumberId}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="businessAccountId">WhatsApp Business Account ID</Label>
                    <Input
                        id="businessAccountId"
                        placeholder="Contoh: 123456789012345"
                        value={data.businessAccountId || ''}
                        onChange={(e) => { updateData({ businessAccountId: e.target.value }); setErrors(p => ({ ...p, businessAccountId: '' })) }}
                        className={errors.businessAccountId ? 'border-red-400' : ''}
                    />
                    <p className="text-xs text-muted-foreground">WABA ID dari Meta Business Suite atau WhatsApp API Setup</p>
                    {errors.businessAccountId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.businessAccountId}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <div className="relative">
                        <Input
                            id="accessToken"
                            type={showToken ? 'text' : 'password'}
                            placeholder="Masukkan access token dari Meta Developer Console"
                            value={data.accessToken || ''}
                            onChange={(e) => { updateData({ accessToken: e.target.value }); setErrors(p => ({ ...p, accessToken: '' })) }}
                            className={`pr-10 ${errors.accessToken ? 'border-red-400' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Klik "Generate access token" di halaman WhatsApp API Setup</p>
                    {errors.accessToken && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.accessToken}</p>}
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
                            {validationResult.phone_number && (
                                <p className="text-xs mt-1">Nomor: {validationResult.phone_number}</p>
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
