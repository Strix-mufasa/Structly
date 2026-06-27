'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label, Switch, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/index'
import { useToast } from '@/components/ui/toaster'
import { Pencil, ToggleLeft, ToggleRight, Plus } from 'lucide-react'
import { Task } from '@prisma/client'

// ── Create Task Modal ────────────────────────────────────────────────────────
export default function CreateTaskModal() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [active, setActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  async function handleCreate() {
    if (!name.trim() || name.trim().length < 2) { setError('Task name must be at least 2 characters'); return }
    setLoading(true)
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), status: active ? 'ACTIVE' : 'INACTIVE' }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setError(data.error === 'NAME_EXISTS' ? 'A task with this name already exists' : 'Failed to create task')
      return
    }
    toast(`Task "${name.trim()}" created.`, 'success')
    setOpen(false)
    setName('')
    setActive(true)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Add Task</Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); setError('') }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Task Name</Label>
              <Input placeholder="e.g. Electrical Installation" value={name}
                onChange={(e) => { setName(e.target.value); setError('') }} autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()} />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Visible to employees immediately</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setOpen(false)}>Cancel</Button>
              <Button fullWidth loading={loading} onClick={handleCreate}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Task Row Actions (edit name + toggle status) ─────────────────────────────
export function TaskRowActions({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false)
  const [name, setName] = useState(task.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  async function toggleStatus() {
    const newStatus = task.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    toast(`Task ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`, 'success')
    router.refresh()
  }

  async function handleEdit() {
    if (!name.trim() || name.trim().length < 2) { setError('Name must be at least 2 characters'); return }
    setLoading(true)
    const res = await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    setLoading(false)
    if (res.ok) {
      toast('Task updated.', 'success')
      setEditOpen(false)
      router.refresh()
    } else {
      setError('Failed to update task.')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setEditOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent transition-colors">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button onClick={toggleStatus}
        className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-accent transition-colors"
        title={task.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
        {task.status === 'ACTIVE'
          ? <ToggleRight className="h-4 w-4 text-emerald-600" />
          : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
      </button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Task Name</Label>
              <Input value={name} onChange={(e) => { setName(e.target.value); setError('') }} autoFocus />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button fullWidth loading={loading} onClick={handleEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

