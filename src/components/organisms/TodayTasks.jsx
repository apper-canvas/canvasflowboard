import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { isToday } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const TodayTasks = ({ tasks, projects, onToggleComplete, onAddSubtask }) => {
const todayTasks = useMemo(() => {
    // Only show main tasks (no subtasks) in today's view
    return tasks.filter(task => isToday(new Date(task.dueDate)) && !task.parentId)
  }, [tasks])
  
  const completedCount = todayTasks.filter(task => task.completed).length
  
  const getSubtasks = (parentId) => {
    return tasks.filter(task => task.parentId === parentId)
  }
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.Id === projectId)
    return project?.name || "Unknown Project"
  }
  
const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return "error"
      case "High": return "warning" 
      case "Medium": return "info"
      case "Low": return "success"
      default: return "default"
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 font-display">Today's Tasks</h2>
          <div className="text-sm text-slate-500">
            {completedCount}/{todayTasks.length} completed
          </div>
        </div>
        
        {todayTasks.length === 0 ? (
          <div className="text-center py-6">
            <ApperIcon name="CheckCircle" className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-slate-500">No tasks for today</p>
            <p className="text-sm text-slate-400">Enjoy your free time!</p>
          </div>
        ) : (
          <div className="space-y-3">
{todayTasks.map((task, index) => {
              const subtasks = getSubtasks(task.Id)
              const completedSubtasks = subtasks.filter(sub => sub.completed).length
              
const renderTask = (taskItem, depth = 0) => {
                const blockedByTasks = taskItem.blockedBy ? 
                  taskItem.blockedBy.map(id => tasks.find(t => t.Id === id)).filter(Boolean) : []
                const isBlocked = blockedByTasks.length > 0

                return (
                <motion.div
                  key={taskItem.Id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors ${
                    taskItem.completed ? "opacity-75 bg-slate-50" : isBlocked ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
                  }`}
                  style={{ marginLeft: depth * 16 }}
                >
                  <button
                    onClick={() => onToggleComplete(taskItem)}
                    className="mt-0.5"
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      taskItem.completed 
                        ? "bg-primary-500 border-primary-500" 
                        : "border-slate-300 hover:border-primary-400"
                    }`}>
                      {taskItem.completed && (
                        <ApperIcon name="Check" className="w-2.5 h-2.5 text-white" />
                      )}
                    </div>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-medium ${
                            taskItem.completed ? "line-through text-slate-500" : "text-slate-900"
                          }`}>
                            {taskItem.title}
                          </h4>
                          {depth === 0 && subtasks.length > 0 && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {completedSubtasks}/{subtasks.length}
                            </span>
                          )}
                          {depth === 0 && onAddSubtask && (
                            <button
                              onClick={() => onAddSubtask(taskItem.Id)}
                              className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                              title="Add subtask"
                            >
                              <ApperIcon name="Plus" className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {getProjectName(taskItem.projectId)}
                        </p>
                      </div>
<Badge variant={getPriorityColor(taskItem.priority)} className="text-xs ml-2">
                        {taskItem.priority}
                      </Badge>
                      {isBlocked && (
                        <div className="flex items-center gap-1 ml-2">
                          <ApperIcon name="AlertTriangle" size={12} className="text-amber-500" />
                          <span className="text-xs text-amber-600">Blocked</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
              
              return (
                <div key={task.Id}>
                  {renderTask(task, 0)}
                  {subtasks.map(subtask => renderTask(subtask, 1))}
</div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TodayTasks