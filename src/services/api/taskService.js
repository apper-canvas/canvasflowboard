import tasksData from "@/services/mockData/tasks.json"

let tasks = [...tasksData.map(task => ({
  ...task,
  status: task.completed ? 'Done' : 'To Do',
  statusHistory: [{
    status: task.completed ? 'Done' : 'To Do',
    timestamp: task.createdAt || new Date().toISOString()
  }],
  lastUpdated: task.createdAt || new Date().toISOString()
}))]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const taskService = {
  async getAll() {
    await delay(250)
    return [...tasks]
  },

  async getById(id) {
    await delay(200)
    const task = tasks.find(t => t.Id === parseInt(id))
    if (!task) {
      throw new Error("Task not found")
    }
    return { ...task }
  },

  async getByProjectId(projectId) {
    await delay(250)
    return tasks.filter(t => t.projectId === parseInt(projectId))
  },

async create(taskData) {
    await delay(350)
    const now = new Date().toISOString()
    const status = taskData.status || 'To Do'
    const newTask = {
      ...taskData,
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      projectId: parseInt(taskData.projectId),
      status,
      completed: status === 'Done',
      createdAt: now,
      lastUpdated: now,
      statusHistory: [{
        status,
        timestamp: now
      }]
    }
    tasks.push(newTask)
    return { ...newTask }
  },

async update(id, taskData) {
    await delay(300)
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    
    const now = new Date().toISOString()
    const oldTask = tasks[index]
    const newStatus = taskData.status || oldTask.status
    
    tasks[index] = {
      ...oldTask,
      ...taskData,
      Id: parseInt(id),
      projectId: parseInt(taskData.projectId),
      status: newStatus,
      completed: newStatus === 'Done',
      lastUpdated: now,
      statusHistory: newStatus !== oldTask.status 
        ? [...(oldTask.statusHistory || []), { status: newStatus, timestamp: now }]
        : oldTask.statusHistory
    }
    
    return { ...tasks[index] }
  },

  async updateStatus(id, status) {
    await delay(200)
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    
    const now = new Date().toISOString()
    const oldTask = tasks[index]
    
    tasks[index] = {
      ...oldTask,
      status,
      completed: status === 'Done',
      lastUpdated: now,
      statusHistory: [...(oldTask.statusHistory || []), { status, timestamp: now }]
    }
    
    return { ...tasks[index] }
  },

  async delete(id) {
    await delay(250)
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    
    tasks.splice(index, 1)
    return true
  },

async toggleComplete(id) {
    await delay(200)
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    
    const now = new Date().toISOString()
    const oldTask = tasks[index]
    const newStatus = oldTask.completed ? 'To Do' : 'Done'
    
    tasks[index] = {
      ...oldTask,
      completed: !oldTask.completed,
      status: newStatus,
      lastUpdated: now,
      statusHistory: [...(oldTask.statusHistory || []), { status: newStatus, timestamp: now }]
    }
    
    return { ...tasks[index] }
  }
}