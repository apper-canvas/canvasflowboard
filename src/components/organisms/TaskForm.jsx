import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Textarea from "@/components/atoms/Textarea";

const TaskForm = ({ task, projectId, parentId, onSubmit, onCancel, allTasks = [] }) => {
const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    projectId: projectId || "",
    parentId: parentId || "",
    blockedBy: []
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
        parentId: task.parentId || "",
        blockedBy: task.blockedBy || []
      })
    }
  }, [task])

  // Available tasks for dependencies (excluding current task and its descendants)
  const availableTasksForDependency = allTasks.filter(t => 
    t.Id !== task?.Id && // Not the current task
    t.parentId !== task?.Id && // Not a subtask of current task
    (!task?.parentId || t.Id !== task.parentId) // Not the parent of current task
  )
  
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
        parentId: formData.parentId || parentId || null,
        blockedBy: formData.blockedBy.length > 0 ? formData.blockedBy : null
      }
      
      onSubmit(taskData)
    }
  }

  const handleDependencyChange = (e) => {
    const selectedTaskIds = Array.from(e.target.selectedOptions).map(option => parseInt(option.value))
    handleChange("blockedBy", selectedTaskIds)
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
            <option value="Critical">Critical</option>
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

        {/* Dependencies */}
        {availableTasksForDependency.length > 0 && (
          <FormField label="Dependencies (Blocked By)" error={""}>
            <select
              multiple
              value={formData.blockedBy.map(String)}
              onChange={handleDependencyChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[100px]"
            >
              {availableTasksForDependency.map(availableTask => (
                <option key={availableTask.Id} value={availableTask.Id}>
                  {availableTask.title} ({availableTask.priority})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Hold Ctrl/Cmd to select multiple tasks that must be completed before this task can start
            </p>
</FormField>
        )}
      
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