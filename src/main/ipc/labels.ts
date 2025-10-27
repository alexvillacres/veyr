import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db'
import { labels } from '../db/schema'

export function registerLabelsHandlers(): void {
  // Get all labels
  ipcMain.handle('labels:getAll', async () => {
    const db = getDatabase()
    return await db.select().from(labels)
  })

  // Create label
  ipcMain.handle('labels:create', async (_event, data: { name: string; color: string }) => {
    const db = getDatabase()
    const [label] = await db.insert(labels).values(data).returning()
    return label
  })

  // Update label
  ipcMain.handle(
    'labels:update',
    async (_event, id: number, data: Partial<{ name: string; color: string }>) => {
      const db = getDatabase()
      const [label] = await db.update(labels).set(data).where(eq(labels.id, id)).returning()
      return label
    }
  )

  // Delete label
  ipcMain.handle('labels:delete', async (_event, id: number) => {
    const db = getDatabase()
    await db.delete(labels).where(eq(labels.id, id))
    return { success: true }
  })
}
