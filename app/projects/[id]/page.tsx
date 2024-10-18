import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProjectData(id: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('')
    .eq('id', id)
    .single(); // Fetch a single project based on the ID

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return project;
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectData(params.id);

  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <p>{project.details}</p>

          {/* If you have files or sources, you can list them here */}
          {project.files && project.files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold">Files:</h3>
              <ul>
                {project.files.map((file: string, index: number) => (
                  <li key={index}>
                    <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}