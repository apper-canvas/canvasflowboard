import React from "react"
import { motion } from "framer-motion"
import Badge from "@/components/atoms/Badge"
import ProgressBar from "@/components/atoms/ProgressBar"
import ApperIcon from "@/components/ApperIcon"
import { formatDateShort, getUrgencyLevel, getUrgencyColor, getUrgencyTextColor } from "@/utils/dateUtils"

const ProjectCard = ({ project, onClick, onEdit, onDelete }) => {
  const urgencyLevel = getUrgencyLevel(project.deadline)
  const urgencyColorClass = getUrgencyColor(urgencyLevel)
  const urgencyTextClass = getUrgencyTextColor(urgencyLevel)
  
  const getStatusVariant = (status) => {
    switch (status) {
      case "Planning": return "planning"
      case "In Progress": return "progress"
      case "On Hold": return "hold"
      case "Completed": return "completed"
      default: return "default"
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-lg border-l-4 ${urgencyColorClass} shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 font-display line-clamp-2">
            {project.name}
          </h3>
          <div className="flex items-center space-x-2 ml-4">
            <Badge variant={getStatusVariant(project.status)}>
              {project.status}
            </Badge>
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(project)
                }}
                className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
              >
                <ApperIcon name="Edit" className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(project)
                }}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="mb-4">
          <ProgressBar value={project.progress} showValue />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center">
              <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
              <span className={urgencyTextClass}>
                {formatDateShort(new Date(project.deadline))}
              </span>
            </div>
          </div>
          
          {urgencyLevel === "overdue" && (
            <Badge variant="error">Overdue</Badge>
          )}
          {urgencyLevel === "urgent" && (
            <Badge variant="warning">Due Soon</Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard