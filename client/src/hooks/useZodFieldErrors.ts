import { useState } from 'react';
import { extractZodFieldErrors, formatFieldErrors, type ZodFieldErrors } from '@/lib/zodError';
import { toast } from 'sonner';

/**
 * Generic hook for managing Zod field errors with automatic extraction and toast notification.
 * Returns [errors, setErrors, handleError] where handleError can be used directly in mutation.onError
 */
export function useZodFieldErrors<T extends Record<string, string>>(
  initialState: T,
  options?: {
    /** Custom toast message prefix (default: "Validierungsfehler") */
    toastPrefix?: string;
    /** If true, shows individual field errors in toast (default: false) */
    showFieldsInToast?: boolean;
  }
): [T, React.Dispatch<React.SetStateAction<T>>, (error: unknown) => void] {
  const [errors, setErrors] = useState<T>(initialState);

  const handleError = (error: unknown) => {
    const fieldErrors = extractZodFieldErrors(error);
    const next = { ...initialState };
    let hasFieldErrors = false;

    // Map extracted errors to state shape
    for (const key of Object.keys(initialState)) {
      if (fieldErrors[key]) {
        (next as any)[key] = fieldErrors[key];
        hasFieldErrors = true;
      }
    }

    // Set general error if no field errors
    if (!hasFieldErrors && 'general' in next) {
      (next as any).general = (error as any)?.message || 'Unbekannter Fehler';
    }

    setErrors(next);

    // Toast notification
    const prefix = options?.toastPrefix || 'Validierungsfehler';
    if (hasFieldErrors && options?.showFieldsInToast) {
      toast.error(`${prefix}: ${formatFieldErrors(fieldErrors)}`);
    } else if (hasFieldErrors) {
      toast.error(prefix);
    } else {
      toast.error((error as any)?.message || prefix);
    }
  };

  return [errors, setErrors, handleError];
}
