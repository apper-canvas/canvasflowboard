// Mock data for time entries
let timeEntries = [
  {
    Id: 1,
    taskId: 1,
    projectId: 1,
    duration: 3600, // 1 hour in seconds
    description: "Working on wireframes and mockups",
    date: "2024-01-25",
    startTime: null,
    endTime: null,
    isManual: true,
    createdAt: "2024-01-25T10:00:00.000Z"
  },
  {
    Id: 2,
    taskId: 4,
    projectId: 2,
    duration: 7200, // 2 hours in seconds
    description: "Comparing React Native vs Flutter",
    date: "2024-01-24",
    startTime: null,
    endTime: null,
    isManual: true,
    createdAt: "2024-01-24T14:00:00.000Z"
  },
  {
    Id: 3,
    taskId: 6,
    projectId: 3,
    duration: 5400, // 1.5 hours in seconds
    description: "Designing posts for Instagram and Facebook",
    date: "2024-01-23",
    startTime: null,
    endTime: null,
    isManual: true,
    createdAt: "2024-01-23T16:00:00.000Z"
  }
]

// Active timer state
let activeTimer = {
  isRunning: false,
  taskId: null,
  projectId: null,
  startTime: null,
  elapsedTime: 0,
  description: ""
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const timeTrackingService = {
  // Time entries CRUD
  async getAll() {
    await delay(200)
    return [...timeEntries]
  },

  async getById(id) {
    await delay(150)
    const entry = timeEntries.find(e => e.Id === parseInt(id))
    if (!entry) {
      throw new Error("Time entry not found")
    }
    return { ...entry }
  },

  async getByTaskId(taskId) {
    await delay(200)
    return timeEntries.filter(e => e.taskId === parseInt(taskId))
  },

  async getByProjectId(projectId) {
    await delay(200)
    return timeEntries.filter(e => e.projectId === parseInt(projectId))
  },

  async getByDateRange(startDate, endDate) {
    await delay(200)
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return entryDate >= start && entryDate <= end
    })
  },

  async getTodayEntries() {
    const today = new Date().toISOString().split('T')[0]
    await delay(150)
    return timeEntries.filter(e => e.date === today)
  },

  async create(entryData) {
    await delay(300)
    const newId = Math.max(...timeEntries.map(e => e.Id), 0) + 1
    const now = new Date().toISOString()
    
    const newEntry = {
      ...entryData,
      Id: newId,
      taskId: parseInt(entryData.taskId),
      projectId: parseInt(entryData.projectId),
      duration: parseInt(entryData.duration),
      date: entryData.date || new Date().toISOString().split('T')[0],
      isManual: entryData.isManual !== undefined ? entryData.isManual : true,
      createdAt: now
    }
    
    timeEntries.push(newEntry)
    return { ...newEntry }
  },

  async update(id, entryData) {
    await delay(300)
    const index = timeEntries.findIndex(e => e.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Time entry not found")
    }
    
    timeEntries[index] = {
      ...timeEntries[index],
      ...entryData,
      Id: parseInt(id),
      taskId: entryData.taskId ? parseInt(entryData.taskId) : timeEntries[index].taskId,
      projectId: entryData.projectId ? parseInt(entryData.projectId) : timeEntries[index].projectId,
      duration: entryData.duration ? parseInt(entryData.duration) : timeEntries[index].duration
    }
    
    return { ...timeEntries[index] }
  },

  async delete(id) {
    await delay(250)
    const index = timeEntries.findIndex(e => e.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Time entry not found")
    }
    
    timeEntries.splice(index, 1)
    return true
  },

  // Timer management
  async getActiveTimer() {
    await delay(100)
    return { ...activeTimer }
  },

  async startTimer(taskId, projectId, description = "") {
    await delay(200)
    if (activeTimer.isRunning) {
      throw new Error("Timer is already running")
    }
    
    activeTimer = {
      isRunning: true,
      taskId: parseInt(taskId),
      projectId: parseInt(projectId),
      startTime: new Date().toISOString(),
      elapsedTime: 0,
      description
    }
    
    return { ...activeTimer }
  },

  async stopTimer() {
    await delay(200)
    if (!activeTimer.isRunning) {
      throw new Error("No active timer running")
    }
    
    const endTime = new Date().toISOString()
    const startTime = new Date(activeTimer.startTime)
    const duration = Math.floor((new Date(endTime) - startTime) / 1000) + activeTimer.elapsedTime
    
    // Create time entry from timer
    const timeEntry = await this.create({
      taskId: activeTimer.taskId,
      projectId: activeTimer.projectId,
      duration,
      description: activeTimer.description,
      startTime: activeTimer.startTime,
      endTime,
      isManual: false
    })
    
    // Reset timer
    activeTimer = {
      isRunning: false,
      taskId: null,
      projectId: null,
      startTime: null,
      elapsedTime: 0,
      description: ""
    }
    
    return { timeEntry, timer: { ...activeTimer } }
  },

  async pauseTimer() {
    await delay(150)
    if (!activeTimer.isRunning) {
      throw new Error("No active timer running")
    }
    
    const now = new Date()
    const startTime = new Date(activeTimer.startTime)
    const sessionDuration = Math.floor((now - startTime) / 1000)
    
    activeTimer.elapsedTime += sessionDuration
    activeTimer.isRunning = false
    activeTimer.startTime = null
    
    return { ...activeTimer }
  },

  async resumeTimer() {
    await delay(150)
    if (activeTimer.isRunning) {
      throw new Error("Timer is already running")
    }
    
    if (!activeTimer.taskId) {
      throw new Error("No timer to resume")
    }
    
    activeTimer.isRunning = true
    activeTimer.startTime = new Date().toISOString()
    
    return { ...activeTimer }
  },

  async resetTimer() {
    await delay(100)
    activeTimer = {
      isRunning: false,
      taskId: null,
      projectId: null,
      startTime: null,
      elapsedTime: 0,
      description: ""
    }
    
    return { ...activeTimer }
  },

  // Utility functions
  async getTotalTimeForTask(taskId) {
    await delay(150)
    const taskEntries = timeEntries.filter(e => e.taskId === parseInt(taskId))
    return taskEntries.reduce((total, entry) => total + entry.duration, 0)
  },

  async getTotalTimeForProject(projectId) {
    await delay(150)
    const projectEntries = timeEntries.filter(e => e.projectId === parseInt(projectId))
    return projectEntries.reduce((total, entry) => total + entry.duration, 0)
  },

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  },

  formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}