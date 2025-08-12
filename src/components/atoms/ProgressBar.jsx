import React from "react"
import { cn } from "@/utils/cn"

const ProgressBar = ({ value = 0, className, showValue = false }) => {
  const percentage = Math.min(Math.max(value, 0), 100)
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        {showValue && (
          <span className="text-xs font-medium text-slate-600">{percentage}%</span>
        )}
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar