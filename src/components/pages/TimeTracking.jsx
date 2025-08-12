import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Header from "@/components/organisms/Header"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Input from "@/components/atoms/Input"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import Modal from "@/components/molecules/Modal"
import { projectService } from "@/services/api/projectService"
import { taskService } from "@/services/api/taskService"
import { timeTrackingService } from "@/services/api/timeTrackingService"
const TimeTracking = () => {
const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [timeEntries, setTimeEntries] = useState([])
  const [timer, setTimer] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Manual entry form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    projectId: "",
    taskId: "",
    date: new Date().toISOString().split('T')[0],
    hours: "",
    minutes: "",
    description: ""
  })
  const [editingEntry, setEditingEntry] = useState(null)
  
useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [projectsData, tasksData, entriesData, activeTimer] = await Promise.all([
          projectService.getAll(),
          taskService.getAll(),
          timeTrackingService.getAll(),
          timeTrackingService.getActiveTimer()
        ])
        setProjects(projectsData)
        setTasks(tasksData)
        setTimeEntries(enrichTimeEntries(entriesData, tasksData, projectsData))
        setTimer(activeTimer)
      } catch (err) {
        console.error("Failed to load data:", err)
        toast.error("Failed to load time tracking data")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  useEffect(() => {
    let interval = null
    if (timer?.isRunning) {
      interval = setInterval(() => {
        const now = new Date()
        const startTime = new Date(timer.startTime)
        const sessionTime = Math.floor((now - startTime) / 1000)
        setCurrentTime(timer.elapsedTime + sessionTime)
      }, 1000)
    } else {
      setCurrentTime(timer?.elapsedTime || 0)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])
  
const enrichTimeEntries = (entries, tasksData, projectsData) => {
    return entries.map(entry => {
      const task = tasksData.find(t => t.Id === entry.taskId)
      const project = projectsData.find(p => p.Id === entry.projectId)
      return {
        ...entry,
        taskName: task?.title || "Unknown Task",
        projectName: project?.name || "Unknown Project"
      }
    })
  }
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0)
  }
  
  const getTodayTime = () => {
    const today = new Date().toISOString().split('T')[0]
    return timeEntries
      .filter(entry => entry.date === today)
      .reduce((total, entry) => total + entry.duration, 0)
  }
  
  const filteredTasks = tasks.filter(task => 
    task.projectId === parseInt(formData.projectId)
  )
  
  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry)
      setFormData({
        projectId: entry.projectId.toString(),
        taskId: entry.taskId.toString(),
        date: entry.date,
        hours: Math.floor(entry.duration / 3600).toString(),
        minutes: Math.floor((entry.duration % 3600) / 60).toString(),
        description: entry.description || ""
      })
    } else {
      setEditingEntry(null)
      setFormData({
        projectId: "",
        taskId: "",
        date: new Date().toISOString().split('T')[0],
        hours: "",
        minutes: "",
        description: ""
      })
    }
    setIsModalOpen(true)
  }
  
  const handleSubmitEntry = async () => {
    if (!formData.projectId || !formData.taskId || (!formData.hours && !formData.minutes)) {
      toast.error("Please fill in all required fields")
      return
    }
    
    const duration = (parseInt(formData.hours || 0) * 3600) + (parseInt(formData.minutes || 0) * 60)
    
    try {
      if (editingEntry) {
        await timeTrackingService.update(editingEntry.Id, {
          projectId: formData.projectId,
          taskId: formData.taskId,
          date: formData.date,
          duration,
          description: formData.description
        })
        toast.success("Time entry updated successfully")
      } else {
        await timeTrackingService.create({
          projectId: formData.projectId,
          taskId: formData.taskId,
          date: formData.date,
          duration,
          description: formData.description
        })
        toast.success("Time entry logged successfully")
      }
      
      // Refresh data
      const [entriesData] = await Promise.all([
        timeTrackingService.getAll()
      ])
      setTimeEntries(enrichTimeEntries(entriesData, tasks, projects))
      setIsModalOpen(false)
    } catch (err) {
      toast.error(err.message || "Failed to save time entry")
    }
  }
  
  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this time entry?")) {
      return
    }
    
    try {
      await timeTrackingService.delete(entryId)
      setTimeEntries(prev => prev.filter(entry => entry.Id !== entryId))
      toast.success("Time entry deleted successfully")
    } catch (err) {
      toast.error(err.message || "Failed to delete time entry")
    }
  }
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header 
          title="Time Tracking" 
          subtitle="Track time spent on projects and tasks"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ApperIcon name="Clock" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500">Loading time tracking data...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
<div className="flex-1 flex flex-col">
      <Header 
        title="Time Tracking" 
        subtitle="Track time spent on projects and tasks"
        action={
          <Button onClick={() => handleOpenModal()}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Log Time
          </Button>
        }
      />
      
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Today's Summary */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900 font-display">Today</h3>
              <ApperIcon name="Calendar" className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-primary-600">
              {formatDuration(getTodayTime())}
            </div>
            <p className="text-sm text-slate-600">Total time logged</p>
          </div>
          
          {/* Active Timer Status */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900 font-display">Active Timer</h3>
              <ApperIcon name="Clock" className="w-5 h-5 text-slate-500" />
            </div>
            {timer?.isRunning ? (
              <>
                <div className="text-2xl font-bold text-green-600 font-mono">
                  {formatTime(currentTime)}
                </div>
                <p className="text-sm text-slate-600">Currently running</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-400">
                  00:00:00
                </div>
                <p className="text-sm text-slate-600">No active timer</p>
              </>
            )}
          </div>
          
          {/* Total Time */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900 font-display">Total</h3>
              <ApperIcon name="BarChart3" className="w-5 h-5 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatDuration(getTotalTime())}
            </div>
            <p className="text-sm text-slate-600">All time logged</p>
          </div>
        </div>
        
        {/* Time Entries */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 font-display">Recent Time Entries</h2>
              <Button
                onClick={() => handleOpenModal()}
                variant="secondary"
                className="text-sm"
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            {timeEntries.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="Clock" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No time entries yet</h3>
                <p className="text-slate-500 mb-4">Start tracking time to see your entries here</p>
                <Button onClick={() => handleOpenModal()}>
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Log Your First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {timeEntries.map((entry) => (
                  <div key={entry.Id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-slate-900">{entry.projectName}</h4>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 text-sm">{entry.taskName}</span>
                      </div>
                      {entry.description && (
                        <p className="text-sm text-slate-600 mb-2">{entry.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{entry.date}</span>
                        {!entry.isManual && (
                          <Badge variant="secondary" className="text-xs">
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant="primary" className="font-mono">
                        {formatDuration(entry.duration)}
                      </Badge>
                      <button 
                        onClick={() => handleOpenModal(entry)}
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEntry(entry.Id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? "Edit Time Entry" : "Log Time Manually"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Project *
              </label>
              <Select
                value={formData.projectId}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    projectId: e.target.value,
                    taskId: ""
                  }))
                }}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.Id} value={project.Id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Task *
              </label>
              <Select
                value={formData.taskId}
                onChange={(e) => setFormData(prev => ({ ...prev, taskId: e.target.value }))}
                disabled={!formData.projectId}
              >
                <option value="">Select a task</option>
                {filteredTasks.map(task => (
                  <option key={task.Id} value={task.Id}>
                    {task.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Date *
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Hours
              </label>
              <Input
                type="number"
                min="0"
                max="24"
                placeholder="0"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Minutes
              </label>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={formData.minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What did you work on?"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitEntry}>
              {editingEntry ? "Update Entry" : "Log Time"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TimeTracking