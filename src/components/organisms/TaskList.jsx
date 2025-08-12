import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Tasks from "@/components/pages/Tasks";
import { formatDate, formatDateShort, getUrgencyLevel } from "@/utils/dateUtils";
const TaskList = ({ tasks, onToggleComplete, onEdit, onDelete, onAdd, onUpdateStatus, onAddSubtask, projectId }) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set())
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return "error"
      case "High": return "warning"
      case "Medium": return "info"
      case "Low": return "success"
      default: return "default"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "To Do": return "default"
      case "In Progress": return "warning"
      case "Review": return "info"
      case "Done": return "success"
      default: return "default"
    }
  }

  const toggleTaskExpanded = (taskId) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const handleStatusClick = async (task, newStatus) => {
    if (onUpdateStatus) {
      await onUpdateStatus(task, newStatus)
    }
  }

  // Sort and filter tasks
const taskHierarchy = useMemo(() => {
    // Only show main tasks initially, subtasks will be shown nested
    const mainTasks = tasks.filter(task => !task.parentId && (!projectId || task.projectId === projectId))
    
    let filteredTasks = mainTasks.filter(task => {
      const matchesStatus = !statusFilter || task.status === statusFilter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesPriority && matchesSearch
    })

    return filteredTasks.sort((a, b) => {
      // First sort by completion status (incomplete first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      
      // Then by priority (High -> Medium -> Low)
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 }
      const priorityDiff = (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
      if (priorityDiff !== 0) return priorityDiff
      
      // Finally by due date (earliest first)
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [tasks, statusFilter, priorityFilter, searchTerm, projectId])

  const getSubtasks = (parentId) => {
    return tasks.filter(task => task.parentId === parentId).sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Review', label: 'Review' },
    { value: 'Done', label: 'Done' }
  ]

const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ]
  
  const getUrgencyIcon = (dueDate) => {
    const level = getUrgencyLevel(dueDate)
    if (level === "overdue") return { icon: "AlertCircle", color: "text-red-500" }
    if (level === "urgent") return { icon: "Clock", color: "text-orange-500" }
    return { icon: "Calendar", color: "text-slate-400" }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 font-display">Tasks</h3>
<Button size="sm" onClick={() => onAdd(projectId)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
          Add Main Task
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <ApperIcon name="CheckSquare" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500">No tasks yet</p>
          <p className="text-sm text-slate-400">Add your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
{/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  icon="Search"
                />
              </div>
              <div className="flex gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={statusOptions}
                  className="min-w-32"
                />
                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                  options={priorityOptions}
                  className="min-w-32"
                />
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <AnimatePresence>
{taskHierarchy.map((task, index) => {
              const urgency = getUrgencyIcon(task.dueDate)
              const isExpanded = expandedTasks.has(task.Id)
              const subtasks = getSubtasks(task.Id)
              const completedSubtasks = subtasks.filter(sub => sub.completed).length
              
const renderTask = (taskItem, depth = 0) => {
                const taskUrgency = getUrgencyIcon(taskItem.dueDate)
                const taskExpanded = expandedTasks.has(taskItem.Id)
                const blockedByTasks = taskItem.blockedBy ? 
                  taskItem.blockedBy.map(id => tasks.find(t => t.Id === id)).filter(Boolean) : []
                const isBlocked = blockedByTasks.length > 0
                return (
                  <motion.div
                    key={taskItem.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-all duration-200 ${
                      taskItem.completed ? "opacity-75" : ""
                    } ${taskExpanded ? 'shadow-sm' : ''} ${depth > 0 ? 'ml-6 border-l-4 border-l-primary-200' : ''}`}
                    style={{ marginLeft: depth * 16 }}
                  >
                    {/* Task Content */}
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => onToggleComplete(taskItem)}
                          className="mt-1 flex-shrink-0"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            taskItem.completed 
                              ? "bg-primary-500 border-primary-500" 
                              : "border-slate-300 hover:border-primary-400"
                          }`}>
                            {taskItem.completed && (
                              <ApperIcon name="Check" className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-medium ${
                                  taskItem.completed ? "line-through text-slate-500" : "text-slate-900"
                                }`}>
                                  {taskItem.title}
                                </h4>
                                
                                {/* Subtask counter for main tasks */}
                                {depth === 0 && subtasks.length > 0 && (
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {completedSubtasks}/{subtasks.length}
                                  </span>
                                )}
                                
                                {/* Add subtask button */}
                                {depth === 0 && onAddSubtask && (
                                  <button
                                    onClick={() => onAddSubtask(taskItem.Id)}
                                    className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                                    title="Add subtask"
                                  >
                                    <ApperIcon name="Plus" className="w-3 h-3" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => toggleTaskExpanded(taskItem.Id)}
                                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  <ApperIcon 
                                    name={taskExpanded ? "ChevronUp" : "ChevronDown"} 
                                    className="w-4 h-4" 
                                  />
                                </button>
                              </div>
                              
                              <p className={`text-sm ${
                                taskItem.completed ? "line-through text-slate-400" : "text-slate-600"
                              } ${!taskExpanded ? 'line-clamp-2' : ''}`}>
                                {taskItem.description}
                              </p>
                              
                              {/* Status and Priority Badges */}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge 
                                  variant={getStatusColor(taskItem.status)} 
                                  className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    const statusCycle = ['To Do', 'In Progress', 'Review', 'Done']
                                    const currentIndex = statusCycle.indexOf(taskItem.status)
                                    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length]
                                    handleStatusClick(taskItem, nextStatus)
                                  }}
                                >
                                  {taskItem.status}
                                </Badge>
<Badge variant={getPriorityColor(taskItem.priority)} className="text-xs">
                                  {taskItem.priority}
                                </Badge>
                                
                                {/* Dependency indicator */}
                                {isBlocked && (
                                  <div className="flex items-center gap-1">
                                    <ApperIcon name="AlertTriangle" size={12} className="text-amber-500" />
                                    <span className="text-xs text-amber-600">
                                      Blocked by: {blockedByTasks.map(t => t.title).join(', ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onEdit(taskItem)}
                                className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                              >
                                <ApperIcon name="Edit" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDelete(taskItem)}
                                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-2 text-xs text-slate-500">
                            <ApperIcon name={taskUrgency.icon} className={`w-3 h-3 mr-1 ${taskUrgency.color}`} />
                            <span className={taskUrgency.color}>
                              Due {formatDateShort(new Date(taskItem.dueDate))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
<AnimatePresence>
                      {taskExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-200 bg-slate-50"
                        >
                          <div className="p-4 space-y-3">
                            {/* Task Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-slate-700">Created:</span>
                                <span className="ml-2 text-slate-600">
                                  {formatDate(new Date(taskItem.createdAt))}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-slate-700">Last Updated:</span>
                                <span className="ml-2 text-slate-600">
                                  {formatDate(new Date(taskItem.lastUpdated))}
                                </span>
                              </div>
                            </div>

                            {/* Dependencies */}
                            {blockedByTasks.length > 0 && (
                              <div>
                                <h5 className="font-medium text-slate-700 mb-2">Dependencies</h5>
                                <div className="space-y-1">
                                  <span className="text-sm text-amber-600 flex items-center gap-1">
                                    <ApperIcon name="AlertTriangle" size={14} />
                                    This task is blocked by:
                                  </span>
                                  {blockedByTasks.map(blockedTask => (
                                    <div key={blockedTask.Id} className="flex items-center gap-2 text-xs text-slate-600 ml-5">
                                      <Badge variant={getStatusColor(blockedTask.status)} className="text-xs">
                                        {blockedTask.status}
                                      </Badge>
                                      <span>{blockedTask.title}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Status History */}
                            {taskItem.statusHistory && taskItem.statusHistory.length > 0 && (
                              <div>
                                <h5 className="font-medium text-slate-700 mb-2">Status History</h5>
                                <div className="space-y-1">
                                  {taskItem.statusHistory.slice(-3).reverse().map((entry, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                      <Badge variant={getStatusColor(entry.status)} className="text-xs">
                                        {entry.status}
                                      </Badge>
                                      <span>{formatDate(new Date(entry.timestamp))}</span>
                                    </div>
                                  ))}
                                  {taskItem.statusHistory.length > 3 && (
                                    <div className="text-xs text-slate-500">
                                      + {taskItem.statusHistory.length - 3} more status changes
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Quick Status Updates */}
                            <div>
                              <span className="font-medium text-slate-700 text-sm">Quick Status Update:</span>
                              <div className="flex gap-2 mt-2">
                                {['To Do', 'In Progress', 'Review', 'Done'].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusClick(taskItem, status)}
                                    disabled={taskItem.status === status || isBlocked}
                                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                      taskItem.status === status || isBlocked
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                    }`}
                                    title={isBlocked ? 'Cannot change status - task is blocked by dependencies' : ''}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              }
              
              return (
                <div key={task.Id} className="space-y-2">
                  {renderTask(task, 0)}
                  {subtasks.map(subtask => renderTask(subtask, 1))}
                </div>
              )
            })}
</AnimatePresence>

          {taskHierarchy.length === 0 && (
            <div className="text-center py-12">
              <ApperIcon name="Search" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter || priorityFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first task"}
              </p>
              <Button onClick={onAdd} variant="primary">
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskList