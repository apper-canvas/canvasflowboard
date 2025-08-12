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