export interface Faq {
    id: number
    question: string
    answer: string
    created_at: string
    updated_at: string
}

export interface FaqFormData {
    question: string
    answer: string
}
