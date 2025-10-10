import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import Tag from "./tag";
import type { GoalColorKey } from "@/constants/colors";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  goalName?: string;
  goalColor?: GoalColorKey;
  onTitleChange?: (newTitle: string) => void;
  onOptionsClick?: () => void;
  onGoalClick?: () => void;
}

export default function Card({
  title,
  goalName,
  goalColor,
  onTitleChange,
  onOptionsClick,
  onGoalClick,
  ...props
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title && onTitleChange) {
      onTitleChange(trimmedValue);
    } else {
      setEditValue(title); // Revert if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-2 p-3 mb-2 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200/70 hover:border-gray-300/70 transition group/card min-h-[60px]"
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 text-sm text-gray-950 outline-0 ring-0"
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
        {onOptionsClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOptionsClick();
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-300/50 transition opacity-0 group-hover/card:opacity-100"
            aria-label="More options"
          >
            <MoreHorizontal size={14} className="text-gray-600" />
          </button>
        )}
      </div>
      {goalName && (
        <div className="flex flex-row gap-2">
          <Tag color={goalColor} onClick={onGoalClick}>
            {goalName}
          </Tag>
        </div>
      )}
    </div>
  );
}
