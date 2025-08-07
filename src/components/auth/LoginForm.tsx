'use client';

import SocialLoginButtons from './SocialLoginButtons';
import EmailPasswordForm from './EmailPasswordForm';

type Props = {
  isSignUp: boolean;
  onToggleMode: () => void;
  onSuccess: () => void;
};

export default function LoginForm ({ isSignUp, onToggleMode, onSuccess }: Props) {
  return (
    <div className='space-y-4'>
      <SocialLoginButtons />
      <EmailPasswordForm 
        isSignUp={isSignUp}
        onToggleMode={onToggleMode}
        onSuccess={onSuccess}
      />
    </div>
  );
};
