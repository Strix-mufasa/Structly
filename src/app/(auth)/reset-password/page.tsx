'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent } from '@/components/ui/index'
export default function ResetPasswordPage() {
  const router = useRouter()
  const token = useSearchParams().get('token')
  const [state, setState] = useState<'loading'|'invalid'|'ready'|'success'>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  useEffect(() => { if (!token) { setState('invalid'); return }; fetch(`/api/auth/verify-token?token=${token}&type=reset`).then(r=>r.json()).then(d=>setState(d.valid?'ready':'invalid')).catch(()=>setState('invalid')) }, [token])
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string,string> = {}
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
    if (res.ok) { setState('success'); setTimeout(() => router.push('/auth/login'), 1500) } else { setErrors({ form: 'Link expired. Request a new one.' }); setLoading(false) }
  }
  if (state === 'loading') return <Card><CardContent className="pt-6 py-12 text-center"><div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin mx-auto mb-4" /></CardContent></Card>
  if (state === 'invalid') return <Card><CardContent className="pt-6 py-12 text-center"><AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" /><h2 className="font-semibold mb-2">Link expired</h2><Button variant="outline" onClick={() => router.push('/auth/forgot-password')}>Request new link</Button></CardContent></Card>
  if (state === 'success') return <Card><CardContent className="pt-6 py-12 text-center"><div className="text-3xl mb-4">checkmark</div><h2 className="font-semibold mb-2">Password updated</h2><p className="text-sm text-muted-foreground">Redirecting...</p></CardContent></Card>
  return (
    <Card><CardContent className="pt-6">
      <div className="mb-6"><h2 className="text-xl font-bold">Reset your password</h2></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5"><Label>New Password</Label>
          <div className="relative"><Input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} className="pr-12" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-muted-foreground">{showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
        </div>
        <div className="space-y-1.5"><Label>Confirm Password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} /></div>
        {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
        <Button type="submit" fullWidth loading={loading}>Reset password</Button>
      </form>
    </CardContent></Card>
  )
}

