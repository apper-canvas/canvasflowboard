import React from "react"
import { cn } from "@/utils/cn"
import Input from "@/components/atoms/Input"

const FormField = ({ label, error, required, className, children, ...props }) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children || <Input {...props} />}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FormField