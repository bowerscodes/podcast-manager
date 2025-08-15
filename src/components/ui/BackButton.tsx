import { Button } from '@heroui/button';

import useNavigation from '@/hooks/useNavigation';

type Props = {
  to?: string;
  fallbackPath?: string;
};

export default function BackButton({ to, fallbackPath = "/podcasts" }: Props) {
  const { handleBack } = useNavigation();

  return (
    <Button 
      variant="light" 
      color="primary" 
      className="px-0"
      onPress={() => handleBack(fallbackPath)}
    >
      ← Back {to && `to ${to.charAt(0).toUpperCase() + to.slice(1)}`}
    </Button>
  );
}
