import { useLiveQuery } from "dexie-react-hooks";
import { db, type Goal } from "../db";

export function useGoals() {
  const goals = useLiveQuery(() =>
    db.goals.where("status").equals("active").sortBy("order"),
  );

  const addGoal = async (name: string, color?: string) => {
    console.log("addGoal called with name:", name, "color:", color);
    
    const existingGoals = await db.goals.toArray();
    console.log("Existing goals:", existingGoals);
    
    const maxOrder =
      existingGoals.length > 0
        ? Math.max(...existingGoals.map((g) => g.order))
        : 0;

    const newGoal: Goal = {
      name,
      color,
      status: "active",
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating new goal:", newGoal);
    const id = await db.goals.add(newGoal);
    console.log("New goal created with ID:", id);
    
    return id;
  };

  const getGoalById = async (goalId: number) => {
    return await db.goals.get(goalId);
  };

  const updateGoal = async (goalId: number, updates: { name?: string; color?: string }) => {
    console.log("updateGoal called with id:", goalId, "updates:", updates);
    await db.goals.update(goalId, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteGoal = async (goalId: number) => {
    console.log("deleteGoal called with id:", goalId);
    await db.goals.delete(goalId);
  };

  return { goals: goals || [], addGoal, updateGoal, deleteGoal, getGoalById };
}
