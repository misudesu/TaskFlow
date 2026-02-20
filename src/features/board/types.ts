import type { Priority } from '@/types/global'

interface Board {
  id: string
  userId: string
  title: string
  columns: Column[]
  createdAt: Date
  updatedAt: Date
}

interface Column {
  id: string
  boardId: string
  title: string
  position: number
  tasks: Task[]
}

interface Task {
  id: string
  columnId: string
  title: string
  description: string | null
  priority: Priority
  dueDate: Date | null
  position: number
  createdAt: Date
  updatedAt: Date
}

interface NewTask {
  columnId: string
  title: string
  description?: string
  priority: Priority
  dueDate?: Date
}

export type { Board, Column, Task, NewTask }
