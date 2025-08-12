import projectsData from "@/services/mockData/projects.json"

let projects = [...projectsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const projectService = {
  async getAll() {
    await delay(300)
    return [...projects]
  },

  async getById(id) {
    await delay(200)
    const project = projects.find(p => p.Id === parseInt(id))
    if (!project) {
      throw new Error("Project not found")
    }
    return { ...project }
  },

  async create(projectData) {
    await delay(400)
    const newProject = {
      ...projectData,
      Id: Math.max(...projects.map(p => p.Id)) + 1,
      createdAt: new Date().toISOString()
    }
    projects.push(newProject)
    return { ...newProject }
  },

  async update(id, projectData) {
    await delay(350)
    const index = projects.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Project not found")
    }
    
    projects[index] = {
      ...projects[index],
      ...projectData,
      Id: parseInt(id)
    }
    
    return { ...projects[index] }
  },

  async delete(id) {
    await delay(300)
    const index = projects.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Project not found")
    }
    
    projects.splice(index, 1)
    return true
  }
}