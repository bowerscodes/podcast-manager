import toast from 'react-hot-toast';
import { CiEdit } from "react-icons/ci";
import { IoCheckmark, IoClose } from "react-icons/io5";
import { cloneElement, useCallback, useEffect, useRef, useState } from 'react';
import { textarea } from 'framer-motion/client';


type Props = {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  children: React.ReactElement<{ className?: string }>;
  inputClassName?: string;
  multiline?: boolean;
};

type ElementType = "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "span" | string;

const getElementStyles = (tagName: ElementType) => {
  switch (tagName) {
    case "h1":
      return {
        elementStyles: "font-[800] text-[xx-large]",
        iconSize: 24
      }
      break;
    case "h2":
      return {
        elementStyles: "font-[600] text-[x-large]",
        iconSize: 20
      }
      break;
    case "h3":
      return {
        elementStyles: "font-[600] text-[large]",
        iconSize: 18
      }
      break;
    default:
      return {
        elementStyles: "",
        iconSize: 16
      };
  }
}

export default function EditableField({
  value, 
  onSave, 
  children, 
  inputClassName = "",
  multiline = false
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const adjustInputSize = useCallback(() => {
    const currentRef = multiline ? textareaRef.current : inputRef.current;
    if (currentRef && !multiline) {
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
  }, [editValue, multiline]);

  useEffect(() => {
    if (isEditing) {
      adjustInputSize();
    }
  }, [editValue, isEditing, adjustInputSize])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return;
    }

    setSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      toast.success("Updated successfully");
    } catch (error) {
      console.error("Error saving: ", error);
      toast.error("Failed to update");
      setEditValue(value); // Reset on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const elementType = typeof children.type === "string" ? children.type : "span";
  const { elementStyles, iconSize } = getElementStyles(elementType);

  if (isEditing) {
    const originalClassName = children.props.className || ""

    const sharedProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditValue(e.target.value);
        adjustInputSize();
      },
      onKeyDown: handleKeyDown,
      className: `bg-transparent border-b2 border-blue-500 outline-none ${originalClassName} ${elementStyles} ${inputClassName}`,
      autoFocus: true,
      disabled: saving,
      style: {
        minHeight: "auto",
        boxShadow: "none",
        border: "none",
        minWidth: "20px"
      }
    };

    return (
      <div className="inline-flex items-center gap-2">
        {multiline ? (
          <textarea 
            ref={textareaRef}
            {...sharedProps}
            rows={3}
          />
        ) : (
          <input 
            ref={inputRef}
            type="text"
            {...sharedProps}
          />
        )}
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="text-green-500 hover:text-green-600 cursor-pointer"
            disabled={saving}
          >
            <IoCheckmark size={iconSize} />
          </button>
          <button
            onClick={handleCancel}
            className="text-red-500 hover:text-red-600 cursor-pointer"
          >
            <IoClose size={iconSize} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3">
      {cloneElement(children, {}, value)}
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-500 text-sm hover:text-blue-600 transition-colors cursor-pointer"
      >
        <CiEdit size={iconSize} />
      </button>      
    </div>
  )
}
