import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Header from "@/components/organisms/Header"
import SearchBar from "@/components/molecules/SearchBar"
import Modal from "@/components/molecules/Modal"
import ConfirmDialog from "@/components/molecules/ConfirmDialog"
import TaskForm from "@/components/organisms/TaskForm"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Badge from "@/components/atoms/Badge"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { formatDateShort, getUrgencyLevel, getUrgencyIcon } from "@/utils/dateUtils"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [projectFilter, setProjectFilter] = useState("All")
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ])
      setTasks(tasksData)
      setProjects(projectsData)
    } catch (err) {
      setError("Failed to load tasks. Please try again.")
      console.error("Tasks load error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  const handleCreateTask = () => {
    setSelectedTask(null)
    setShowTaskModal(true)
  }
  
  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }
  
  const handleDeleteTask = (task) => {
    setTaskToDelete(task)
    setShowDeleteDialog(true)
  }
  
  const handleTaskSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        const updatedTask = await taskService.update(selectedTask.Id, taskData)
        setTasks(prev => 
          prev.map(t => t.Id === selectedTask.Id ? updatedTask : t)
        )
        toast.success("Task updated successfully!")
      } else {
        const newTask = await taskService.create(taskData)
        setTasks(prev => [...prev, newTask])
        toast.success("Task created successfully!")
      }
      setShowTaskModal(false)
      setSelectedTask(null)
    } catch (err) {
      toast.error("Failed to save task. Please try again.")
      console.error("Task save error:", err)
    }
  }
  
  const handleConfirmDelete = async () => {
    try {
      await taskService.delete(taskToDelete.Id)
      setTasks(prev => prev.filter(t => t.Id !== taskToDelete.Id))
      toast.success("Task deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete task. Please try again.")
      console.error("Task delete error:", err)
    }
  }
  
  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.toggleComplete(task.Id)
      setTasks(prev => 
        prev.map(t => t.Id === task.Id ? updatedTask : t)
      )
      toast.success(`Task ${updatedTask.completed ? 'completed' : 'reopened'}!`)
    } catch (err) {
      toast.error("Failed to update task. Please try again.")
      console.error("Task toggle error:", err)
    }
  }
  
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id === projectId)
    return project?.name || "Unknown Project"
  }
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "error"
      case "Medium": return "warning"
      case "Low": return "success"
      default: return "default"
    }
  }
  
  const getUrgencyIcon = (dueDate) => {
    const level = getUrgencyLevel(dueDate)
    if (level === "overdue") return { icon: "AlertCircle", color: "text-red-500" }
    if (level === "urgent") return { icon: "Clock", color: "text-orange-500" }
    return { icon: "Calendar", color: "text-slate-400" }
  }
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter
    const matchesStatus = statusFilter === "All" || 
                         (statusFilter === "Completed" && task.completed) ||
                         (statusFilter === "Pending" && !task.completed)
    const matchesProject = projectFilter === "All" || task.projectId === parseInt(projectFilter)
    
    return matchesSearch && matchesPriority && matchesStatus && matchesProject
  })
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Tasks" />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading tasks..." />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Tasks" />
        <div className="flex-1 flex items-center justify-center">
          <Error message={error} onRetry={loadData} />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Tasks" 
        subtitle={`All your tasks across projects (${tasks.length})`}
        action={
          <Button onClick={handleCreateTask}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            New Task
          </Button>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SearchBar
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="lg:col-span-2"
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </Select>
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            <Empty
              icon="CheckSquare"
              title="No tasks yet"
              description="Create your first task to start tracking your work and staying organized."
              actionLabel="Create Task"
              onAction={handleCreateTask}
            />
          ) : (
            <Empty
              icon="Search"
              title="No tasks found"
              description="Try adjusting your search terms or filters to find what you're looking for."
            />
          )
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Task</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Project</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Priority</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Due Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-700">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTasks.map((task) => {
                    const urgency = getUrgencyIcon(task.dueDate)
                    
                    return (
                      <tr key={task.Id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className="mt-1"
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                task.completed 
                                  ? "bg-primary-500 border-primary-500" 
                                  : "border-slate-300 hover:border-primary-400"
                              }`}>
                                {task.completed && (
                                  <ApperIcon name="Check" className="w-2.5 h-2.5 text-white" />
                                )}
                              </div>
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium ${
                                task.completed ? "line-through text-slate-500" : "text-slate-900"
                              }`}>
                                {task.title}
                              </p>
                              <p className={`text-sm mt-1 ${
                                task.completed ? "line-through text-slate-400" : "text-slate-600"
                              }`}>
                                {task.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {getProjectName(task.projectId)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm">
                            <ApperIcon name={urgency.icon} className={`w-4 h-4 mr-2 ${urgency.color}`} />
                            <span className={urgency.color}>
                              {formatDateShort(new Date(task.dueDate))}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={task.completed ? "completed" : "progress"}>
                            {task.completed ? "Completed" : "Pending"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                            >
                              <ApperIcon name="Edit" className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task)}
                              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <ApperIcon name="Trash2" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
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
          }}
        />
      </Modal>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setTaskToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default Tasks