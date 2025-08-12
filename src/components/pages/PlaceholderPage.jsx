import React from "react"
import Header from "@/components/organisms/Header"
import ApperIcon from "@/components/ApperIcon"

const PlaceholderPage = ({ title, description, icon = "Construction" }) => {
  return (
    <div className="flex-1 flex flex-col">
      <Header title={title} />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ApperIcon name={icon} className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2 font-display">
            Coming Soon
          </h2>
          <p className="text-slate-600 mb-6">
            {description}
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-lg">
            <p className="text-sm text-slate-600">
              This feature is currently under development and will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderPage