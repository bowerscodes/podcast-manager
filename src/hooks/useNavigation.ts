"use client"; 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';


export default function useNavigation() {
  const router = useRouter();
  const [canGoBack, setCangoBack] = useState(false);

  useEffect(() => {
    setCangoBack(window.history.length > 1);
  }, []);

  const handleBack = (fallbathPath: string = "/podcasts") => {
    if (canGoBack) {
      router.back();
    }
    else {
      router.push(fallbathPath)
    }
  };

  return {
    canGoBack,
    handleBack,
    router
  };
}
