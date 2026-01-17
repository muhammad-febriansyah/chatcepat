import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import InputError from '@/components/input-error'
import { FormEventHandler } from 'react'
import { HelpCircle, Save, X } from 'lucide-react'
import { router } from '@inertiajs/react'
import { Faq } from '@/types/faq'

interface EditFaqProps {
    faq: Faq
}

export default function EditFaq({ faq }: EditFaqProps) {
    const { data, setData, put, processing, errors } = useForm({
        question: faq.question || '',
        answer: faq.answer || '',
    })

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        put(`/admin/faqs/${faq.id}`)
    }

    const handleCancel = () => {
        router.visit('/admin/faqs')
    }

    return (
        <AdminLayout>
            <Head title="Edit FAQ" />

            <PageHeader title="Edit FAQ" description="Perbarui pertanyaan umum" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <HelpCircle className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi FAQ</CardTitle>
                                <CardDescription>Perbarui pertanyaan dan jawaban</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="question" className="text-sm font-medium">
                                Pertanyaan *
                            </Label>
                            <Input
                                id="question"
                                name="question"
                                value={data.question}
                                onChange={(e) => setData('question', e.target.value)}
                                placeholder="Masukkan pertanyaan"
                                required
                            />
                            <InputError message={errors.question} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="answer" className="text-sm font-medium">
                                Jawaban *
                            </Label>
                            <textarea
                                id="answer"
                                name="answer"
                                value={data.answer}
                                onChange={(e) => setData('answer', e.target.value)}
                                placeholder="Masukkan jawaban"
                                rows={6}
                                required
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.answer} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        <X className="size-4" />
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="size-4" />
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    )
}
