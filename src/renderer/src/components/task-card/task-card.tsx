import { Card, CardHeader, CardContent } from '../ui/card'
import { Trash2 } from 'lucide-react'
import EditableTitle from '@components/editable-title'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  taskId: number
  title: string
  isNew?: boolean
  onTitleChange?: (newTitle: string) => void
  onDelete?: () => void
  onCancel?: () => void
}

export default function TaskCard({
  taskId,
  title,
  isNew,
  onTitleChange,
  onCancel,
  onDelete,
  ...props
}: CardProps) {
  const handleTitleChange = (newTitle: string) => {
    onTitleChange?.(newTitle)
  }

  const handleCancel = () => {
    onCancel?.()
  }

  const handleDelete = () => {
    onDelete?.()
  }

  return (
    <Card key={taskId} className="relative group/card space-y-2" {...props}>
      <CardHeader className="flex flex-row items-start gap-2">
        <EditableTitle
          title={title}
          onCommit={handleTitleChange}
          onCancel={handleCancel}
          autoFocus={isNew}
        />
        <Trash2
          size={16}
          className="flex-shrink-0 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 hover:text-foreground"
          onClick={handleDelete}
        />
      </CardHeader>
      <CardContent>
        <div aria-label="task-quest" className="flex items-center gap-1 text-muted-foreground">
          <span className="text-xs text-muted-foreground bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-[4px]">
            Design focus
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
