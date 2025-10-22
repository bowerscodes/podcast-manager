import { inputErrorTextStyles } from "../../lib/input-config";

export function Error({ error, inputId }: { error: string; inputId: string }) {

  return (
    <span id={`${inputId}-error`} className={inputErrorTextStyles} role="alert">
      {error}
    </span>
  );
}