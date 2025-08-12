import React from "react"
import { motion } from "framer-motion"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { formatDateShort, getUrgencyLevel } from "@/utils/dateUtils"

const TaskList = ({ tasks, onToggleComplete, onEdit, onDelete, onAdd, projectId }) => {
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
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 font-display">Tasks</h3>
        <Button size="sm" onClick={() => onAdd(projectId)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-1" />
          Add Task
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
          {tasks.map((task, index) => {
            const urgency = getUrgencyIcon(task.dueDate)
            
            return (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${
                  task.completed ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => onToggleComplete(task)}
                    className="mt-1"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed 
                        ? "bg-primary-500 border-primary-500" 
                        : "border-slate-300 hover:border-primary-400"
                    }`}>
                      {task.completed && (
                        <ApperIcon name="Check" className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          task.completed ? "line-through text-slate-500" : "text-slate-900"
                        }`}>
                          {task.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          task.completed ? "line-through text-slate-400" : "text-slate-600"
                        }`}>
                          {task.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                          {task.priority}
                        </Badge>
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                        >
                          <ApperIcon name="Edit" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(task)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2 text-xs text-slate-500">
                      <ApperIcon name={urgency.icon} className={`w-3 h-3 mr-1 ${urgency.color}`} />
                      <span className={urgency.color}>
                        {formatDateShort(new Date(task.dueDate))}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TaskList