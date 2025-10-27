import { registerColumnsHandlers } from './columns'
import { registerTasksHandlers } from './tasks'
import { registerLabelsHandlers } from './labels'

export function registerIpcHandlers(): void {
  registerColumnsHandlers()
  registerTasksHandlers()
  registerLabelsHandlers()
}
