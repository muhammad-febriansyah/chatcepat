import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
    value: string
    label?: string
}

export default function CopyButton({ value, label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            const el = document.createElement('textarea')
            el.value = value
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-1">
            {label && <p className="text-xs font-medium text-gray-600">{label}</p>}
            <div className="flex gap-2 items-center">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md font-mono text-sm text-gray-700 break-all">
                    {value}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={`min-w-[80px] transition-all ${copied ? 'border-green-500 text-green-600' : ''}`}
                >
                    {copied ? (
                        <><Check className="w-3 h-3 mr-1" />Copied!</>
                    ) : (
                        <><Copy className="w-3 h-3 mr-1" />Copy</>
                    )}
                </Button>
            </div>
        </div>
    )
}
