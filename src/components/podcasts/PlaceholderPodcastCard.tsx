import { Card, CardBody } from "@heroui/card";
import { AiOutlinePlusCircle } from "react-icons/ai";

type Props = {
  isFirstInList?: boolean;
  onCreateClick: () => void;
}

export default function PlaceholderPodcastCard({ isFirstInList, onCreateClick }: Props) {

  return (
    <Card
      className="podcast-card group border-2 h-[300px] border-dashed"
      style={{
        borderColor: 'rgba(139, 92, 246, 0.8)',
        background: 'rgba(139, 92, 246, 0.05)'
      }}
      isPressable
      onPress={onCreateClick}
    >
      <CardBody className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
          style={{
            background: 'var(--gradient-primary)',
          }}
        >
          <AiOutlinePlusCircle className="text-white text-2xl" size={48} />          
        </div>
        <h3 className="text-gradient text-lg font-semibold mb-2">
          Add new podcast
        </h3>
        {isFirstInList && 
          <p className="text-muted text-sm max-w-xs">
          Create your first podcast to get started
        </p>
        }
      </CardBody>
    </Card>
  )
};
