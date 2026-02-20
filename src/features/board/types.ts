import type { Priority } from '@/types/global'

interface Board {
  id: string
  userId: string
  title: string
  columns: Column[]
  createdAt: string
  updatedAt: string
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
  dueDate: string | null
  position: number
  createdAt: string
  updatedAt: string
}

interface NewTask {
  columnId: string
  title: string
  description?: string
  priority: Priority
  dueDate?: string
}

interface NewColumn {
  title: string
  boardId: string
}

export type { Board, Column, Task, NewTask, NewColumn }
