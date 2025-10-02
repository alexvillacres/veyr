import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Task } from "../db";

export function useTasks() {
  const dbTasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<number, Partial<Task>>
  >(new Map());

  // Merge DB tasks with optimistic updates
  const tasks = useMemo(() => {
    return dbTasks.map((task) => {
      const updates = optimisticUpdates.get(task.id!);
      return updates ? { ...task, ...updates } : task;
    });
  }, [dbTasks, optimisticUpdates]);

  const moveTask = (taskId: number, newStageId: number) => {
    // 1. Optimistic update
    setOptimisticUpdates((prev) => {
      const next = new Map(prev);
      next.set(taskId, { stageId: newStageId, updatedAt: new Date() });
      return next;
    });

    // 2. Background DB write
    db.tasks
      .update(taskId, { stageId: newStageId, updatedAt: new Date() })
      .then(() => {
        // 3. Clear optimistic state once DB update completes
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(taskId);
          return next;
        });
      })
      .catch((error) => {
        console.error("Failed to update task:", error);
        // Revert optimistic update on error
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(taskId);
          return next;
        });
      });
  };

  const addTask = async (name: string, stageId: number, goalId?: number) => {
    const newTask: Task = {
      name,
      stageId,
      goalId,
      order: tasks.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Could add optimistic rendering here with a temp ID if needed
    await db.tasks.add(newTask);
  };

  return { tasks, moveTask, addTask };
}
