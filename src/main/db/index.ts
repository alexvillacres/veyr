import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'

/**
 * Database instance
 * Stored in user data directory: ~/Library/Application Support/veyr/database.sqlite
 */
export let db: ReturnType<typeof drizzle> | null = null
let sqlite: Database.Database | null = null

/**
 * Initialize the SQLite database with Bun and Drizzle ORM
 */
export function initDatabase(): ReturnType<typeof drizzle> {
  if (db) {
    return db
  }

  // Store database in user data directory
  const userDataPath = app.getPath('userData')
  const dbPath = join(userDataPath, 'database.sqlite')

  console.log('Initializing database at:', dbPath)

  // Create SQLite database using better-sqlite3
  sqlite = new Database(dbPath)

  // Initialize Drizzle ORM
  db = drizzle(sqlite, { schema })

  // Run migrations/create tables
  createTables()

  return db
}

/**
 * Get the database instance
 */
export function getDatabase(): ReturnType<typeof drizzle> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * Create tables if they don't exist
 * This is a simple approach for initial setup
 */
function createTables(): void {
  if (!sqlite) {
    throw new Error('SQLite instance not initialized')
  }

  // Create columns table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Create labels table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#808080',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Create tasks table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      column_id INTEGER NOT NULL,
      label_id INTEGER,
      "order" INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      start_time TEXT NOT NULL DEFAULT (datetime('now')),
      end_time TEXT NOT NULL DEFAULT (datetime('now')),
      duration_in_seconds INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `)

  // Create task_labels junction table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS task_labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      label_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    )
  `)

  // Seed default columns if none exist
  const columnsCount = sqlite.prepare('SELECT COUNT(*) as count FROM columns').get() as {
    count: number
  }

  const tasksCount = sqlite.prepare('SELECT COUNT(*) as count from tasks').get() as {
    count: number
  }

  if (columnsCount.count === 0) {
    console.log('Seeding default columns...')
    const insertColumn = sqlite.prepare(
      'INSERT INTO columns (name, description, "order") VALUES (?, ?, ?)'
    )

    insertColumn.run('To Do', 'Tasks that need to be done', 0)
    insertColumn.run('In Progress', 'Tasks currently being worked on', 1)
    insertColumn.run('Done', 'Completed tasks', 2)
  }

  if (tasksCount.count === 0) {
    console.log('Seeding default tasks...')
    const insertTask = sqlite.prepare(
      'INSERT INTO tasks (title, column_id, "order") VALUES (?, ?, ?)'
    )
    insertTask.run('Your first task', 1, 0)
  }

  console.log(
    'Database tables created successfully',
    sqlite.prepare('SELECT * FROM columns').all(),
    sqlite.prepare('SELECT * FROM tasks').all()
  )
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}
