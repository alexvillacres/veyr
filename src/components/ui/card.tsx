import { useState, useRef, useEffect } from "react";
import { GoalSelect } from "../GoalSelect";
import { TaskDialog } from "../TaskDialog";
import { Trash2 } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  taskId?: number;
  title: string;
  goalId?: number;
  isNew?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onGoalChange?: (goalId: number | undefined) => void;
  onCancel?: () => void;
}

export default function Card({
  taskId,
  title,
  goalId,
  isNew = false,
  onTitleChange,
  onGoalChange,
  onCancel,
  ...props
}: CardProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editValue, setEditValue] = useState(title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { deleteTask } = useTasks();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();

    // If it's a new task and empty, cancel it
    if (isNew && !trimmedValue) {
      onCancel?.();
      return;
    }

    // If it's empty, revert to original
    if (!trimmedValue) {
      setEditValue(title);
      setIsEditing(false);
      return;
    }

    // Save if changed
    if (trimmedValue !== title && onTitleChange) {
      onTitleChange(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      if (isNew) {
        onCancel?.();
      } else {
        setEditValue(title);
        setIsEditing(false);
      }
    }
  };

  const handleDelete = () => {
    if (taskId) {
      void deleteTask(taskId);
    }
    setShowDeleteDialog(false);
  };

  return (
    <div
      className="flex flex-col items-start gap-2 p-3 mb-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200/70 hover:border-gray-300/70 transition group/card min-h-[60px]"
      {...props}
    >
      <div className="flex justify-between gap-2 w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={isNew ? "Your new task" : ""}
            className="flex-1 text-sm text-gray-950 outline-0 ring-0 bg-transparent placeholder:text-gray-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h1
            className="flex-1 text-sm text-gray-950 cursor-text hover:text-gray-900 transition"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {title}
          </h1>
        )}
        {!isNew && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="hover:text-red-600 transition-colors"
            aria-label="Delete task"
          >
            <Trash2
              size={14}
              className="opacity-0 text-gray-600 group-hover/card:opacity-100 transition cursor-pointer hover:text-red-600"
            />
          </button>
        )}
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <GoalSelect
          selectedGoalId={goalId}
          onSelect={(newGoalId) => {
            onGoalChange?.(newGoalId);
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <TaskDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Task"
      >
        <div className="px-3 py-2 flex flex-col gap-4">
          <p className="text-sm text-gray-925 font-light">
            Are you sure you want to delete{" "}
            <strong className="text-gray-950">{title}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="flex h-7 items-center justify-center rounded-md border border-gray-300 bg-gray-200 px-2 text-sm text-gray-925 transition select-none hover:bg-gray-300 focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-blue-800 active:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex h-7 items-center justify-center rounded-md  bg-red-strong px-2 py-1 text-sm text-gray-50 select-none hover:bg-red-strong/90 transition focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-red-800 active:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </TaskDialog>
    </div>
  );
}
