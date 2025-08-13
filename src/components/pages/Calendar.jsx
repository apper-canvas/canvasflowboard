import React, { useState, useEffect, useMemo } from "react"
import { toast } from "react-toastify"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"
import ApperIcon from "@/components/ApperIcon"
import Header from "@/components/organisms/Header"
import Modal from "@/components/molecules/Modal"
import TaskForm from "@/components/organisms/TaskForm"
import ProjectForm from "@/components/organisms/ProjectForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Select from "@/components/atoms/Select"
import { 
  formatDate, 
  formatDateShort, 
  getUrgencyLevel, 
  getUrgencyColor, 
  getUrgencyTextColor,
  generateCalendarGrid,
  getMonthName,
  getWeekDates,
  getPreviousMonth,
  getNextMonth,
  groupEventsByDate,
  isSameDay
} from "@/utils/dateUtils"

const Calendar = () => {
  // Data states
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Calendar navigation states
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("month") // "month", "week", "day"
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [newEventDate, setNewEventDate] = useState(null)
  
  // Filter states
  const [showTasks, setShowTasks] = useState(true)
  const [showProjects, setShowProjects] = useState(true)
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ])
      setTasks(tasksData || [])
      setProjects(projectsData || [])
    } catch (err) {
      setError("Failed to load calendar data. Please try again.")
      console.error("Calendar load error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  // Calendar navigation handlers
  const handlePreviousPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(getPreviousMonth(currentDate))
    } else if (viewMode === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else if (viewMode === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 1)
      setCurrentDate(newDate)
    }
  }
  
  const handleNextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(getNextMonth(currentDate))
    } else if (viewMode === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else if (viewMode === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 1)
      setCurrentDate(newDate)
    }
  }
  
  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }
  
  // Event handlers
  const handleDateClick = (date) => {
    setSelectedDate(date)
    if (viewMode === "month") {
      setViewMode("day")
      setCurrentDate(date)
    }
  }
  
  const handleCreateEvent = (date) => {
    setNewEventDate(date)
    setSelectedTask(null)
    setSelectedProject(null)
    // Default to creating a task for now - could add type selection
    setShowTaskModal(true)
  }
  
  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }
  
  const handleEditProject = (project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
  }
  
  // Form submission handlers
  const handleTaskSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        const updatedTask = await taskService.update(selectedTask.Id, taskData)
        setTasks(prev => prev.map(t => t.Id === selectedTask.Id ? updatedTask : t))
        toast.success("Task updated successfully!")
      } else {
        // Set due date to selected date if creating from calendar
        if (newEventDate) {
          taskData.due_date_c = newEventDate.toISOString()
        }
        const newTask = await taskService.create(taskData)
        setTasks(prev => [...prev, newTask])
        toast.success("Task created successfully!")
      }
      setShowTaskModal(false)
      setSelectedTask(null)
      setNewEventDate(null)
    } catch (err) {
      toast.error("Failed to save task. Please try again.")
      console.error("Task save error:", err)
    }
  }
  
  const handleProjectSubmit = async (projectData) => {
    try {
      if (selectedProject) {
        const updatedProject = await projectService.update(selectedProject.Id, projectData)
        setProjects(prev => prev.map(p => p.Id === selectedProject.Id ? updatedProject : p))
        toast.success("Project updated successfully!")
      } else {
        // Set deadline to selected date if creating from calendar
        if (newEventDate) {
          projectData.deadline_c = newEventDate.toISOString()
        }
        const newProject = await projectService.create(projectData)
        setProjects(prev => [...prev, newProject])
        toast.success("Project created successfully!")
      }
      setShowProjectModal(false)
      setSelectedProject(null)
      setNewEventDate(null)
    } catch (err) {
      toast.error("Failed to save project. Please try again.")
      console.error("Project save error:", err)
    }
  }
  
  // Calendar data processing
  const calendarEvents = useMemo(() => {
    const events = []
    
    // Add task due dates
    if (showTasks) {
      tasks.forEach(task => {
        if (task.due_date_c) {
          events.push({
            id: `task-${task.Id}`,
            type: 'task',
            title: task.title_c || task.Name,
            date: new Date(task.due_date_c),
            priority: task.priority_c,
            status: task.status_c,
            completed: task.completed_c,
            data: task
          })
        }
      })
    }
    
    // Add project deadlines
    if (showProjects) {
      projects.forEach(project => {
        if (project.deadline_c) {
          events.push({
            id: `project-${project.Id}`,
            type: 'project',
            title: project.Name,
            date: new Date(project.deadline_c),
            status: project.status_c,
            data: project
          })
        }
      })
    }
    
    return groupEventsByDate(events)
  }, [tasks, projects, showTasks, showProjects])
  
  const calendarGrid = useMemo(() => {
    if (viewMode === "month") {
      return generateCalendarGrid(currentDate)
    } else if (viewMode === "week") {
      return getWeekDates(currentDate)
    } else {
      return [currentDate]
    }
  }, [currentDate, viewMode])
  
  // Render functions
  const renderCalendarHeader = () => {
    let title = ""
    if (viewMode === "month") {
      title = `${getMonthName(currentDate)} ${currentDate.getFullYear()}`
    } else if (viewMode === "week") {
      const weekDates = getWeekDates(currentDate)
      const start = formatDateShort(weekDates[0])
      const end = formatDateShort(weekDates[6])
      title = `${start} - ${end}`
    } else {
      title = formatDate(currentDate)
    }
    
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPeriod}>
              <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextPeriod}>
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 font-display">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {["month", "week", "day"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-primary-500 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          
          {/* Filter Toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTasks}
                onChange={(e) => setShowTasks(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-2 ${
                showTasks ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
              }`}>
                {showTasks && <ApperIcon name="Check" className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-slate-600">Tasks</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showProjects}
                onChange={(e) => setShowProjects(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-2 ${
                showProjects ? 'bg-green-500 border-green-500' : 'border-slate-300'
              }`}>
                {showProjects && <ApperIcon name="Check" className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-slate-600">Projects</span>
            </label>
          </div>
        </div>
      </div>
    )
  }
  
  const renderEvent = (event) => {
    const urgencyLevel = getUrgencyLevel(event.date)
    const urgencyColor = getUrgencyColor(urgencyLevel)
    const urgencyTextColor = getUrgencyTextColor(urgencyLevel)
    
    return (
      <div
        key={event.id}
        onClick={() => event.type === 'task' ? handleEditTask(event.data) : handleEditProject(event.data)}
        className={`p-2 rounded text-xs cursor-pointer hover:shadow-sm transition-all ${urgencyColor} ${urgencyTextColor} mb-1`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{event.title}</span>
          <ApperIcon 
            name={event.type === 'task' ? 'CheckSquare' : 'FolderOpen'} 
            className="w-3 h-3 ml-1 flex-shrink-0" 
          />
        </div>
        {event.status && (
          <div className="mt-1">
            <Badge variant="outline" size="xs">{event.status}</Badge>
          </div>
        )}
      </div>
    )
  }
  
  const renderMonthView = () => {
    const today = new Date()
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-card">
        {/* Month header with days of week */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-slate-600 border-r border-slate-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarGrid.map((date, index) => {
            const isToday = isSameDay(date, today)
            const isCurrentMonth = date.getMonth() === currentDate.getMonth()
            const dateEvents = calendarEvents[date.toDateString()] || []
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[120px] p-2 border-r border-b border-slate-200 last:border-r-0 hover:bg-slate-50 cursor-pointer ${
                  !isCurrentMonth ? 'bg-slate-50/50' : ''
                } ${isToday ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-primary-700' : 
                    !isCurrentMonth ? 'text-slate-400' : 'text-slate-900'
                  }`}>
                    {date.getDate()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCreateEvent(date)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded"
                  >
                    <ApperIcon name="Plus" className="w-3 h-3 text-slate-500" />
                  </button>
                </div>
                <div className="space-y-1">
                  {dateEvents.slice(0, 3).map(event => renderEvent(event))}
                  {dateEvents.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dateEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  const renderWeekView = () => {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-card">
        <div className="grid grid-cols-7 divide-x divide-slate-200">
          {calendarGrid.map((date, index) => {
            const isToday = isSameDay(date, new Date())
            const dateEvents = calendarEvents[date.toDateString()] || []
            
            return (
              <div key={index} className={`p-4 min-h-[400px] ${isToday ? 'bg-primary-50' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-600 font-medium">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
                    </div>
                    <div className={`text-lg font-semibold mt-1 ${
                      isToday ? 'text-primary-700' : 'text-slate-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateEvent(date)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <ApperIcon name="Plus" className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  {dateEvents.map(event => renderEvent(event))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  const renderDayView = () => {
    const dateEvents = calendarEvents[currentDate.toDateString()] || []
    const isToday = isSameDay(currentDate, new Date())
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-2xl font-bold ${
              isToday ? 'text-primary-700' : 'text-slate-900'
            }`}>
              {formatDate(currentDate)}
            </h3>
            <p className="text-slate-600 mt-1">{dateEvents.length} events</p>
          </div>
          <Button onClick={() => handleCreateEvent(currentDate)}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
        
        {dateEvents.length === 0 ? (
          <Empty
            icon="Calendar"
            title="No events today"
            description="Create your first event for this date."
            actionLabel="Add Event"
            onAction={() => handleCreateEvent(currentDate)}
          />
        ) : (
          <div className="space-y-3">
            {dateEvents.map(event => (
              <div key={event.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-all">
                {renderEvent(event)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Calendar" />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading calendar..." />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Calendar" />
        <div className="flex-1 flex items-center justify-center">
          <Error message={error} onRetry={loadData} />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Calendar" 
        subtitle="View and manage project deadlines and task due dates"
      />
      
      <div className="flex-1 p-6">
        {renderCalendarHeader()}
        
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>
      
      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
          setNewEventDate(null)
        }}
        title={selectedTask ? "Edit Task" : "Create New Task"}
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskModal(false)
            setSelectedTask(null)
            setNewEventDate(null)
          }}
        />
      </Modal>
      
      {/* Project Modal */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setSelectedProject(null)
          setNewEventDate(null)
        }}
        title={selectedProject ? "Edit Project" : "Create New Project"}
        size="lg"
      >
        <ProjectForm
          project={selectedProject}
          onSubmit={handleProjectSubmit}
          onCancel={() => {
            setShowProjectModal(false)
            setSelectedProject(null)
            setNewEventDate(null)
          }}
        />
      </Modal>
    </div>
  )
}

export default Calendar