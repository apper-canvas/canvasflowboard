const { ApperClient } = window.ApperSDK

// Active timer state (local storage for session persistence)
let activeTimer = {
  isRunning: false,
  taskId: null,
  projectId: null,
  startTime: null,
  elapsedTime: 0,
  description: ""
}

export const timeTrackingService = {
  async getAll() {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "start_time_c" } },
          { field: { Name: "end_time_c" } },
          { field: { Name: "is_manual_c" } },
          { field: { Name: "billable_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "task_id_c" } },
          { field: { Name: "project_id_c" } }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
        pagingInfo: { limit: 500, offset: 0 }
      }
      
      const response = await apperClient.fetchRecords('time_entry_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      return response.data.map(entry => ({
        Id: entry.Id,
        taskId: entry.task_id_c?.Id || entry.task_id_c,
        projectId: entry.project_id_c?.Id || entry.project_id_c,
        duration: entry.duration_c || 0,
        description: entry.description_c || '',
        date: entry.date_c,
        startTime: entry.start_time_c,
        endTime: entry.end_time_c,
        isManual: entry.is_manual_c || false,
        billable: entry.billable_c || false,
        createdAt: entry.created_at_c || entry.CreatedOn
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching time entries:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching time entries:", error.message)
        throw error
      }
    }
  },

  async getById(id) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "duration_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "start_time_c" } },
          { field: { Name: "end_time_c" } },
          { field: { Name: "is_manual_c" } },
          { field: { Name: "billable_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "task_id_c" } },
          { field: { Name: "project_id_c" } }
        ]
      }
      
      const response = await apperClient.getRecordById('time_entry_c', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error("Time entry not found")
      }
      
      const entry = response.data
      return {
        Id: entry.Id,
        taskId: entry.task_id_c?.Id || entry.task_id_c,
        projectId: entry.project_id_c?.Id || entry.project_id_c,
        duration: entry.duration_c || 0,
        description: entry.description_c || '',
        date: entry.date_c,
        startTime: entry.start_time_c,
        endTime: entry.end_time_c,
        isManual: entry.is_manual_c || false,
        billable: entry.billable_c || false,
        createdAt: entry.created_at_c || entry.CreatedOn
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching time entry with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching time entry with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async create(entryData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const now = new Date().toISOString()
      
      const params = {
        records: [{
          Name: entryData.description || 'Time Entry',
          task_id_c: parseInt(entryData.taskId),
          project_id_c: parseInt(entryData.projectId),
          duration_c: parseInt(entryData.duration),
          description_c: entryData.description,
          date_c: entryData.date || new Date().toISOString().split('T')[0],
          start_time_c: entryData.startTime,
          end_time_c: entryData.endTime,
          is_manual_c: entryData.isManual !== undefined ? entryData.isManual : true,
          billable_c: entryData.billable !== undefined ? entryData.billable : true,
          created_at_c: now
        }]
      }
      
      const response = await apperClient.createRecord('time_entry_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create time entries ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const newEntry = successfulRecords[0].data
        return {
          Id: newEntry.Id,
          taskId: newEntry.task_id_c?.Id || newEntry.task_id_c,
          projectId: newEntry.project_id_c?.Id || newEntry.project_id_c,
          duration: newEntry.duration_c || 0,
          description: newEntry.description_c || '',
          date: newEntry.date_c,
          startTime: newEntry.start_time_c,
          endTime: newEntry.end_time_c,
          isManual: newEntry.is_manual_c || false,
          billable: newEntry.billable_c || false,
          createdAt: newEntry.created_at_c || newEntry.CreatedOn
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating time entry:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating time entry:", error.message)
        throw error
      }
    }
  },

  async update(id, entryData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const updateData = {
        Id: parseInt(id)
      }
      
      // Only include updateable fields that were provided
      if (entryData.taskId !== undefined) {
        updateData.task_id_c = parseInt(entryData.taskId)
      }
      if (entryData.projectId !== undefined) {
        updateData.project_id_c = parseInt(entryData.projectId)
      }
      if (entryData.duration !== undefined) {
        updateData.duration_c = parseInt(entryData.duration)
      }
      if (entryData.description !== undefined) {
        updateData.Name = entryData.description || 'Time Entry'
        updateData.description_c = entryData.description
      }
      if (entryData.date !== undefined) {
        updateData.date_c = entryData.date
      }
      if (entryData.startTime !== undefined) {
        updateData.start_time_c = entryData.startTime
      }
      if (entryData.endTime !== undefined) {
        updateData.end_time_c = entryData.endTime
      }
      if (entryData.isManual !== undefined) {
        updateData.is_manual_c = entryData.isManual
      }
      if (entryData.billable !== undefined) {
        updateData.billable_c = entryData.billable
      }
      
      const params = {
        records: [updateData]
      }
      
      const response = await apperClient.updateRecord('time_entry_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update time entries ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const updatedEntry = successfulUpdates[0].data
        return {
          Id: updatedEntry.Id,
          taskId: updatedEntry.task_id_c?.Id || updatedEntry.task_id_c,
          projectId: updatedEntry.project_id_c?.Id || updatedEntry.project_id_c,
          duration: updatedEntry.duration_c || 0,
          description: updatedEntry.description_c || '',
          date: updatedEntry.date_c,
          startTime: updatedEntry.start_time_c,
          endTime: updatedEntry.end_time_c,
          isManual: updatedEntry.is_manual_c || false,
          billable: updatedEntry.billable_c || false,
          createdAt: updatedEntry.created_at_c || updatedEntry.CreatedOn
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating time entry:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating time entry:", error.message)
        throw error
      }
    }
  },

  async delete(id) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await apperClient.deleteRecord('time_entry_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete time entries ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting time entry:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting time entry:", error.message)
        throw error
      }
    }
  },

  // Timer management (local state)
  async getActiveTimer() {
    return { ...activeTimer }
  },

  async startTimer(taskId, projectId, description = "") {
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

  async getRecentTasks() {
    // Get tasks that have recent time entries
    try {
      const [tasks, entries] = await Promise.all([
        this.getAll(),
        this.getTodayEntries()
      ])
      
      const recentTaskIds = [...new Set(entries.map(entry => entry.taskId))]
      const { taskService } = await import('./taskService.js')
      const { projectService } = await import('./projectService.js')
      
      const allTasks = await taskService.getAll()
      const projects = await projectService.getAll()
      
      return recentTaskIds
        .map(taskId => {
          const task = allTasks.find(t => t.Id === taskId)
          const project = projects.find(p => p.Id === task?.projectId)
          return task ? { ...task, projectName: project?.name || 'Unknown Project' } : null
        })
        .filter(Boolean)
        .slice(0, 10) // Limit to 10 recent tasks
    } catch (error) {
      console.error('Failed to load recent tasks:', error)
      return []
    }
  },

  async getTodayEntries() {
    const today = new Date().toISOString().split('T')[0]
    const entries = await this.getAll()
    return entries.filter(e => e.date === today)
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