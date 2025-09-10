"use client";

import { Card } from "@heroui/card";
import { useState, useRef, useEffect } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

type ExpandableContentProps = {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showChevron?: boolean;
};

export default function ExpandableContent({
  title,
  children,
  defaultExpanded = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
  showChevron = true,
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const calculateHeight = () => {
      if (contentRef.current) {
        const newHeight = contentRef.current.scrollHeight;
        setContentHeight(newHeight);
      }
    };

    if (mounted) {
      
      calculateHeight();

      // Immediate recalculation
      const timer1 = setTimeout(calculateHeight, 50);

      // Recalculate again once components have had time to render
      const timer2 = setTimeout(calculateHeight, 200);

      // Final recalculation for complex nested components
      const timer3 = setTimeout(calculateHeight, 500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [children, isExpanded, mounted]);

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return() => window.removeEventListener("resize", handleResize);
  }, []);


  const maxHeightStyle = isExpanded 
  ? (contentHeight > 0 ?`${contentHeight + 60}px` : "2000px")
  : "0px";

  return (
    <div className={`border-gradient-xl rounded-lg mb-6 ${className}`}>
      <Card
        className="border border-gray-200 shadow-md"
        style={{ background: "var(--gradient-card-subtle)" }}
      >
        <div
          className={`flex items-center  p-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${headerClassName}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="heading-secondary">{title}</h2>
          {showChevron && (
            <div className="text-gray-600 hover:text-primary transition-colors p-2">
              {isExpanded ? (
                <MdExpandLess
                  size={20}
                  className="transition-transform duration-200"
                />
              ) : (
                <MdExpandMore
                  size={20}
                  className="transition-transform duration-200"
                />
              )}
            </div>
          )}
        </div>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{
            maxHeight: maxHeightStyle,
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div>
            <div
              ref={contentRef}
              className={`px-3 pb-3 transition-all duration-400 ease-in-out ${contentClassName}`}
            >
              {children}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
