import { createClient } from '@supabase/supabase-js';
import { Card, CardContent} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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
  const { testimonials } = await getProjectsAndTestimonials();

  return (
    <>
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">OKAA Solutions</h1>
        <p className="text-xl text-muted-foreground">Working to solve workplace problems with innovative AI/ML applications</p>
      </section>

      {/* New highlighted section */}
      <section className="my-20 bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Discover Our Latest Project</h2>
            <p className="text-lg mb-6">
              A real time AI-powered occupancy detector that helps you find an empty seat in a crowded space.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link href="/hot-seat">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2 bg-primary-foreground p-8">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src="https://ucarecdn.com/11c5417a-de78-4578-ae8c-4296eb261106/-/preview/1000x562/" 
                alt="AI Project Visualization" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
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
    </>
  );
}

