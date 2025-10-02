import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Card from "./components/card";
import Droppable from "./components/droppable";
import Draggable from "./components/draggable";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { Task } from "./db";
import { useTasks } from "./hooks/useTasks";
import { AddTaskButton } from "./components/add-task-button";
import { EditTaskDialog } from "./components/edit-task-dialog";

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "numeric",
  day: "numeric",
});

export default function App() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const stages = useLiveQuery(() => db.stages.orderBy("order").toArray());
  const { tasks, moveTask, updateTask } = useTasks();

  // Configure sensor to require 5px movement before drag starts
  // This allows clicks to work normally while still enabling drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag activates
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = Number(String(active.id).replace("task-", ""));
    const task = tasks.find((t) => t.id === id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = Number(String(active.id).replace("task-", ""));
    const stageKey = String(over.id);

    const stage = stages?.find((s) => s.key === stageKey);
    if (!stage?.id) {
      console.error("Stage not found for key:", stageKey);
      setActiveTask(null);
      return;
    }

    // Optimistic update happens inside the hook
    moveTask(taskId, stage.id);
    setActiveTask(null);
  };

  return (
    <>
      <header className="shrink-0 flex justify-center items-center top-0 z-10 min-h-[48px] border-b-[0.5px] border-gray-400">
        <span className="font-light text-sm text-gray-600">
          {formattedDate}
        </span>
      </header>
      <main className="grow-1 grid grid-cols-3 w-full h-full py-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {stages?.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col grow-1 gap-2 border-r-[0.5px] border-gray-400 px-4 group"
            >
              <span className="text-sm font-light text-gray-800">
                {stage.name}
              </span>
              <Droppable id={stage.key}>
                <div className="flex flex-col col-span-1">
                  {tasks
                    .filter((task) => task.stageId === stage.id)
                    .map((task) => (
                      <Draggable key={task.id} id={`task-${task.id}`}>
                        <Card
                          title={task.name}
                          onTitleChange={(newTitle) =>
                            updateTask(task.id!, { name: newTitle })
                          }
                          onOptionsClick={() => setEditingTask(task)}
                        />
                      </Draggable>
                    ))}
                </div>
                <AddTaskButton
                  stageId={stage.id!}
                  className="opacity-0 group-hover:opacity-100"
                ></AddTaskButton>
              </Droppable>
            </div>
          ))}
          <DragOverlay>
            {activeTask ? (
              <Card style={{ cursor: "grabbing" }} title={activeTask.name} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </>
  );
}
