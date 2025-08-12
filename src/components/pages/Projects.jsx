import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Header from "@/components/organisms/Header"
import ProjectCard from "@/components/organisms/ProjectCard"
import SearchBar from "@/components/molecules/SearchBar"
import Modal from "@/components/molecules/Modal"
import ConfirmDialog from "@/components/molecules/ConfirmDialog"
import ProjectForm from "@/components/organisms/ProjectForm"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { projectService } from "@/services/api/projectService"

const Projects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  
  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  
  const loadProjects = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await projectService.getAll()
      setProjects(data)
    } catch (err) {
      setError("Failed to load projects. Please try again.")
      console.error("Projects load error:", err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadProjects()
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
      toast.success("Project deleted successfully!")
    } catch (err) {
      toast.error("Failed to delete project. Please try again.")
      console.error("Project delete error:", err)
    }
  }
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Projects" />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading projects..." />
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Projects" />
        <div className="flex-1 flex items-center justify-center">
          <Error message={error} onRetry={loadProjects} />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <Header 
        title="Projects" 
        subtitle={`Manage all your projects (${projects.length})`}
        action={
          <Button onClick={handleCreateProject}>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />
      
      <div className="flex-1 p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-card">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="All">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </Select>
          </div>
        </div>
        
        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          projects.length === 0 ? (
            <Empty
              icon="FolderOpen"
              title="No projects yet"
              description="Create your first project to start tracking your work and managing tasks effectively."
              actionLabel="Create Project"
              onAction={handleCreateProject}
            />
          ) : (
            <Empty
              icon="Search"
              title="No projects found"
              description="Try adjusting your search terms or filters to find what you're looking for."
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
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

export default Projects