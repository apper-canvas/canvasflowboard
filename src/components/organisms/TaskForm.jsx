import React, { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"

const TaskForm = ({ task, projectId, parentId, onSubmit, onCancel }) => {
const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    projectId: projectId || "",
    parentId: parentId || ""
  })
  
  const [errors, setErrors] = useState({})
  
useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: format(new Date(task.dueDate), "yyyy-MM-dd"),
        projectId: task.projectId,
        parentId: task.parentId || ""
      })
    }
  }, [task])
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Task description is required"
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        completed: task?.completed || false,
        parentId: formData.parentId || parentId || null
      }
      
      onSubmit(taskData)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Task Title"
        required
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
      />
      
      <FormField
        label="Description"
        required
        error={errors.description}
      >
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the task"
          rows={3}
        />
      </FormField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Priority"
          required
          error={errors.priority}
        >
          <Select
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </FormField>
<FormField
          label="Due Date"
          required
          type="date"
          value={formData.dueDate}
          onChange={(e) => handleChange("dueDate", e.target.value)}
          error={errors.dueDate}
        />
      </div>
      
      {parentId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <ApperIcon name="ArrowRight" className="w-4 h-4" />
            <span>This will be created as a subtask</span>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  )
}

export default TaskForm