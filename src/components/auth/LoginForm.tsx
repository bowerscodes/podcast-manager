'use client';

import MagicLinkForm from './MagicLinkForm';

type Props = {
  onClose?: () => void;
};

export default function LoginForm ({ onClose }: Props) {
  const handleSuccess = () => {
    if (onClose) {
      setTimeout(onClose, 3000);
    }
  }
  return (
    <div className='space-y-4'>
      <MagicLinkForm onSuccess={handleSuccess} />
    </div>
  );
};
