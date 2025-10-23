import { useLiveQuery } from "dexie-react-hooks";
import { db, type Quest } from "../db";

export function useQuests() {
  const quests = useLiveQuery(() =>
    db.quests.where("status").equals("active").sortBy("order"),
  );

  const addQuest = async (name: string, color?: string) => {
    console.log("addQuest called with name:", name, "color:", color);
    
    const existingQuests = await db.quests.toArray();
    console.log("Existing quests:", existingQuests);
    
    const maxOrder =
      existingQuests.length > 0
        ? Math.max(...existingQuests.map((q) => q.order))
        : 0;

    const newQuest: Quest = {
      name,
      color,
      status: "active",
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating new quest:", newQuest);
    const id = await db.quests.add(newQuest);
    console.log("New quest created with ID:", id);
    
    return id;
  };

  const getQuestById = async (questId: number) => {
    return await db.quests.get(questId);
  };

  const updateQuest = async (questId: number, updates: { name?: string; color?: string }) => {
    console.log("updateQuest called with id:", questId, "updates:", updates);
    await db.quests.update(questId, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteQuest = async (questId: number) => {
    console.log("deleteQuest called with id:", questId);
    await db.quests.delete(questId);
  };

  return { quests: quests || [], addQuest, updateQuest, deleteQuest, getQuestById };
}

