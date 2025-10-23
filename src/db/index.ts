import Dexie, { EntityTable } from "dexie";

interface Task {
  id?: number;
  name: string;
  questId?: number;
  order: number;
  stageId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Quest {
  id?: number;
  name: string;
  color?: string;
  status: "active" | "archived";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Stage {
  id?: number;
  key: string;
  name: string;
  order: number;
  wipLimit?: number;
}

interface Meta {
  key: string;
  value: string;
}

interface Color {
  id: string; // The color key (e.g., "blue", "green")
  name: string; // Display name (e.g., "Blue")
  subtleBg: string; // Subtle background class
  solidBg: string; // Solid background class
  strongText: string; // Strong text class
  subtleText: string; // Subtle text class
  hoverShadow: string; // Hover shadow class
  ring: string; // Ring class
  hoverRing: string; // Hover ring class
}

const db = new Dexie("VeyrDB") as Dexie & {
  tasks: EntityTable<Task, "id">;
  quests: EntityTable<Quest, "id">;
  stages: EntityTable<Stage, "id">;
  meta: EntityTable<Meta, "key">;
  colors: EntityTable<Color, "id">;
};

db.version(1).stores({
  tasks: "++id, name, stageId, [questId+stageId], [questId+order]",
  quests: "++id, status, order",
  stages: "++id, key, order",
  meta: "key",
});

// Version 2: Add color field to quests
db.version(2).stores({
  tasks: "++id, name, stageId, [questId+stageId], [questId+order]",
  quests: "++id, status, order",
  stages: "++id, key, order",
  meta: "key",
});

// Version 3: Add colors table
db.version(3).stores({
  tasks: "++id, name, stageId, [questId+stageId], [questId+order]",
  quests: "++id, status, order",
  stages: "++id, key, order",
  meta: "key",
  colors: "id",
});

let isSeeding = false;

export async function seedIfEmpty() {
  if (isSeeding) return;
  isSeeding = true;
  console.log("seedIfEmpty() called");
  const exists = await db.stages.get({ key: "ready" });
  if (exists) {
    console.log("Already seeded, skipping");
    return;
  }

  // Seed colors table
  await db.colors.bulkAdd([
    {
      id: "green",
      name: "Green",
      subtleBg: "bg-green-200",
      solidBg: "bg-green-700",
      strongText: "text-green-700",
      subtleText: "text-green-200",
      hoverShadow: "hover:shadow-[0px_0px_8px_2px_#466a66]",
      ring: "ring-green-strong",
      hoverRing: "hover:ring-green-strong",
    },
    {
      id: "blue",
      name: "Blue",
      subtleBg: "bg-blue-200",
      solidBg: "bg-blue-700",
      strongText: "text-blue-700",
      subtleText: "text-blue-200",
      hoverShadow: "hover:shadow-[0px_0px_8px_2px_#6491C9]",
      ring: "ring-blue-strong",
      hoverRing: "hover:ring-blue-strong",
    },
    {
      id: "purple",
      name: "Purple",
      subtleBg: "bg-purple-200",
      solidBg: "bg-purple-700",
      strongText: "text-purple-700",
      subtleText: "text-purple-200",
      hoverShadow: "hover:shadow-[0px_0px_8px_2px_#8F7898]",
      ring: "ring-purple-strong",
      hoverRing: "hover:ring-purple-strong",
    },
    {
      id: "orange",
      name: "Orange",
      subtleBg: "bg-orange-200",
      solidBg: "bg-orange-700",
      strongText: "text-orange-700",
      subtleText: "text-orange-200",
      hoverShadow: "hover:shadow-[0px_0px_8px_2px_#B86E58]",
      ring: "ring-orange-strong",
      hoverRing: "hover:ring-orange-strong",
    },
    {
      id: "yellow",
      name: "Yellow",
      subtleBg: "bg-yellow-200",
      solidBg: "bg-yellow-700",
      strongText: "text-yellow-700",
      subtleText: "text-yellow-200",
      hoverShadow: "hover:shadow-[0px_0px_8px_2px_#DAD49C]",
      ring: "ring-yellow-strong",
      hoverRing: "hover:ring-yellow-strong",
    },
  ]);

  await db.stages.bulkAdd([
    { key: "ready", name: "Ready", order: 1 },
    { key: "doing", name: "Doing", order: 2 },
    { key: "done", name: "Done", order: 3 },
  ]);

  await db.quests.bulkAdd([
    { id: 1, name: "Design focus", color: "blue", status: "active", order: 1, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: "Engineering exploration", color: "green", status: "active", order: 2, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, name: "Career research", color: "purple", status: "active", order: 3, createdAt: new Date(), updatedAt: new Date() },
  ]);

  const readyStage = await db.stages.get({ key: "ready" });

  if (readyStage?.id) {
    await db.tasks.add({
      name: "Design Kanban board",
      order: 1,
      stageId: readyStage.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export type { Task, Quest, Stage, Meta, Color };
export { db };
