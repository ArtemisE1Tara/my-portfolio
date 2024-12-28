import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Portfolio',
  description: 'Explore my projects and testimonials',
};

// Hardcoded testimonials
const hardcodedTestimonials = [
  {
    id: 1,
    content: "This platform has transformed the way I work. Highly recommended!",
    name: "John Doe",
  },
  {
    id: 2,
    content: "Amazing features and exceptional support from the team!",
    name: "Jane Smith",
  },
  {
    id: 3,
    content: "I’ve saved so much time and effort thanks to this solution.",
    name: "Chris Johnson",
  },
];

export default function Home() {
  const testimonials = hardcodedTestimonials;

  return (
    <>
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">OKAA Solutions</h1>
          <p className="text-xl text-muted-foreground">
            Working to solve workplace problems with innovative AI/ML applications
          </p>
        </section>

        {/* New highlighted section */}
        <section className="my-20 bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-4">Discover Our Latest Project</h2>
              <p className="text-lg mb-6">
                A real-time AI-powered occupancy detector that helps you find an empty seat in a crowded space.
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
                    <p className="text-lg italic text-muted-foreground">
                      &quot;{testimonial.content}&quot;
                    </p>
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
