import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface EditableTitleProps {
    name: string;
    onTitleChange?: (newTitle: string) => void;
    onCancel?: () => void;
    className?: string;
  }
export function EditableTitle({
    name,
    onTitleChange,
    onCancel,
    className,
  }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      if (isEditing && inputRef.current) {
        const input = inputRef.current;
        const length = input.value.length;
        input.focus();
        input.setSelectionRange(length, length);
      }
    }, [isEditing]);
  
    const handleStartEdit = () => {
      setEditValue(name || "");
      setIsEditing(true);
    };
  
    const handleSave = () => {
      const trimmedValue = editValue.trim();
  
      if (trimmedValue === name) {
        setIsEditing(false);
        return;
      }
  
      if (trimmedValue === "") {
        onCancel?.();
        setIsEditing(false);
        return;
      }
  
      onTitleChange?.(trimmedValue);
      setIsEditing(false);
    };
  
    const handleCancel = () => {
      setEditValue("");
      setIsEditing(false);
    };
  
    return (
      <div className={clsx(`flex flex-initial text-sm transition-colors duration-100`, className)}>
        <div
          className={`
            flex items-center justify-start text-left min-w-[180px] rounded-sm border-[0.5px] px-1 py-0.5
            transition-colors duration-100
            ${isEditing ? "border-gray-200 bg-gray-100" : "border-transparent hover:border-gray-200 hover:bg-gray-100"}
          `}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              placeholder={name}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onClick={(e) => e.preventDefault()}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              autoFocus
              className="
                bg-gray-100 text-gray-950 outline-none w-full]
                rounded-sm border-none
                focus:ring-0 p-0
              "
            />
          ) : (
            <div
              onClick={handleStartEdit}
              className="w-full truncate cursor-text"
            >
              <span>{name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  