import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EmployeeSidebar from '@/components/employee/EmployeeSidebar'
import { ToastContextProvider } from '@/components/ui/toaster'
import { LanguageProvider } from '@/lib/LanguageContext'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYEE') redirect('/login')
  return (
    <LanguageProvider>
      <ToastContextProvider>
        <div className="min-h-screen bg-background flex">
          <EmployeeSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </ToastContextProvider>
    </LanguageProvider>
  )
}