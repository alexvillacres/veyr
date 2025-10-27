import { Column } from '@renderer/features/column/column'
import type { Column as ColumnType, Task as TaskType } from '@types'

interface ColumnBoardProps {
  columns: ColumnType[]
  tasks: TaskType[]
}

export const ColumnBoard: React.FC<ColumnBoardProps> = ({ columns, tasks }) => {
  return (
    <div className="flex min-h-[calc(100vh-48px)] overflow-x-auto py-4">
      {columns.map((column, index) => (
        <Column key={column.id} column={column} index={index} tasks={tasks || []} />
      ))}
    </div>
  )
}
