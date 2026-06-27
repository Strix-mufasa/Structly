import { Role, UserStatus, TaskStatus } from '@prisma/client'

export type { Role, UserStatus, TaskStatus }

export interface UserSafe {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  createdAt: Date
}

export interface TaskSafe {
  id: string
  name: string
  status: TaskStatus
  createdAt: Date
}

export interface TimeEntryWithRelations {
  id: string
  date: Date
  hours: number
  comment: string | null
  createdAt: Date
  user: { id: string; name: string; email: string }
  task: { id: string; name: string }
}

export interface WeekDay {
  date: Date
  dayLabel: string
  dayNumber: number
  isToday: boolean
  isFuture: boolean
  totalHours: number
  entries: TimeEntryWithRelations[]
}

export interface DashboardStats {
  totalActiveUsers: number
  totalActiveTasks: number
  entriesThisWeek: number
  hoursThisWeek: number
}

export interface EmployeeDashboardData {
  todayHours: number
  weekHours: number
  daysLoggedThisWeek: number
  todayEntries: TimeEntryWithRelations[]
  weekData: WeekDay[]
}

// NextAuth session extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      status: string
    }
  }
}
