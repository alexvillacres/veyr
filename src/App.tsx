import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Card from "./components/ui/card";
import Droppable from "./components/layout/droppable";
import Draggable from "./components/layout/draggable";
import { useLiveQuery } from "dexie-react-hooks";
import { db, seedIfEmpty } from "./db";
import type { Task } from "./db";
import { useTasks } from "./hooks/useTasks";
import { Plus } from "lucide-react";

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "numeric",
  day: "numeric",
});

export default function App() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [creatingTaskInStage, setCreatingTaskInStage] = useState<number | null>(
    null,
  );

  useEffect(() => {
    seedIfEmpty().catch((error) => {
      console.error("Failed to seed data", error);
    });
  }, []);

  const stages = useLiveQuery(() => db.stages.orderBy("order").toArray());
  const { tasks, moveTask, updateTask, addTask } = useTasks();

  // Configure sensor to require 5px movement before drag starts
  // This allows clicks to work normally while still enabling drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag activates
      },
    }),
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
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex-shrink-0 flex justify-center items-center z-10 min-h-[48px] border-b-[0.5px] border-gray-400">
        <span className="font-light text-sm text-gray-600">
          {formattedDate}
        </span>
      </header>
      <main className="flex-1 grid grid-cols-3 w-full overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {stages?.map((stage) => (
            <div
              key={stage.id}
              className="flex flex-col border-r-[0.5px] border-gray-400 px-4 py-4 group overflow-hidden w-full min-w-0"
            >
              <span className="text-sm font-light text-gray-800 mb-2 flex-shrink-0">
                {stage.name}
              </span>
              <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] min-h-0">
                <Droppable id={stage.key}>
                  <div className="flex flex-col min-h-full">
                    {tasks
                      .filter((task) => task.stageId === stage.id)
                      .map((task) => {
                        return (
                          <Draggable key={task.id} id={`task-${task.id}`}>
                            <Card
                              taskId={task.id}
                              title={task.name}
                              goalId={task.goalId}
                              onTitleChange={(newTitle) =>
                                void updateTask(task.id!, {
                                  name: newTitle,
                                }).catch((error) => {
                                  console.error("Failed to update task", error);
                                })
                              }
                              onGoalChange={(newGoalId) =>
                                void updateTask(task.id!, {
                                  goalId: newGoalId,
                                }).catch((error) => {
                                  console.error(
                                    "Failed to update task goal",
                                    error,
                                  );
                                })
                              }
                            />
                          </Draggable>
                        );
                      })}
                    {creatingTaskInStage === stage.id && (
                      <Card
                        isNew
                        title=""
                        onTitleChange={(newTitle) => {
                          void addTask(newTitle, stage.id!).then(() => {
                            setCreatingTaskInStage(null);
                          });
                        }}
                        onCancel={() => setCreatingTaskInStage(null)}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => setCreatingTaskInStage(stage.id!)}
                    disabled={creatingTaskInStage === stage.id}
                    className="inline-flex flex-col w-full items-center justify-center bg-gray-100 border-gray-300 transition border-[0.5px] rounded px-0.5 py-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 min-h-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </Droppable>
              </div>
            </div>
          ))}
          <DragOverlay>
            {activeTask ? (
              <Card
                taskId={activeTask.id}
                style={{ cursor: "grabbing" }}
                title={activeTask.name}
                goalId={activeTask.goalId}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
