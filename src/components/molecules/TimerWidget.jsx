import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import Modal from "@/components/molecules/Modal"
import { timeTrackingService } from "@/services/api/timeTrackingService"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"

const TimerWidget = () => {
  const [timer, setTimer] = useState({
    isRunning: false,
    taskId: null,
    projectId: null,
    startTime: null,
    elapsedTime: 0,
    description: ""
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedTask, setSelectedTask] = useState("")
  const [description, setDescription] = useState("")
  const [taskInfo, setTaskInfo] = useState({ taskName: "", projectName: "" })
  const [loading, setLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, tasksData, activeTimer] = await Promise.all([
          projectService.getAll(),
          taskService.getAll(),
          timeTrackingService.getActiveTimer()
        ])
        setProjects(projectsData)
        setTasks(tasksData)
        setTimer(activeTimer)
        
        if (activeTimer.isRunning) {
          updateTaskInfo(activeTimer.taskId, activeTimer.projectId, tasksData, projectsData)
        }
      } catch (err) {
        console.error("Failed to load timer data:", err)
      }
    }
    
    loadData()
  }, [])

  // Timer tick effect
  useEffect(() => {
    let interval = null
    
    if (timer.isRunning) {
      interval = setInterval(() => {
        const now = new Date()
        const startTime = new Date(timer.startTime)
        const sessionTime = Math.floor((now - startTime) / 1000)
        setCurrentTime(timer.elapsedTime + sessionTime)
      }, 1000)
    } else {
      setCurrentTime(timer.elapsedTime)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const updateTaskInfo = (taskId, projectId, tasksData = tasks, projectsData = projects) => {
    const task = tasksData.find(t => t.Id === parseInt(taskId))
    const project = projectsData.find(p => p.Id === parseInt(projectId))
    setTaskInfo({
      taskName: task?.title || "",
      projectName: project?.name || ""
    })
  }

  const handleStartTimer = async () => {
    if (!selectedProject || !selectedTask) {
      toast.error("Please select a project and task")
      return
    }
    
    setLoading(true)
    try {
      const activeTimer = await timeTrackingService.startTimer(
        selectedTask,
        selectedProject,
        description
      )
      setTimer(activeTimer)
      updateTaskInfo(selectedTask, selectedProject)
      setIsModalOpen(false)
      setSelectedProject("")
      setSelectedTask("")
      setDescription("")
      toast.success("Timer started!")
    } catch (err) {
      toast.error(err.message || "Failed to start timer")
    } finally {
      setLoading(false)
    }
  }

  const handleStopTimer = async () => {
    setLoading(true)
    try {
      await timeTrackingService.stopTimer()
      setTimer({
        isRunning: false,
        taskId: null,
        projectId: null,
        startTime: null,
        elapsedTime: 0,
        description: ""
      })
      setCurrentTime(0)
      setTaskInfo({ taskName: "", projectName: "" })
      toast.success("Timer stopped and time logged!")
    } catch (err) {
      toast.error(err.message || "Failed to stop timer")
    } finally {
      setLoading(false)
    }
  }

  const handlePauseTimer = async () => {
    setLoading(true)
    try {
      const pausedTimer = await timeTrackingService.pauseTimer()
      setTimer(pausedTimer)
      toast.success("Timer paused")
    } catch (err) {
      toast.error(err.message || "Failed to pause timer")
    } finally {
      setLoading(false)
    }
  }

  const handleResumeTimer = async () => {
    setLoading(true)
    try {
      const resumedTimer = await timeTrackingService.resumeTimer()
      setTimer(resumedTimer)
      toast.success("Timer resumed")
    } catch (err) {
      toast.error(err.message || "Failed to resume timer")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const filteredTasks = tasks.filter(task => 
    task.projectId === parseInt(selectedProject)
  )

  if (!timer.isRunning && !timer.taskId) {
    return (
      <>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="secondary"
          className="flex items-center space-x-2 px-3 py-2"
        >
          <ApperIcon name="Play" className="w-4 h-4" />
          <span className="hidden sm:inline">Start Timer</span>
        </Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Start Timer"
        >
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
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartTimer}
                disabled={!selectedProject || !selectedTask || loading}
                loading={loading}
              >
                Start Timer
              </Button>
            </div>
          </div>
        </Modal>
      </>
    )
  }

  return (
    <div className="flex items-center space-x-3 bg-slate-50 rounded-lg px-3 py-2">
      <div className="text-right">
        <div className="text-lg font-mono font-bold text-slate-900">
          {formatTime(currentTime)}
        </div>
        {taskInfo.taskName && (
          <div className="text-xs text-slate-600 max-w-32 truncate">
            {taskInfo.projectName} • {taskInfo.taskName}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {timer.isRunning ? (
          <Button
            onClick={handlePauseTimer}
            variant="secondary"
            className="p-2"
            disabled={loading}
          >
            <ApperIcon name="Pause" className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleResumeTimer}
            variant="primary"
            className="p-2"
            disabled={loading}
          >
            <ApperIcon name="Play" className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          onClick={handleStopTimer}
          variant="danger"
          className="p-2"
          disabled={loading}
        >
          <ApperIcon name="Square" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default TimerWidget