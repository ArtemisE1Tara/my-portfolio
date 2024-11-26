"use client"

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LogOut, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Stats from "@/components/stats"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Project {
  id?: number
  title: string
  description: string
  details: string
  file_url?: string
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    details: '',
    file_url: '',
  })
  const [editProjectId, setEditProjectId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('statistics')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<number[]>([])

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const detailsRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*')
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  useEffect(() => {
    if (editProjectId) {
      adjustTextareaHeight(descriptionRef.current)
      adjustTextareaHeight(detailsRef.current)
    }
  }, [editProjectId, newProject.description, newProject.details])

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 1000)}px`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProject(prev => ({ ...prev, [name]: value }))
    if (e.target.tagName.toLowerCase() === 'textarea') {
      adjustTextareaHeight(e.target as HTMLTextAreaElement)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsLoading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error } = await supabase.storage
          .from('projects')
          .upload(fileName, file)

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('projects')
          .getPublicUrl(fileName)

        setNewProject({ ...newProject, file_url: urlData.publicUrl })
      } catch (error) {
        console.error('Error uploading file:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (editProjectId) {
        const { error } = await supabase
          .from('projects')
          .update({
            title: newProject.title,
            description: newProject.description,
            details: newProject.details,
            file_url: newProject.file_url
          })
          .eq('id', editProjectId)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            title: newProject.title,
            description: newProject.description,
            details: newProject.details,
            file_url: newProject.file_url
          })
        
        if (error) throw error
      }

      setNewProject({ title: '', description: '', details: '', file_url: '' })
      setEditProjectId(null)
      await fetchProjects()
      setActiveTab('projects') // Switch back to the projects tab
    } catch (error) {
      console.error('Error submitting project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (project: Project) => {
    setNewProject(project)
    setEditProjectId(project.id || null)
    setActiveTab('create')
  }

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        window.location.href = '/'
      } else {
        console.error('Logout failed')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      setIsLoggingOut(false)
    }
  }

  const toggleProjectExpansion = (id: number) => {
    setExpandedProjects(prev => 
      prev.includes(id) ? prev.filter(projectId => projectId !== id) : [...prev, id]
    )
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" /> {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="create">{editProjectId ? 'Edit Project' : 'Create Project'}</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{project.description}</p>
                    <Separator className="my-2" />
                    <div className="relative">
                      <p className="text-sm mb-4 break-words">
                        {expandedProjects.includes(project.id!) 
                          ? project.details 
                          : truncateText(project.details, 100)}
                      </p>
                      {project.details.length > 100 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute bottom-0 right-0 bg-background"
                          onClick={() => toggleProjectExpansion(project.id!)}
                        >
                          {expandedProjects.includes(project.id!) 
                            ? <ChevronUp className="h-4 w-4" />
                            : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id!)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="create">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{editProjectId ? 'Edit Project' : 'Create a new project'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    value={newProject.title} 
                    onChange={handleChange} 
                    placeholder="Project title" 
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    ref={descriptionRef}
                    id="description" 
                    name="description" 
                    value={newProject.description} 
                    onChange={handleChange} 
                    placeholder="Brief description of the project" 
                    rows={3}
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="details">Details</Label>
                  <Textarea
                    ref={detailsRef}
                    id="details"
                    name="details"
                    value={newProject.details}
                    onChange={handleChange}
                    placeholder="Detailed description of the project"
                    rows={6}
                  />
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="file_url">File</Label>
                  <Input id="file_url" name="file_url" type="file" onChange={handleFileChange} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Project'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        <TabsContent value="statistics">
          <Stats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
