import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAboutMe() {
  const { data, error } = await supabase
    .from('aboutme')
    .select('content')
    .single(); // Ensure only a single row is returned

  if (error) {
    console.error('Error fetching About Me:', error);
    return null;
  }

  return data;
}

export default async function AboutMePage() {
  const aboutMe = await getAboutMe();

  if (!aboutMe) {
    return <p>Error fetching About Me</p>;
  }

  return (
    <div>
      <h1>About Me</h1>
      <p>{aboutMe.content}</p>
    </div>
  );
}