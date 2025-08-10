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
      <div className="loading-spinner mx-auto mb-2"></div>
      <p className="text-muted">{message}</p>
    </div>
  );
};
