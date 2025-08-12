import React, { useState, useEffect } from "react"
import Header from "@/components/organisms/Header"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { projectService } from "@/services/api/projectService"
import { taskService } from "@/services/api/taskService"

const TimeTracking = () => {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedTask, setSelectedTask] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [description, setDescription] = useState("")
  
  // Mock time entries for demonstration
  const [timeEntries] = useState([
    {
      id: 1,
      projectName: "Website Redesign",
      taskName: "Design new homepage layout",
      duration: 3600, // 1 hour in seconds
      description: "Working on wireframes and mockups",
      date: "2024-01-25"
    },
    {
      id: 2,
      projectName: "Mobile App Development",
      taskName: "Research cross-platform frameworks",
      duration: 7200, // 2 hours in seconds
      description: "Comparing React Native vs Flutter",
      date: "2024-01-24"
    },
    {
      id: 3,
      projectName: "Marketing Campaign Q1",
      taskName: "Create social media content",
      duration: 5400, // 1.5 hours in seconds
      description: "Designing posts for Instagram and Facebook",
      date: "2024-01-23"
    }
  ])
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, tasksData] = await Promise.all([
          projectService.getAll(),
          taskService.getAll()
        ])
        setProjects(projectsData)
        setTasks(tasksData)
      } catch (err) {
        console.error("Failed to load data:", err)
      }
    }
    
    loadData()
  }, [])
  
  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setTime(time => time + 1)
      }, 1000)
    } else if (!isRunning && time !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isRunning, time])
  
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  const handleStart = () => {
    if (selectedProject && selectedTask) {
      setIsRunning(true)
    }
  }
  
  const handleStop = () => {
    setIsRunning(false)
  }
  
  const handleReset = () => {
    setTime(0)
    setIsRunning(false)
  }
  
  const filteredTasks = tasks.filter(task => 
    task.projectId === parseInt(selectedProject)
  )
  
  const getSelectedProjectName = () => {
    const project = projects.find(p => p.Id === parseInt(selectedProject))
    return project?.name || ""
  }
  
  const getSelectedTaskName = () => {
    const task = tasks.find(t => t.Id === parseInt(selectedTask))
    return task?.title || ""
  }
  
  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0)
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Time Tracking" 
        subtitle="Track time spent on projects and tasks"
      />
      
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Timer */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 font-display">Timer</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Project
                  </label>
                  <Select
                    value={selectedProject}
                    onChange={(e) => {
                      setSelectedProject(e.target.value)
                      setSelectedTask("")
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
                    Task
                  </label>
                  <Select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    disabled={!selectedProject}
                  >
                    <option value="">Select a task</option>
                    {filteredTasks.map(task => (
                      <option key={task.Id} value={task.Id}>
                        {task.title}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="bg-slate-50 rounded-lg p-8 mb-6">
                  <div className="text-4xl font-mono font-bold text-slate-900 mb-2">
                    {formatTime(time)}
                  </div>
                  {selectedProject && selectedTask && (
                    <div className="text-sm text-slate-600">
                      <p className="font-medium">{getSelectedProjectName()}</p>
                      <p>{getSelectedTaskName()}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-3">
                  {!isRunning ? (
                    <Button 
                      onClick={handleStart}
                      disabled={!selectedProject || !selectedTask}
                      className="flex-1"
                    >
                      <ApperIcon name="Play" className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={handleStop} variant="danger" className="flex-1">
                      <ApperIcon name="Pause" className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="secondary">
                    <ApperIcon name="RotateCcw" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Time Entries */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 shadow-card">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 font-display">Recent Time Entries</h2>
                  <div className="text-sm text-slate-600">
                    Total: <span className="font-semibold">{formatDuration(getTotalTime())}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {timeEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <ApperIcon name="Clock" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">No time entries yet</p>
                    <p className="text-sm text-slate-400">Start tracking time to see your entries here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="primary">{formatDuration(entry.duration)}</Badge>
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <ApperIcon name="Edit" className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
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
        </div>
      </div>
    </div>
  )
}

export default TimeTracking