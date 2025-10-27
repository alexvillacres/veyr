import { ipcMain } from 'electron'
import { getDatabase } from '../db'
import { columns } from '../db/schema'

export function registerColumnsHandlers(): void {
  // Get all columns
  ipcMain.handle('columns:getAll', async () => {
    const db = getDatabase()
    return await db.select().from(columns).orderBy(columns.order)
  })
}
