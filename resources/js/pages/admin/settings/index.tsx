import { Head, usePage, useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { update } from '@/routes/admin/settings'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import InputError from '@/components/input-error'
import {
    Globe,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Search,
    Save,
    Image as ImageIcon,
    Upload,
    X,
    FileImage,
    Plus,
    Trash2,
    Map,
    Layers,
    Send,
    RefreshCcw,
    CheckCircle
} from 'lucide-react'
import { useState, useEffect, FormEventHandler } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import axios from 'axios'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SettingsProps {
    settings: {
        site_name: string
        site_description: string
        contact_email: string
        contact_phone: string
        address: string
        google_maps_embed: string
        contact_help_image: string
        facebook_url: string
        twitter_url: string
        instagram_url: string
        linkedin_url: string
        tiktok_url: string
        meta_keywords: string
        meta_description: string
        logo: string
        favicon: string
        auth_logo: string
        auth_logo_name: string
        auth_tagline: string
        auth_heading: string
        auth_description: string
        auth_features: string
        auth_copyright: string
        auth_hero_image: string
        hero_image: string
        hero_badge: string
        hero_heading: string
        hero_description: string
        hero_stat_1_value: string
        hero_stat_1_label: string
        hero_stat_2_value: string
        hero_stat_2_label: string
        hero_stat_3_value: string
        hero_stat_3_label: string
        features_section_title: string
        features_section_subtitle: string
        feature_1_icon: string
        feature_1_title: string
        feature_1_description: string
        feature_2_icon: string
        feature_2_title: string
        feature_2_description: string
        feature_3_icon: string
        feature_3_title: string
        feature_3_description: string
        feature_4_icon: string
        feature_4_title: string
        feature_4_description: string
        feature_5_icon: string
        feature_5_title: string
        feature_5_description: string
        feature_6_icon: string
        feature_6_title: string
        feature_6_description: string
        why_choose_heading: string
        why_choose_subheading: string
        why_choose_image: string
        why_choose_features: string
        footer_tagline: string
        footer_company_name: string
        footer_address: string
        google_play_url: string
        app_store_url: string
        youtube_url: string
        whatsapp_support: string
        email_support: string
        mailketing_from_email: string
        mailketing_api_token: string
        mail_template_registration_success: string
        mail_template_payment_success: string
        mail_template_password_change: string
        mail_template_upgrade_success: string
        mail_template_trial_reminder: string
        mail_template_package_reminder: string
    }
}

interface WhyChooseFeature {
    icon: string;
    title: string;
    description: string;
    image?: string;
}

export default function Settings({ settings }: SettingsProps) {
    // Convert JSON array to array of strings for auth_features
    const authFeaturesArray = settings?.auth_features
        ? (() => {
            try {
                const features = JSON.parse(settings.auth_features);
                return Array.isArray(features) ? features : [''];
            } catch {
                return [''];
            }
        })()
        : [''];

    const [authFeatures, setAuthFeatures] = useState<string[]>(authFeaturesArray);

    // Convert JSON array for why_choose_features
    const whyChooseFeaturesArray: WhyChooseFeature[] = settings?.why_choose_features
        ? (() => {
            try {
                const features = JSON.parse(settings.why_choose_features);
                return Array.isArray(features) ? features : [{ icon: 'TrendingUp', title: '', description: '' }];
            } catch {
                return [{ icon: 'TrendingUp', title: '', description: '' }];
            }
        })()
        : [{ icon: 'TrendingUp', title: '', description: '' }];

    const [whyChooseFeatures, setWhyChooseFeatures] = useState<WhyChooseFeature[]>(whyChooseFeaturesArray);
    const [whyChooseFeatureImages, setWhyChooseFeatureImages] = useState<{ [key: number]: File | null }>({});

    const { data, setData, post, processing, errors } = useForm({
        site_name: settings?.site_name || '',
        site_description: settings?.site_description || '',
        contact_email: settings?.contact_email || '',
        contact_phone: settings?.contact_phone || '',
        address: settings?.address || '',
        google_maps_embed: settings?.google_maps_embed || '',
        contact_help_image: null as File | null,
        facebook_url: settings?.facebook_url || '',
        twitter_url: settings?.twitter_url || '',
        instagram_url: settings?.instagram_url || '',
        linkedin_url: settings?.linkedin_url || '',
        tiktok_url: settings?.tiktok_url || '',
        meta_keywords: settings?.meta_keywords || '',
        meta_description: settings?.meta_description || '',
        logo: null as File | null,
        favicon: null as File | null,
        auth_logo: null as File | null,
        auth_logo_name: settings?.auth_logo_name || '',
        auth_tagline: settings?.auth_tagline || '',
        auth_heading: settings?.auth_heading || '',
        auth_description: settings?.auth_description || '',
        auth_features: '',
        auth_copyright: settings?.auth_copyright || '',
        auth_hero_image: null as File | null,
        hero_image: null as File | null,
        hero_badge: settings?.hero_badge || 'Balas Chat dengan Cepat 24/7, Non Stop!',
        hero_heading: settings?.hero_heading || 'Tingkatkan Penjualan Hingga 40% dengan Customer Service & Sales AI',
        hero_description: settings?.hero_description || 'Tingkatkan Interaksi dengan Customer, Followup Otomatis, dan Hemat Anggaran CS Hingga Ratusan Juta dengan Agent AI Cerdas dan Humanis',
        hero_stat_1_value: settings?.hero_stat_1_value || '5000+',
        hero_stat_1_label: settings?.hero_stat_1_label || 'Pengguna Aktif',
        hero_stat_2_value: settings?.hero_stat_2_value || '3x',
        hero_stat_2_label: settings?.hero_stat_2_label || 'Peningkatan Konversi',
        hero_stat_3_value: settings?.hero_stat_3_value || '85%',
        hero_stat_3_label: settings?.hero_stat_3_label || 'Waktu Hemat',
        features_section_title: settings?.features_section_title || 'Fitur Lengkap untuk',
        features_section_subtitle: settings?.features_section_subtitle || 'Pertumbuhan Bisnis',
        feature_1_icon: settings?.feature_1_icon || 'Bot',
        feature_1_title: settings?.feature_1_title || 'AI-Powered Automation',
        feature_1_description: settings?.feature_1_description || 'Otomatis mengelola lead dan customer dengan kecerdasan buatan',
        feature_2_icon: settings?.feature_2_icon || 'MessageSquare',
        feature_2_title: settings?.feature_2_title || 'Smart Conversations',
        feature_2_description: settings?.feature_2_description || 'Chatbot cerdas yang memahami konteks dan kebutuhan customer',
        feature_3_icon: settings?.feature_3_icon || 'TrendingUp',
        feature_3_title: settings?.feature_3_title || 'Sales Analytics',
        feature_3_description: settings?.feature_3_description || 'Analisis penjualan real-time untuk keputusan bisnis yang lebih baik',
        feature_4_icon: settings?.feature_4_icon || 'Users',
        feature_4_title: settings?.feature_4_title || 'Contact Management',
        feature_4_description: settings?.feature_4_description || 'Kelola semua kontak dan interaksi customer di satu tempat',
        feature_5_icon: settings?.feature_5_icon || 'Zap',
        feature_5_title: settings?.feature_5_title || 'Quick Response',
        feature_5_description: settings?.feature_5_description || 'Respon otomatis dan cepat untuk setiap inquiry customer',
        feature_6_icon: settings?.feature_6_icon || 'BarChart3',
        feature_6_title: settings?.feature_6_title || 'Performance Tracking',
        feature_6_description: settings?.feature_6_description || 'Pantau performa tim sales dan target pencapaian',
        why_choose_heading: settings?.why_choose_heading || 'Kenapa Ribuan Bisnis',
        why_choose_subheading: settings?.why_choose_subheading || 'Menggunakan ChatCepat',
        why_choose_image: null as File | null,
        why_choose_features: '',
        footer_tagline: settings?.footer_tagline || 'Omnichannel + CRM',
        footer_company_name: settings?.footer_company_name || 'PT Teknologi ChatCepat Indonesia',
        footer_address: settings?.footer_address || 'Ruko Hampton Avenue Blok A no.10. Paramount - Gading Serpong. Tangerang, 15810',
        google_play_url: settings?.google_play_url || '#',
        app_store_url: settings?.app_store_url || '#',
        youtube_url: settings?.youtube_url || 'https://youtube.com',
        whatsapp_support: settings?.whatsapp_support || '6281234567890',
        email_support: settings?.email_support || 'support@chatcepat.com',
        mailketing_from_email: settings?.mailketing_from_email || '',
        mailketing_api_token: settings?.mailketing_api_token || '',
        mail_template_registration_success: settings?.mail_template_registration_success || `<p>Halo {user_name},</p><p>Terima kasih telah mendaftar di {site_name}. Akun Anda telah berhasil dibuat.</p><p>Untuk mengaktifkan layanan, silakan lakukan pembayaran sebesar <b>{payment_amount}</b> melalui tautan berikut:</p><p><a href="{payment_link}" target="_blank">Klik di sini untuk melakukan pembayaran</a></p><p>Terima kasih,</p><p>Tim {site_name}</p>`,
        mail_template_payment_success: settings?.mail_template_payment_success || `<p>Halo {user_name},</p><p>Kami telah menerima pembayaran Anda dengan nomor transaksi <b>{transaction_id}</b>.</p><p>Paket <b>{package_name}</b> Anda telah aktif dan siap digunakan. Silakan masuk ke panel Anda untuk mulai menggunakan layanan.</p><p>Terima kasih atas kepercayaan Anda,</p><p>Tim {site_name}</p>`,
        mail_template_password_change: settings?.mail_template_password_change || `<p>Halo {user_name},</p><p>Pemberitahuan keamanan: Kata sandi akun Anda di {site_name} telah berhasil diubah pada {date_time}.</p><p>Jika Anda tidak merasa melakukan perubahan ini, segera hubungi tim dukungan kami.</p><p>Terima kasih,</p><p>Tim Keamanan {site_name}</p>`,
        mail_template_upgrade_success: settings?.mail_template_upgrade_success || `<p>Halo {user_name},</p><p>Selamat! Akun Anda telah berhasil ditingkatkan ke paket <b>{new_package_name}</b>.</p><p>Anda sekarang dapat menikmati fitur-fitur premium yang tersedia dalam paket ini. Silakan cek dasbor Anda untuk rincian selengkapnya.</p><p>Terima kasih,</p><p>Tim {site_name}</p>`,
        mail_template_trial_reminder: settings?.mail_template_trial_reminder || `<p>Halo {user_name},</p><p>Masa uji coba (trial) Anda akan berakhir dalam <b>{days_left} hari</b>.</p><p>Untuk terus menikmati semua fitur tanpa hambatan, kami menyarankan agar Anda segera melakukan upgrade ke paket berbayar.</p><p>Jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan.</p><p>Terima kasih,</p><p>Tim {site_name}</p>`,
        mail_template_package_reminder: settings?.mail_template_package_reminder || `<p>Halo {user_name},</p><p>Masa aktif paket <b>{package_name}</b> Anda akan berakhir pada tanggal <b>{expiry_date}</b>.</p><p>Untuk memastikan layanan tetap aktif dan pesan Anda terus terkirim, mohon segera melakukan perpanjangan paket sebelum masa aktif habis.</p><p>Terima kasih,</p><p>Tim {site_name}</p>`,
        _method: 'PUT' as const,
    });

    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testRecipient, setTestRecipient] = useState('');
    const [selectedTestTemplate, setSelectedTestTemplate] = useState<string>('generic');
    const [isTesting, setIsTesting] = useState(false);

    const handleTestMailketing = async () => {
        if (!testRecipient) {
            toast.error('Mohon masukkan email tujuan');
            return;
        }

        if (!data.mailketing_from_email || !data.mailketing_api_token) {
            toast.error('Kredensial Mailketing belum lengkap');
            return;
        }

        setIsTesting(true);
        try {
            const response = await axios.post(route('admin.settings.mailketing.test'), {
                recipient_email: testRecipient,
                mailketing_from_email: data.mailketing_from_email,
                mailketing_api_token: data.mailketing_api_token,
                template_key: selectedTestTemplate !== 'generic' ? selectedTestTemplate : null,
                template_content: selectedTestTemplate !== 'generic' ? (data as any)[selectedTestTemplate] : null,
            });

            if (response.data.success || response.status === 200) {
                toast.success('Email tes berhasil dikirim!');
                setIsTestModalOpen(false);
                setTestRecipient('');
            } else {
                toast.error(response.data.error || 'Gagal mengirim email tes');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan saat mengetes Mailketing');
        } finally {
            setIsTesting(false);
        }
    };

    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
    const [authLogoPreview, setAuthLogoPreview] = useState<string | null>(null)
    const [authHeroPreview, setAuthHeroPreview] = useState<string | null>(null)
    const [contactHelpPreview, setContactHelpPreview] = useState<string | null>(null)
    const [heroPreview, setHeroPreview] = useState<string | null>(null)
    const [whyChoosePreview, setWhyChoosePreview] = useState<string | null>(null)

    // Set initial previews
    useEffect(() => {
        if (settings?.logo) {
            setLogoPreview(`/storage/${settings.logo}`)
        }
        if (settings?.favicon) {
            setFaviconPreview(`/storage/${settings.favicon}`)
        }
        if (settings?.auth_logo) {
            setAuthLogoPreview(`/storage/${settings.auth_logo}`)
        }
        if (settings?.auth_hero_image) {
            setAuthHeroPreview(`/storage/${settings.auth_hero_image}`)
        }
        if (settings?.contact_help_image) {
            setContactHelpPreview(`/storage/${settings.contact_help_image}`)
        }
        if (settings?.hero_image) {
            setHeroPreview(`/storage/${settings.hero_image}`)
        }
        if (settings?.why_choose_image) {
            setWhyChoosePreview(`/storage/${settings.why_choose_image}`)
        }
    }, [settings])

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()

        // Convert authFeatures array to JSON string
        const featuresJson = JSON.stringify(authFeatures.filter(f => f.trim() !== ''));
        setData('auth_features', featuresJson);

        // Convert whyChooseFeatures array to JSON string
        const whyChooseFeaturesJson = JSON.stringify(whyChooseFeatures.filter(f => f.title.trim() !== '' || f.description.trim() !== ''));
        setData('why_choose_features', whyChooseFeaturesJson);

        // Use setTimeout to ensure state is updated before posting
        setTimeout(() => {
            post(update().url, {
                preserveScroll: true,
                forceFormData: true,
                onBefore: () => {
                    setData('auth_features', featuresJson);
                    setData('why_choose_features', whyChooseFeaturesJson);
                    // Add images to data
                    Object.entries(whyChooseFeatureImages).forEach(([index, file]) => {
                        if (file) {
                            setData(`why_choose_feature_image_${index}` as any, file);
                        }
                    });
                }
            })
        }, 0);
    }

    const addFeature = () => {
        setAuthFeatures([...authFeatures, '']);
    }

    const removeFeature = (index: number) => {
        const newFeatures = authFeatures.filter((_, i) => i !== index);
        setAuthFeatures(newFeatures.length > 0 ? newFeatures : ['']);
    }

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...authFeatures];
        newFeatures[index] = value;
        setAuthFeatures(newFeatures);
    }

    // Why Choose Features Helpers
    const addWhyChooseFeature = () => {
        setWhyChooseFeatures([...whyChooseFeatures, { icon: 'TrendingUp', title: '', description: '' }]);
    }

    const removeWhyChooseFeature = (index: number) => {
        const newFeatures = whyChooseFeatures.filter((_, i) => i !== index);
        setWhyChooseFeatures(newFeatures.length > 0 ? newFeatures : [{ icon: 'TrendingUp', title: '', description: '' }]);
    }

    const updateWhyChooseFeature = (index: number, field: keyof WhyChooseFeature, value: string) => {
        const newFeatures = [...whyChooseFeatures];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setWhyChooseFeatures(newFeatures);
    }

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo' | 'favicon' | 'auth_logo' | 'auth_hero_image' | 'contact_help_image' | 'hero_image' | 'why_choose_image'
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file, type)
        }
    }

    const processFile = (file: File, type: 'logo' | 'favicon' | 'auth_logo' | 'auth_hero_image' | 'contact_help_image' | 'hero_image' | 'why_choose_image') => {
        setData(type, file)
        const reader = new FileReader()
        reader.onloadend = () => {
            if (type === 'logo') {
                setLogoPreview(reader.result as string)
            } else if (type === 'favicon') {
                setFaviconPreview(reader.result as string)
            } else if (type === 'auth_logo') {
                setAuthLogoPreview(reader.result as string)
            } else if (type === 'auth_hero_image') {
                setAuthHeroPreview(reader.result as string)
            } else if (type === 'hero_image') {
                setHeroPreview(reader.result as string)
            } else if (type === 'why_choose_image') {
                setWhyChoosePreview(reader.result as string)
            } else {
                setContactHelpPreview(reader.result as string)
            }
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveFile = (type: 'logo' | 'favicon' | 'auth_logo' | 'auth_hero_image' | 'contact_help_image' | 'hero_image' | 'why_choose_image') => {
        setData(type, null)
        if (type === 'logo') {
            setLogoPreview(settings?.logo ? `/storage/${settings.logo}` : null)
        } else if (type === 'favicon') {
            setFaviconPreview(settings?.favicon ? `/storage/${settings.favicon}` : null)
        } else if (type === 'auth_logo') {
            setAuthLogoPreview(settings?.auth_logo ? `/storage/${settings.auth_logo}` : null)
        } else if (type === 'auth_hero_image') {
            setAuthHeroPreview(settings?.auth_hero_image ? `/storage/${settings.auth_hero_image}` : null)
        } else if (type === 'hero_image') {
            setHeroPreview(settings?.hero_image ? `/storage/${settings.hero_image}` : null)
        } else if (type === 'why_choose_image') {
            setWhyChoosePreview(settings?.why_choose_image ? `/storage/${settings.why_choose_image}` : null)
        } else {
            setContactHelpPreview(settings?.contact_help_image ? `/storage/${settings.contact_help_image}` : null)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent, type: 'logo' | 'favicon' | 'auth_logo' | 'auth_hero_image' | 'contact_help_image' | 'hero_image' | 'why_choose_image') => {
        e.preventDefault()
        e.stopPropagation()

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            processFile(file, type)
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const handleGoogleMapsChange = (value: string) => {
        // Extract src URL from iframe if full HTML is pasted
        const srcMatch = value.match(/src="([^"]+)"/);
        if (srcMatch) {
            setData('google_maps_embed', srcMatch[1]);
        } else {
            setData('google_maps_embed', value);
        }
    }

    return (
        <AdminLayout>
            <Head title="Pengaturan" />

            <PageHeader
                title="Pengaturan"
                description="Kelola pengaturan dan konfigurasi website Anda"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="general">
                            <Globe className="size-4 mr-2" />
                            Umum
                        </TabsTrigger>
                        <TabsTrigger value="homepage">
                            <ImageIcon className="size-4 mr-2" />
                            Homepage
                        </TabsTrigger>
                        <TabsTrigger value="contact">
                            <Mail className="size-4 mr-2" />
                            Kontak
                        </TabsTrigger>
                        <TabsTrigger value="social">
                            <Globe className="size-4 mr-2" />
                            Sosial Media
                        </TabsTrigger>
                        <TabsTrigger value="seo">
                            <Search className="size-4 mr-2" />
                            SEO
                        </TabsTrigger>
                        <TabsTrigger value="auth">
                            <ImageIcon className="size-4 mr-2" />
                            Halaman Login
                        </TabsTrigger>
                        <TabsTrigger value="footer">
                            <FileImage className="size-4 mr-2" />
                            Footer
                        </TabsTrigger>
                        <TabsTrigger value="integrations">
                            <Layers className="size-4 mr-2" />
                            Integrasi
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-6">
                        {/* Branding */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <ImageIcon className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Branding</CardTitle>
                                        <CardDescription>
                                            Logo dan favicon website Anda
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Logo Upload */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">
                                            Logo Website
                                        </Label>

                                        {/* Drag & Drop Area */}
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'logo')}
                                            className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-background/50"
                                        >
                                            {logoPreview ? (
                                                <div className="space-y-4">
                                                    {/* Preview Image */}
                                                    <div className="relative w-full h-48 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo Preview"
                                                            className="max-w-full max-h-full object-contain p-4"
                                                        />
                                                        {/* Remove Button */}
                                                        {data.logo && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile('logo')}
                                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                                                title="Hapus file"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <FileImage className="size-4" />
                                                            <span>Logo siap diupload</span>
                                                        </div>
                                                        {data.logo && (
                                                            <span className="text-muted-foreground">
                                                                {formatFileSize(data.logo.size)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-3">
                                                    <div className="flex justify-center">
                                                        <div className="p-4 rounded-full bg-primary/10">
                                                            <Upload className="size-8 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Drag & drop logo di sini</p>
                                                        <p className="text-xs text-muted-foreground mt-1">atau klik tombol di bawah</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Upload Button */}
                                            <div className="mt-4 flex justify-center">
                                                <Label
                                                    htmlFor="logo"
                                                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                                >
                                                    <Upload className="size-4" />
                                                    {logoPreview ? 'Ganti Logo' : 'Pilih Logo'}
                                                </Label>
                                                <Input
                                                    id="logo"
                                                    name="logo"
                                                    type="file"
                                                    accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, 'logo')}
                                                />
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Format: PNG, JPG, JPEG, SVG • Maksimal: 2MB
                                        </p>
                                        <InputError message={errors.logo} />
                                    </div>

                                    {/* Favicon Upload */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">
                                            Favicon
                                        </Label>

                                        {/* Drag & Drop Area */}
                                        <div
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, 'favicon')}
                                            className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-background/50"
                                        >
                                            {faviconPreview ? (
                                                <div className="space-y-4">
                                                    {/* Preview Image */}
                                                    <div className="relative w-full h-48 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={faviconPreview}
                                                            alt="Favicon Preview"
                                                            className="max-w-full max-h-full object-contain p-4"
                                                        />
                                                        {/* Remove Button */}
                                                        {data.favicon && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFile('favicon')}
                                                                className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                                                title="Hapus file"
                                                            >
                                                                <X className="size-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <FileImage className="size-4" />
                                                            <span>Favicon siap diupload</span>
                                                        </div>
                                                        {data.favicon && (
                                                            <span className="text-muted-foreground">
                                                                {formatFileSize(data.favicon.size)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-3">
                                                    <div className="flex justify-center">
                                                        <div className="p-4 rounded-full bg-primary/10">
                                                            <Upload className="size-8 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">Drag & drop favicon di sini</p>
                                                        <p className="text-xs text-muted-foreground mt-1">atau klik tombol di bawah</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Upload Button */}
                                            <div className="mt-4 flex justify-center">
                                                <Label
                                                    htmlFor="favicon"
                                                    className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                                >
                                                    <Upload className="size-4" />
                                                    {faviconPreview ? 'Ganti Favicon' : 'Pilih Favicon'}
                                                </Label>
                                                <Input
                                                    id="favicon"
                                                    name="favicon"
                                                    type="file"
                                                    accept="image/png,image/jpg,image/jpeg,image/x-icon"
                                                    className="hidden"
                                                    onChange={(e) => handleFileChange(e, 'favicon')}
                                                />
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Format: PNG, JPG, JPEG, ICO • Maksimal: 1MB
                                        </p>
                                        <InputError message={errors.favicon} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informasi Umum */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Globe className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Informasi Umum</CardTitle>
                                        <CardDescription>
                                            Informasi dasar dan branding website
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="site_name" className="text-sm font-medium">
                                        Nama Website *
                                    </Label>
                                    <Input
                                        id="site_name"
                                        name="site_name"
                                        value={data.site_name}
                                        onChange={(e) => setData('site_name', e.target.value)}
                                        placeholder="Masukkan nama website"
                                        required
                                    />
                                    <InputError message={errors.site_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site_description" className="text-sm font-medium">
                                        Deskripsi Website
                                    </Label>
                                    <textarea
                                        id="site_description"
                                        name="site_description"
                                        value={data.site_description}
                                        onChange={(e) => setData('site_description', e.target.value)}
                                        placeholder="Deskripsi singkat tentang website Anda"
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    />
                                    <InputError message={errors.site_description} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Homepage Tab */}
                    <TabsContent value="homepage" className="space-y-6">
                        {/* Hero Section Homepage */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Globe className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Hero Section Homepage</CardTitle>
                                        <CardDescription>
                                            Gambar utama dan konten di halaman homepage
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Site Name and Description will be added here from the duplicate Informasi Umum card */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Gambar Hero Homepage
                                    </Label>

                                    {/* Drag & Drop Area */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'hero_image')}
                                        className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-background/50"
                                    >
                                        {heroPreview ? (
                                            <div className="space-y-4">
                                                {/* Preview Image */}
                                                <div className="relative w-full h-64 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={heroPreview}
                                                        alt="Hero Preview"
                                                        className="max-w-full max-h-full object-contain p-4"
                                                    />
                                                    {/* Remove Button */}
                                                    {data.hero_image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile('hero_image')}
                                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                                            title="Hapus file"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <FileImage className="size-4" />
                                                        <span>Gambar hero siap diupload</span>
                                                    </div>
                                                    {data.hero_image && (
                                                        <span className="text-muted-foreground">
                                                            {formatFileSize(data.hero_image.size)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <div className="flex justify-center">
                                                    <div className="p-4 rounded-full bg-primary/10">
                                                        <Upload className="size-8 text-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Drag & drop gambar hero di sini</p>
                                                    <p className="text-xs text-muted-foreground mt-1">atau klik tombol di bawah</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <div className="mt-4 flex justify-center">
                                            <Label
                                                htmlFor="hero_image"
                                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                <Upload className="size-4" />
                                                {heroPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                            </Label>
                                            <Input
                                                id="hero_image"
                                                name="hero_image"
                                                type="file"
                                                accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'hero_image')}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Format: PNG, JPG, JPEG, SVG, WebP • Maksimal: 5MB • Gambar akan ditampilkan di hero section homepage
                                    </p>
                                    <InputError message={errors.hero_image} />
                                </div>

                                {/* Hero Content Fields */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Konten Hero Section</h3>

                                    {/* Hero Badge */}
                                    <div className="space-y-2">
                                        <Label htmlFor="hero_badge" className="text-sm font-medium">
                                            Badge Text
                                        </Label>
                                        <Input
                                            id="hero_badge"
                                            name="hero_badge"
                                            value={data.hero_badge}
                                            onChange={(e) => setData('hero_badge', e.target.value)}
                                            placeholder="Powered by Advanced AI Technology"
                                        />
                                        <InputError message={errors.hero_badge} />
                                    </div>

                                    {/* Hero Heading */}
                                    <div className="space-y-2">
                                        <Label htmlFor="hero_heading" className="text-sm font-medium">
                                            Heading Utama
                                        </Label>
                                        <Input
                                            id="hero_heading"
                                            name="hero_heading"
                                            value={data.hero_heading}
                                            onChange={(e) => setData('hero_heading', e.target.value)}
                                            placeholder="Tingkatkan Penjualan Hingga 3x Lebih Cepat dengan AI"
                                        />
                                        <InputError message={errors.hero_heading} />
                                    </div>

                                    {/* Hero Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="hero_description" className="text-sm font-medium">
                                            Deskripsi
                                        </Label>
                                        <textarea
                                            id="hero_description"
                                            name="hero_description"
                                            value={data.hero_description}
                                            onChange={(e) => setData('hero_description', e.target.value)}
                                            placeholder="Platform CRM berbasis AI yang membantu tim sales Anda..."
                                            rows={3}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        />
                                        <InputError message={errors.hero_description} />
                                    </div>

                                    {/* Statistics */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">Statistik</Label>

                                        {/* Stat 1 */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_stat_1_value" className="text-xs text-muted-foreground">
                                                    Nilai 1
                                                </Label>
                                                <Input
                                                    id="hero_stat_1_value"
                                                    name="hero_stat_1_value"
                                                    value={data.hero_stat_1_value}
                                                    onChange={(e) => setData('hero_stat_1_value', e.target.value)}
                                                    placeholder="10K+"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_stat_1_label" className="text-xs text-muted-foreground">
                                                    Label 1
                                                </Label>
                                                <Input
                                                    id="hero_stat_1_label"
                                                    name="hero_stat_1_label"
                                                    value={data.hero_stat_1_label}
                                                    onChange={(e) => setData('hero_stat_1_label', e.target.value)}
                                                    placeholder="Active Users"
                                                />
                                            </div>
                                        </div>

                                        {/* Stat 2 */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_stat_2_value" className="text-xs text-muted-foreground">
                                                    Nilai 2
                                                </Label>
                                                <Input
                                                    id="hero_stat_2_value"
                                                    name="hero_stat_2_value"
                                                    value={data.hero_stat_2_value}
                                                    onChange={(e) => setData('hero_stat_2_value', e.target.value)}
                                                    placeholder="3x"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_stat_2_label" className="text-xs text-muted-foreground">
                                                    Label 2
                                                </Label>
                                                <Input
                                                    id="hero_stat_2_label"
                                                    name="hero_stat_2_label"
                                                    value={data.hero_stat_2_label}
                                                    onChange={(e) => setData('hero_stat_2_label', e.target.value)}
                                                    placeholder="Faster Conversion"
                                                />
                                            </div>
                                        </div>

                                        {/* Stat 3 */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_stat_3_value" className="text-xs text-muted-foreground">
                                                    Nilai 3
                                                </Label>
                                                <Input
                                                    id="hero_stat_3_value"
                                                    name="hero_stat_3_value"
                                                    value={data.hero_stat_3_value}
                                                    onChange={(e) => setData('hero_stat_3_value', e.target.value)}
                                                    placeholder="70%"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_stat_3_label" className="text-xs text-muted-foreground">
                                                    Label 3
                                                </Label>
                                                <Input
                                                    id="hero_stat_3_label"
                                                    name="hero_stat_3_label"
                                                    value={data.hero_stat_3_label}
                                                    onChange={(e) => setData('hero_stat_3_label', e.target.value)}
                                                    placeholder="Time Saved"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Why Choose Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <ImageIcon className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Why Choose Section</CardTitle>
                                        <CardDescription>
                                            Gambar dan fitur-fitur unggulan yang ditampilkan di section "Kenapa Memilih Kami"
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Section Heading */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Judul Section</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="why_choose_heading" className="text-sm font-medium">
                                            Heading Utama
                                        </Label>
                                        <Input
                                            id="why_choose_heading"
                                            name="why_choose_heading"
                                            value={data.why_choose_heading}
                                            onChange={(e) => setData('why_choose_heading', e.target.value)}
                                            placeholder="Kenapa Ribuan Bisnis"
                                        />
                                        <InputError message={errors.why_choose_heading} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="why_choose_subheading" className="text-sm font-medium">
                                            Sub Heading
                                        </Label>
                                        <Input
                                            id="why_choose_subheading"
                                            name="why_choose_subheading"
                                            value={data.why_choose_subheading}
                                            onChange={(e) => setData('why_choose_subheading', e.target.value)}
                                            placeholder="Menggunakan ChatCepat"
                                        />
                                        <InputError message={errors.why_choose_subheading} />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Gambar Why Choose Section
                                    </Label>

                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'why_choose_image')}
                                        className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-background/50"
                                    >
                                        {whyChoosePreview ? (
                                            <div className="space-y-4">
                                                <div className="relative w-full h-64 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={whyChoosePreview}
                                                        alt="Why Choose Preview"
                                                        className="max-w-full max-h-full object-contain p-4"
                                                    />
                                                    {data.why_choose_image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile('why_choose_image')}
                                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                                            title="Hapus file"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <FileImage className="size-4" />
                                                        <span>Gambar siap diupload</span>
                                                    </div>
                                                    {data.why_choose_image && (
                                                        <span className="text-muted-foreground">
                                                            {formatFileSize(data.why_choose_image.size)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <div className="flex justify-center">
                                                    <div className="p-4 rounded-full bg-primary/10">
                                                        <Upload className="size-8 text-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Drag & drop gambar di sini</p>
                                                    <p className="text-xs text-muted-foreground mt-1">atau klik tombol di bawah</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 flex justify-center">
                                            <Label
                                                htmlFor="why_choose_image"
                                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                <Upload className="size-4" />
                                                {whyChoosePreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                            </Label>
                                            <Input
                                                id="why_choose_image"
                                                name="why_choose_image"
                                                type="file"
                                                accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'why_choose_image')}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Format: PNG, JPG, JPEG, SVG, WebP • Maksimal: 5MB
                                    </p>
                                    <InputError message={errors.why_choose_image} />
                                </div>

                                {/* Features List */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-slate-900">Fitur Unggulan</h3>
                                        <Button
                                            type="button"
                                            onClick={addWhyChooseFeature}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Plus className="size-4" />
                                            Tambah Fitur
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {whyChooseFeatures.map((feature, index) => (
                                            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-900">Fitur {index + 1}</span>
                                                    {whyChooseFeatures.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeWhyChooseFeature(index)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`why_choose_icon_${index}`} className="text-xs text-muted-foreground">
                                                        Icon (Lucide Icon Name)
                                                    </Label>
                                                    <Input
                                                        id={`why_choose_icon_${index}`}
                                                        value={feature.icon}
                                                        onChange={(e) => updateWhyChooseFeature(index, 'icon', e.target.value)}
                                                        placeholder="TrendingUp"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`why_choose_title_${index}`} className="text-xs text-muted-foreground">
                                                        Judul
                                                    </Label>
                                                    <Input
                                                        id={`why_choose_title_${index}`}
                                                        value={feature.title}
                                                        onChange={(e) => updateWhyChooseFeature(index, 'title', e.target.value)}
                                                        placeholder="Tingkatkan Penjualan Hingga 40%"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`why_choose_description_${index}`} className="text-xs text-muted-foreground">
                                                        Deskripsi
                                                    </Label>
                                                    <textarea
                                                        id={`why_choose_description_${index}`}
                                                        value={feature.description}
                                                        onChange={(e) => updateWhyChooseFeature(index, 'description', e.target.value)}
                                                        placeholder="Dengan automasi WhatsApp yang cerdas..."
                                                        rows={2}
                                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`why_choose_feature_image_${index}`} className="text-xs text-muted-foreground">
                                                        Gambar Fitur
                                                    </Label>
                                                    {feature.image && !whyChooseFeatureImages[index] && (
                                                        <div className="mb-2">
                                                            <img
                                                                src={`/storage/${feature.image}`}
                                                                alt={feature.title}
                                                                className="h-24 w-auto rounded-lg border object-contain"
                                                            />
                                                            <p className="mt-1 text-xs text-muted-foreground">Gambar saat ini</p>
                                                        </div>
                                                    )}
                                                    <Input
                                                        id={`why_choose_feature_image_${index}`}
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setWhyChooseFeatureImages(prev => ({
                                                                    ...prev,
                                                                    [index]: file
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Format: PNG, JPG, JPEG, SVG, WebP (Max: 5MB)
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Features Section */}

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <ImageIcon className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Features Section Homepage</CardTitle>
                                        <CardDescription>
                                            Kelola fitur-fitur yang ditampilkan di halaman homepage
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Section Title & Subtitle */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Judul Section</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="features_section_title" className="text-sm font-medium">
                                            Judul Utama
                                        </Label>
                                        <Input
                                            id="features_section_title"
                                            name="features_section_title"
                                            value={data.features_section_title}
                                            onChange={(e) => setData('features_section_title', e.target.value)}
                                            placeholder="Fitur Lengkap untuk"
                                        />
                                        <InputError message={errors.features_section_title} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="features_section_subtitle" className="text-sm font-medium">
                                            Sub Judul
                                        </Label>
                                        <Input
                                            id="features_section_subtitle"
                                            name="features_section_subtitle"
                                            value={data.features_section_subtitle}
                                            onChange={(e) => setData('features_section_subtitle', e.target.value)}
                                            placeholder="Pertumbuhan Bisnis"
                                        />
                                        <InputError message={errors.features_section_subtitle} />
                                    </div>
                                </div>

                                {/* Feature 1 */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Fitur 1</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature_1_icon" className="text-xs text-muted-foreground">
                                                Icon (Lucide)
                                            </Label>
                                            <Input
                                                id="feature_1_icon"
                                                name="feature_1_icon"
                                                value={data.feature_1_icon}
                                                onChange={(e) => setData('feature_1_icon', e.target.value)}
                                                placeholder="Bot"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="feature_1_title" className="text-xs text-muted-foreground">
                                                Judul
                                            </Label>
                                            <Input
                                                id="feature_1_title"
                                                name="feature_1_title"
                                                value={data.feature_1_title}
                                                onChange={(e) => setData('feature_1_title', e.target.value)}
                                                placeholder="AI-Powered Automation"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feature_1_description" className="text-xs text-muted-foreground">
                                            Deskripsi
                                        </Label>
                                        <Input
                                            id="feature_1_description"
                                            name="feature_1_description"
                                            value={data.feature_1_description}
                                            onChange={(e) => setData('feature_1_description', e.target.value)}
                                            placeholder="Otomatis mengelola lead dan customer"
                                        />
                                    </div>
                                </div>

                                {/* Feature 2 */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Fitur 2</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature_2_icon" className="text-xs text-muted-foreground">
                                                Icon (Lucide)
                                            </Label>
                                            <Input
                                                id="feature_2_icon"
                                                name="feature_2_icon"
                                                value={data.feature_2_icon}
                                                onChange={(e) => setData('feature_2_icon', e.target.value)}
                                                placeholder="MessageSquare"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="feature_2_title" className="text-xs text-muted-foreground">
                                                Judul
                                            </Label>
                                            <Input
                                                id="feature_2_title"
                                                name="feature_2_title"
                                                value={data.feature_2_title}
                                                onChange={(e) => setData('feature_2_title', e.target.value)}
                                                placeholder="Smart Conversations"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feature_2_description" className="text-xs text-muted-foreground">
                                            Deskripsi
                                        </Label>
                                        <Input
                                            id="feature_2_description"
                                            name="feature_2_description"
                                            value={data.feature_2_description}
                                            onChange={(e) => setData('feature_2_description', e.target.value)}
                                            placeholder="Chatbot cerdas yang memahami konteks"
                                        />
                                    </div>
                                </div>

                                {/* Feature 3 */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Fitur 3</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature_3_icon" className="text-xs text-muted-foreground">
                                                Icon (Lucide)
                                            </Label>
                                            <Input
                                                id="feature_3_icon"
                                                name="feature_3_icon"
                                                value={data.feature_3_icon}
                                                onChange={(e) => setData('feature_3_icon', e.target.value)}
                                                placeholder="TrendingUp"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="feature_3_title" className="text-xs text-muted-foreground">
                                                Judul
                                            </Label>
                                            <Input
                                                id="feature_3_title"
                                                name="feature_3_title"
                                                value={data.feature_3_title}
                                                onChange={(e) => setData('feature_3_title', e.target.value)}
                                                placeholder="Sales Analytics"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feature_3_description" className="text-xs text-muted-foreground">
                                            Deskripsi
                                        </Label>
                                        <Input
                                            id="feature_3_description"
                                            name="feature_3_description"
                                            value={data.feature_3_description}
                                            onChange={(e) => setData('feature_3_description', e.target.value)}
                                            placeholder="Analisis penjualan real-time"
                                        />
                                    </div>
                                </div>

                                {/* Feature 4 */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Fitur 4</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature_4_icon" className="text-xs text-muted-foreground">
                                                Icon (Lucide)
                                            </Label>
                                            <Input
                                                id="feature_4_icon"
                                                name="feature_4_icon"
                                                value={data.feature_4_icon}
                                                onChange={(e) => setData('feature_4_icon', e.target.value)}
                                                placeholder="Users"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="feature_4_title" className="text-xs text-muted-foreground">
                                                Judul
                                            </Label>
                                            <Input
                                                id="feature_4_title"
                                                name="feature_4_title"
                                                value={data.feature_4_title}
                                                onChange={(e) => setData('feature_4_title', e.target.value)}
                                                placeholder="Contact Management"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feature_4_description" className="text-xs text-muted-foreground">
                                            Deskripsi
                                        </Label>
                                        <Input
                                            id="feature_4_description"
                                            name="feature_4_description"
                                            value={data.feature_4_description}
                                            onChange={(e) => setData('feature_4_description', e.target.value)}
                                            placeholder="Kelola semua kontak dan interaksi"
                                        />
                                    </div>
                                </div>

                                {/* Feature 5 */}
                                <div className="space-y-4 pb-4 border-b border-border">
                                    <h3 className="text-sm font-semibold text-slate-900">Fitur 5</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature_5_icon" className="text-xs text-muted-foreground">
                                                Icon (Lucide)
                                            </Label>
                                            <Input
                                                id="feature_5_icon"
                                                name="feature_5_icon"
                                                value={data.feature_5_icon}
                                                onChange={(e) => setData('feature_5_icon', e.target.value)}
                                                placeholder="Zap"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="feature_5_title" className="text-xs text-muted-foreground">
                                                Judul
                                            </Label>
                                            <Input
                                                id="feature_5_title"
                                                name="feature_5_title"
                                                value={data.feature_5_title}
                                                onChange={(e) => setData('feature_5_title', e.target.value)}
                                                placeholder="Quick Response"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feature_5_description" className="text-xs text-muted-foreground">
                                            Deskripsi
                                        </Label>
                                        <Input
                                            id="feature_5_description"
                                            name="feature_5_description"
                                            value={data.feature_5_description}
                                            onChange={(e) => setData('feature_5_description', e.target.value)}
                                            placeholder="Respon otomatis dan cepat"
                                        />
                                    </div>
                                </div>

                                {/* Feature 6 */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900">Fitur 6</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="feature_6_icon" className="text-xs text-muted-foreground">
                                                Icon (Lucide)
                                            </Label>
                                            <Input
                                                id="feature_6_icon"
                                                name="feature_6_icon"
                                                value={data.feature_6_icon}
                                                onChange={(e) => setData('feature_6_icon', e.target.value)}
                                                placeholder="BarChart3"
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="feature_6_title" className="text-xs text-muted-foreground">
                                                Judul
                                            </Label>
                                            <Input
                                                id="feature_6_title"
                                                name="feature_6_title"
                                                value={data.feature_6_title}
                                                onChange={(e) => setData('feature_6_title', e.target.value)}
                                                placeholder="Performance Tracking"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feature_6_description" className="text-xs text-muted-foreground">
                                            Deskripsi
                                        </Label>
                                        <Input
                                            id="feature_6_description"
                                            name="feature_6_description"
                                            value={data.feature_6_description}
                                            onChange={(e) => setData('feature_6_description', e.target.value)}
                                            placeholder="Pantau performa tim sales"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                        Icon menggunakan <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Lucide Icons</a>.
                                        Kosongkan field untuk menyembunyikan fitur.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Contact Tab */}
                    <TabsContent value="contact" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Mail className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Informasi Kontak</CardTitle>
                                        <CardDescription>
                                            Informasi untuk dihubungi pengguna
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email" className="text-sm font-medium">
                                            Alamat Email *
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="contact_email"
                                                name="contact_email"
                                                type="email"
                                                value={data.contact_email}
                                                onChange={(e) => setData('contact_email', e.target.value)}
                                                placeholder="email@contoh.com"
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.contact_email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_phone" className="text-sm font-medium">
                                            Nomor Telepon
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="contact_phone"
                                                name="contact_phone"
                                                value={data.contact_phone}
                                                onChange={(e) => setData('contact_phone', e.target.value)}
                                                placeholder="+62 812-3456-7890"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.contact_phone} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm font-medium">
                                        Alamat
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Alamat kantor atau bisnis Anda"
                                            rows={2}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 pl-10 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                        />
                                    </div>
                                    <InputError message={errors.address} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="google_maps_embed" className="text-sm font-medium">
                                        Google Maps Embed
                                    </Label>
                                    <div className="relative">
                                        <Map className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                        <textarea
                                            id="google_maps_embed"
                                            name="google_maps_embed"
                                            value={data.google_maps_embed}
                                            onChange={(e) => handleGoogleMapsChange(e.target.value)}
                                            placeholder='Paste iframe lengkap atau URL saja. Contoh:
<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450"...></iframe>

atau langsung URL-nya saja:
https://www.google.com/maps/embed?pb=...'
                                            rows={4}
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 pl-10 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono text-xs"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        💡 <strong>Cara mudah:</strong> Buka Google Maps → Cari lokasi → Klik "Share" → Pilih "Embed a map" → Copy semua kode HTML yang muncul → Paste di sini
                                    </p>
                                    <InputError message={errors.google_maps_embed} />
                                </div>

                                {/* Google Maps Preview */}
                                {data.google_maps_embed && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Preview Peta
                                        </Label>
                                        <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-border">
                                            <iframe
                                                src={data.google_maps_embed}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                    </div>
                                )}

                                {/* Contact Help Image Upload */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Gambar "Butuh Bantuan Segera?"
                                    </Label>

                                    {/* Drag & Drop Area */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'contact_help_image')}
                                        className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-background/50"
                                    >
                                        {contactHelpPreview ? (
                                            <div className="space-y-4">
                                                {/* Preview Image */}
                                                <div className="relative w-full h-48 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={contactHelpPreview}
                                                        alt="Contact Help Preview"
                                                        className="max-w-full max-h-full object-contain p-4"
                                                    />
                                                    {/* Remove Button */}
                                                    {data.contact_help_image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile('contact_help_image')}
                                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                                            title="Hapus file"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <FileImage className="size-4" />
                                                        <span>Gambar siap diupload</span>
                                                    </div>
                                                    {data.contact_help_image && (
                                                        <span className="text-muted-foreground">
                                                            {formatFileSize(data.contact_help_image.size)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <div className="flex justify-center">
                                                    <div className="p-4 rounded-full bg-primary/10">
                                                        <Upload className="size-8 text-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Drag & drop gambar di sini</p>
                                                    <p className="text-xs text-muted-foreground mt-1">atau klik tombol di bawah</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <div className="mt-4 flex justify-center">
                                            <Label
                                                htmlFor="contact_help_image"
                                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                <Upload className="size-4" />
                                                {contactHelpPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                            </Label>
                                            <Input
                                                id="contact_help_image"
                                                name="contact_help_image"
                                                type="file"
                                                accept="image/png,image/jpg,image/jpeg,image/svg+xml,image/webp"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'contact_help_image')}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Format: PNG, JPG, JPEG, SVG, WebP • Maksimal: 3MB • Gambar akan ditampilkan di halaman kontak
                                    </p>
                                    <InputError message={errors.contact_help_image} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Social Media Tab */}
                    <TabsContent value="social" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Globe className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Media Sosial</CardTitle>
                                        <CardDescription>
                                            Hubungkan akun media sosial Anda
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook_url" className="text-sm font-medium">
                                            Facebook
                                        </Label>
                                        <div className="relative">
                                            <Facebook className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="facebook_url"
                                                name="facebook_url"
                                                type="url"
                                                value={data.facebook_url}
                                                onChange={(e) => setData('facebook_url', e.target.value)}
                                                placeholder="https://facebook.com/halamananda"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.facebook_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="twitter_url" className="text-sm font-medium">
                                            Twitter / X
                                        </Label>
                                        <div className="relative">
                                            <Twitter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="twitter_url"
                                                name="twitter_url"
                                                type="url"
                                                value={data.twitter_url}
                                                onChange={(e) => setData('twitter_url', e.target.value)}
                                                placeholder="https://twitter.com/username"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.twitter_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instagram_url" className="text-sm font-medium">
                                            Instagram
                                        </Label>
                                        <div className="relative">
                                            <Instagram className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="instagram_url"
                                                name="instagram_url"
                                                type="url"
                                                value={data.instagram_url}
                                                onChange={(e) => setData('instagram_url', e.target.value)}
                                                placeholder="https://instagram.com/username"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.instagram_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin_url" className="text-sm font-medium">
                                            LinkedIn
                                        </Label>
                                        <div className="relative">
                                            <Linkedin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="linkedin_url"
                                                name="linkedin_url"
                                                type="url"
                                                value={data.linkedin_url}
                                                onChange={(e) => setData('linkedin_url', e.target.value)}
                                                placeholder="https://linkedin.com/company/perusahaan"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.linkedin_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tiktok_url" className="text-sm font-medium">
                                            TikTok
                                        </Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="tiktok_url"
                                                name="tiktok_url"
                                                type="url"
                                                value={data.tiktok_url}
                                                onChange={(e) => setData('tiktok_url', e.target.value)}
                                                placeholder="https://tiktok.com/@username"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.tiktok_url} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SEO Tab */}
                    <TabsContent value="seo" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Search className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Pengaturan SEO</CardTitle>
                                        <CardDescription>
                                            Optimalkan website untuk mesin pencari
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="meta_keywords" className="text-sm font-medium">
                                        Kata Kunci Meta
                                    </Label>
                                    <Input
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        value={data.meta_keywords}
                                        onChange={(e) => setData('meta_keywords', e.target.value)}
                                        placeholder="ai, chat, platform, komunikasi"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Pisahkan kata kunci dengan koma
                                    </p>
                                    <InputError message={errors.meta_keywords} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meta_description" className="text-sm font-medium">
                                        Deskripsi Meta
                                    </Label>
                                    <textarea
                                        id="meta_description"
                                        name="meta_description"
                                        value={data.meta_description}
                                        onChange={(e) => setData('meta_description', e.target.value)}
                                        placeholder="Deskripsi singkat yang muncul di hasil pencarian"
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Panjang yang disarankan: 150-160 karakter
                                    </p>
                                    <InputError message={errors.meta_description} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Auth Page Tab */}
                    <TabsContent value="auth" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <ImageIcon className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Halaman Login Branding</CardTitle>
                                        <CardDescription>
                                            Kustomisasi tampilan halaman login/register
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* Hero Image Upload */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        Gambar Hero Login
                                    </Label>

                                    {/* Drag & Drop Area */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'auth_hero_image')}
                                        className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors bg-background/50"
                                    >
                                        {authHeroPreview ? (
                                            <div className="space-y-4">
                                                {/* Preview Image */}
                                                <div className="relative w-full h-48 rounded-lg border-2 border-border bg-muted flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={authHeroPreview}
                                                        alt="Hero Preview"
                                                        className="max-w-full max-h-full object-contain p-4"
                                                    />
                                                    {/* Remove Button */}
                                                    {data.auth_hero_image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile('auth_hero_image')}
                                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                                                            title="Hapus file"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <FileImage className="size-4" />
                                                        <span>Gambar hero siap diupload</span>
                                                    </div>
                                                    {data.auth_hero_image && (
                                                        <span className="text-muted-foreground">
                                                            {formatFileSize(data.auth_hero_image.size)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-3">
                                                <div className="flex justify-center">
                                                    <div className="p-4 rounded-full bg-primary/10">
                                                        <Upload className="size-8 text-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Drag & drop gambar hero di sini</p>
                                                    <p className="text-xs text-muted-foreground mt-1">atau klik tombol di bawah</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        <div className="mt-4 flex justify-center">
                                            <Label
                                                htmlFor="auth_hero_image"
                                                className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                <Upload className="size-4" />
                                                {authHeroPreview ? 'Ganti Gambar' : 'Pilih Gambar'}
                                            </Label>
                                            <Input
                                                id="auth_hero_image"
                                                name="auth_hero_image"
                                                type="file"
                                                accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'auth_hero_image')}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Format: PNG, JPG, JPEG, SVG • Maksimal: 5MB • Recommended: 1920x1080px
                                    </p>
                                    <InputError message={errors.auth_hero_image} />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="auth_logo_name" className="text-sm font-medium">
                                            Nama Logo
                                        </Label>
                                        <Input
                                            id="auth_logo_name"
                                            name="auth_logo_name"
                                            value={data.auth_logo_name}
                                            onChange={(e) => setData('auth_logo_name', e.target.value)}
                                            placeholder="ChatCepat"
                                        />
                                        <InputError message={errors.auth_logo_name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="auth_tagline" className="text-sm font-medium">
                                            Tagline
                                        </Label>
                                        <Input
                                            id="auth_tagline"
                                            name="auth_tagline"
                                            value={data.auth_tagline}
                                            onChange={(e) => setData('auth_tagline', e.target.value)}
                                            placeholder="Smart, Fast & Reliable"
                                        />
                                        <InputError message={errors.auth_tagline} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="auth_heading" className="text-sm font-medium">
                                        Heading Utama
                                    </Label>
                                    <Input
                                        id="auth_heading"
                                        name="auth_heading"
                                        value={data.auth_heading}
                                        onChange={(e) => setData('auth_heading', e.target.value)}
                                        placeholder="Kelola website Anda dengan mudah dan cepat"
                                    />
                                    <InputError message={errors.auth_heading} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="auth_description" className="text-sm font-medium">
                                        Deskripsi
                                    </Label>
                                    <textarea
                                        id="auth_description"
                                        name="auth_description"
                                        value={data.auth_description}
                                        onChange={(e) => setData('auth_description', e.target.value)}
                                        placeholder="Platform manajemen konten modern dengan fitur lengkap untuk mengembangkan bisnis Anda."
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    />
                                    <InputError message={errors.auth_description} />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                            Fitur-fitur
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addFeature}
                                            className="h-8"
                                        >
                                            <Plus className="size-4 mr-1" />
                                            Tambah Fitur
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {authFeatures.map((feature, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <div className="flex-1">
                                                    <Input
                                                        value={feature}
                                                        onChange={(e) => updateFeature(index, e.target.value)}
                                                        placeholder={`Fitur ${index + 1}`}
                                                        className="w-full"
                                                    />
                                                </div>
                                                {authFeatures.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFeature(index)}
                                                        className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-muted-foreground">
                                        Klik "Tambah Fitur" untuk menambah item baru, atau klik ikon sampah untuk menghapus
                                    </p>
                                    <InputError message={errors.auth_features} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="auth_copyright" className="text-sm font-medium">
                                        Copyright Text
                                    </Label>
                                    <Input
                                        id="auth_copyright"
                                        name="auth_copyright"
                                        value={data.auth_copyright}
                                        onChange={(e) => setData('auth_copyright', e.target.value)}
                                        placeholder="© 2025 ChatCepat. All rights reserved."
                                    />
                                    <InputError message={errors.auth_copyright} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Footer Tab */}
                    <TabsContent value="footer" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <FileImage className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Pengaturan Footer</CardTitle>
                                        <CardDescription>
                                            Kelola informasi yang ditampilkan di footer website
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="footer_tagline" className="text-sm font-medium">
                                        Tagline Footer
                                    </Label>
                                    <textarea
                                        id="footer_tagline"
                                        name="footer_tagline"
                                        value={data.footer_tagline}
                                        onChange={(e) => setData('footer_tagline', e.target.value)}
                                        placeholder="Omnichannel + CRM"
                                        rows={2}
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Tagline atau slogan yang akan ditampilkan di bawah logo. Tekan Enter untuk baris baru.
                                    </p>
                                    <InputError message={errors.footer_tagline} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="footer_company_name" className="text-sm font-medium">
                                        Nama Perusahaan
                                    </Label>
                                    <Input
                                        id="footer_company_name"
                                        name="footer_company_name"
                                        value={data.footer_company_name}
                                        onChange={(e) => setData('footer_company_name', e.target.value)}
                                        placeholder="PT Teknologi ChatCepat Indonesia"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Nama lengkap perusahaan yang akan ditampilkan di footer
                                    </p>
                                    <InputError message={errors.footer_company_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="footer_address" className="text-sm font-medium">
                                        Alamat Perusahaan
                                    </Label>
                                    <textarea
                                        id="footer_address"
                                        name="footer_address"
                                        value={data.footer_address}
                                        onChange={(e) => setData('footer_address', e.target.value)}
                                        placeholder="Ruko Hampton Avenue Blok A no.10. Paramount - Gading Serpong. Tangerang, 15810"
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Alamat lengkap kantor perusahaan
                                    </p>
                                    <InputError message={errors.footer_address} />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="google_play_url" className="text-sm font-medium">
                                            Google Play URL
                                        </Label>
                                        <Input
                                            id="google_play_url"
                                            name="google_play_url"
                                            value={data.google_play_url}
                                            onChange={(e) => setData('google_play_url', e.target.value)}
                                            placeholder="https://play.google.com/store/apps/details?id=..."
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Link ke aplikasi di Google Play Store
                                        </p>
                                        <InputError message={errors.google_play_url} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="app_store_url" className="text-sm font-medium">
                                            App Store URL
                                        </Label>
                                        <Input
                                            id="app_store_url"
                                            name="app_store_url"
                                            value={data.app_store_url}
                                            onChange={(e) => setData('app_store_url', e.target.value)}
                                            placeholder="https://apps.apple.com/id/app/..."
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Link ke aplikasi di App Store
                                        </p>
                                        <InputError message={errors.app_store_url} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="youtube_url" className="text-sm font-medium">
                                        YouTube URL
                                    </Label>
                                    <Input
                                        id="youtube_url"
                                        name="youtube_url"
                                        value={data.youtube_url}
                                        onChange={(e) => setData('youtube_url', e.target.value)}
                                        placeholder="https://youtube.com/@channel"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Link ke channel YouTube perusahaan
                                    </p>
                                    <InputError message={errors.youtube_url} />
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp_support" className="text-sm font-medium">
                                            WhatsApp Support
                                        </Label>
                                        <Input
                                            id="whatsapp_support"
                                            name="whatsapp_support"
                                            value={data.whatsapp_support}
                                            onChange={(e) => setData('whatsapp_support', e.target.value)}
                                            placeholder="6281234567890"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Nomor WhatsApp support (format: 628xxx tanpa +)
                                        </p>
                                        <InputError message={errors.whatsapp_support} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email_support" className="text-sm font-medium">
                                            Email Support
                                        </Label>
                                        <Input
                                            id="email_support"
                                            name="email_support"
                                            value={data.email_support}
                                            onChange={(e) => setData('email_support', e.target.value)}
                                            placeholder="support@chatcepat.com"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Email untuk customer support
                                        </p>
                                        <InputError message={errors.email_support} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Integrations Tab Content */}
                    <TabsContent value="integrations" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Layers className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <CardTitle>Integrasi Pihak Ketiga</CardTitle>
                                        <CardDescription>
                                            Hubungkan website Anda dengan layanan eksternal
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Mailketing Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="size-8 rounded bg-[#FE0000] flex items-center justify-center text-white font-bold text-xs">M</div>
                                            <h3 className="font-semibold text-base">Mailketing</h3>
                                        </div>

                                        <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                    disabled={!data.mailketing_from_email || !data.mailketing_api_token}
                                                >
                                                    <RefreshCcw className="size-3.5" />
                                                    Test Koneksi
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Test Koneksi Mailketing</DialogTitle>
                                                    <DialogDescription>
                                                        Kirim email percobaan untuk memastikan konfigurasi sudah benar.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="test_template">Pilih Template untuk Dites</Label>
                                                        <Select value={selectedTestTemplate} onValueChange={setSelectedTestTemplate}>
                                                            <SelectTrigger id="test_template">
                                                                <SelectValue placeholder="Pilih template" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="generic">Default (Email Tes Koneksi)</SelectItem>
                                                                <SelectItem value="mail_template_registration_success">1. Registrasi Berhasil & Instruksi Bayar</SelectItem>
                                                                <SelectItem value="mail_template_payment_success">2. Konfirmasi Pembayaran Berhasil</SelectItem>
                                                                <SelectItem value="mail_template_password_change">3. Ganti Password</SelectItem>
                                                                <SelectItem value="mail_template_upgrade_success">4. Berhasil Upgrade Paket</SelectItem>
                                                                <SelectItem value="mail_template_trial_reminder">5. Pengingat Masa Trial Berakhir</SelectItem>
                                                                <SelectItem value="mail_template_package_reminder">6. Pengingat Paket Berakhir</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="test_recipient">Email Tujuan</Label>
                                                        <Input
                                                            id="test_recipient"
                                                            placeholder="nama@example.com"
                                                            value={testRecipient}
                                                            onChange={(e) => setTestRecipient(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg border">
                                                        <p className="font-semibold mb-1">Data yang akan dikirim:</p>
                                                        <ul className="list-disc list-inside space-y-0.5">
                                                            <li>From: {data.mailketing_from_email || '(belum diisi)'}</li>
                                                            <li>Template: {
                                                                selectedTestTemplate === 'generic' ? 'Default Test' :
                                                                    selectedTestTemplate === 'mail_template_registration_success' ? 'Registrasi' :
                                                                        selectedTestTemplate === 'mail_template_payment_success' ? 'Pembayaran' :
                                                                            selectedTestTemplate === 'mail_template_password_change' ? 'Keamanan' :
                                                                                selectedTestTemplate === 'mail_template_upgrade_success' ? 'Upgrade' :
                                                                                    selectedTestTemplate === 'mail_template_trial_reminder' ? 'Trial' : 'Paket'
                                                            }</li>
                                                            <li>API Token: {data.mailketing_api_token ? '••••••••••••' : '(belum diisi)'}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setIsTestModalOpen(false)}
                                                        disabled={isTesting}
                                                    >
                                                        Batal
                                                    </Button>
                                                    <Button
                                                        onClick={handleTestMailketing}
                                                        disabled={isTesting}
                                                        className="gap-2"
                                                    >
                                                        {isTesting ? (
                                                            <RefreshCcw className="size-4 animate-spin" />
                                                        ) : (
                                                            <Send className="size-4" />
                                                        )}
                                                        {isTesting ? 'Mengirim...' : 'Kirim Email Tes'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="mailketing_from_email" className="text-sm font-medium">
                                                Gmail (From Email)
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="mailketing_from_email"
                                                    name="mailketing_from_email"
                                                    type="email"
                                                    value={data.mailketing_from_email}
                                                    onChange={(e) => setData('mailketing_from_email', e.target.value)}
                                                    placeholder="akunanda@gmail.com"
                                                    className="pl-10"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Email Gmail yang terhubung dengan akun Mailketing Anda
                                            </p>
                                            <InputError message={errors.mailketing_from_email} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mailketing_api_token" className="text-sm font-medium">
                                                API Token
                                            </Label>
                                            <Input
                                                id="mailketing_api_token"
                                                name="mailketing_api_token"
                                                type="password"
                                                value={data.mailketing_api_token}
                                                onChange={(e) => setData('mailketing_api_token', e.target.value)}
                                                placeholder="Masukkan API Token Mailketing"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Dapatkan token API dari dashboard Mailketing
                                            </p>
                                            <InputError message={errors.mailketing_api_token} />
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 mt-2">
                                        <div className="flex items-start gap-3">
                                            <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">i</div>
                                            <div className="text-sm text-blue-800">
                                                <p className="font-semibold mb-1">Informasi:</p>
                                                <p>Pengaturan ini digunakan untuk pengiriman email melalui layanan <a href="https://mailketing.co.id" target="_blank" className="font-bold underline uppercase">Mailketing</a>. Pastikan kredensial yang dimasukkan valid sesuai dengan dokumentasi Mailketing.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email Templates Section */}
                                    <div className="mt-8 space-y-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <Mail className="size-5 text-primary" />
                                            <h3 className="font-semibold text-base">Template Email</h3>
                                        </div>

                                        <Accordion type="single" collapsible className="w-full space-y-2 border-none">
                                            {/* 1. Registration & Payment Instructions */}
                                            <AccordionItem value="reg-success" className="border rounded-lg px-4 bg-muted/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold">1. Notifikasi Registrasi Berhasil & Instruksi Pembayaran</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Dikirim saat user baru mendaftar</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Isi Template</Label>
                                                        <RichTextEditor
                                                            content={data.mail_template_registration_success}
                                                            onChange={(content) => setData('mail_template_registration_success', content)}
                                                        />
                                                        <InputError message={errors.mail_template_registration_success} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Variabel tersedia: {'{user_name}'}, {'{site_name}'}, {'{payment_amount}'}, {'{payment_link}'}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* 2. Payment Success */}
                                            <AccordionItem value="pay-success" className="border rounded-lg px-4 bg-muted/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold">2. Notifikasi Pembayaran Berhasil</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Dikirim konfirmasi instan setelah transaksi sukses</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Isi Template</Label>
                                                        <RichTextEditor
                                                            content={data.mail_template_payment_success}
                                                            onChange={(content) => setData('mail_template_payment_success', content)}
                                                        />
                                                        <InputError message={errors.mail_template_payment_success} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Variabel tersedia: {'{user_name}'}, {'{transaction_id}'}, {'{package_name}'}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* 3. Password Change */}
                                            <AccordionItem value="pwd-change" className="border rounded-lg px-4 bg-muted/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold">3. Notifikasi Ganti Password</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Pemberitahuan keamanan saat password diubah</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Isi Template</Label>
                                                        <RichTextEditor
                                                            content={data.mail_template_password_change}
                                                            onChange={(content) => setData('mail_template_password_change', content)}
                                                        />
                                                        <InputError message={errors.mail_template_password_change} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Variabel tersedia: {'{user_name}'}, {'{date_time}'}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* 4. Upgrade Success */}
                                            <AccordionItem value="upg-success" className="border rounded-lg px-4 bg-muted/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold">4. Notifikasi Berhasil Upgrade</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Selamat atas aktivasi paket baru</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Isi Template</Label>
                                                        <RichTextEditor
                                                            content={data.mail_template_upgrade_success}
                                                            onChange={(content) => setData('mail_template_upgrade_success', content)}
                                                        />
                                                        <InputError message={errors.mail_template_upgrade_success} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Variabel tersedia: {'{user_name}'}, {'{new_package_name}'}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* 5. Trial Reminder */}
                                            <AccordionItem value="trial-reminder" className="border rounded-lg px-4 bg-muted/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold">5. Pengingat Masa Trial Berakhir</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Ajakan upgrade sebelum trial selesai</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Isi Template</Label>
                                                        <RichTextEditor
                                                            content={data.mail_template_trial_reminder}
                                                            onChange={(content) => setData('mail_template_trial_reminder', content)}
                                                        />
                                                        <InputError message={errors.mail_template_trial_reminder} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Variabel tersedia: {'{user_name}'}, {'{days_left}'}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* 6. Package Expired Reminder */}
                                            <AccordionItem value="pkg-reminder" className="border rounded-lg px-4 bg-muted/30">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-semibold">6. Pengingat Paket Berakhir</span>
                                                        <span className="text-xs text-muted-foreground font-normal">Pemberitahuan perpanjangan paket (Basic/Medium/Pro/Enterprise)</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-2 pb-6 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs">Isi Template</Label>
                                                        <RichTextEditor
                                                            content={data.mail_template_package_reminder}
                                                            onChange={(content) => setData('mail_template_package_reminder', content)}
                                                        />
                                                        <InputError message={errors.mail_template_package_reminder} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic">
                                                        Variabel tersedia: {'{user_name}'}, {'{package_name}'}, {'{expiry_date}'}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Tombol Aksi */}
                <div className="flex items-center justify-end gap-4 sticky bottom-0 bg-background py-4 border-t">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={!!processing}
                    >
                        <Save className="size-4" />
                        <span>{String(processing ? 'Menyimpan...' : 'Simpan Perubahan')}</span>
                    </Button>
                </div>
            </form>
        </AdminLayout>
    )
}
