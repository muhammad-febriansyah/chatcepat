export interface AiAssistantType {
    id: number
    code: string
    name: string
    description: string | null
    system_prompt: string | null
    icon: string | null
    color: string | null
    is_active: boolean
    sort_order: number
    created_at: string
    updated_at: string
}
