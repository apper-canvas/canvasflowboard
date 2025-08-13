import { format, isToday, isTomorrow, isPast, differenceInDays, startOfDay } from "date-fns"

export const formatDate = (date) => {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "MMM dd, yyyy")
}

export const formatDateShort = (date) => {
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, "MMM dd")
}

export const getUrgencyLevel = (dueDate) => {
  const now = new Date()
  const due = new Date(dueDate)
  
  if (isPast(due) && !isToday(due)) return "overdue"
  if (isToday(due) || isTomorrow(due)) return "urgent"
  if (differenceInDays(due, now) <= 3) return "soon"
  return "normal"
}

export const getUrgencyColor = (level) => {
  switch (level) {
    case "overdue":
      return "border-red-500 bg-red-50"
    case "urgent":
      return "border-orange-500 bg-orange-50"
    case "soon":
      return "border-yellow-500 bg-yellow-50"
    default:
      return "border-green-500 bg-green-50"
  }
}

export const getUrgencyTextColor = (level) => {
  switch (level) {
    case "overdue":
      return "text-red-700"
    case "urgent":
      return "text-orange-700"
    case "soon":
      return "text-yellow-700"
    default:
      return "text-green-700"
  }
}

// Time formatting utilities
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const parseDuration = (hours, minutes) => {
  return (parseInt(hours || 0) * 3600) + (parseInt(minutes || 0) * 60)
}

// Calendar-specific utilities
export const generateCalendarGrid = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)
  
  // Start from the Sunday of the week containing the first day
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  
  // End on the Saturday of the week containing the last day
  const endDate = new Date(lastDay)
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
  
  const calendarDates = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    calendarDates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return calendarDates
}

export const getMonthName = (date) => {
  return date.toLocaleString('default', { month: 'long' })
}

export const getWeekDates = (date) => {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay()) // Go to Sunday
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek)
    weekDate.setDate(startOfWeek.getDate() + i)
    weekDates.push(weekDate)
  }
  
  return weekDates
}

export const getPreviousMonth = (date) => {
  const prevMonth = new Date(date)
  prevMonth.setMonth(date.getMonth() - 1)
  return prevMonth
}

export const getNextMonth = (date) => {
  const nextMonth = new Date(date)
  nextMonth.setMonth(date.getMonth() + 1)
  return nextMonth
}

export const groupEventsByDate = (events) => {
  const grouped = {}
  
  events.forEach(event => {
    const dateKey = event.date.toDateString()
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(event)
  })
  
  // Sort events within each date by time, then by priority
  Object.keys(grouped).forEach(dateKey => {
    grouped[dateKey].sort((a, b) => {
      // First by time (if available)
      const timeA = a.date.getHours() * 60 + a.date.getMinutes()
      const timeB = b.date.getHours() * 60 + b.date.getMinutes()
      if (timeA !== timeB) return timeA - timeB
      
      // Then by priority (for tasks)
      if (a.priority && b.priority) {
        const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 }
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
      }
      
      // Finally by title alphabetically
      return a.title.localeCompare(b.title)
    })
  })
  
  return grouped
}

export const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString()
}