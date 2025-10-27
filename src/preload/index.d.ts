import { ElectronAPI } from '@electron-toolkit/preload'

// Database types
export interface Column {
  id: number
  name: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface Label {
  id: number
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  title: string
  columnId: number
  labelId: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface TaskLabel {
  id: number
  taskId: number
  labelId: number
  createdAt: string
}

// API interface
export interface API {
  columns: {
    getAll: () => Promise<Column[]>
  }
  tasks: {
    getAll: () => Promise<Task[]>
    getByColumn: (columnId: number) => Promise<Task[]>
    create: (data: { title: string; columnId: number }) => Promise<Task>
    update: (
      id: number,
      data: Partial<{ title: string; columnId: number; order: number }>
    ) => Promise<Task>
    delete: (id: number) => Promise<{ success: boolean }>
    addLabel: (taskId: number, labelId: number) => Promise<TaskLabel>
    removeLabel: (taskId: number, labelId: number) => Promise<{ success: boolean }>
  }
  labels: {
    getAll: () => Promise<Label[]>
    create: (data: { name: string; color: string }) => Promise<Label>
    update: (id: number, data: Partial<{ name: string; color: string }>) => Promise<Label>
    delete: (id: number) => Promise<{ success: boolean }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
