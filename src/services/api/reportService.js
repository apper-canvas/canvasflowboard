const { ApperClient } = window.ApperSDK

export const reportService = {
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
          { field: { Name: "report_type_c" } },
          { field: { Name: "data_source_c" } },
          { field: { Name: "filters_c" } },
          { field: { Name: "aggregations_c" } },
          { field: { Name: "calculations_c" } },
          { field: { Name: "display_format_c" } },
          { field: { Name: "schedule_c" } }
        ],
        orderBy: [{ fieldName: "CreatedOn", sorttype: "DESC" }],
        pagingInfo: { limit: 100, offset: 0 }
      }
      
      const response = await apperClient.fetchRecords('report_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data || response.data.length === 0) {
        return []
      }
      
      return response.data.map(report => ({
        Id: report.Id,
        name: report.Name,
        reportType: report.report_type_c || '',
        dataSource: report.data_source_c || '',
        filters: report.filters_c || '',
        aggregations: report.aggregations_c || '',
        calculations: report.calculations_c || '',
        displayFormat: report.display_format_c || '',
        schedule: report.schedule_c || '',
        createdOn: report.CreatedOn,
        modifiedOn: report.ModifiedOn
      }))
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching reports:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error fetching reports:", error.message)
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
          { field: { Name: "report_type_c" } },
          { field: { Name: "data_source_c" } },
          { field: { Name: "filters_c" } },
          { field: { Name: "aggregations_c" } },
          { field: { Name: "calculations_c" } },
          { field: { Name: "display_format_c" } },
          { field: { Name: "schedule_c" } }
        ]
      }
      
      const response = await apperClient.getRecordById('report_c', parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (!response.data) {
        throw new Error("Report not found")
      }
      
      const report = response.data
      return {
        Id: report.Id,
        name: report.Name,
        reportType: report.report_type_c || '',
        dataSource: report.data_source_c || '',
        filters: report.filters_c || '',
        aggregations: report.aggregations_c || '',
        calculations: report.calculations_c || '',
        displayFormat: report.display_format_c || '',
        schedule: report.schedule_c || '',
        createdOn: report.CreatedOn,
        modifiedOn: report.ModifiedOn
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching report with ID ${id}:`, error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error(`Error fetching report with ID ${id}:`, error.message)
        throw error
      }
    }
  },

  async create(reportData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        records: [{
          Name: reportData.name,
          report_type_c: reportData.reportType,
          data_source_c: reportData.dataSource,
          filters_c: reportData.filters,
          aggregations_c: reportData.aggregations,
          calculations_c: reportData.calculations,
          display_format_c: reportData.displayFormat,
          schedule_c: reportData.schedule
        }]
      }
      
      const response = await apperClient.createRecord('report_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create reports ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const newReport = successfulRecords[0].data
        return {
          Id: newReport.Id,
          name: newReport.Name,
          reportType: newReport.report_type_c || '',
          dataSource: newReport.data_source_c || '',
          filters: newReport.filters_c || '',
          aggregations: newReport.aggregations_c || '',
          calculations: newReport.calculations_c || '',
          displayFormat: newReport.display_format_c || '',
          schedule: newReport.schedule_c || '',
          createdOn: newReport.CreatedOn,
          modifiedOn: newReport.ModifiedOn
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating report:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error creating report:", error.message)
        throw error
      }
    }
  },

  async update(id, reportData) {
    try {
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: reportData.name,
          report_type_c: reportData.reportType,
          data_source_c: reportData.dataSource,
          filters_c: reportData.filters,
          aggregations_c: reportData.aggregations,
          calculations_c: reportData.calculations,
          display_format_c: reportData.displayFormat,
          schedule_c: reportData.schedule
        }]
      }
      
      const response = await apperClient.updateRecord('report_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update reports ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) throw new Error(record.message)
          })
        }
        
        const updatedReport = successfulUpdates[0].data
        return {
          Id: updatedReport.Id,
          name: updatedReport.Name,
          reportType: updatedReport.report_type_c || '',
          dataSource: updatedReport.data_source_c || '',
          filters: updatedReport.filters_c || '',
          aggregations: updatedReport.aggregations_c || '',
          calculations: updatedReport.calculations_c || '',
          displayFormat: updatedReport.display_format_c || '',
          schedule: updatedReport.schedule_c || '',
          createdOn: updatedReport.CreatedOn,
          modifiedOn: updatedReport.ModifiedOn
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating report:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error updating report:", error.message)
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
      
      const response = await apperClient.deleteRecord('report_c', params)
      
      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete reports ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting report:", error?.response?.data?.message)
        throw new Error(error.response.data.message)
      } else {
        console.error("Error deleting report:", error.message)
        throw error
      }
    }
  },

  async executeReport(reportId) {
    try {
      const report = await this.getById(reportId)
      
      // Import required services
      const { projectService } = await import('./projectService.js')
      const { taskService } = await import('./taskService.js')
      const { timeTrackingService } = await import('./timeTrackingService.js')
      
      let data = []
      let summary = {}
      
      // Execute report based on data source
      switch (report.dataSource.toLowerCase()) {
        case 'projects':
          data = await projectService.getAll()
          summary = {
            totalRecords: data.length,
            completedProjects: data.filter(p => p.status === 'Completed').length,
            activeProjects: data.filter(p => p.status === 'In Progress').length,
            averageProgress: data.reduce((sum, p) => sum + (p.progress || 0), 0) / data.length
          }
          break
          
        case 'tasks':
          data = await taskService.getAll()
          summary = {
            totalRecords: data.length,
            completedTasks: data.filter(t => t.completed).length,
            pendingTasks: data.filter(t => !t.completed).length,
            highPriorityTasks: data.filter(t => t.priority === 'High' || t.priority === 'Critical').length
          }
          break
          
        case 'time_entries':
          data = await timeTrackingService.getAll()
          const totalHours = data.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600
          summary = {
            totalRecords: data.length,
            totalHours: Math.round(totalHours * 100) / 100,
            billableHours: data.filter(t => t.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600,
            averageEntryDuration: totalHours / data.length || 0
          }
          break
          
        default:
          // Combined report with all data sources
          const [projects, tasks, timeEntries] = await Promise.all([
            projectService.getAll(),
            taskService.getAll(),
            timeTrackingService.getAll()
          ])
          
          data = {
            projects,
            tasks,
            timeEntries
          }
          
          summary = {
            totalProjects: projects.length,
            totalTasks: tasks.length,
            totalTimeEntries: timeEntries.length,
            completionRate: tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length * 100).toFixed(1) + '%' : '0%'
          }
      }
      
      return {
        report,
        data,
        summary,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error("Error executing report:", error.message)
      throw error
    }
  }
}