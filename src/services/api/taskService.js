const { ApperClient } = window.ApperSDK

export const taskService = {
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
          { field: { Name: "project_id_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "blocked_by_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "status_history_c" } },
          { field: { Name: "last_updated_c" } },
          { field: { Name: "parent_id_c" } }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
        pagingInfo: { limit: 500, offset: 0 }
      }
      
      const response = await apperClient.fetchRecords('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      return response.data.map(task => ({
        Id: task.Id,
        projectId: task.project_id_c?.Id || task.project_id_c,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        priority: task.priority_c || 'Medium',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        createdAt: task.created_at_c || task.CreatedOn,
        blockedBy: task.blocked_by_c ? task.blocked_by_c.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : null,
        status: task.status_c || (task.completed_c ? 'Done' : 'To Do'),
        statusHistory: task.status_history_c ? JSON.parse(task.status_history_c) : [],
        lastUpdated: task.last_updated_c || task.ModifiedOn || task.CreatedOn,
        parentId: task.parent_id_c?.Id || task.parent_id_c || null
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching tasks:", error.message)
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
          { field: { Name: "project_id_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "blocked_by_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "status_history_c" } },
          { field: { Name: "last_updated_c" } },
          { field: { Name: "parent_id_c" } }
        ]
      }
      
      const response = await apperClient.getRecordById('task_c', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error("Task not found")
      }
      
      const task = response.data
      return {
        Id: task.Id,
        projectId: task.project_id_c?.Id || task.project_id_c,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        priority: task.priority_c || 'Medium',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        createdAt: task.created_at_c || task.CreatedOn,
        blockedBy: task.blocked_by_c ? task.blocked_by_c.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : null,
        status: task.status_c || (task.completed_c ? 'Done' : 'To Do'),
        statusHistory: task.status_history_c ? JSON.parse(task.status_history_c) : [],
        lastUpdated: task.last_updated_c || task.ModifiedOn || task.CreatedOn,
        parentId: task.parent_id_c?.Id || task.parent_id_c || null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching task with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async getByProjectId(projectId) {
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
          { field: { Name: "project_id_c" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "due_date_c" } },
          { field: { Name: "completed_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "blocked_by_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "status_history_c" } },
          { field: { Name: "last_updated_c" } },
          { field: { Name: "parent_id_c" } }
        ],
        where: [
          {
            FieldName: "project_id_c",
            Operator: "EqualTo",
            Values: [parseInt(projectId)]
          }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
        pagingInfo: { limit: 500, offset: 0 }
      }
      
      const response = await apperClient.fetchRecords('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      return response.data.map(task => ({
        Id: task.Id,
        projectId: task.project_id_c?.Id || task.project_id_c,
        title: task.title_c || task.Name,
        description: task.description_c || '',
        priority: task.priority_c || 'Medium',
        dueDate: task.due_date_c,
        completed: task.completed_c || false,
        createdAt: task.created_at_c || task.CreatedOn,
        blockedBy: task.blocked_by_c ? task.blocked_by_c.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : null,
        status: task.status_c || (task.completed_c ? 'Done' : 'To Do'),
        statusHistory: task.status_history_c ? JSON.parse(task.status_history_c) : [],
        lastUpdated: task.last_updated_c || task.ModifiedOn || task.CreatedOn,
        parentId: task.parent_id_c?.Id || task.parent_id_c || null
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching tasks for project ${projectId}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching tasks for project ${projectId}:`, error.message)
        throw error
      }
    }
  },

  async create(taskData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const now = new Date().toISOString()
      const status = taskData.status || 'To Do'
      
      const params = {
        records: [{
          Name: taskData.title,
          project_id_c: parseInt(taskData.projectId),
          title_c: taskData.title,
          description_c: taskData.description,
          priority_c: taskData.priority,
          due_date_c: taskData.dueDate,
          completed_c: taskData.completed || false,
          created_at_c: now,
          blocked_by_c: taskData.blockedBy && taskData.blockedBy.length > 0 ? taskData.blockedBy.join(',') : null,
          status_c: status,
          status_history_c: JSON.stringify([{ status, timestamp: now }]),
          last_updated_c: now,
          parent_id_c: taskData.parentId ? parseInt(taskData.parentId) : null
        }]
      }
      
      const response = await apperClient.createRecord('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create tasks ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const newTask = successfulRecords[0].data
        return {
          Id: newTask.Id,
          projectId: newTask.project_id_c?.Id || newTask.project_id_c,
          title: newTask.title_c || newTask.Name,
          description: newTask.description_c || '',
          priority: newTask.priority_c || 'Medium',
          dueDate: newTask.due_date_c,
          completed: newTask.completed_c || false,
          createdAt: newTask.created_at_c || newTask.CreatedOn,
          blockedBy: newTask.blocked_by_c ? newTask.blocked_by_c.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : null,
          status: newTask.status_c || status,
          statusHistory: newTask.status_history_c ? JSON.parse(newTask.status_history_c) : [],
          lastUpdated: newTask.last_updated_c || newTask.CreatedOn,
          parentId: newTask.parent_id_c?.Id || newTask.parent_id_c || null
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating task:", error.message)
        throw error
      }
    }
  },

  async createSubtask(parentId, taskData) {
    return this.create({
      ...taskData,
      parentId: parseInt(parentId)
    })
  },

  async update(id, taskData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const now = new Date().toISOString()
      const updateData = {
        Id: parseInt(id),
        last_updated_c: now
      }
      
      // Only include updateable fields that were provided
      if (taskData.title !== undefined) {
        updateData.Name = taskData.title
        updateData.title_c = taskData.title
      }
      if (taskData.description !== undefined) {
        updateData.description_c = taskData.description
      }
      if (taskData.priority !== undefined) {
        updateData.priority_c = taskData.priority
      }
      if (taskData.dueDate !== undefined) {
        updateData.due_date_c = taskData.dueDate
      }
      if (taskData.completed !== undefined) {
        updateData.completed_c = taskData.completed
      }
      if (taskData.projectId !== undefined) {
        updateData.project_id_c = parseInt(taskData.projectId)
      }
      if (taskData.parentId !== undefined) {
        updateData.parent_id_c = taskData.parentId ? parseInt(taskData.parentId) : null
      }
      if (taskData.blockedBy !== undefined) {
        updateData.blocked_by_c = taskData.blockedBy && taskData.blockedBy.length > 0 ? taskData.blockedBy.join(',') : null
      }
      if (taskData.status !== undefined) {
        updateData.status_c = taskData.status
        updateData.completed_c = taskData.status === 'Done'
      }
      
      const params = {
        records: [updateData]
      }
      
      const response = await apperClient.updateRecord('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update tasks ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const updatedTask = successfulUpdates[0].data
        return {
          Id: updatedTask.Id,
          projectId: updatedTask.project_id_c?.Id || updatedTask.project_id_c,
          title: updatedTask.title_c || updatedTask.Name,
          description: updatedTask.description_c || '',
          priority: updatedTask.priority_c || 'Medium',
          dueDate: updatedTask.due_date_c,
          completed: updatedTask.completed_c || false,
          createdAt: updatedTask.created_at_c || updatedTask.CreatedOn,
          blockedBy: updatedTask.blocked_by_c ? updatedTask.blocked_by_c.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : null,
          status: updatedTask.status_c || (updatedTask.completed_c ? 'Done' : 'To Do'),
          statusHistory: updatedTask.status_history_c ? JSON.parse(updatedTask.status_history_c) : [],
          lastUpdated: updatedTask.last_updated_c || updatedTask.ModifiedOn,
          parentId: updatedTask.parent_id_c?.Id || updatedTask.parent_id_c || null
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating task:", error.message)
        throw error
      }
    }
  },

  async updateStatus(id, status) {
    return this.update(id, { status, completed: status === 'Done' })
  },

  async toggleComplete(id) {
    try {
      // First get the current task to determine new status
      const currentTask = await this.getById(id)
      const newStatus = currentTask.completed ? 'To Do' : 'Done'
      
      return this.update(id, {
        status: newStatus,
        completed: !currentTask.completed
      })
    } catch (error) {
      console.error("Error toggling task completion:", error.message)
      throw error
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
      
      const response = await apperClient.deleteRecord('task_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete tasks ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting task:", error.message)
        throw error
      }
    }
  },

  async quickUpdateTitle(id, title) {
    return this.update(id, { title })
  },

  async quickUpdateDueDate(id, dueDate) {
    return this.update(id, { dueDate })
}
}