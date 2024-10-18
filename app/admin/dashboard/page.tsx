'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Project {
  id?: number;
  title: string;
  description: string;
  details: string;
  file_url?: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    details: '',
    file_url: '',
  });
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        // Create a unique file name to prevent conflicts
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error } = await supabase.storage
          .from('projects') // Make sure this bucket exists in your Supabase storage
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('projects')
          .getPublicUrl(fileName);

        setNewProject({ ...newProject, file_url: urlData.publicUrl });
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
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
          .eq('id', editProjectId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            title: newProject.title,
            description: newProject.description,
            details: newProject.details,
            file_url: newProject.file_url
          });
        
        if (error) throw error;
      }

      // Reset form and refresh projects
      setNewProject({ title: '', description: '', details: '', file_url: '' });
      setEditProjectId(null);
      await fetchProjects();
    } catch (error) {
      console.error('Error submitting project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setNewProject(project);
    setEditProjectId(project.id || null);
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editProjectId ? 'Edit Project' : 'Create Project'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Project title"
                value={newProject.title}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                placeholder="Short description"
                value={newProject.description}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md h-24"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <textarea
                name="details"
                placeholder="Detailed information"
                value={newProject.details}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md h-32"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">File</label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Processing...' : (editProjectId ? 'Update Project' : 'Create Project')}
            </button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Existing Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-gray-600 mb-2">{project.description}</p>
              <p className="text-sm text-gray-500 mb-4">{project.details}</p>
              {project.file_url && (
                <a 
                  href={project.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block mb-4"
                >
                  View File
                </a>
              )}
              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => handleEdit(project)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(project.id!)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
