import { type FC } from 'react'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import TaskCard from '@components/task-card/task-card'
import type { Column as ColumnType, Task as TaskType } from '@types'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ColumnProps {
  column: ColumnType
  index: number
  tasks: TaskType[]
}

export const Column: FC<ColumnProps> = ({ column, index, tasks }) => {
  const [isCreatingTask, setIsCreatingTask] = useState<number | null>(null)
  const columnTasks = tasks.filter((task) => task.columnId === column.id)

  const queryClient = useQueryClient()

  const createTask = useMutation({
    mutationFn: async ({ title, columnId }: { title: string; columnId: number }) => {
      return window.api.tasks.create({ title, columnId })
    },
    onSuccess: (newTask) => {
      queryClient.setQueryData<TaskType[]>(['tasks'], (old) => {
        if (!old) return [newTask]
        return [...old, newTask]
      })
      setIsCreatingTask(null)
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
    }
  })

  const updateTask = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      return window.api.tasks.update(id, { title })
    },
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData<TaskType[]>(['tasks'])

      queryClient.setQueryData<TaskType[]>(['tasks'], (old) => {
        if (!old) return []
        return old.map((task) => (task.id === id ? { ...task, title } : task))
      })

      return { previousTasks }
    },
    onError: (error, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      console.error('Failed to update task:', error)
    }
  })

  const handleCreateTask = (title: string) => {
    if (title.trim()) {
      createTask.mutate({ title: title.trim(), columnId: column.id })
    } else {
      setIsCreatingTask(null)
    }
  }

  const handleUpdateTask = (id: number, title: string) => {
    updateTask.mutate({ id, title })
  }

  const handleDelete = (id: number) => console.log(`task delete (${id})`)

  const getStatusIcon = (columnIndex: number, columnName: string) => {
    if (columnIndex === 0) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-3 w-3 rounded-full border-1 border-muted-foreground" />
          <span className="text-sm font-light">{columnName}</span>
        </div>
      )
    }
    // Last stage (Done) - checkmark
    if (columnName.toLowerCase() === 'done') {
      return (
        <div className="flex items-center gap-2 text-emerald-600">
          <div className="h-3 w-3 rounded-full border-1 border-emerald-600 flex items-center justify-center">
            <svg
              className="h-2 w-2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-light">{columnName}</span>
        </div>
      )
    }
    // Middle stages - dot
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="h-3 w-3 rounded-full border-1 border-muted-foreground flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        </div>
        <span className="text-sm font-light">{columnName}</span>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-[280px] space-y-4 border-r-[0.5px] overflow-hidden">
      <div className="flex items-center justify-between px-4">
        {getStatusIcon(index, column.name)}
      </div>
      <div className="px-4 min-h-[200px] h-full space-y-3 group/column">
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            taskId={task.id}
            title={task.title}
            onTitleChange={(newTitle) => handleUpdateTask(task.id, newTitle)}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
        {isCreatingTask === column.id && (
          <TaskCard
            key="new-task"
            taskId={0}
            title=""
            isNew
            onTitleChange={handleCreateTask}
            onCancel={() => setIsCreatingTask(null)}
            onDelete={() => setIsCreatingTask(null)}
          />
        )}
        {isCreatingTask !== column.id && (
          <button
            onClick={() => setIsCreatingTask(column.id)}
            className="inline-flex flex-col w-full items-center justify-center bg-background-muted border-[0.5px] transition border-[0.5px] rounded px-0.5 py-0.5 opacity-0 group-hover/column:opacity-100 min-h-6"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
