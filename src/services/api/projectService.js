const { ApperClient } = window.ApperSDK

export const projectService = {
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
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "progress_c" } }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
        pagingInfo: { limit: 100, offset: 0 }
      }
      
      const response = await apperClient.fetchRecords('project_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      return response.data.map(project => ({
        Id: project.Id,
        name: project.Name,
        description: project.description_c || '',
        status: project.status_c || 'Planning',
        deadline: project.deadline_c,
        progress: project.progress_c || 0,
        createdAt: project.created_at_c || project.CreatedOn
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching projects:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching projects:", error.message)
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
          { field: { Name: "description_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "progress_c" } }
        ]
      }
      
      const response = await apperClient.getRecordById('project_c', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error("Project not found")
      }
      
      const project = response.data
      return {
        Id: project.Id,
        name: project.Name,
        description: project.description_c || '',
        status: project.status_c || 'Planning',
        deadline: project.deadline_c,
        progress: project.progress_c || 0,
        createdAt: project.created_at_c || project.CreatedOn
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching project with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching project with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async create(projectData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        records: [{
          Name: projectData.name,
          description_c: projectData.description,
          status_c: projectData.status,
          deadline_c: projectData.deadline,
          progress_c: parseInt(projectData.progress) || 0,
          created_at_c: new Date().toISOString()
        }]
      }
      
      const response = await apperClient.createRecord('project_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create projects ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const newProject = successfulRecords[0].data
        return {
          Id: newProject.Id,
          name: newProject.Name,
          description: newProject.description_c || '',
          status: newProject.status_c || 'Planning',
          deadline: newProject.deadline_c,
          progress: newProject.progress_c || 0,
          createdAt: newProject.created_at_c || newProject.CreatedOn
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating project:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating project:", error.message)
        throw error
      }
    }
  },

  async update(id, projectData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: projectData.name,
          description_c: projectData.description,
          status_c: projectData.status,
          deadline_c: projectData.deadline,
          progress_c: parseInt(projectData.progress) || 0
        }]
      }
      
      const response = await apperClient.updateRecord('project_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update projects ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const updatedProject = successfulUpdates[0].data
        return {
          Id: updatedProject.Id,
          name: updatedProject.Name,
          description: updatedProject.description_c || '',
          status: updatedProject.status_c || 'Planning',
          deadline: updatedProject.deadline_c,
          progress: updatedProject.progress_c || 0,
          createdAt: updatedProject.created_at_c || updatedProject.CreatedOn
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating project:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating project:", error.message)
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
      
      const response = await apperClient.deleteRecord('project_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete projects ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting project:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting project:", error.message)
        throw error
      }
    }
  }
}