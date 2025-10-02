import Dexie, { EntityTable } from "dexie";

interface Task {
  id?: number;
  name: string;
  goalId?: number;
  order: number;
  stageId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Goal {
  id?: number;
  name: string;
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

const db = new Dexie("VeyrDB") as Dexie & {
  tasks: EntityTable<Task, "id">;
  goals: EntityTable<Goal, "id">;
  stages: EntityTable<Stage, "id">;
  meta: EntityTable<Meta, "key">;
};

db.version(1).stores({
  tasks: "++id, name, stageId, [goalId+stageId], [goalId+order]",
  goals: "++id, status, order",
  stages: "++id, key, order",
  meta: "key",
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

  await db.stages.bulkAdd([
    { key: "ready", name: "Ready", order: 1 },
    { key: "doing", name: "Doing", order: 2 },
    { key: "done", name: "Done", order: 3 },
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

export type { Task, Goal, Stage, Meta };
export { db };
