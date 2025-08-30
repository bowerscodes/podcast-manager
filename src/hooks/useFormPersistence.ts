import { useEffect, useState, useCallback } from "react";

export function useFormPersistence<T>(key: string, initialData: T) {
  const [formData, setFormData] = useState<T>(() => {
    if (typeof window === "undefined") return initialData;

    try {
      const saved = localStorage.getItem(key);
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
    } catch {
      return initialData;
    }
  });

  // Auto-save to localStorage when formData changes
  useEffect(() => {
    if (typeof window !== undefined) {
      localStorage.setItem(key, JSON.stringify(formData));
    }
  }, [key, formData]);

  const clearPersistedData = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  }, [key]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    clearPersistedData();
  }, [initialData, clearPersistedData]);

  return {
    formData, 
    setFormData, 
    clearPersistedData,
    resetForm,
  };
}
