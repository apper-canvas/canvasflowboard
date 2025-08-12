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
    description: "",
    billable: true
  })
  const [editingEntry, setEditingEntry] = useState(null)
  
  // Quick time entry state
  const [showQuickEntry, setShowQuickEntry] = useState(false)
  const [quickEntryData, setQuickEntryData] = useState({
    taskId: "",
    hours: "",
    minutes: "",
    description: "",
    billable: true
  })
  const [recentTasks, setRecentTasks] = useState([])
  
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
  
  // Filter time entries to show today's entries by default
  const todayEntries = timeEntries.filter(entry => {
    const today = new Date().toISOString().split('T')[0]
    return entry.date === today
  })
  
  // Get recent tasks for quick entry
  const loadRecentTasks = async () => {
    try {
      const recent = await timeTrackingService.getRecentTasks()
      setRecentTasks(recent)
    } catch (err) {
      console.error('Failed to load recent tasks:', err)
    }
  }
  
  // Handle quick time entry submission
  const handleQuickTimeEntry = async () => {
    if (!quickEntryData.taskId || (!quickEntryData.hours && !quickEntryData.minutes)) {
      toast.error("Please select a task and enter time")
      return
    }
    
    const hours = parseInt(quickEntryData.hours) || 0
    const minutes = parseInt(quickEntryData.minutes) || 0
    const totalMinutes = (hours * 60) + minutes
    
    if (totalMinutes <= 0) {
      toast.error("Please enter a valid time duration")
      return
    }
    
    try {
      const selectedTask = recentTasks.find(task => task.Id === parseInt(quickEntryData.taskId))
      
      const entryData = {
        taskId: parseInt(quickEntryData.taskId),
        projectId: selectedTask.projectId,
        duration: totalMinutes * 60, // Convert to seconds
        description: quickEntryData.description,
        date: new Date().toISOString().split('T')[0],
        billable: quickEntryData.billable,
        isManual: true
      }
      
      const newEntry = await timeTrackingService.create(entryData)
      const enrichedEntry = enrichTimeEntries([newEntry], tasks, projects)[0]
      setTimeEntries(prev => [enrichedEntry, ...prev])
      
      // Reset quick entry form
      setQuickEntryData({
        taskId: "",
        hours: "",
        minutes: "",
        description: "",
        billable: true
      })
      setShowQuickEntry(false)
      
      toast.success("Time entry logged successfully")
    } catch (err) {
      toast.error(err.message || "Failed to create time entry")
    }
  }
  
  const handleOpenModal = (entry = null) => {
if (entry) {
      setEditingEntry(entry)
      setFormData({
        projectId: entry.projectId.toString(),
        taskId: entry.taskId.toString(),
        date: entry.date,
        hours: Math.floor(entry.duration / 3600).toString(),
        minutes: Math.floor((entry.duration % 3600) / 60).toString(),
        description: entry.description || "",
        billable: entry.billable !== undefined ? entry.billable : true
      })
    } else {
      setEditingEntry(null)
      setFormData({
        projectId: "",
        taskId: "",
        date: new Date().toISOString().split('T')[0],
        hours: "",
        minutes: "",
        description: "",
        billable: true
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
          description: formData.description,
          billable: formData.billable
        })
        toast.success("Time entry updated successfully")
      } else {
        await timeTrackingService.create({
          projectId: formData.projectId,
          taskId: formData.taskId,
          date: formData.date,
          duration,
          description: formData.description,
          billable: formData.billable
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
  
  // Load recent tasks when component mounts
  useEffect(() => {
    loadRecentTasks()
  }, [timeEntries]) // Reload when time entries change
  
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
        
        {/* Quick Time Entry */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ApperIcon name="Zap" className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-slate-900 font-display">Quick Time Entry</h2>
                <Badge variant="secondary" className="text-xs">Recent Tasks</Badge>
              </div>
              <Button
                onClick={() => setShowQuickEntry(!showQuickEntry)}
                variant="ghost"
                className="text-sm"
              >
                <ApperIcon 
                  name={showQuickEntry ? "ChevronUp" : "ChevronDown"} 
                  className="w-4 h-4" 
                />
              </Button>
            </div>
          </div>
          
          {showQuickEntry && (
            <div className="p-6 bg-slate-50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Task Selection */}
                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Recent Task
                  </label>
                  <Select
                    value={quickEntryData.taskId}
                    onChange={(e) => setQuickEntryData(prev => ({ ...prev, taskId: e.target.value }))}
                    className="w-full"
                  >
                    <option value="">Select a recent task...</option>
                    {recentTasks.map(task => (
                      <option key={task.Id} value={task.Id}>
                        {task.projectTitle} - {task.title}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {/* Time Input */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time Spent
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="23"
                        value={quickEntryData.hours}
                        onChange={(e) => setQuickEntryData(prev => ({ ...prev, hours: e.target.value }))}
                        className="text-center"
                      />
                      <span className="text-xs text-slate-500 mt-1 block text-center">hrs</span>
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="59"
                        value={quickEntryData.minutes}
                        onChange={(e) => setQuickEntryData(prev => ({ ...prev, minutes: e.target.value }))}
                        className="text-center"
                      />
                      <span className="text-xs text-slate-500 mt-1 block text-center">min</span>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <Input
                    placeholder="What did you work on?"
                    value={quickEntryData.description}
                    onChange={(e) => setQuickEntryData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                {/* Submit Button */}
                <div className="lg:col-span-1 flex items-end">
                  <Button
                    onClick={handleQuickTimeEntry}
                    className="w-full"
                    disabled={!quickEntryData.taskId || (!quickEntryData.hours && !quickEntryData.minutes)}
                  >
                    <ApperIcon name="Plus" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Billable Toggle */}
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quick-billable"
                  checked={quickEntryData.billable}
                  onChange={(e) => setQuickEntryData(prev => ({ ...prev, billable: e.target.checked }))}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="quick-billable" className="text-sm text-slate-700">
                  Billable time
                </label>
              </div>
            </div>
          )}
        </div>

{/* Today's Time Log */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-card">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 font-display">Today's Time Log</h2>
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
            {todayEntries.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="Clock" className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No time logged today</h3>
                <p className="text-slate-500 mb-4">Use the quick entry form above or start tracking time to see your entries here</p>
                <Button onClick={() => setShowQuickEntry(true)}>
                  <ApperIcon name="Zap" className="w-4 h-4 mr-2" />
                  Quick Log Time
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {todayEntries.map((entry) => (
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
                        {entry.billable !== undefined && (
                          <Badge variant={entry.billable ? "default" : "secondary"} className="text-xs">
                            {entry.billable ? "Billable" : "Non-billable"}
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
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="billable" className="text-sm font-medium text-slate-700">
              Billable hours
            </label>
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