"use client";

import { Card } from "@heroui/card";
import { useState, useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);

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
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: isExpanded ? "none" : "0px",
            height: isExpanded ? "auto" : "0px",
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div>
            <div
              ref={contentRef}
              className={`px-3 pb-3 transition-all duration-300 ease-in-out ${contentClassName}`}
            >
              {children}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
