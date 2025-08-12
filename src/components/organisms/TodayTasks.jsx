import React from "react"
import { motion } from "framer-motion"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { isToday } from "date-fns"

const TodayTasks = ({ tasks, projects, onToggleComplete }) => {
  const todayTasks = tasks.filter(task => isToday(new Date(task.dueDate)))
  const completedCount = todayTasks.filter(task => task.completed).length
  
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
            {todayTasks.map((task, index) => (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start space-x-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors ${
                  task.completed ? "opacity-75 bg-slate-50" : "bg-white border-slate-200"
                }`}
              >
                <button
                  onClick={() => onToggleComplete(task)}
                  className="mt-0.5"
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    task.completed 
                      ? "bg-primary-500 border-primary-500" 
                      : "border-slate-300 hover:border-primary-400"
                  }`}>
                    {task.completed && (
                      <ApperIcon name="Check" className="w-2.5 h-2.5 text-white" />
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
                      <p className="text-xs text-slate-500 mt-1">
                        {getProjectName(task.projectId)}
                      </p>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs ml-2">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TodayTasks