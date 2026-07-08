'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Card, CardContent } from '@/components/ui/index'
import { PageHeader } from '@/components/shared'
import { useToast } from '@/components/ui/toaster'
import { Role, UserStatus } from '@/types'
import { useLang } from '@/lib/LanguageContext'

interface Props {
  user: { id: string; name: string; email: string; role: Role; status: UserStatus; jobTitle: string | null }
}

const jobTitleOptions = [
  { value: 'Site Manager', label: 'Site Manager' },
  { value: 'Foreman / Work Supervisor', label: 'Foreman / Work Supervisor' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Design Manager / Engineering Lead', label: 'Design Manager / Engineering Lead' },
  { value: 'Purchaser / Procurement Officer', label: 'Purchaser / Procurement Officer' },
  { value: 'Finance Manager / CFO', label: 'Finance Manager / CFO' },
  { value: 'Construction Safety Officer (YA)', label: 'Construction Safety Officer (YA)' },
  { value: 'Subcontractor Safety Officer (YA)', label: 'Subcontractor Safety Officer (YA)' },
]

export default function EditUserForm({ user }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLang()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [jobTitle, setJobTitle] = useState(user.jobTitle || '')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) { setError('Name must be at least 2 characters'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), role, jobTitle }),
    })
    setLoading(false)
    if (res.ok) {
      toast('User updated successfully.', 'success')
      router.push('/users')
    } else {
      setError('Failed to update user.')
    }
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <PageHeader title="Edit User" backHref="/users" />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => { setName(e.target.value); setError('') }} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input value={user.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-1.5">
              <Label>{t.roleLabel || 'Role'}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t.jobTitleLabel || 'Job Title'}</Label>
              <Select value={jobTitle} onValueChange={setJobTitle}>
                <SelectTrigger><SelectValue placeholder={t.jobTitlePlaceholder || 'Select a job title'} /></SelectTrigger>
                <SelectContent>
                  {jobTitleOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" fullWidth loading={loading}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}