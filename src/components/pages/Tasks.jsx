import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import ApperIcon from "@/components/ApperIcon";
import Header from "@/components/organisms/Header";
import TaskForm from "@/components/organisms/TaskForm";
import TaskList from "@/components/organisms/TaskList";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import Modal from "@/components/molecules/Modal";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Projects from "@/components/pages/Projects";
import { formatDateShort, getUrgencyIcon, getUrgencyLevel } from "@/utils/dateUtils";
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
  const [parentTaskId, setParentTaskId] = useState(null)
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
    setParentTaskId(null)
    setShowTaskModal(true)
  }

  const handleCreateSubtask = (parentId) => {
    setSelectedTask(null)
    setParentTaskId(parentId)
    setShowTaskModal(true)
  }
  
  
const handleEditTask = (task) => {
    setSelectedTask(task)
    setParentTaskId(task.parentId)
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
      } else if (parentTaskId) {
        const newSubtask = await taskService.createSubtask(parentTaskId, taskData)
        setTasks(prev => [...prev, newSubtask])
        toast.success("Subtask created successfully!")
      } else {
        const newTask = await taskService.create(taskData)
        setTasks(prev => [...prev, newTask])
        toast.success("Task created successfully!")
      }
      setShowTaskModal(false)
      setSelectedTask(null)
      setParentTaskId(null)
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

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      const updatedTask = await taskService.updateStatus(task.Id, newStatus)
      setTasks(prev => 
        prev.map(t => t.Id === task.Id ? updatedTask : t)
      )
      toast.success(`Task status updated to ${newStatus}!`)
    } catch (err) {
      toast.error("Failed to update task status. Please try again.")
      console.error("Task status update error:", err)
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
          <TaskList 
            tasks={filteredTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onAdd={handleCreateTask}
            onAddSubtask={handleCreateSubtask}
            onUpdateStatus={handleUpdateStatus}
          />
)}

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
          setParentTaskId(null)
        }}
        title={parentTaskId ? "Create New Subtask" : selectedTask ? "Edit Task" : "Create New Task"}
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          parentId={parentTaskId}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskModal(false)
            setSelectedTask(null)
            setParentTaskId(null)
          }}
        />
      </Modal>
      
      {/* Delete Confirmation Dialog */}
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
    </div>
  )
}

export default Tasks