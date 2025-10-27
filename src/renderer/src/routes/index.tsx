import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getCurrentDate } from '../lib/utils'
import { ColumnBoard } from '@renderer/features/board/column-board'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

function RouteComponent() {
  // Fetch columns from SQLite database
  const {
    data: columns,
    isLoading,
    error
  } = useQuery({
    queryKey: ['columns'],
    queryFn: () => window.api.columns.getAll()
  })

  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => window.api.tasks.getAll()
  })

  const currentDate = getCurrentDate()

  if (isLoading || isLoadingTasks) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (error || tasksError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="text-sm text-red-600">Error: {String(error || tasksError)}</span>
      </div>
    )
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">No columns found</span>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-background">
      <div className="mx-auto h-full">
        {/* Date Header */}
        <div className="flex min-h-[48px] items-center justify-center border-b-[0.5px] p-2">
          <span className="text-sm text-muted-foreground">{currentDate}</span>
        </div>

        {/* Kanban Board */}
        <ColumnBoard columns={columns} tasks={tasks || []} />
      </div>
    </div>
  )
}
