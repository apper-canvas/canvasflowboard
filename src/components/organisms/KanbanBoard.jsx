import React, { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import { formatDateShort, getUrgencyLevel } from '@/utils/dateUtils'
import { cn } from '@/utils/cn'

const KanbanBoard = ({ 
  tasks, 
  onToggleComplete, 
  onEdit, 
  onDelete, 
  onAdd, 
  onUpdateStatus, 
  projectId 
}) => {
const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [collapsedColumns, setCollapsedColumns] = useState(new Set())

  const toggleColumnCollapse = (columnId) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(columnId)) {
        newSet.delete(columnId)
      } else {
        newSet.add(columnId)
      }
      return newSet
    })
  }

  const columns = [
    { id: 'To Do', title: 'To Do', color: 'border-slate-300 bg-slate-50' },
    { id: 'In Progress', title: 'In Progress', color: 'border-yellow-300 bg-yellow-50' },
    { id: 'Review', title: 'Review', color: 'border-blue-300 bg-blue-50' },
    { id: 'Done', title: 'Done', color: 'border-green-300 bg-green-50' }
  ]

  // Filter and group tasks by status
  const tasksByStatus = useMemo(() => {
    const filteredTasks = tasks.filter(task => 
      !task.parentId && (!projectId || task.projectId === projectId)
    )
    
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter(task => 
        task.status === column.id
      ).sort((a, b) => {
        // Sort by completion status (incomplete first), then priority, then due date
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
        const priorityDiff = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.dueDate) - new Date(b.dueDate)
      })
      return acc
    }, {})
  }, [tasks, projectId])

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'error'
      case 'High': return 'warning'
      case 'Medium': return 'primary'
      case 'Low': return 'success'
      default: return 'default'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Critical': return 'AlertTriangle'
      case 'High': return 'ArrowUp'
      case 'Medium': return 'Minus'
      case 'Low': return 'ArrowDown'
      default: return 'Circle'
    }
  }

  const getUrgencyIcon = (dueDate) => {
    const level = getUrgencyLevel(dueDate)
    if (level === 'overdue') return { icon: 'AlertCircle', color: 'text-red-500' }
    if (level === 'urgent') return { icon: 'Clock', color: 'text-orange-500' }
    return { icon: 'Calendar', color: 'text-slate-400' }
  }

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e) => {
    // Only clear dragOverColumn if we're actually leaving the column
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (draggedTask && draggedTask.status !== columnId && onUpdateStatus) {
      await onUpdateStatus(draggedTask, columnId)
    }
    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 font-display">Kanban Board</h3>
        <Button size="sm" onClick={() => onAdd(projectId)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-96">
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              'flex flex-col bg-white rounded-lg border-2 transition-colors duration-200',
              column.color,
              dragOverColumn === column.id ? 'border-primary-400 bg-primary-50' : ''
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
<div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleColumnCollapse(column.id)}
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                    title={collapsedColumns.has(column.id) ? 'Expand column' : 'Collapse column'}
                  >
                    <ApperIcon 
                      name={collapsedColumns.has(column.id) ? "ChevronRight" : "ChevronDown"} 
                      className="w-4 h-4 text-slate-500" 
                    />
                  </button>
                  <h4 className="font-medium text-slate-900">{column.title}</h4>
                </div>
                <Badge variant="default" className="text-xs">
                  {tasksByStatus[column.id]?.length || 0}
                </Badge>
              </div>
            </div>

{/* Tasks */}
            <AnimatePresence>
              {!collapsedColumns.has(column.id) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex-1 p-2 space-y-2 min-h-64">
                    <AnimatePresence>
                      {tasksByStatus[column.id]?.map((task, index) => {
                        const urgency = getUrgencyIcon(task.dueDate)
                        const priorityIcon = getPriorityIcon(task.priority)

                        return (
                          <motion.div
                            key={task.Id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              'kanban-card bg-white border border-slate-200 rounded-lg p-3 cursor-move shadow-sm hover:shadow-md transition-all duration-200',
                              task.completed ? 'opacity-75' : '',
                              draggedTask?.Id === task.Id ? 'opacity-50 rotate-2 scale-105' : ''
                            )}
                          >
                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <button
                                  onClick={() => onToggleComplete(task)}
                                  className="flex-shrink-0 mt-0.5"
                                >
                                  <div className={cn(
                                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                                    task.completed 
                                      ? 'bg-primary-500 border-primary-500' 
                                      : 'border-slate-300 hover:border-primary-400'
                                  )}>
                                    {task.completed && (
                                      <ApperIcon name="Check" className="w-2.5 h-2.5 text-white" />
                                    )}
                                  </div>
                                </button>
                                <h5 className={cn(
                                  'text-sm font-medium flex-1 min-w-0 truncate',
                                  task.completed ? 'line-through text-slate-500' : 'text-slate-900'
                                )}>
                                  {task.title}
                                </h5>
                              </div>
                              
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => onEdit(task)}
                                  className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                                >
                                  <ApperIcon name="Edit" className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDelete(task)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <ApperIcon name="Trash2" className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Task Description */}
                            <p className={cn(
                              'text-xs text-slate-600 mb-3 line-clamp-2',
                              task.completed ? 'line-through text-slate-400' : ''
                            )}>
                              {task.description}
                            </p>

                            {/* Task Metadata */}
                            <div className="space-y-2">
                              {/* Priority */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <ApperIcon 
                                    name={priorityIcon} 
                                    className={cn(
                                      'w-3 h-3',
                                      task.priority === 'Critical' ? 'text-red-500' :
                                      task.priority === 'High' ? 'text-orange-500' :
                                      task.priority === 'Medium' ? 'text-blue-500' : 'text-green-500'
                                    )} 
                                  />
                                  <Badge 
                                    variant={getPriorityColor(task.priority)} 
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                                
                                {/* Assignee placeholder */}
                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                                  <ApperIcon name="User" className="w-3 h-3 text-slate-500" />
                                </div>
                              </div>

                              {/* Due Date */}
                              <div className="flex items-center gap-1 text-xs">
                                <ApperIcon 
                                  name={urgency.icon} 
                                  className={cn('w-3 h-3', urgency.color)} 
                                />
                                <span className={urgency.color}>
                                  {formatDateShort(new Date(task.dueDate))}
                                </span>
                              </div>

                              {/* Subtasks indicator */}
                              {tasks.filter(t => t.parentId === task.Id).length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <ApperIcon name="List" className="w-3 h-3" />
                                  <span>
                                    {tasks.filter(t => t.parentId === task.Id && t.completed).length}/
                                    {tasks.filter(t => t.parentId === task.Id).length} subtasks
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    
                    {/* Empty state for column */}
                    {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
                      <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                        <div className="text-center">
                          <ApperIcon name="Plus" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Drop tasks here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed state indicator */}
            {collapsedColumns.has(column.id) && (
              <div className="p-4 text-center text-slate-400 text-sm border-t border-slate-100">
                <div className="flex items-center justify-center gap-2">
                  <ApperIcon name="EyeOff" className="w-4 h-4" />
                  <span>Column collapsed - {tasksByStatus[column.id]?.length || 0} tasks hidden</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state for entire board */}
      {tasks.filter(task => !task.parentId && (!projectId || task.projectId === projectId)).length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <ApperIcon name="Kanban" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
          <p className="text-slate-500 mb-4">Add your first task to get started with the kanban board</p>
          <Button onClick={() => onAdd(projectId)} variant="primary">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}
    </div>
  )
}

export default KanbanBoard