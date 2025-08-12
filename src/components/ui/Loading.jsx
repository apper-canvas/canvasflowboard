import React from "react"
import { cn } from "@/utils/cn"

const Loading = ({ className, text = "Loading..." }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="relative">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  )
}

export const LoadingSkeleton = ({ className }) => {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-slate-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-slate-200 rounded h-4 w-1/2 mb-2"></div>
      <div className="bg-slate-200 rounded h-4 w-5/6"></div>
    </div>
  )
}

export const ProjectCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-slate-200 rounded h-6 w-3/4"></div>
        <div className="bg-slate-200 rounded-full h-6 w-16"></div>
      </div>
      <div className="bg-slate-200 rounded h-4 w-full mb-3"></div>
      <div className="bg-slate-200 rounded h-2 w-full mb-4"></div>
      <div className="flex items-center justify-between">
        <div className="bg-slate-200 rounded h-4 w-20"></div>
        <div className="bg-slate-200 rounded h-4 w-16"></div>
      </div>
    </div>
  )
}

export default Loading