import React, { useContext } from 'react'
import { AuthContext } from '../../App'
import ApperIcon from '@/components/ApperIcon'
import Button from './Button'

const LogoutButton = () => {
  const { logout } = useContext(AuthContext)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button 
      variant="secondary" 
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <ApperIcon name="LogOut" className="w-4 h-4" />
      Logout
    </Button>
  )
}

export default LogoutButton