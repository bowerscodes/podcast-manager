import useNavigation from '@/hooks/useNavigation';

type Props = {
  to?: string;
  fallbackPath?: string;
};

export default function BackButton({ to, fallbackPath = "/podcasts" }: Props) {
  const { handleBack } = useNavigation();

  return (
    <button 
      className="flex px-0 text-blue-400 hover:text-primary-500 transition-colors"
      onClick={() => handleBack(fallbackPath)}
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
