type Props = {
  message?: string;
  className?: string;
};

export default function LoadingSpinner({
  message = "Loading...",
  className = "p-8 text-center"
}: Props) {
  return (
    <div className={className}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p>{message}</p>
    </div>
  );
};
