import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Header = ({ title, subtitle, action, onMobileMenuClick }) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md mr-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">{title}</h1>
            {subtitle && (
              <p className="text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {action && (
          <div className="flex items-center space-x-3">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export default Header