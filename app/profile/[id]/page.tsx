// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

import PublicProfileClient from './PublicProfileClient';

export default function PublicProfilePage() {
  return <PublicProfileClient />;
}