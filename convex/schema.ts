import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  boards: defineTable({
    name: v.string(),
  }),
  lists: defineTable({
    name: v.string(),
    boardId: v.id("boards"),
  }),
  tasks: defineTable({
    name: v.string(),
    listId: v.id("lists"),
  }),
  goals: defineTable({
    name: v.string(),
    cardId: v.id("tasks"),
  }),
});