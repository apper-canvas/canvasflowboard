import React, { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"
import { format } from "date-fns"

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planning",
    deadline: "",
    progress: 0
  })
  
  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        deadline: format(new Date(project.deadline), "yyyy-MM-dd"),
        progress: project.progress
      })
    }
  }, [project])
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Project description is required"
    }
    
    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required"
    } else {
      const selectedDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      const projectData = {
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
        progress: Number(formData.progress)
      }
      
      onSubmit(projectData)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Project Name"
        required
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
        error={errors.name}
        placeholder="Enter project name"
      />
      
      <FormField
        label="Description"
        required
        error={errors.description}
      >
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your project"
          rows={4}
        />
      </FormField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Status"
          required
          error={errors.status}
        >
          <Select
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </Select>
        </FormField>
        
        <FormField
          label="Deadline"
          required
          type="date"
          value={formData.deadline}
          onChange={(e) => handleChange("deadline", e.target.value)}
          error={errors.deadline}
        />
      </div>
      
      {project && (
        <FormField
          label={`Progress (${formData.progress}%)`}
          type="range"
          min="0"
          max="100"
          value={formData.progress}
          onChange={(e) => handleChange("progress", e.target.value)}
          className="range-input"
        />
      )}
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  )
}

export default ProjectForm