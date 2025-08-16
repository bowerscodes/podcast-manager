
type Props = {
  isExplicit: boolean;
  className?: string;
}

export default function ExplicitTag({ isExplicit, className }: Props) {
  if (!isExplicit) return null;
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-sm ${className}`}>
      EXPLICIT
    </span>
  );
};
