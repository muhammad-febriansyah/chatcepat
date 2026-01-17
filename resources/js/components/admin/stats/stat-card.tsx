import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: string
    className?: string
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn('transition-all hover:border-primary/30', className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
                            {trend && (
                                <span className="text-xs font-medium text-primary">
                                    {trend}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {description}
                            </p>
                        )}
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="size-6 text-primary" strokeWidth={2} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
