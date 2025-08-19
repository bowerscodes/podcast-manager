import Link from 'next/link';
import { Button } from '@heroui/button';


export default function AuthError() {
  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center">
      <div className="stats-card p-8 max-w-md text-center">
        <h1 className="heading-secondary mb-4">Authentication Error</h1>
        <p className="text-muted mb-6">
          There was a problem signing you in. Please try again.
        </p>
        <Button as={Link} href="/" className="btn-primary">
          Return Home
        </Button>
      </div>
    </div>
  );
};
