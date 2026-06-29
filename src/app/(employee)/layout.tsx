import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EmployeeTabBar from '@/components/employee/EmployeeTabBar'
import { ToastContextProvider } from '@/components/ui/toaster'
import { LanguageProvider } from '@/lib/LanguageContext'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'EMPLOYEE') redirect('/login')
  return (
    <LanguageProvider>
    <ToastContextProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 overflow-y-auto pb-20"><div className="max-w-lg mx-auto px-4 py-6">{children}</div></main>
        <EmployeeTabBar />
      </div>
    </ToastContextProvider>
    </LanguageProvider>
  )
}

