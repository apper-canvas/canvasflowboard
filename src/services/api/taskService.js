import tasksData from "@/services/mockData/tasks.json";
let tasks = [...tasksData.map(task => ({
  ...task,
  parentId: task.parentId || null,
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
      parentId: taskData.parentId ? parseInt(taskData.parentId) : null,
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

  async createSubtask(parentId, taskData) {
    await delay(350)
    const parentTask = tasks.find(t => t.Id === parseInt(parentId))
    if (!parentTask) {
      throw new Error("Parent task not found")
    }
    
    const subtaskData = {
      ...taskData,
      parentId: parseInt(parentId),
      projectId: parentTask.projectId
    }
    
    return this.create(subtaskData)
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
      parentId: taskData.parentId ? parseInt(taskData.parentId) : oldTask.parentId,
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

  async getSubtasks(parentId) {
    await delay(100)
    return tasks.filter(task => task.parentId === parseInt(parentId))
  },

  async getMainTasks() {
    await delay(100)
    return tasks.filter(task => !task.parentId)
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
  },

  getTaskHierarchy() {
    const mainTasks = tasks.filter(task => !task.parentId)
    
    const buildTaskTree = (task) => ({
      ...task,
      subtasks: tasks.filter(t => t.parentId === task.Id).map(buildTaskTree)
    })
    
    return mainTasks.map(buildTaskTree)
  },
getTaskDepth(taskId) {
    let depth = 0
    let currentTask = tasks.find(t => t.Id === parseInt(taskId))
    
    while (currentTask && currentTask.parentId) {
      depth++
      currentTask = tasks.find(t => t.Id === currentTask.parentId)
    }
    
    return depth
  }
}