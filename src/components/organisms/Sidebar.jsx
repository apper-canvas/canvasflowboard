import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const navigation = [
  { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { name: "Projects", href: "/projects", icon: "FolderOpen" },
  { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
  { name: "Time Tracking", href: "/time", icon: "Clock" },
  { name: "Calendar", href: "/calendar", icon: "Calendar", disabled: true },
  { name: "Reports", href: "/reports", icon: "BarChart3" }
]

const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const location = useLocation()

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      <div className="flex items-center h-16 px-6 border-b border-slate-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" className="w-5 h-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-slate-900 font-display">FlowBoard</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onMobileClose}
            className={({ isActive }) => cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              isActive 
                ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-500" 
                : item.disabled
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            )}
          >
            <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
            {item.name}
            {item.disabled && (
              <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-900 mb-1">Need help?</h4>
          <p className="text-xs text-slate-600 mb-3">Check out our documentation and guides</p>
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            Learn more →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-full">
        <SidebarContent />
      </div>
      
      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onMobileClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-64 transform"
          >
            <SidebarContent />
          </motion.div>
        </div>
      )}
    </>
  )
}

export default Sidebar