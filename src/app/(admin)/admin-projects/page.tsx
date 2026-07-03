'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/index'
import { Plus, Trash2, Pencil, ChevronRight } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'
import { useRouter } from 'next/navigation'

interface Component { id: string; code: string; name: string; category: string }
interface ActivityRow { zone: string; componentIds: string[]; activityName: string }

export default function ProjectsPage() {
  const { t } = useLang()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [step1, setStep1] = useState({ name: '', assignedUserIds: [] as string[], date: '' })
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([{ zone: '', componentIds: [], activityName: '' }])
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null)
  const [tempComponentIds, setTempComponentIds] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/admin/projects').then(r => r.json()).then(d => { setProjects(d); setLoading(false) })
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d))
    fetch('/api/admin/components').then(r => r.json()).then(d => setComponents(d))
  }, [])

  const categoryRows = Array.from({ length: 10 }, (_, row) => {
    const rowComponents = components.filter(c => c.code.startsWith(String(row)))
    const categoryLabel = rowComponents[0]?.category ?? ''
    const cells = Array.from({ length: 10 }, (_, col) => {
      const code = `${row}${col}`
      return rowComponents.find(c => c.code === code) ?? null
    })
    return { categoryLabel, cells }
  })

  function toggleUser(userId: string) {
    setStep1(f => ({
      ...f,
      assignedUserIds: f.assignedUserIds.includes(userId)
        ? f.assignedUserIds.filter(id => id !== userId)
        : [...f.assignedUserIds, userId]
    }))
  }

  function openComponentPicker(idx: number) {
    setEditingRowIdx(idx)
    setTempComponentIds(activityRows[idx].componentIds)
    setShowComponentModal(true)
  }

  function toggleComponent(id: string) {
    setTempComponentIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id])
  }

  function confirmComponents() {
    if (editingRowIdx === null) return
    setActivityRows(rows => rows.map((r, i) => i === editingRowIdx ? { ...r, componentIds: tempComponentIds } : r))
    setShowComponentModal(false)
  }

  function addRow() {
    setActivityRows(rows => [...rows, { zone: '', componentIds: [], activityName: '' }])
  }

  function removeRow(idx: number) {
    setActivityRows(rows => rows.filter((_, i) => i !== idx))
  }

  function updateRow(idx: number, field: keyof ActivityRow, value: string) {
    setActivityRows(rows => rows.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  function openModal() {
    setStep(1)
    setStep1({ name: '', assignedUserIds: [], date: '' })
    setActivityRows([{ zone: '', componentIds: [], activityName: '' }])
    setShowModal(true)
  }
  async function handlePublish(statusVal: string) {
      if (!step1.name || step1.assignedUserIds.length === 0 || !step1.date) return
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: step1.name,
          assignedUserIds: step1.assignedUserIds,
          memberRoles: {},
          date: step1.date,
          status: statusVal,
          activityRows: activityRows,
        })
      })
    if (!res.ok) { console.error('Error:', await res.text()); return }
    const project = await res.json()
    setProjects([project, ...projects])
    setShowModal(false)
  }

  const activeUsers = users.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE')
  const selectedUserNames = step1.assignedUserIds.map(id => activeUsers.find(u => u.id === id)?.name).filter(Boolean).join(', ')

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.adminProjectsTitle}</h1>
          <p className="text-muted-foreground mt-1">{projects.length} {t.totalProjects}</p>
        </div>
        <Button onClick={openModal}>
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
                <p className="text-sm text-muted-foreground">{p.members?.map((m: any) => m.user.name).join(', ') || '—'}</p>
                <p className="text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {p.status === 'PUBLISHED' ? t.statusPublished : t.statusDraft}
                </span>
              </div>
            ))
        }
      </Card>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-center">Add Project details</h2>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Project Name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  value={step1.name} onChange={e => setStep1({...step1, name: e.target.value})}
                  placeholder="e.g. Backend Development" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Assigned to</label>
                <div className="border border-gray-200 rounded-lg text-sm">
                  <details>
                    <summary className="list-none flex items-center justify-between px-3 py-2 cursor-pointer">
                      <span className={selectedUserNames ? 'text-gray-900 truncate' : 'text-gray-400'}>
                        {selectedUserNames || 'Select members...'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 rotate-90 shrink-0" />
                    </summary>
                    <div className="border-t border-gray-100 px-3 py-2 space-y-1.5 max-h-36 overflow-y-auto">
                      {activeUsers.map(u => (
                        <label key={u.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                          <input type="checkbox" checked={step1.assignedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                          <span>{u.name}</span>
                          <span className="text-gray-400 text-xs">({u.email})</span>
                        </label>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  value={step1.date} onChange={e => setStep1({...step1, date: e.target.value})} />
              </div>
              <button className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={() => { if (step1.name && step1.assignedUserIds.length > 0 && step1.date) setStep(2) }}>
                Next →
              </button>
            </div>
          )}

          {/* STEP 2 — Figma exact match, no horizontal scroll */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-8 overflow-y-auto overflow-x-hidden flex-1 space-y-7">

                {/* Project header */}
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className="text-gray-400 text-xs">≡≡</span>
                    Project {step1.name}
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                {/* Rows container */}
                <div className="flex flex-col gap-7">
                  {/* Column headers */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 text-sm font-medium text-black">Zone</div>
                    <div className="flex-1 min-w-0 text-sm font-medium text-black">Component</div>
                    <div className="flex-1 min-w-0 text-sm font-medium text-black">Activity</div>
                    <div className="w-12 shrink-0"></div>
                  </div>

                  {/* Activity rows */}
                  {activityRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        placeholder="add zone"
                        value={row.zone}
                        onChange={e => updateRow(idx, 'zone', e.target.value)}
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <input
                          readOnly
                          className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-pointer truncate outline-none"
                          placeholder="select component"
                          value={row.componentIds.length > 0 ? components.filter(c => row.componentIds.includes(c.id)).map(c => c.name).join(', ') : ''}
                          onClick={() => openComponentPicker(idx)}
                        />
                        <button type="button" onClick={() => openComponentPicker(idx)}
                          className="shrink-0 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-primary/90">
                          Add +
                        </button>
                      </div>
                      <input
                        className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                        placeholder="select activity"
                        value={row.activityName}
                        onChange={e => updateRow(idx, 'activityName', e.target.value)}
                      />
                      <div className="w-12 shrink-0 flex items-center gap-1.5 justify-end">
                        <button className="text-blue-400 hover:text-blue-600 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more */}
                <div className="flex justify-center">
                  <button onClick={addRow}
                    className="bg-white text-black text-sm px-6 py-2 rounded-lg font-medium border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                    Add more
                  </button>
                </div>
              </div>

              {/* Publish / Draft */}
              <div className="px-8 py-5 flex items-center justify-center gap-3 border-t border-gray-100">
                <button onClick={() => handlePublish('PUBLISHED')}
                  className="bg-primary text-white text-sm px-8 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Publish
                </button>
                <button onClick={() => handlePublish('DRAFT')}
                  className="border border-gray-200 text-gray-700 text-sm px-8 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  Draft
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Component Picker */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-background z-[60] flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>Projects</span>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="font-normal text-muted-foreground">Construction components</span>
            </div>
            <Button onClick={() => setShowComponentModal(false)}>Close</Button>
          </div>
          <div className="flex-1 overflow-auto px-8 py-6">
            <table className="w-full border-collapse text-xs table-fixed">
              <tbody>
                {categoryRows.map((row, rowIdx) => (
                  row.categoryLabel ? (
                    <tr key={rowIdx} className="border border-border">
                      <td className="p-3 font-bold text-xs uppercase w-44 border-r border-border align-middle">{row.categoryLabel}</td>
                      {row.cells.map((cell, colIdx) => (
                        <td key={colIdx} className={`p-2 border-r border-border align-top ${cell && tempComponentIds.includes(cell.id) ? 'bg-primary/5' : ''}`}>
                          {cell ? (
                            <label className="flex items-start gap-1.5 cursor-pointer">
                              <div className="mt-0.5 shrink-0">
                                <input type="checkbox" className="sr-only" checked={tempComponentIds.includes(cell.id)} onChange={() => toggleComponent(cell.id)} />
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
            <Button variant="outline" onClick={() => setShowComponentModal(false)}>{t.cancel}</Button>
            <Button onClick={confirmComponents}>{t.confirm || 'Confirm'}</Button>
          </div>
        </div>
      )}
    </div>
  )
}