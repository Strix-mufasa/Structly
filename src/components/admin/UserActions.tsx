'use client'

import { useState } from 'react'
import { UserStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toaster'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import { Ban, CheckCircle } from 'lucide-react'

interface Props {
  userId: string
  currentStatus: UserStatus
  userName: string
}

export default function UserActions({ userId, currentStatus, userName }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const isDisabled = currentStatus === 'DISABLED'
  const action = isDisabled ? 'Enable' : 'Disable'

  async function handleToggle() {
    setLoading(true)
    const newStatus = isDisabled ? 'ACTIVE' : 'DISABLED'
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(false)
    setOpen(false)
    if (res.ok) {
      toast(`${userName} has been ${isDisabled ? 'enabled' : 'disabled'}.`, 'success')
      router.refresh()
    } else {
      toast('Failed to update user.', 'error')
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors
          ${isDisabled ? 'hover:bg-green-50 hover:border-green-300' : 'hover:bg-red-50 hover:border-red-300'}`}>
        {isDisabled
          ? <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          : <Ban className="h-3.5 w-3.5 text-destructive" />}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action} {userName}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isDisabled
              ? `${userName} will be able to log in again.`
              : `${userName} will no longer be able to log in. Their time entries will be preserved.`}
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant={isDisabled ? 'default' : 'destructive'} loading={loading} onClick={handleToggle}>
              {action}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

