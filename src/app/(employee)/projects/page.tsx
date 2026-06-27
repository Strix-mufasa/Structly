'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/index'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(d => { setProjects(d); setLoading(false) })
  }, [])

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground text-sm mt-0.5">All your submitted time entries</p>
      </div>

      {loading ? <div className="text-center text-muted-foreground text-sm py-12">Loading...</div>
      : projects.length === 0 ? <div className="text-center text-muted-foreground text-sm py-12">No projects yet.</div>
      : (
        <div className="space-y-3">
          {projects.map(p => (
            <Card key={p.id}>
              <CardContent className="py-4 px-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.assignedTo} · {new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <Button size="sm" onClick={() => router.push(`/log?project=${p.id}`)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Entry
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}