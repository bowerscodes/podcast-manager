import { Button } from "@heroui/button";
import { useEffect, useRef, useState } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

type EpisodeDescriptionProps = {
  description: string;
};

export default function EpisodeDescription({
  description,
}: EpisodeDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldTruncate, setShouldTruncate] = useState(false);
  const [fullHeight, setFullHeight] = useState<number>(0);
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);

  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;

        // First, temporarily remove line clamp to get full height
        element.style.webkitLineClamp = "unset";
        element.style.overflow = "visible";
        element.style.display = "block";

        const fullHeight = element.scrollHeight;
        setFullHeight(fullHeight);

        // Then apply line clamp to get clamped height
        element.style.webkitLineClamp = "1";
        element.style.overflow = "hidden";
        element.style.display = "-webkit-box";
        element.style.setProperty("-webkit-box-orient", "vertical");

        const clampedHeight = element.clientHeight;
        setCollapsedHeight(clampedHeight);

        // Determine if truncation is needed
        const needsTruncation = fullHeight > clampedHeight;
        setShouldTruncate(needsTruncation);

        if (needsTruncation && !isExpanded) {
          element.style.webkitLineClamp = "1";
          element.style.overflow = "hidden";
          element.style.display = "-webkit-box";
          element.style.setProperty("-webkit-box-orient", "vertical");
        } else {
          element.style.webkitLineClamp = "unset";
          element.style.overflow = "visible";
          element.style.display = "block";
        }
      }
    };

    // Delay to ensure DOM is fully rendered
    const timer = setTimeout(checkOverflow, 100);

    // Re-check on window resize for responsive behaviour
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [description, isExpanded]);

  return (
    <>
      <div
        ref={containerRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isExpanded
            ? `${fullHeight + 10}px`
            : `${collapsedHeight + 5}px`,
        }}
      >
        <p
          ref={textRef}
          className="text-sm text-gray-600 leading-relaxed transition-all duration-300 ease-in-out"
        >
          {description}
        </p>
      </div>

      {shouldTruncate && (
        <Button
          size="sm"
          variant="light"
          className="h-auto px-0 py-0.5 w-fit justify-start text-blue-600 hover:bg-transparent rounded"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <span className="flex items-center gap-1 text-xs">
            {isExpanded ? (
              <>
                Show less{" "}
                <MdExpandLess
                  size={16}
                  className="transition-transform duration-200"
                />
              </>
            ) : (
              <>
                Show more{" "}
                <MdExpandMore
                  size={16}
                  className="transition-transform duration-200"
                />
              </>
            )}
          </span>
        </Button>
      )}
    </>
  );
};
