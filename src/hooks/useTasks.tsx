import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Task } from "../db";

export function useTasks() {
  const dbTasks = useLiveQuery(() => db.tasks.toArray());
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<number, Partial<Task>>
  >(new Map());

  // Merge DB tasks with optimistic updates
  const tasks = useMemo(() => {
    if (!dbTasks) return [];
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

  const addTask = async (name: string, stageId: number, questId?: number) => {
    const newTask: Task = {
      name,
      stageId,
      questId,
      order: tasks.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Could add optimistic rendering here with a temp ID if needed
    await db.tasks.add(newTask).catch((error) => {
      console.error("Failed to create new task", error);
    });
  };

  const updateTask = async (
    taskId: number,
    updates: { name?: string; questId?: number },
  ) => {
    await db.tasks
      .update(taskId, {
        ...updates,
        updatedAt: new Date(),
      })
      .catch((error) => {
        console.error("Failed to update task", error);
      });
  };

  const deleteTask = async (taskId: number) => {
    await db.tasks.delete(taskId).catch((error) => {
      console.error("Failed to delete task", error);
    });
  };

  return { tasks, moveTask, addTask, updateTask, deleteTask };
}
