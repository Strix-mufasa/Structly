// 'use client'
// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { ChevronRight, Layers, MapPin, Zap } from 'lucide-react'
// import { useLang } from '@/lib/LanguageContext'

// export default function ProjectDetailPage() {
//   const { id } = useParams()
//   const router = useRouter()
//   const { t } = useLang()
//   const [project, setProject] = useState<any>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetch(`/api/admin/projects/${id}`)
//       .then(r => r.json())
//       .then(d => { setProject(d); setLoading(false) })
//   }, [id])

//   if (loading) return (
//     <div className="flex items-center justify-center py-24">
//       <div className="text-center space-y-3">
//         <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
//         <p className="text-sm text-muted-foreground">{t.loadingText}</p>
//       </div>
//     </div>
//   )

//   if (!project) return (
//     <div className="flex items-center justify-center py-24">
//       <p className="text-sm text-muted-foreground">Project not found</p>
//     </div>
//   )

//   return (
//     <div className="animate-fade-in space-y-6">

//       {/* Breadcrumb */}
//       <div className="flex items-center gap-2 text-sm text-muted-foreground">
//         <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push('/admin-projects')}>
//           {t.adminProjects}
//         </span>
//         <ChevronRight className="h-3.5 w-3.5" />
//         <span className="text-foreground font-medium">{project.name}</span>
//         <ChevronRight className="h-3.5 w-3.5" />
//         <span>{t.activitiesPerComponent}</span>
//       </div>

//       {/* Header Card */}
//       <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
//             <Layers className="h-5 w-5 text-primary" />
//           </div>
//           <div>
//             <h1 className="text-lg font-bold">{project.name}</h1>
//             <p className="text-xs text-muted-foreground mt-0.5">
//               {project.activities?.length || 0} {t.totalActivities} &nbsp;·&nbsp;
//               {project.members?.map((m: any) => m.user.name).join(', ') || '—'}
//             </p>
//           </div>
//         </div>
//         <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${project.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
//           {project.status === 'PUBLISHED' ? t.statusPublished : t.statusDraft}
//         </span>
//       </div>

//       {/* Stats Row */}
//       <div className="grid grid-cols-3 gap-4">
//         {[
//           { label: 'Zone', value: Array.from(new Set(project.activities?.map((a: any) => a.zone?.name))).filter(Boolean).length, icon: MapPin, color: 'text-green-500 bg-green-500/10' },
//           { label: 'Component', value: Array.from(new Set(project.activities?.map((a: any) => a.component?.name))).filter(Boolean).length, icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
//           { label: 'Activity', value: project.activities?.length || 0, icon: Zap, color: 'text-blue-500 bg-blue-500/10' },
//         ].map((stat, i) => (
//           <div key={i} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
//             <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color}`}>
//               <stat.icon className="h-4 w-4" />
//             </div>
//             <div>
//               <p className="text-xl font-bold">{stat.value}</p>
//               <p className="text-xs text-muted-foreground">{stat.label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Activities Table */}
//       <div className="rounded-2xl border border-border bg-card overflow-hidden">
//         <div className="grid grid-cols-3 gap-4 px-6 py-3.5 bg-muted/40 border-b border-border">
//           <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             <MapPin className="h-3.5 w-3.5" /> {t.zoneCol}
//           </div>
//           <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             <Layers className="h-3.5 w-3.5" /> {t.componentCol}
//           </div>
//           <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             <Zap className="h-3.5 w-3.5" /> {t.activityCol}
//           </div>
//         </div>

//         {(!project.activities || project.activities.length === 0) && (
//           <div className="py-16 text-center space-y-2">
//             <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
//             <p className="text-sm text-muted-foreground">{t.noActivitiesYet}</p>
//             <p className="text-xs text-muted-foreground/60">{t.noActivitiesDesc}</p>
//           </div>
//         )}

//         {project.activities?.map((a: any, idx: number) => (
//           <div key={a.id} className={`grid grid-cols-3 gap-4 px-6 py-4 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
//             <div className="flex items-center gap-2">
//               <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
//               <span className="text-sm font-medium">{a.zone?.name || '—'}</span>
//             </div>
//             <div>
//               <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 text-xs font-medium">
//                 {a.component?.name || '—'}
//               </span>
//             </div>
//             <div>
//               <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 text-xs font-medium">
//                 {a.name}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//     </div>
//   )
// }



'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Building2, Plus, Trash2, Pencil } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

