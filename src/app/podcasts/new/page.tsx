import AuthGuard from '@/components/auth/AuthGuard';
import NewPodcastForm from '../../../components/forms/NewPodcastForm';

export default function NewPodcastPage() {

  return (
    <AuthGuard>
      <div className="container mx-auto p-8 max-w-2xl">
        <h1>Create New Podcast</h1>
        <NewPodcastForm />
      </div>
    </AuthGuard>
  );
};
