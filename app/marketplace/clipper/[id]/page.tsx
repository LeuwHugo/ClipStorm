import ClipperProfileClient from './ClipperProfileClient';

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // Return a list of possible clipper IDs for static generation
  // In a real app, you would fetch this from your database
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function ClipperProfilePage() {
  return <ClipperProfileClient />;
}