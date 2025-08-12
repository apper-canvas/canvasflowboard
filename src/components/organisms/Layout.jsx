import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import TimerWidget from "@/components/molecules/TimerWidget"
import Sidebar from "./Sidebar"

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  return (
<div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={handleMobileMenuClose}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Timer Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-end">
            <TimerWidget />
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={{ onMobileMenuClick: handleMobileMenuToggle }} />
        </div>
      </div>
    </div>
  )
}

export default Layout