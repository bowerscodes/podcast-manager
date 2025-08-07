import AuthGuard from '@/components/auth/AuthGuard';
import PodcastForm from './PodcastForm';

export default function NewPodcastPage() {

  return (
    <AuthGuard>
      <div className="container mx-auto p-8 max-w-2xl">
        <h1>Create New Podcast</h1>
        <PodcastForm />
      </div>
    </AuthGuard>
  );
};
