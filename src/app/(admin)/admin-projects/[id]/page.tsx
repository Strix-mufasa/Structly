'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronRight, Plus, Layers, MapPin, Zap } from 'lucide-react'
import { useLang } from '@/lib/LanguageContext'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t } = useLang()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d); setLoading(false) })
  }, [id])

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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => router.push('/admin-projects')}>
          {t.adminProjects}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{project.name}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span>{t.activitiesPerComponent}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">{project.name}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {project.activities?.length || 0} {t.totalActivities} &nbsp;·&nbsp;
              {project.members?.map((m: any) => m.user.name).join(', ') || '—'}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push('/admin-projects')}>
          <Plus className="h-4 w-4 mr-1" /> {t.addProjects}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t.totalActivities, value: project.activities?.length || 0, icon: Zap, color: 'text-blue-500 bg-blue-500/10' },
        //   { label: t.uniqueZones, value: [...new Set(project.activities?.map((a: any) => a.zone?.name))].filter(Boolean).length, icon: MapPin, color: 'text-green-500 bg-green-500/10' },
        //   { label: t.components, value: [...new Set(project.activities?.map((a: any) => a.component?.name))].filter(Boolean).length, icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
            { label: t.uniqueZones, value: Array.from(new Set(project.activities?.map((a: any) => a.zone?.name))).filter(Boolean).length, icon: MapPin, color: 'text-green-500 bg-green-500/10' },
            { label: t.components, value: Array.from(new Set(project.activities?.map((a: any) => a.component?.name))).filter(Boolean).length, icon: Layers, color: 'text-purple-500 bg-purple-500/10' },
                
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activities Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-3 gap-4 px-6 py-3.5 bg-muted/40 border-b border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5" /> {t.zoneCol}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5" /> {t.componentCol}
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5" /> {t.activityCol}
          </div>
        </div>

        {(!project.activities || project.activities.length === 0) && (
          <div className="py-16 text-center space-y-2">
            <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">{t.noActivitiesYet}</p>
            <p className="text-xs text-muted-foreground/60">{t.noActivitiesDesc}</p>
          </div>
        )}

        {project.activities?.map((a: any, idx: number) => (
          <div
            key={a.id}
            className={`grid grid-cols-3 gap-4 px-6 py-4 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <span className="text-sm font-medium">{a.zone?.name || '—'}</span>
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 text-xs font-medium">
                {a.component?.name || '—'}
              </span>
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-500/10 text-green-600 text-xs font-medium">
                {a.name}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}