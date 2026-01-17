import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'draft' | 'published' | 'archived'
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        draft: 'bg-yellow-100 text-yellow-800',
        published: 'bg-blue-100 text-blue-800',
        archived: 'bg-red-100 text-red-800',
    }

    return (
        <Badge
            variant="secondary"
            className={cn(
                'border-0 font-medium capitalize',
                variants[status],
                className
            )}
        >
            {status}
        </Badge>
    )
}
