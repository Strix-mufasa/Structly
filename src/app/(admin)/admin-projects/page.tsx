'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/index'
import { Plus } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

interface Component {
  id: string
  code: string
  name: string
  category: string
}

export default function ProjectsPage() {
  const { t } = useLang()
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    assignedUserIds: [] as string[],
    date: '',
    status: 'PUBLISHED',
    zone: '',
    taskName: '',
    componentIds: [] as string[],
  })
  // temp selection state while the component-picker modal is open
  const [tempComponentIds, setTempComponentIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/projects').then(r => r.json()).then(d => { setProjects(d); setLoading(false) })
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d))
    fetch('/api/admin/components').then(r => r.json()).then(d => setComponents(d))
  }, [])

  function toggleUser(userId: string) {
    setForm(f => ({
      ...f,
      assignedUserIds: f.assignedUserIds.includes(userId)
        ? f.assignedUserIds.filter(id => id !== userId)
        : [...f.assignedUserIds, userId]
    }))
  }

  function openComponentPicker() {
    setTempComponentIds(form.componentIds) // start picker with whatever's already selected
    setShowComponentModal(true)
  }

  function toggleComponent(id: string) {
    setTempComponentIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    )
  }

  function confirmComponents() {
    setForm(f => ({ ...f, componentIds: tempComponentIds }))
    setShowComponentModal(false)
  }

  async function handleAdd() {
    if (!form.name || form.assignedUserIds.length === 0 || !form.date) return
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const project = await res.json()
    setProjects([project, ...projects])
    setShowModal(false)
    setForm({ name: '', assignedUserIds: [], date: '', status: 'PUBLISHED', zone: '', taskName: '', componentIds: [] })
  }

  const selectedComponentLabel = form.componentIds.length === 0
    ? ''
    : components
        .filter(c => form.componentIds.includes(c.id))
        .map(c => c.name)
        .join(', ')

  // Build a 10x10 grid: row = first digit of code, col = second digit
  const categoryRows = Array.from({ length: 10 }, (_, row) => {
    const rowComponents = components.filter(c => c.code.startsWith(String(row)))
    const categoryLabel = rowComponents[0]?.category ?? ''
    const cells = Array.from({ length: 10 }, (_, col) => {
      const code = `${row}${col}`
      return rowComponents.find(c => c.code === code) ?? null
    })
    return { categoryLabel, cells }
  })

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.adminProjectsTitle}</h1>
          <p className="text-muted-foreground mt-1">{projects.length} {t.totalProjects}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> {t.addProject}
        </Button>
      </div>

      <Card>
        <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
          <span>{t.projectCol}</span>
          <span>{t.membersCol}</span>
          <span>{t.dateCol}</span>
          <span>{t.statusCol}</span>
        </div>
        {loading
          ? <div className="py-12 text-center text-muted-foreground text-sm">{t.loadingText}</div>
          : projects.length === 0
            ? <div className="py-12 text-center text-muted-foreground text-sm">{t.noProjects}</div>
            : projects.map(p => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_100px] gap-2 md:gap-4 px-5 py-4 border-b border-border items-center">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.members?.map((m: any) => m.user.name).join(', ') || '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {p.status === 'PUBLISHED' ? t.statusPublished : t.statusDraft}
                </span>
              </div>
            ))
        }
      </Card>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{t.addProject}</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.projectNameLabel}</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder={t.projectNamePlaceholder} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.membersCol}</label>
              <div className="border border-border rounded-xl px-3 py-2 space-y-2 max-h-40 overflow-y-auto">
                {users.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE').map(u => (
                  <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.assignedUserIds.includes(u.id)}
                      onChange={() => toggleUser(u.id)}
                    />
                    {u.name} <span className="text-muted-foreground text-xs">({u.email})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.dateCol}</label>
              <input type="date" className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.statusCol}</label>
              <select className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="PUBLISHED">{t.statusPublished}</option>
                <option value="DRAFT">{t.statusDraft}</option>
              </select>
            </div>

            {/* NEW: Zone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.zoneLabel || 'Zone'}</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}
                placeholder={t.zonePlaceholder || 'e.g. Z5 plan 3 Lgh 3001-3004'} />
            </div>

            {/* NEW: Task Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.taskNameLabel || 'Task Name'}</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.taskName} onChange={e => setForm({...form, taskName: e.target.value})}
                placeholder={t.taskNamePlaceholder || 'e.g. Site Cleanup'} />
            </div>

            {/* NEW: Component picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.componentLabel || 'Component'}</label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background truncate"
                  value={selectedComponentLabel}
                  placeholder={t.componentPlaceholder || 'Basic Constructions, Composite, .....'}
                />
                <Button type="button" onClick={openComponentPicker} className="rounded-full px-4 text-xs">
                  {t.addButton || 'Add +'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleAdd} className="flex-1">{t.addProject}</Button>
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">{t.cancel}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Component Picker Modal (Image 4) */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-card rounded-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {t.projectsCol || 'Projects'} / {t.constructionComponents || 'Construction components'}
              </h2>
            </div>

            <table className="w-full border-collapse text-xs">
              <tbody>
                {categoryRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-border">
                    <td className="align-top p-2 font-semibold w-40 whitespace-normal">
                      {row.categoryLabel}
                    </td>
                    {row.cells.map((cell, colIdx) => (
                      <td key={colIdx} className="align-top p-2 border-l border-border min-w-[90px]">
                        {cell ? (
                          <label className="flex items-start gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              className="mt-0.5"
                              checked={tempComponentIds.includes(cell.id)}
                              onChange={() => toggleComponent(cell.id)}
                            />
                            <span>
                              <span className="font-semibold">{cell.code}</span>
                              <br />
                              <span className="text-muted-foreground">{cell.name}</span>
                            </span>
                          </label>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowComponentModal(false)}>
                {t.cancel}
              </Button>
              <Button onClick={confirmComponents}>
                {t.confirm || 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}