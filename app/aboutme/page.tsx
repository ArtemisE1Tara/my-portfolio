import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch data from Supabase for About Me, Education, and Experience
async function getAboutMeData() {
  const { data: aboutMe, error: aboutMeError } = await supabase
    .from('aboutme')
    .select('content')
    .single();

  const { data: education, error: educationError } = await supabase
    .from('education')
    .select('*');

  const { data: experience, error: experienceError } = await supabase
    .from('experience')
    .select('id, company, role, description, start_year, end_year');

  if (aboutMeError) {
    console.error('Error fetching About Me:', aboutMeError);
  }
  if (educationError) {
    console.error('Error fetching Education:', educationError);
  }
  if (experienceError) {
    console.error('Error fetching Experience:', experienceError);
  }

  return { aboutMe, education, experience };
}

export default async function AboutPage() {
    const { aboutMe, education, experience } = await getAboutMeData();
  
    console.log('Experience Data:', experience); // Check what data is being returned
  
    return (
      <div className="container mx-auto py-10">
        {/* About Me Section */}
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-8">About Me</h1>
          <Card>
            <CardContent>
              <p>{aboutMe?.content}</p>
            </CardContent>
          </Card>
        </section>
  
        {/* Education Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8">Education</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {education?.map((edu) => (
              <Card key={edu.id}>
                <CardHeader>
                  <CardTitle>{edu.institution}</CardTitle>
                  <CardDescription>{edu.degree} - {edu.year}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{edu.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
  
       {/* Experience Section */}
       <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-8">xv</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experience?.map((exp) => (
              <Card key={exp.id}>
                <CardHeader>
                  <CardTitle>{exp.company}</CardTitle>
                  <CardDescription>{exp.role} ({exp.start_year} - {exp.end_year})</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{exp.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


      </div>
    );
  }
  