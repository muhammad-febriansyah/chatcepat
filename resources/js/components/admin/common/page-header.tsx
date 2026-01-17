import { PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps extends PropsWithChildren {
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export function PageHeader({
    title,
    description,
    action,
    className,
    children,
}: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-6', className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-base text-muted-foreground max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
            {children}
        </div>
    )
}
