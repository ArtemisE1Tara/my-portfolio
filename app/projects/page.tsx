import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { FileText } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Disable caching and enable server-side rendering on each request
export const revalidate = 0;

async function getAllProjects() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return projects;
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

export default async function AllProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="text-4xl font-bold mb-8">All Projects</h1>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <Separator className="my-2" />
                <div className="relative">
                  <p className="text-sm mb-4 break-words">
                    {truncateText(project.details, 150)}
                  </p>
                </div>
                {project.file_url && (
                  <a 
                    href={project.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline mt-2"
                  >
                    <FileText className="mr-2 h-4 w-4" /> View File
                  </a>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/projects/${project.id}`}>Learn More</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
