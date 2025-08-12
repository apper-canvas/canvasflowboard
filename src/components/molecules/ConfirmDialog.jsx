import React from "react"
import Modal from "./Modal"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger"
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <ApperIcon name="AlertTriangle" className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex space-x-3 justify-center">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog