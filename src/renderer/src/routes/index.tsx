import { type FC, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@renderer/components/ui/badge'
import { Card } from '@renderer/components/ui/card'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const Route = createFileRoute('/')({
  component: RouteComponent
})

interface Task {
  id: string
  title: string
  tag: string
  tagVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  columnId: string
}

interface Column {
  id: string
  title: string
  status: 'ready' | 'doing' | 'done'
  tasks: Task[]
}

type ColumnsState = Record<string, Column>

const initialData: Column[] = [
  {
    id: 'ready',
    title: 'Ready',
    status: 'ready',
    tasks: [
      {
        id: '1',
        title: 'Find 3 agencies that you can be a part of',
        tag: 'Community',
        tagVariant: 'secondary',
        columnId: 'ready'
      }
    ]
  },
  {
    id: 'doing',
    title: 'Doing',
    status: 'doing',
    tasks: [
      {
        id: '2',
        title: 'Design simple Kanban board',
        tag: 'Design focus',
        tagVariant: 'outline',
        columnId: 'doing'
      },
      {
        id: '3',
        title: 'Scaffold React project repo',
        tag: 'Eng exploration',
        tagVariant: 'destructive',
        columnId: 'doing'
      },
      {
        id: '4',
        title: 'List 3 agencies that you want to work for',
        tag: 'Agency pursuit',
        tagVariant: 'default',
        columnId: 'doing'
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    tasks: [
      {
        id: '5',
        title: 'Design simple Kanban board',
        tag: 'Design focus',
        tagVariant: 'outline',
        columnId: 'done'
      }
    ]
  }
]

interface TaskCardProps {
  task: Task
}

const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
        <div className="space-y-3">
          <h3 className="text-sm leading-tight text-foreground">{task.title}</h3>
          <Badge variant={task.tagVariant} className="text-xs pointer-events-none">
            {task.tag}
          </Badge>
        </div>
      </Card>
    </div>
  )
}

const TaskCardOverlay: FC<{ task: Task }> = ({ task }) => {
  return (
    <Card className="p-4 shadow-lg rotate-3">
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-tight text-foreground">{task.title}</h3>
        <Badge variant={task.tagVariant} className="text-xs">
          {task.tag}
        </Badge>
      </div>
    </Card>
  )
}

interface KanbanColumnProps {
  column: Column
}

const KanbanColumn: FC<KanbanColumnProps> = ({ column }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column
    }
  })

  const getStatusIcon = (status: Column['status']) => {
    switch (status) {
      case 'ready':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-3 w-3 rounded-full border-1 border-muted-foreground" />
            <span className="text-sm font-light">{column.title}</span>
          </div>
        )
      case 'doing':
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-3 w-3 rounded-full border-1 border-muted-foreground flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            </div>
            <span className="text-sm font-light">{column.title}</span>
          </div>
        )
      case 'done':
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
            <span className="text-sm font-light">{column.title}</span>
          </div>
        )
    }
  }

  const taskIds = column.tasks.map((task) => task.id)

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[280px] space-y-4 border-r-[0.5px]">
      <div className="flex items-center justify-between px-4">{getStatusIcon(column.status)}</div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="px-4 min-h-[200px] space-y-3">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function RouteComponent() {
  const [columns, setColumns] = useState<ColumnsState>(() => {
    const columnsMap: ColumnsState = {}
    initialData.forEach((column) => {
      columnsMap[column.id] = column
    })
    return columnsMap
  })

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current

    if (activeData?.type === 'task') {
      setActiveTask(activeData.task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const activeId = active.id
    const overId = over.id
    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || activeId === overId) {
      setActiveTask(null)
      return
    }

    // Handle task being dropped on another task or column
    if (activeData.type === 'task') {
      const activeTask = activeData.task as Task
      const sourceColumnId = activeTask.columnId

      // Determine target column
      let targetColumnId: string

      if (overData?.type === 'column') {
        targetColumnId = overData.column.id
      } else if (overData?.type === 'task') {
        targetColumnId = overData.task.columnId
      } else {
        // If dropped on column container itself
        targetColumnId = overId as string
      }

      setColumns((prevColumns) => {
        const newColumns = { ...prevColumns }
        const sourceColumn = { ...newColumns[sourceColumnId] }
        const targetColumn = { ...newColumns[targetColumnId] }

        // Remove task from source column
        const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === activeTask.id)
        if (taskIndex === -1) {
          return prevColumns
        }

        const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1)

        // Update task's columnId
        movedTask.columnId = targetColumnId

        if (sourceColumnId === targetColumnId) {
          // Reordering within same column
          let newIndex = targetColumn.tasks.findIndex((t) => t.id === overId)
          if (newIndex === -1) {
            newIndex = targetColumn.tasks.length
          }
          targetColumn.tasks.splice(newIndex, 0, movedTask)
          newColumns[targetColumnId] = targetColumn
        } else {
          // Moving to different column
          if (overData?.type === 'task') {
            const overTaskIndex = targetColumn.tasks.findIndex((t) => t.id === overId)
            targetColumn.tasks.splice(overTaskIndex, 0, movedTask)
          } else {
            targetColumn.tasks.push(movedTask)
          }

          newColumns[sourceColumnId] = sourceColumn
          newColumns[targetColumnId] = targetColumn
        }

        return newColumns
      })
    }

    setActiveTask(null)
  }

  const getCurrentDate = (): string => {
    const now = new Date()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = days[now.getDay()]
    const month = now.getMonth() + 1
    const day = now.getDate()
    return `${dayName}, ${month}/${day}`
  }

  const columnOrder = ['ready', 'doing', 'done']

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-screen bg-background">
        <div className="mx-auto h-full">
          {/* Date Header */}
          <div className="flex justify-center items-center border-b-[0.5px] min-h-[48px] p-2">
            <span className="text-sm text-muted-foreground">{getCurrentDate()}</span>
          </div>

          {/* Kanban Board */}
          <SortableContext items={columnOrder}>
            <div className="flex overflow-x-auto py-4 min-h-[calc(100vh-48px)]">
              {columnOrder.map((columnId) => (
                <KanbanColumn key={columnId} column={columns[columnId]} />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>

      <DragOverlay>{activeTask ? <TaskCardOverlay task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  )
}
