import { useDroppable } from "@dnd-kit/core";

interface DroppableProps {
  id: string;
  children: React.ReactNode;
}

export default function Droppable({ id, children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const style = {
    backgroundColor: isOver ? "var(--color-gray-100)" : undefined,
    border: isOver
      ? "1px dashed var(--color-gray-300)"
      : "1px dashed transparent",
    borderRadius: "8px",
    minHeight: "100%",
    transition: "all 0.2s ease",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
