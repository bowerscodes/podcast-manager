type Props = {
  children?: React.ReactNode;
  className?: string;
  color?: "gray" | "green" | "blue" | "red" | "yellow" | "purple" | "pink" | "indigo";
  explicit?: boolean;
  mode?: "light" | "dark";
};

const lightModeColorMap = {
  gray: 'bg-gray-200 text-gray-800 border-gray-400',
  green: 'bg-green-200 text-green-800 border-green-500',
  blue: 'bg-blue-200 text-blue-800 border-blue-500',
  red: 'bg-red-200 text-red-800 border-red-500',
  yellow: 'bg-yellow-200 text-yellow-800 border-yellow-500',
  purple: 'bg-purple-200 text-purple-800 border-purple-500',
  pink: 'bg-pink-200 text-pink-800 border-pink-500',
  indigo: 'bg-indigo-200 text-indigo-800 border-indigo-500',
};

const darkModeColorMap = {
  gray: 'bg-gray-700 text-gray-200 border-gray-500',
  green: 'bg-green-800 text-green-200 border-green-400',
  blue: 'bg-blue-800 text-blue-200 border-blue-400',
  red: 'bg-red-800 text-red-200 border-red-400',
  yellow: 'bg-yellow-700 text-yellow-200 border-yellow-400',
  purple: 'bg-purple-800 text-purple-200 border-purple-400',
  pink: 'bg-pink-800 text-pink-200 border-pink-400',
  indigo: 'bg-indigo-800 text-indigo-200 border-indigo-400',
};


export default function Tag({ children, className, color = "gray", explicit, mode = "dark" }: Props) {
  const finalColor = explicit ? "red" : color;
  const finalContent = explicit ? "EXPLICIT" : children;
  
  if (!finalContent) return null;

  // Choose the appropriate color map based on mode
  const colorMap = mode === "light" ? lightModeColorMap : darkModeColorMap;
  const colorClasses = colorMap[finalColor as keyof typeof colorMap] || colorMap.gray;
  
  return (
    <span className={`${className} inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-sm border-1.5 cursor-default select-none ${colorClasses}`}>
      {finalContent}
    </span>
  );
};
