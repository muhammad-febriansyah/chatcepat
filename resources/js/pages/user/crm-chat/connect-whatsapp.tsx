import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import UserLayout from '@/layouts/user/user-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import ProgressSteps from './connect/components/ProgressSteps'
import Step1CreateMetaApp from './connect/steps/Step1CreateMetaApp'
import Step2AddProduct from './connect/steps/Step2AddProduct'
import Step3SetupWebhook from './connect/steps/Step3SetupWebhook'
import Step4GetCredentials from './connect/steps/Step4GetCredentials'
import Step5TestConnect from './connect/steps/Step5TestConnect'
import SuccessScreen from './connect/SuccessScreen'

interface Props {
    channel?: any
    webhookUrl: string
    verifyToken: string
}

interface WizardData {
    appId: string
    channelName: string
    phoneNumberId: string
    businessAccountId: string
    accessToken: string
}

const STEPS = [
    'Buat Meta App',
    'Tambah Product',
    'Setup Webhook',
    'Credentials',
    'Test & Simpan',
]

export default function ConnectWhatsApp({ channel, webhookUrl, verifyToken }: Props) {
    const [currentStep, setCurrentStep] = useState(1)
    const [isCompleted, setIsCompleted] = useState(false)
    const [data, setData] = useState<WizardData>({
        appId: '',
        channelName: channel?.name || '',
        phoneNumberId: channel?.credentials?.phone_number_id || '',
        businessAccountId: channel?.credentials?.waba_id || '',
        accessToken: '',
    })

    const updateData = (newData: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...newData }))
    }

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1CreateMetaApp data={data} updateData={updateData} onNext={nextStep} onBack={() => router.visit('/user/crm-chat')} />
            case 2: return <Step2AddProduct data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
            case 3: return <Step3SetupWebhook data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} webhookUrl={webhookUrl} verifyToken={verifyToken} />
            case 4: return <Step4GetCredentials data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />
            case 5: return <Step5TestConnect data={data} onBack={prevStep} onComplete={() => setIsCompleted(true)} />
            default: return null
        }
    }

    if (isCompleted) {
        return (
            <UserLayout>
                <Head title="WhatsApp Terhubung" />
                <div className="space-y-6">
                    <Card><CardContent className="p-8"><SuccessScreen data={data} /></CardContent></Card>
                </div>
            </UserLayout>
        )
    }

    return (
        <UserLayout>
            <Head title="Hubungkan WhatsApp Cloud API" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 border">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/user/crm-chat')}
                            className="hover:bg-white/50"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-100">
                                <MessageCircle className="size-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    WhatsApp Cloud API
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Ikuti langkah-langkah berikut untuk menghubungkan WhatsApp Anda
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wizard Card */}
                <Card className="border-2">
                    <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600" />
                    <CardContent className="p-8">
                        <ProgressSteps steps={STEPS} currentStep={currentStep} />
                        <div className="mt-8">
                            {renderStep()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    )
}
