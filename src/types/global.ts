interface ApiResponse<T> {
  data: T
}

interface ApiError {
  error: string
}

type Priority = 'urgent' | 'high' | 'medium' | 'low'

type TaskStatus = 'todo' | 'in_progress' | 'done'

export type { ApiResponse, ApiError, Priority, TaskStatus }
