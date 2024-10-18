import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

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
    .select('*') // Changed from empty string to '*'
    .order('id', { ascending: false }); // Optional: show newest first
  
  const { data: testimonials, error: testimonialsError } = await supabase
    .from('testimonials')
    .select('*')
    .order('id', { ascending: false }); // Optional: show newest first

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
    <div className="container mx-auto py-10">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Portfolio</h1>
        <p className="text-lg text-gray-600">Explore my projects and what people say about my work!</p>
      </section>

      {/* Projects Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8">Featured Projects</h2>
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-gray-600">{project.details}</p>
                  {project.file_url && (
                    <a 
                      href={project.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block mt-4"
                    >
                      View File
                    </a>
                  )}
                </CardContent>
                <CardFooter>
                  <a href={`/projects/${project.id}`} className="text-blue-600 hover:underline">
                    Learn More
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No projects available yet.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Testimonials Section */}
      <section>
        <h2 className="text-3xl font-semibold mb-8">Testimonials</h2>
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col">
                <CardContent className="flex-1 pt-6">
                  <blockquote className="relative">
                    <p className="text-lg italic text-gray-700">"{testimonial.content}"</p>
                    <footer className="mt-4 text-right text-gray-600">
                      — {testimonial.name}
                    </footer>
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No testimonials available yet.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}