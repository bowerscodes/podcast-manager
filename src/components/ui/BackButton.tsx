"use client";

import { useRouter } from 'next/navigation';

type Props = {
  to?: string;
  fallbackPath?: string;
};

export default function BackButton({ to, fallbackPath = "/podcasts" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (to) {
      // Priority 1: Go to specific route if provided
      // Ensure it's treated as absolute path by adding leading slash if missing
      const absolutePath = to.startsWith('/') ? to : `/${to}`;
      router.push(absolutePath);
    } else if (window.history.length > 1) {
      // Priority 2: Browser back if history exists
      window.history.back();
    } else {
      // Priority 3: Fallback route
      router.push(fallbackPath);
    }
  };

  return (
    <button 
      className="flex px-0 text-blue-400 hover:text-primary-500 transition-colors"
      onClick={handleBack}
      style={{ 
        background: 'transparent', 
        border: 'none',
        cursor: 'pointer'
      }}
    > 
      {`← `}<p className="pl-2 hover:underline underline-offset-4">Back {to && `to ${to.charAt(0).toUpperCase() + to.slice(1)}`}</p>
    </button>
  );
}
