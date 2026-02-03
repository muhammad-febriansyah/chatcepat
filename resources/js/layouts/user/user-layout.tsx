import { PropsWithChildren, useEffect, useRef } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { UserSidebar } from '@/components/user/sidebar/user-sidebar'
import { UserHeader } from '@/components/user/header/user-header'
import { AdminSidebar } from '@/components/admin/sidebar/admin-sidebar'
import { AdminHeader } from '@/components/admin/header/admin-header'
import { Toaster, toast } from 'sonner'
import { usePage } from '@inertiajs/react'
import { startCsrfAutoRefresh, stopCsrfAutoRefresh } from '@/utils/csrf-refresh'
import { SharedData } from '@/types'

export default function UserLayout({ children }: PropsWithChildren) {
    const { flash, auth } = usePage<SharedData & { flash: { success?: string; error?: string } }>().props
    const lastFlashRef = useRef<{ success?: string; error?: string }>({})

    // Check if current user is admin
    const isAdmin = auth?.user?.role === 'admin'

    useEffect(() => {
        if (flash?.success && typeof flash.success === 'string' && flash.success !== lastFlashRef.current.success) {
            toast.success(flash.success)
            lastFlashRef.current.success = flash.success
        }
        if (flash?.error && typeof flash.error === 'string' && flash.error !== lastFlashRef.current.error) {
            toast.error(flash.error)
            lastFlashRef.current.error = flash.error
        }
    }, [flash?.success, flash?.error])

    // Auto-refresh CSRF token every 10 minutes (aggressive) to prevent 419 errors
    useEffect(() => {
        startCsrfAutoRefresh(10) // Refresh every 60 minutes

        return () => {
            stopCsrfAutoRefresh() // Cleanup on unmount
        }
    }, [])

    // If admin is accessing user routes, use AdminLayout to keep admin sidebar
    if (isAdmin) {
        return (
            <SidebarProvider>
                <AdminSidebar />
                <SidebarInset className="bg-background">
                    <AdminHeader />
                    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 lg:p-10">
                        {children}
                    </main>
                </SidebarInset>
                <Toaster richColors position="top-right" />
            </SidebarProvider>
        )
    }

    // Regular user layout
    return (
        <SidebarProvider>
            <UserSidebar />
            <SidebarInset className="bg-background">
                <UserHeader />
                <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8 lg:p-10">
                    {children}
                </main>
            </SidebarInset>
            <Toaster richColors position="top-right" />
        </SidebarProvider>
    )
}
