'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Card, CardContent } from '@/components/ui/index'
import { PageHeader } from '@/components/shared'
import { useToast } from '@/components/ui/toaster'
export default function CreateUserPage() {
  const router = useRouter(); const { toast } = useToast()
  const [loading, setLoading] = useState(false); const [errors, setErrors] = useState<Record<string,string>>({}); const [form, setForm] = useState({ name: '', email: '', role: 'EMPLOYEE' })
  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); setErrors(e => ({ ...e, [field]: '' })) }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string,string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const res = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json(); setLoading(false)
    if (!res.ok) { if (data.error === 'EMAIL_EXISTS') setErrors({ email: 'An account with this email already exists' }); else setErrors({ form: 'Failed to create user.' }); return }
    toast(`${form.name} invited successfully!`, 'success'); router.push('/admin/users')
  }
  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title="Add User" subtitle="They will receive an invitation email" backhref="/users" />
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5"><Label>Full Name</Label><Input placeholder="e.g. Anna Lindstrom" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} autoFocus /></div>
          <div className="space-y-1.5"><Label>Email Address</Label><Input type="email" placeholder="anna@company.com" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} /></div>
          <div className="space-y-1.5"><Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="EMPLOYEE">Employee</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent>
            </Select>
          </div>
          {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
          <div className="flex gap-3 pt-2"><Button type="button" variant="outline" fullWidth onClick={() => router.back()}>Cancel</Button><Button type="submit" fullWidth loading={loading}>Create and Send Invite</Button></div>
        </form>
      </CardContent></Card>
    </div>
  )
}

