import { useDraggable } from "@dnd-kit/core";

interface DraggableProps {
  id: string;
  children: React.ReactNode;
}

export default function Draggable({ id, children }: DraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
  });

  const style = {
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
