import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import ApperIcon from "@/components/ApperIcon";
import TimerWidget from "@/components/molecules/TimerWidget";
import LogoutButton from "@/components/atoms/LogoutButton";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
<div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={handleMobileMenuClose}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Timer Header */}
<div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                onClick={handleMobileMenuToggle}
              >
                <ApperIcon name="Menu" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <TimerWidget />
              <LogoutButton />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet context={{ onMobileMenuClick: handleMobileMenuToggle }} />
        </div>
      </div>
</div>
  );
};

export default Layout;