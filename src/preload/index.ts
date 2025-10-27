import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Columns
  columns: {
    getAll: () => ipcRenderer.invoke('columns:getAll')
  },

  // Tasks
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    getByColumn: (columnId: number) => ipcRenderer.invoke('tasks:getByColumn', columnId),
    create: (data: { title: string; columnId: number }) => ipcRenderer.invoke('tasks:create', data),
    update: (id: number, data: Partial<{ title: string; columnId: number; order: number }>) =>
      ipcRenderer.invoke('tasks:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('tasks:delete', id),
    addLabel: (taskId: number, labelId: number) =>
      ipcRenderer.invoke('tasks:addLabel', taskId, labelId),
    removeLabel: (taskId: number, labelId: number) =>
      ipcRenderer.invoke('tasks:removeLabel', taskId, labelId)
  },

  // Labels
  labels: {
    getAll: () => ipcRenderer.invoke('labels:getAll'),
    create: (data: { name: string; color: string }) => ipcRenderer.invoke('labels:create', data),
    update: (id: number, data: Partial<{ name: string; color: string }>) =>
      ipcRenderer.invoke('labels:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('labels:delete', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
