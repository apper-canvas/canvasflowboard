import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Header from "@/components/organisms/Header"
import ProjectCard from "@/components/organisms/ProjectCard"
import TodayTasks from "@/components/organisms/TodayTasks"
import Modal from "@/components/molecules/Modal"
import ConfirmDialog from "@/components/molecules/ConfirmDialog"
import ProjectForm from "@/components/organisms/ProjectForm"
import Button from "@/components/atoms/Button"
import Loading, { ProjectCardSkeleton } from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { projectService } from "@/services/api/projectService"
import { taskService } from "@/services/api/taskService"

const Dashboard = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      const [projectsData, tasksData] = await Promise.all([
        projectService.getAll(),
        taskService.getAll()
      ])
      setProjects(projectsData)
      setTasks(tasksData)
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.")
      console.error("Dashboard load error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  const handleCreateProject = () => {
    setSelectedProject(null)
    setShowProjectModal(true)
  }
  
  const handleEditProject = (project) => {
    setSelectedProject(project)
    setShowProjectModal(true)
  }
  
  const handleDeleteProject = (project) => {
    setProjectToDelete(project)
    setShowDeleteDialog(true)
  }
  
  const handleProjectSubmit = async (projectData) => {
    try {
      if (selectedProject) {
        await projectService.update(selectedProject.Id, projectData)
        setProjects(prev => 
          prev.map(p => p.Id === selectedProject.Id ? { ...p, ...projectData } : p)
        )
        toast.success("Project updated successfully!")
      } else {
        const newProject = await projectService.create(projectData)
        setProjects(prev => [...prev, newProject])
        toast.success("Project created successfully!")
      }
      setShowProjectModal(false)
      setSelectedProject(null)
    } catch (err) {
      toast.error("Failed to save project. Please try again.")
      console.error("Project save error:", err)
    }
  }
  
  const handleConfirmDelete = async () => {
    try {
      await projectService.delete(projectToDelete.Id)
      setProjects(prev => prev.filter(p => p.Id !== projectToDelete.Id))
      setTasks(prev => prev.filter(t => t.projectId !== projectToDelete.Id))
      toast.success("Project deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete project. Please try again.")
      console.error("Project delete error:", err)
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
  
  const getProjectStats = () => {
    const total = projects.length
    const inProgress = projects.filter(p => p.status === "In Progress").length
    const completed = projects.filter(p => p.status === "Completed").length
    const overdue = projects.filter(p => {
      const deadline = new Date(p.deadline)
      const now = new Date()
      return deadline < now && p.status !== "Completed"
    }).length
    
    return { total, inProgress, completed, overdue }
  }
  
  const stats = getProjectStats()
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header 
          title="Dashboard" 
          subtitle="Overview of your projects and tasks"
        />
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="animate-pulse">
                  <div className="bg-slate-200 rounded h-4 w-16 mb-2"></div>
                  <div className="bg-slate-200 rounded h-8 w-12"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <div className="animate-pulse">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="bg-slate-200 rounded h-6 w-32 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-slate-200 rounded h-16"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Error message={error} onRetry={loadDashboardData} />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Dashboard" 
        subtitle="Overview of your projects and tasks"
        action={
          <Button onClick={handleCreateProject}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-card"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="FolderOpen" className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Total Projects</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-card"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="Activity" className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-card"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-card"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-slate-900">{stats.overdue}</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Projects Grid */}
          <div className="xl:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 font-display">Recent Projects</h2>
              
              {projects.length === 0 ? (
                <Empty
                  icon="FolderOpen"
                  title="No projects yet"
                  description="Create your first project to start tracking your work and managing tasks effectively."
                  actionLabel="Create Project"
                  onAction={handleCreateProject}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.slice(0, 4).map((project) => (
                    <ProjectCard
                      key={project.Id}
                      project={project}
                      onClick={() => navigate(`/projects/${project.Id}`)}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Today's Tasks */}
          <div>
            <TodayTasks 
              tasks={tasks} 
              projects={projects}
              onToggleComplete={handleToggleTaskComplete}
            />
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <Modal
        isOpen={showProjectModal}
        onClose={() => {
          setShowProjectModal(false)
          setSelectedProject(null)
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
          }}
        />
      </Modal>
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setProjectToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and will also delete all associated tasks.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}

export default Dashboard