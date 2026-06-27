'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Card, CardContent } from '@/components/ui/index'
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase() }) })
    setLoading(false); setSent(true)
  }
  return (
    <Card><CardContent className="pt-6">
      <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ChevronLeft className="h-4 w-4" /> Back to login</Link>
      {sent ? (
        <div className="text-center py-6">
          <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4"><span className="text-xl">📬</span></div>
          <h2 className="font-semibold mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground">If <strong>{email}</strong> is registered, you will receive a reset link shortly.</p>
        </div>
      ) : (
        <>
          <div className="mb-6"><h2 className="text-xl font-bold">Forgot your password?</h2><p className="text-sm text-muted-foreground mt-1">Enter your email and we will send you a reset link</p></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label>Email address</Label><Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></div>
            <Button type="submit" fullWidth loading={loading} disabled={!email.trim()}>Send reset link</Button>
          </form>
        </>
      )}
    </CardContent></Card>
  )
}

