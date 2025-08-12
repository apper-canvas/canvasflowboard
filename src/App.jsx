import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import Dashboard from "@/components/pages/Dashboard"
import Projects from "@/components/pages/Projects"
import ProjectDetail from "@/components/pages/ProjectDetail"
import Tasks from "@/components/pages/Tasks"
import TimeTracking from "@/components/pages/TimeTracking"
import PlaceholderPage from "@/components/pages/PlaceholderPage"

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="time" element={<TimeTracking />} />
            <Route 
              path="calendar" 
              element={
                <PlaceholderPage 
                  title="Calendar" 
                  description="View and manage project deadlines, task due dates, and schedule meetings with team members."
                  icon="Calendar"
                />
              } 
            />
            <Route 
              path="reports" 
              element={
                <PlaceholderPage 
                  title="Reports" 
                  description="Generate detailed reports on project progress, team productivity, and time tracking analytics."
                  icon="BarChart3"
                />
              } 
            />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="z-50"
        />
      </div>
    </BrowserRouter>
  )
}

export default App