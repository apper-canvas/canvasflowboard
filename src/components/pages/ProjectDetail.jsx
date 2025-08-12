import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Header from "@/components/organisms/Header"
import TaskList from "@/components/organisms/TaskList"
import Modal from "@/components/molecules/Modal"
import ConfirmDialog from "@/components/molecules/ConfirmDialog"
import ProjectForm from "@/components/organisms/ProjectForm"
import TaskForm from "@/components/organisms/TaskForm"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ProgressBar from "@/components/atoms/ProgressBar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperIcon from "@/components/ApperIcon"
import KanbanBoard from "@/components/organisms/KanbanBoard"
import { formatDate, getUrgencyLevel, getUrgencyColor } from "@/utils/dateUtils"
import { projectService } from "@/services/api/projectService"
import { taskService } from "@/services/api/taskService"

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
// Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTaskDeleteDialog, setShowTaskDeleteDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  
  // View state
  const [viewMode, setViewMode] = useState('list') // 'list' or 'kanban'

  // Calculate comprehensive task statistics
  const taskStats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed).length
    const todoTasks = tasks.filter(t => t.status === 'To Do').length
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
    const reviewTasks = tasks.filter(t => t.status === 'Review').length
    const doneTasks = tasks.filter(t => t.status === 'Done').length
    
    const highPriorityTasks = tasks.filter(t => t.priority === 'High' && !t.completed).length
    const overdueTasks = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && !t.completed
    ).length
    
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      total: totalTasks,
      completed: completedTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      review: reviewTasks,
      done: doneTasks,
      highPriority: highPriorityTasks,
      overdue: overdueTasks,
      completionPercentage
    }
  }, [tasks])
  
  const loadProjectData = async () => {
    try {
      setLoading(true)
      setError("")
      const [projectData, tasksData] = await Promise.all([
        projectService.getById(id),
        taskService.getByProjectId(id)
      ])
      setProject(projectData)
      setTasks(tasksData)
    } catch (err) {
      setError("Failed to load project details. Please try again.")
      console.error("Project detail load error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadProjectData()
  }, [id])
  
  const handleEditProject = () => {
    setShowEditModal(true)
  }
  
  const handleDeleteProject = () => {
    setShowDeleteDialog(true)
  }
  
  const handleProjectSubmit = async (projectData) => {
    try {
      const updatedProject = await projectService.update(project.Id, projectData)
      setProject(updatedProject)
      setShowEditModal(false)
      toast.success("Project updated successfully!")
    } catch (err) {
      toast.error("Failed to update project. Please try again.")
      console.error("Project update error:", err)
    }
  }
  
  const handleConfirmDeleteProject = async () => {
    try {
      await projectService.delete(project.Id)
      toast.success("Project deleted successfully!")
      navigate("/projects")
    } catch (err) {
      toast.error("Failed to delete project. Please try again.")
      console.error("Project delete error:", err)
    }
  }
  
  const handleAddTask = () => {
    setSelectedTask(null)
    setShowTaskModal(true)
  }
  
  const handleEditTask = (task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }
  
  const handleDeleteTask = (task) => {
    setTaskToDelete(task)
    setShowTaskDeleteDialog(true)
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
        const newTask = await taskService.create({
          ...taskData,
          projectId: project.Id
        })
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

  const handleUpdateTaskStatus = async (task, newStatus) => {
    try {
      const updatedTask = await taskService.updateStatus(task.Id, newStatus)
      setTasks(prev => 
        prev.map(t => t.Id === task.Id ? updatedTask : t)
      )
      toast.success(`Task moved to ${newStatus}!`)
    } catch (err) {
      toast.error("Failed to update task status. Please try again.")
      console.error("Task status update error:", err)
    }
  }
  
  const handleConfirmDeleteTask = async () => {
    try {
      await taskService.delete(taskToDelete.Id)
      setTasks(prev => prev.filter(t => t.Id !== taskToDelete.Id))
      toast.success("Task deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete task. Please try again.")
      console.error("Task delete error:", err)
    }
  }
  
const handleToggleTaskComplete = async (task) => {
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

  const handleViewToggle = () => {
    setViewMode(current => current === 'list' ? 'kanban' : 'list')
  }
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading project details..." />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Error" />
        <div className="flex-1 flex items-center justify-center">
          <Error message={error} onRetry={loadProjectData} />
        </div>
      </div>
    )
  }
  
  if (!project) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Project Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <Error 
            message="The project you're looking for doesn't exist." 
            showRetry={false}
          />
        </div>
      </div>
    )
  }
  
  const getStatusVariant = (status) => {
    switch (status) {
      case "Planning": return "planning"
      case "In Progress": return "progress"
      case "On Hold": return "hold"
      case "Completed": return "completed"
      default: return "default"
    }
  }
  
  const urgencyLevel = getUrgencyLevel(project.deadline)
  const urgencyColorClass = getUrgencyColor(urgencyLevel)
  
  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title={project.name}
        subtitle="Project Details"
        action={
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={handleEditProject}>
              <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="danger" onClick={handleDeleteProject}>
              <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-1">
            <div className={`bg-white rounded-lg border-l-4 ${urgencyColorClass} shadow-card`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 font-display">
                    Project Overview
                  </h2>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
                    <p className="text-slate-600">{project.description}</p>
                  </div>
                  
                  <div>
<h4 className="text-sm font-medium text-slate-700 mb-2">Overall Progress</h4>
                    <ProgressBar value={taskStats.completionPercentage} showValue />
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t border-slate-200">
                    <div className="flex items-center text-sm text-slate-600">
                      <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                      <span>Due Date</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {formatDate(new Date(project.deadline))}
                    </span>
                  </div>
                  
{/* Task Statistics */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-slate-600">
                        <ApperIcon name="CheckSquare" className="w-4 h-4 mr-2" />
                        <span>Task Completion</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {taskStats.completed}/{taskStats.total} ({taskStats.completionPercentage}%)
                      </span>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-slate-400 mr-2"></div>
                          <span className="text-slate-600">To Do</span>
                        </div>
                        <span className="font-medium text-slate-900">{taskStats.todo}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                          <span className="text-slate-600">In Progress</span>
                        </div>
                        <span className="font-medium text-slate-900">{taskStats.inProgress}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                          <span className="text-slate-600">Review</span>
                        </div>
                        <span className="font-medium text-slate-900">{taskStats.review}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                          <span className="text-slate-600">Done</span>
                        </div>
                        <span className="font-medium text-slate-900">{taskStats.done}</span>
                      </div>
                    </div>

                    {/* Priority & Overdue Alerts */}
                    {(taskStats.highPriority > 0 || taskStats.overdue > 0) && (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        {taskStats.highPriority > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center text-red-600">
                              <ApperIcon name="AlertCircle" className="w-3 h-3 mr-1" />
                              <span>High Priority</span>
                            </div>
                            <span className="font-medium text-red-900">{taskStats.highPriority}</span>
                          </div>
                        )}
                        {taskStats.overdue > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center text-red-600">
                              <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
                              <span>Overdue</span>
                            </div>
                            <span className="font-medium text-red-900">{taskStats.overdue}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-t border-slate-200">
                    <div className="flex items-center text-sm text-slate-600">
                      <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
                      <span>Created</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {formatDate(new Date(project.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
</div>
          
          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 shadow-card p-6">
              {/* View Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="List" className="w-4 h-4" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Columns" className="w-4 h-4" />
                    Kanban
                  </Button>
                </div>
              </div>

              {/* Render appropriate view */}
              {viewMode === 'list' ? (
                <TaskList
                  tasks={tasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onAdd={handleAddTask}
                  projectId={project.Id}
                />
              ) : (
                <KanbanBoard
                  tasks={tasks}
                  onToggleComplete={handleToggleTaskComplete}
                  onUpdateStatus={handleUpdateTaskStatus}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onAdd={handleAddTask}
                  projectId={project.Id}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Project"
        size="lg"
      >
        <ProjectForm
          project={project}
          onSubmit={handleProjectSubmit}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
      
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
          projectId={project.Id}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskModal(false)
            setSelectedTask(null)
          }}
        />
      </Modal>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will also delete all associated tasks.`}
        confirmText="Delete"
        variant="danger"
      />
      
      <ConfirmDialog
        isOpen={showTaskDeleteDialog}
        onClose={() => {
          setShowTaskDeleteDialog(false)
          setTaskToDelete(null)
        }}
        onConfirm={handleConfirmDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default ProjectDetail