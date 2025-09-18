"use client";

import { Card } from "@heroui/card";
import { useState } from "react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

type ExpandableContentProps = {
  title?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showChevron?: boolean;
  chevronPosition?: "start" | "end"
  customHeader?: (isExpanded: boolean) => React.ReactNode;
  variant?: "default" | "season";
  headerStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
};

export default function ExpandableContent({
  title,
  children,
  defaultExpanded = true,
  className = "",
  headerClassName = "",
  contentClassName = "",
  showChevron = true,
  chevronPosition = "end",
  customHeader,
  variant= "default",
  headerStyle,
  contentStyle
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const ChevronComponent = () => (
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
  );

  if (customHeader) {
    return (
      <div className={`${variant === 'season' ? 'season-accordion' : 'border-gradient-xl rounded-lg mb-6'} ${className}`}>
        <div
          className={`cursor-pointer ${headerClassName}`}
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          aria-expanded={isExpanded}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
          style={headerStyle}
        >
          {customHeader(isExpanded)} {/* Pass isExpanded to render prop */}
        </div>

        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}
          `}
          style={contentStyle}
        >
          <div className={`space-y-2 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Default header with configurable chevron position
  return (
    <div className={`border-gradient-xl rounded-lg mb-6 ${className}`}>
      <Card
        className="border border-gray-200 shadow-md"
        style={{ background: "var(--gradient-card-subtle)" }}
      >
        <div
          className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${headerClassName}`}
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          aria-expanded={isExpanded}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {chevronPosition === 'start' && showChevron && <ChevronComponent />}

          <div className="flex items-center gap-2">
            <h2 className="heading-secondary">{title}</h2>
            {chevronPosition === 'end' && showChevron && <ChevronComponent />}
          </div>
        </div>

        <div
          className="overflow-hidden transition-all duration-400 ease-in-out"
          style={{
            maxHeight: isExpanded ? "none" : "0px",
            opacity: isExpanded ? 1 : 0,
            ...contentStyle,
          }}
        >
          <div className={`px-3 pb-3 transition-all duration-400 ease-in-out ${contentClassName}`}>
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
}
