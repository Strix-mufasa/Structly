'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Card, CardContent } from '@/components/ui/index'
import { PageHeader } from '@/components/shared'
import { useToast } from '@/components/ui/toaster'
import { useLang } from '@/lib/LanguageContext'

export default function CreateUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, lang } = useLang()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', email: '', role: 'EMPLOYEE', jobTitle: '' })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const jobTitles = [
    { en: 'Site Manager', sv: 'Platschef' },
    { en: 'Foreman / Work Supervisor', sv: 'Arbetsledare' },
    { en: 'Project Manager', sv: 'Projektchef' },
    { en: 'Design Manager / Engineering Lead', sv: 'Projekteringsledare' },
    { en: 'Purchaser / Procurement Officer', sv: 'Inköpare' },
    { en: 'Finance Manager / CFO', sv: 'Ekonomichef' },
    { en: 'Construction Safety Officer (YA)', sv: 'Bygg YA' },
    { en: 'Subcontractor Safety Officer (YA)', sv: 'UE YA' },
    // { en: 'My real role', sv: 'Min riktiga roll' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (data.error === 'EMAIL_EXISTS') setErrors({ email: 'An account with this email already exists' })
      else setErrors({ form: 'Failed to create user.' })
      return
    }

    toast(`${form.name} invited successfully!`, 'success')
    router.push('/users')
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title={t.addUser} subtitle="They will receive an invitation email" backHref="/users" />
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="space-y-1.5">
            <Label>{t.nameCol}</Label>
            <Input placeholder="e.g. Anna Lindstrom" value={form.name}
              onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label>{t.emailCol}</Label>
            <Input type="email" placeholder="anna@company.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} error={errors.email} />
          </div>

          <div className="space-y-1.5">
            <Label>{lang === 'en' ? 'Job Title' : 'Jobbtitel'}</Label>
            <Select value={form.jobTitle} onValueChange={(v) => set('jobTitle', v)}>
              <SelectTrigger>
                <SelectValue placeholder={lang === 'en' ? 'Select a job title' : 'Välj en jobbtitel'} />
              </SelectTrigger>
              <SelectContent>
                {jobTitles.map((title) => (
                  <SelectItem key={title.en} value={title.en}>
                    {lang === 'en' ? title.en : title.sv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t.roleCol}</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">{lang === 'en' ? 'Employee' : 'Anställd'}</SelectItem>
                <SelectItem value="ADMIN">{lang === 'en' ? 'Admin' : 'Admin'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>
              {t.cancel}
            </Button>
            <Button type="submit" fullWidth loading={loading}>
              {lang === 'en' ? 'Create and Send Invite' : 'Skapa och skicka inbjudan'}
            </Button>
          </div>
        </form>
      </CardContent></Card>
    </div>
  )
}