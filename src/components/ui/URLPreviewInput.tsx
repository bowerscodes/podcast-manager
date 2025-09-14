import { Input } from "@heroui/input";

type Props = {
  value: string;
  label?: string;
  description?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  baseUrl?: string;
  username?: string;
  editing: "username" | "podcastName";
  minLength?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  touched?: boolean;
};

export default function URLPreviewInput({
  value,
  label,
  description,
  onChange,
  baseUrl,
  username,
  editing,
  minLength = 3,
  suffix,
  placeholder,
  disabled,
  touched = false,
}: Props) {
  let displayBase =
    baseUrl ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  displayBase = displayBase.replace(/^https?:\/\//, "").replace(/^www\./, "");

  const isValid = value.length >= minLength && /^[a-z0-9-]+$/.test(value);

  return (
    <div className="border-1 rounded-xl border-gray-300 px-3 py-2">
      {label && <label className="block font-medium mb-1">{label}</label>}
      {description && (
        <div className="text-xs text-gray-500 mb-1">{description}</div>
      )}
      <div className="flex items-center">
        <span className="text-gray-500">{displayBase}/</span>
        {editing === "podcastName" && username && (
          <span className="text-gray-500">{username}/</span>
        )}
        <Input
          value={value}
          label="URL"
          labelPlacement="outside-top"
          onChange={onChange}
          placeholder={placeholder}
          className={`w-40 mx-1 ${!isValid ? "border-red-500" : ""}`}
          disabled={disabled}
          isRequired
        />
        {suffix && <span className="text-gray-500">{suffix}</span>}
      </div>
      {!isValid && touched && (
        <div className="text-xs text-red-500 mt-1">
          Only lowercase letters, numbers, and hyphens allowed. Minimum{" "}
          {minLength} characters.
        </div>
      )}
    </div>
  );
}
