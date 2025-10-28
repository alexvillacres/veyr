import { cn } from '@renderer/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface EditableTitleProps {
  title: string
  onCommit?: (newTitle: string) => void
  onCancel?: () => void
  className?: string
  autoFocus?: boolean
}

export default function EditableTitle({
  title,
  onCommit,
  onCancel,
  className,
  autoFocus = false
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(autoFocus)
  const [editValue, setEditValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) {
      setEditValue(title)
    }
  }, [title, isEditing])

  const commitEdit = () => {
    const trimmedValue = editValue.trim()
    if (trimmedValue !== title) onCommit?.(trimmedValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitEdit()
      setIsEditing(false)
    } else if (e.key === 'Escape') {
      onCancel?.()
      setIsEditing(false)
      setEditValue(title)
    }
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        'flex-1 text-sm font-light hover:text-muted-foreground transition-colors cursor-text',
        className
      )}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="w-full focus:outline-none focus:ring-0 focus:border-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span>{title}</span>
      )}
    </div>
  )
}
