'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent } from '@/components/ui/index'
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    const result = await signIn('credentials', { email: email.trim().toLowerCase(), password, redirect: false })
    if (result?.error) { setError(result.error === 'DISABLED' ? 'This account has been deactivated. Contact your administrator.' : 'Incorrect email or password.'); setLoading(false); return }
    const me = await (await fetch('/api/auth/me')).json()
    router.push(me.role === 'ADMIN' ? '/admin' : 'dashboard')
  }
  return (
    <Card><CardContent className="pt-6">
      <div className="mb-6"><h2 className="text-xl font-bold">Welcome back</h2><p className="text-sm text-muted-foreground mt-1">Log in to continue</p></div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><Label>Password</Label><Link href="/forgot-password" className="text-xs text-brand hover:underline">Forgot password?</Link></div>
          <div className="relative">
            <Input type={showPass ? 'text' : 'password'} placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-12" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-muted-foreground">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        <Button type="submit" fullWidth loading={loading} disabled={!email.trim() || !password}>Log in</Button>
      </form>
    </CardContent></Card>
  )
}

