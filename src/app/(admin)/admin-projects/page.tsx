'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/index'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', assignedTo: '', date: '', status: 'PUBLISHED' })

  useEffect(() => {
    fetch('/api/admin/projects').then(r => r.json()).then(d => { setProjects(d); setLoading(false) })
  }, [])

  async function handleAdd() {
    if (!form.name || !form.assignedTo || !form.date) return
    const res = await fetch('/api/admin/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const project = await res.json()
    setProjects([project, ...projects])
    setShowModal(false)
    setForm({ name: '', assignedTo: '', date: '', status: 'PUBLISHED' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-muted-foreground mt-1">{projects.length} total projects</p></div>
        <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-1" /> Add Project</Button>
      </div>

      <Card>
        <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
          <span>Project</span><span>Assigned To</span><span>Date</span><span>Status</span>
        </div>
        {loading ? <div className="py-12 text-center text-muted-foreground text-sm">Loading...</div>
        : projects.length === 0 ? <div className="py-12 text-center text-muted-foreground text-sm">No projects yet.</div>
        : projects.map(p => (
          <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_100px] gap-2 md:gap-4 px-5 py-4 border-b border-border items-center">
            <p className="text-sm font-medium">{p.name}</p>
            <p className="text-sm text-muted-foreground">{p.assignedTo}</p>
            <p className="text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
          </div>
        ))}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h2 className="text-lg font-bold">Add Project</h2>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project Name</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Backend Development" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Assigned To</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} placeholder="e.g. Anuj Sharma" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date</label>
              <input type="date" className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} className="flex-1">Add Project</Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}