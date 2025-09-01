type Props = {
  children?: React.ReactNode;
  className?: string;
  color?: "gray" | "green" | "blue" | "red" | "yellow" | "purple" | "pink" | "indigo";
  explicit?: boolean
};

const colorMap = {
  gray: 'bg-gray-300 text-gray-800 border-gray-600',
  green: 'bg-green-300 text-green-800 border-green-600',
  blue: 'bg-blue-300 text-blue-800 border-blue-600',
  red: 'bg-red-300 text-red-800 border-red-600',
  yellow: 'bg-yellow-300 text-yellow-800 border-yellow-600',
  purple: 'bg-purple-300 text-purple-800 border-purple-600',
  pink: 'bg-pink-300 text-pink-800 border-pink-600',
  indigo: 'bg-indigo-300 text-indigo-800 border-indigo-600',
};


export default function Tag({ children, className, color = "gray", explicit }: Props) {
  const finalColor = explicit ? "red" : color;
  const finalContent = explicit ? "EXPLICIT" : children;
  
  if (!finalContent) return null;

  const colorClasses = colorMap[finalColor as keyof typeof colorMap] || colorMap.gray;
  
  return (
    <span className={`${className} inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-sm border-1.5 cursor-default select-none ${colorClasses}`}>
      {finalContent}
    </span>
  );
};
