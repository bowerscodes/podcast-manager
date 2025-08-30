type Props = {
  children: React.ReactNode;
  className?: string;
  color?: string;
};

const colorMap = {
  gray: 'bg-gray-300 text-gray-800',
  green: 'bg-green-300 text-green-800',
  blue: 'bg-blue-300 text-blue-800',
  red: 'bg-red-300 text-red-800',
  yellow: 'bg-yellow-300 text-yellow-800',
  purple: 'bg-purple-300 text-purple-800',
  pink: 'bg-pink-300 text-pink-800',
  indigo: 'bg-indigo-300 text-indigo-800',
};


export default function Tag({ children, className, color = "gray" }: Props) {
  if (!children) return null;

  const colorClasses = colorMap[color as keyof typeof colorMap] || colorMap.gray;
  
  return (
    <span className={`${className} inline-flex items-center px-2 py-0.5 text-xs font-medium text-black-500 rounded-sm ${colorClasses}`}>
      {children}
    </span>
  );
};
