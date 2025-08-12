import React from "react"
import { cn } from "@/utils/cn"

const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    primary: "bg-primary-100 text-primary-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    planning: "bg-blue-100 text-blue-700",
    progress: "bg-indigo-100 text-indigo-700",
    hold: "bg-orange-100 text-orange-700",
    completed: "bg-green-100 text-green-700"
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge