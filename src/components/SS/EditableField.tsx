import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineEdit } from "react-icons/ai";
import { IoCheckmark, IoClose } from "react-icons/io5";

import ExpandableText from "@/components/ui/ExpandableText";

type Props = {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  children: React.ReactElement<{ className?: string }>;
  inputClassName?: string;
  multiline?: boolean;
  maxLines?: number;
};

type ElementType = "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span" | string;

const getElementStyles = (tagName: ElementType) => {
  switch (tagName) {
    case "h1":
      return {
        elementStyles: "font-[800] text-[xx-large]",
        iconSize: 24,
      };
      break;
    case "h2":
      return {
        elementStyles: "font-[600] text-[x-large]",
        iconSize: 20,
      };
      break;
    case "h3":
      return {
        elementStyles: "font-[600] text-[large]",
        iconSize: 18,
      };
      break;
    default:
      return {
        elementStyles: "",
        iconSize: 16,
      };
  }
};

export default function EditableField({
  value,
  onSave,
  children,
  inputClassName = "",
  multiline = false,
  maxLines,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const [capturedStyles, setCapturedStyles] = useState<{
    fontSize: string;
    lineHeight: string;
    color: string;
    fontFamily: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayContainerRef = useRef<HTMLDivElement>(null);

  const captureTextStyles = useCallback(() => {
    if (!displayContainerRef.current) return null;

    const textElement = displayContainerRef.current.querySelector(
      "p, span, h1, h2, h3, h4, h5"
    );

    if (textElement) {
      const computedStyle = window.getComputedStyle(textElement);

      return {
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        color: computedStyle.color,
        fontFamily: computedStyle.fontFamily,
      };
    }

    return null;
  }, []);

  const adjustInputSize = useCallback(() => {
    const currentRef = multiline ? textareaRef.current : inputRef.current;
    if (currentRef && !multiline && !maxLines) {
      const input = inputRef.current as HTMLInputElement;

      const span = document.createElement("span");
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.style.whiteSpace = "pre";
      span.style.font = window.getComputedStyle(input).font;
      span.textContent = editValue || "W";
      document.body.appendChild(span);
      const width = span.offsetWidth;
      document.body.removeChild(span);
      input.style.width = `${width + 5}px`;
    }
  }, [editValue, multiline, maxLines]);

  useEffect(() => {
    if (isEditing) {
      adjustInputSize();
    }
  }, [editValue, isEditing, adjustInputSize]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        displayContainerRef.current &&
        !displayContainerRef.current.contains(event.target as Node)
      ) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, handleCancel]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      toast.success("Updated successfully");
    } catch (error) {
      console.error("Error saving: ", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update";
      toast.error(errorMessage);
      setEditValue(value); // Reset on error
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline && !maxLines) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const elementType =
    typeof children.type === "string" ? children.type : "span";
  const { elementStyles, iconSize } = getElementStyles(elementType);

  if (isEditing) {
    const originalClassName = children.props.className || "";

    const sharedProps = {
      value: editValue,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => {
        setEditValue(e.target.value);
        if (!maxLines) adjustInputSize();
      },
      onKeyDown: handleKeyDown,
      className: maxLines
        ? `bg-transparent border-b-2 border-blue-500 outline-none ${inputClassName}`
        : `bg-transparent border-b-2 border-blue-500 outline-none ${originalClassName} ${elementStyles} ${inputClassName}`,
      autoFocus: true,
      disabled: saving,
      style: {
        minHeight: "auto",
        boxShadow: "none",
        border: "none",
        minWidth: "20px",
        ...(maxLines &&
          capturedStyles && {
            fontSize: capturedStyles.fontSize,
            lineHeight: capturedStyles.lineHeight,
            color: capturedStyles.color,
            fontFamily: capturedStyles.fontFamily,
            width: "100%",
            resize: "none" as const,
            whiteSpace: "pre-wrap" as const,
            wordBreak: "break-word" as const,
          }),
        ...(maxLines &&
          !capturedStyles && {
            width: "100%",
            resize: "none" as const,
            whiteSpace: "pre-wrap" as const,
            wordBreak: "break-word" as const,
          }),
      },
    };

    return (
      <div className="inline-flex items-start gap-2 min-w-0">
        {multiline || maxLines ? (
          <textarea 
            ref={textareaRef} 
            {...sharedProps} 
            style={{
              ...sharedProps.style,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            rows={maxLines || 3} 
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            {...sharedProps}
            style={{
              ...sharedProps.style,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          />
        )}
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-gray-100 rounded-md p-1 shadow-sm hover:shadow-md transition-colors cursor-pointer"
            disabled={saving}
          >
            <IoCheckmark size={iconSize - 3} />
          </button>
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-gray-100 rounded-md p-1 shadow-sm hover:shadow-md transition-colors cursor-pointer"
          >
            <IoClose size={iconSize - 3} />
          </button>
        </div>
      </div>
    );
  }

  return children.type === ExpandableText ? (
  <div ref={displayContainerRef} className="flex items-start gap-1 min-w-0">
    <div className="flex-1 min-w-0">
      {cloneElement(children, {
        className: [
          children.props.className,
          "truncate whitespace-nowrap overflow-hidden min-w-0",
        ]
          .filter(Boolean)
          .join(" "),
      }, value)}
    </div>
    <button
      onClick={() => {
        const styles = captureTextStyles();
        setCapturedStyles(styles);
        setIsEditing(true);
      }}
      className="ml-1 text-blue-500 text-sm hover:text-blue-600 transition-colors cursor-pointer flex-shrink-0"
    >
      <AiOutlineEdit size={iconSize} />
    </button>
  </div>
) : (
    // Flex row for single-line fields
    <div ref={displayContainerRef} className="flex items-center gap-3 min-w-0">
      {cloneElement(
        children,
        {
          className: [
            children.props.className,
            "truncate whitespace-nowrap overflow-hidden min-w-0 flex-1",
          ]
            .filter(Boolean)
            .join(" "),
        },
        value
      )}
      <button
        onClick={() => {
          const styles = captureTextStyles();
          setCapturedStyles(styles);
          setIsEditing(true);
        }}
        className="text-blue-500 text-sm hover:text-blue-600 transition-colors cursor-pointer flex-shrink-0"
      >
        <AiOutlineEdit size={iconSize} />
      </button>
    </div>
  );
}