interface Component { id: string; code: string; name: string; category: string }
interface ActivityRow { zone: string; componentIds: string[]; activityName: string }

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t } = useLang()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [components, setComponents] = useState<Component[]>([])
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([])
  const [showComponentModal, setShowComponentModal] = useState(false)
  const [editingRowIdx, setEditingRowIdx] = useState<number | null>(null)
  const [tempComponentIds, setTempComponentIds] = useState<string[]>([])

useEffect(() => {
    fetch(`/api/admin/projects/${id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        setProject(d)
        const zoneMap = new Map<string, ActivityRow>()
        d.activities?.forEach((a: any) => {
          const zoneName = a.zone?.name || ''
          if (!zoneMap.has(zoneName)) {
            zoneMap.set(zoneName, { zone: zoneName, componentIds: [], activityName: a.name })
          }
          if (a.component?.id) zoneMap.get(zoneName)!.componentIds.push(a.component.id)
        })
        const rows = Array.from(zoneMap.values())
        setActivityRows(rows.length > 0 ? rows : [{ zone: '', componentIds: [], activityName: '' }])
        setLoading(false)
      })
    fetch('/api/admin/components', { cache: 'no-store' }).then(r => r.json()).then(d => setComponents(d))
  }, [id])

  const categoryRows = Array.from({ length: 10 }, (_, row) => {
    const rowComponents = components.filter(c => c.code.startsWith(String(row)))
    const categoryLabel = rowComponents[0]?.category ?? ''
    const cells = Array.from({ length: 10 }, (_, col) => {
      const code = `${row}${col}`
      return rowComponents.find(c => c.code === code) ?? null
    })
    return { categoryLabel, cells }
  })

  function openComponentPicker(idx: number) {
    setEditingRowIdx(idx)
    setTempComponentIds(activityRows[idx].componentIds)
    setShowComponentModal(true)
  }

  function toggleComponent(compId: string) {
    setTempComponentIds(ids => ids.includes(compId) ? ids.filter(i => i !== compId) : [...ids, compId])
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

  async function handleSave(statusVal: string) {
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusVal, activityRows }),
    })
    if (!res.ok) { console.error('Error:', await res.text()); return }
    router.push('/admin-projects')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{t.loadingText}</p>
      </div>
    </div>
  )

  if (!project) return (
    <div className="flex items-center justify-center py-24">
      <p className="text-sm text-muted-foreground">Project not found</p>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push('/admin-projects')}>
          {t.adminProjects}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">{project.name}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{t.activitiesPerComponent}</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 space-y-8">

        {/* Project header pill */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center justify-between border border-gray-200 rounded-full px-5 py-3 bg-white">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Building2 className="h-4 w-4 text-gray-400" />
              Project {project.name}
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
          <div className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0 text-sm font-bold text-black">Zone</div>
          <div className="flex-1 min-w-0 text-sm font-bold text-black">Component</div>
          <div className="flex-1 min-w-0 text-sm font-bold text-black">Activity</div>
          <div className="w-16 shrink-0"></div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-4">
          {activityRows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-4">
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

              <div className="flex-1 min-w-0">
                <select
                  className="w-full appearance-none border border-gray-200 rounded-full px-4 py-2 text-sm bg-gray-50 outline-none focus:border-primary cursor-pointer"
                  value={row.activityName}
                  onChange={e => updateRow(idx, 'activityName', e.target.value)}
                >
                  <option value="">select activity</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Worker">Worker</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div className="w-16 shrink-0 flex items-center justify-center gap-3">
                <button type="button" className="text-blue-400 hover:text-blue-600 transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add more */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addRow}
            className="bg-primary text-white text-sm px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Add more
          </button>
        </div>

        {/* Publish/Draft */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => handleSave('PUBLISHED')}
            className="bg-primary text-white text-sm px-8 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Publish
          </button>
          <button onClick={() => handleSave('DRAFT')}
            className="border border-gray-200 text-gray-700 text-sm px-8 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Draft
          </button>
        </div>
      </div>

      {/* Component Picker */}
      {showComponentModal && (
        <div className="fixed inset-0 bg-background z-[60] flex flex-col">
          <div className="flex items-center justify-between px-8 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span>Projects</span>
              <span className="text-muted-foreground font-normal">/</span>
              <span className="font-normal text-muted-foreground">Construction components</span>
            </div>
            <button onClick={() => setShowComponentModal(false)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm">Close</button>
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
            <button onClick={() => setShowComponentModal(false)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm">{t.cancel}</button>
            <button onClick={confirmComponents} className="bg-primary text-white rounded-lg px-4 py-2 text-sm">{t.confirm || 'Confirm'}</button>
          </div>
        </div>
      )}
    </div>
  )
}