import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db'
import { tasks, taskLabels } from '../db/schema'

export function registerTasksHandlers(): void {
  // Get all tasks
  ipcMain.handle('tasks:getAll', async () => {
    const db = getDatabase()
    return await db.select().from(tasks).orderBy(tasks.order)
  })

  // Get tasks by column
  ipcMain.handle('tasks:getByColumn', async (_event, columnId: number) => {
    const db = getDatabase()
    return await db.select().from(tasks).where(eq(tasks.columnId, columnId)).orderBy(tasks.order)
  })

  // Create task
  ipcMain.handle('tasks:create', async (_event, data: { title: string; columnId: number }) => {
    const db = getDatabase()
    const [task] = await db.insert(tasks).values(data).returning()
    return task
  })

  // Update task
  ipcMain.handle(
    'tasks:update',
    async (
      _event,
      id: number,
      data: Partial<{ title: string; columnId: number; order: number }>
    ) => {
      const db = getDatabase()
      const [task] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning()
      return task
    }
  )

  // Delete task
  ipcMain.handle('tasks:delete', async (_event, id: number) => {
    const db = getDatabase()
    await db.delete(tasks).where(eq(tasks.id, id))
    return { success: true }
  })

  // Add label to task
  ipcMain.handle('tasks:addLabel', async (_event, taskId: number, labelId: number) => {
    const db = getDatabase()
    const [relation] = await db.insert(taskLabels).values({ taskId, labelId }).returning()
    return relation
  })

  // Remove label from task
  ipcMain.handle('tasks:removeLabel', async (_event, taskId: number) => {
    const db = getDatabase()
    await db.delete(taskLabels).where(eq(taskLabels.taskId, taskId))
    return { success: true }
  })
}
