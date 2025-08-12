import React, { useState } from "react"
import { Outlet } from "react-router-dom"
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
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={{ onMobileMenuClick: handleMobileMenuToggle }} />
        </div>
      </div>
    </div>
  )
}

export default Layout