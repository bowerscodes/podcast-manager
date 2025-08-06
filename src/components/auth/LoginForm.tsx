'use client';

import SocialLoginButtons from './SocialLoginButtons';
import EmailPasswordForm from './EmailPasswordForm';

type Props = {
  isSignUp: boolean;
  onToggleMode: () => void;
};

export default function LoginForm ({ isSignUp, onToggleMode }: Props) {
  return (
    <div className='space-y-4'>
      <SocialLoginButtons />
      <EmailPasswordForm 
        isSignUp={isSignUp}
        onToggleMode={onToggleMode}
      />
    </div>
  );
};
