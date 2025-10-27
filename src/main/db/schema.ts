import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

/**
 * Columns represent columns in the kanban board (e.g., "To Do", "In Progress", "Done")
 */
export const columns = sqliteTable('columns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`)
})

/**
 * Labels are tags that can be applied to tasks
 * Color is stored as a hex string (e.g., "#FF5733")
 */
export const labels = sqliteTable('labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull().default('#808080'), // Default gray color
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`)
})

/**
 * Tasks are the main work items in the kanban board
 */
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  columnId: integer('column_id')
    .notNull()
    .references(() => columns.id, { onDelete: 'cascade' }),
  labelId: integer('label_id').references(() => labels.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0), // For ordering within a column
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`)
})

export const timeEntries = sqliteTable('time_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  startTime: text('start_time')
    .notNull()
    .default(sql`(datetime('now'))`),
  endTime: text('end_time')
    .notNull()
    .default(sql`(datetime('now'))`),
  durationInSeconds: integer('duration_in_seconds').notNull()
})

/**
 * Junction table for many-to-many relationship between tasks and labels
 */
export const taskLabels = sqliteTable('task_labels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id')
    .notNull()
    .references(() => tasks.id, { onDelete: 'cascade' }),
  labelId: integer('label_id')
    .notNull()
    .references(() => labels.id, { onDelete: 'cascade' }),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`)
})
