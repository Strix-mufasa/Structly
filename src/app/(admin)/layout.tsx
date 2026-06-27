import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { ToastContextProvider } from '@/components/ui/toaster'
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')
  return (
    <ToastContextProvider>
      <div className="flex h-screen bg-background">
        <AdminSidebar user={session.user} />
        <main className="flex-1 overflow-y-auto"><div className="max-w-5xl mx-auto px-6 py-8">{children}</div></main>
      </div>
    </ToastContextProvider>
  )
}

