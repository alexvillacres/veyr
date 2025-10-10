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
import Card from "./components/card";
import Droppable from "./components/droppable";
import Draggable from "./components/draggable";
import { useLiveQuery } from "dexie-react-hooks";
import { db, seedIfEmpty } from "./db";
import type { Task, Goal } from "./db";
import type { GoalColorKey } from "@/constants/colors";
import { useTasks } from "./hooks/useTasks";
import { useGoals } from "./hooks/useGoals";
import { AddTaskButton } from "./components/addTaskButton";
import { EditTaskDialog } from "./components/editTaskDialog";
import { GoalEditDialog } from "./components/goalEditDialog";

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "numeric",
  day: "numeric",
});

export default function App() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    seedIfEmpty().catch((error) => {
      console.error("Failed to seed data", error);
    });
  }, []);

  const stages = useLiveQuery(() => db.stages.orderBy("order").toArray());
  const { tasks, moveTask, updateTask } = useTasks();
  const { goals } = useGoals();

  // Create a map of goal IDs to goal data for quick lookup
  const goalMap = new Map(
    goals.map((goal) => [
      goal.id, 
      { 
        name: goal.name, 
        color: goal.color as GoalColorKey | undefined
      }
    ])
  );

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
                        const goalData = task.goalId ? goalMap.get(task.goalId) : undefined;
                        return (
                          <Draggable key={task.id} id={`task-${task.id}`}>
                            <Card
                              title={task.name}
                              goalName={goalData?.name}
                              goalColor={goalData?.color}
                              onTitleChange={(newTitle) =>
                                void updateTask(task.id!, {
                                  name: newTitle,
                                }).catch((error) => {
                                  console.error("Failed to update task", error);
                                })
                              }
                              onOptionsClick={() => setEditingTask(task)}
                              onGoalClick={() => {
                                if (task.goalId) {
                                  const goal = goals.find((g) => g.id === task.goalId);
                                  if (goal) setEditingGoal(goal);
                                }
                              }}
                            />
                          </Draggable>
                        );
                      })}
                  </div>
                  <AddTaskButton
                    stageId={stage.id!}
                    className="opacity-0 group-hover:opacity-100"
                  ></AddTaskButton>
                </Droppable>
              </div>
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
      {editingGoal && (
        <GoalEditDialog
          goal={editingGoal}
          open={!!editingGoal}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}
    </div>
  );
}
