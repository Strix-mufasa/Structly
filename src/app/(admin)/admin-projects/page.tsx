'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/index'
import { Plus } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'
import { useRouter } from 'next/navigation'

interface Component {
  id: string
  code: string
  name: string
  category: string
}

const jobTitleOptions = [
  { value: 'siteManager', label: 'Site Manager' },
  { value: 'foreman', label: 'Foreman / Work Supervisor' },
  { value: 'projectManager', label: 'Project Manager' },
  { value: 'designManager', label: 'Design Manager / Engineering Lead' },
  { value: 'purchaser', label: 'Purchaser / Procurement Officer' },
  { value: 'financeManager', label: 'Finance Manager / CFO' },
  { value: 'byggYA', label: 'Construction Safety Officer (YA)' },
  { value: 'ueYA', label: 'Subcontractor Safety Officer (YA)' },
]

export default function ProjectsPage() {
  const { t } = useLang()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    assignedUserIds: [] as string[],
    memberRoles: {} as Record<string, string>,
    date: '',
    status: 'PUBLISHED',
    zone: '',
    taskName: '',
    componentIds: [] as string[],
  })
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

  function setMemberRole(userId: string, role: string) {
    setForm(f => ({ ...f, memberRoles: { ...f.memberRoles, [userId]: role } }))
  }

  function openComponentPicker() {
    setTempComponentIds(form.componentIds)
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
    setForm({ name: '', assignedUserIds: [], memberRoles: {}, date: '', status: 'PUBLISHED', zone: '', taskName: '', componentIds: [] })
  }

  const selectedComponentLabel = form.componentIds.length === 0
    ? ''
    : components.filter(c => form.componentIds.includes(c.id)).map(c => c.name).join(', ')

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
              <div key={p.id} onClick={() => router.push(`/admin-projects/${p.id}`)} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_120px_100px] gap-2 md:gap-4 px-5 py-4 border-b border-border items-center cursor-pointer hover:bg-muted/50 transition-colors">
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

            {/* Members + Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.membersCol}</label>
              <div className="border border-border rounded-xl px-3 py-2 space-y-3 max-h-52 overflow-y-auto">
                {users.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE').map(u => (
                  <div key={u.id} className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.assignedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                      {u.name} <span className="text-muted-foreground text-xs">({u.email})</span>
                    </label>
                    {form.assignedUserIds.includes(u.id) && (
                      <select
                        className="w-full border border-border rounded-lg px-2 py-1 text-xs bg-background ml-5"
                        value={form.memberRoles[u.id] || ''}
                        onChange={e => setMemberRole(u.id, e.target.value)}
                      >
                        <option value="">Select role...</option>
                        {jobTitleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
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
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.zoneLabel || 'Zone'}</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.zone} onChange={e => setForm({...form, zone: e.target.value})}
                placeholder={t.zonePlaceholder || 'e.g. Z5 plan 3 Lgh 3001-3004'} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.taskNameLabel || 'Task Name'}</label>
              <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                value={form.taskName} onChange={e => setForm({...form, taskName: e.target.value})}
                placeholder={t.taskNamePlaceholder || 'e.g. Site Cleanup'} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.componentLabel || 'Component'}</label>
              <div className="flex items-center gap-2">
                <input readOnly
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background truncate"
                  value={selectedComponentLabel}
                  placeholder={t.componentPlaceholder || 'Basic Constructions, Composite, .....'} />
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

      {/* Component Picker — Full Page */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-background z-[60] flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>{t.projectsCol || 'Projects'}</span>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="font-normal text-muted-foreground">{t.constructionComponents || 'Construction components'}</span>
            </div>
            <Button onClick={() => router.push('/admin-projects')}>
              + {t.addProjects || 'Add Projects'}
            </Button>
          </div>
          <div className="flex-1 overflow-auto px-8 py-6">
            <table className="w-full border-collapse text-xs table-fixed">
              <tbody>
                {categoryRows.map((row, rowIdx) => (
                  row.categoryLabel ? (
                    <tr key={rowIdx} className="border border-border">
                      <td className="p-3 font-bold text-xs uppercase w-44 border-r border-border align-middle">
                        {row.categoryLabel}
                      </td>
                      {row.cells.map((cell, colIdx) => (
                        <td key={colIdx} className={`p-2 border-r border-border align-top ${cell && tempComponentIds.includes(cell.id) ? 'bg-primary/5' : ''}`}>
                          {cell ? (
                            <label className="flex items-start gap-1.5 cursor-pointer">
                              <div className="mt-0.5 shrink-0">
                                <input type="checkbox" className="sr-only"
                                  checked={tempComponentIds.includes(cell.id)}
                                  onChange={() => toggleComponent(cell.id)} />
                                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${tempComponentIds.includes(cell.id) ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                                  {tempComponentIds.includes(cell.id) && (
                                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span>
                                <span className="font-semibold">{cell.code}</span>
                                <span className="text-muted-foreground ml-1 text-[10px]">%</span>
                                <br />
                                <span className="text-muted-foreground text-[11px] leading-tight">{cell.name}</span>
                              </span>
                            </label>
                          ) : (
                            <span className="text-muted-foreground/20 text-xs">{rowIdx}{colIdx}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3 px-8 py-4 border-t border-border shrink-0">
            <Button variant="outline" onClick={() => setShowComponentModal(false)}>
              {t.cancel}
            </Button>
            <Button onClick={confirmComponents}>
              {t.confirm || 'Confirm'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}