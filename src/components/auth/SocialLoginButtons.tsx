'use client';

import { Button } from '@heroui/button';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

type SocialProvider = 'apple' | 'facebook' | 'github' | 'google';

const socialProviders: { provider: SocialProvider; label: string }[] = [
  { provider: 'apple', label: 'Continue with Apple'},
  { provider: 'facebook', label: 'Continue with Facebook'},
  { provider: 'github', label: 'Continue with GitHub'},
  { provider: 'google', label: 'Continue with Google'},
];

export default function SocialLoginButtons() {
  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    }
  };
  
  return (
    <div className='space-y-2'>
      {socialProviders.map(({ provider, label }) => (
        <Button
          key={provider}
          className='w-full'
          variant='bordered'
          onPress={() => handleSocialLogin(provider)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
