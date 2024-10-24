import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const revalidate = 0; // Add this to disable static generation

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch data for Projects and Testimonials from Supabase
async function getProjectsAndTestimonials() {
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('id', { ascending: false });
  
  const { data: testimonials, error: testimonialsError } = await supabase
    .from('testimonials')
    .select('*')
    .order('id', { ascending: false })
    .limit(3);

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    throw projectsError;
  }

  if (testimonialsError) {
    console.error('Error fetching testimonials:', testimonialsError);
    throw testimonialsError;
  }

  return { 
    projects: projects || [], 
    testimonials: testimonials || [] 
  };
}

export const metadata: Metadata = {
  title: 'My Portfolio',
  description: 'Explore my projects and testimonials',
};

export default async function Home() {
  const { projects, testimonials } = await getProjectsAndTestimonials();

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">OKAA Solutions</h1>
        <p className="text-xl text-muted-foreground">Working to solve workplace problems with innovative AI/ML applications</p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8">Featured Projects</h2>
        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        {projects.length > 5 && (
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-8">Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <blockquote className="relative">
                  <p className="text-lg italic text-muted-foreground">&quot;{testimonial.content}&quot;</p>
                  <footer className="mt-4 text-right text-sm font-medium">
                    — {testimonial.name}
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}
