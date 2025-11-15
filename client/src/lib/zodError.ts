// Central utility for extracting Zod (tRPC) field errors on the client
// Usage: import { extractZodFieldErrors } from '@/lib/zodError'
// Then inside a mutation onError: const fieldErrors = extractZodFieldErrors(error)

export type ZodFieldErrors = Record<string, string>;

interface TRPCZodErrorShape {
  data?: {
    zodError?: {
      fieldErrors?: Record<string, string[]>;
    };
  };
  message?: string;
}

/**
 * Extract first error message per field from a tRPC error containing a ZodError.
 */
export function extractZodFieldErrors(error: unknown): ZodFieldErrors {
  const err = error as TRPCZodErrorShape;
  const fieldErrors = err?.data?.zodError?.fieldErrors;
  if (!fieldErrors) return {};
  const result: ZodFieldErrors = {};
  for (const key of Object.keys(fieldErrors)) {
    const messages = fieldErrors[key];
    if (messages && messages.length) {
      result[key] = messages[0];
    }
  }
  return result;
}

/** True if the error includes any zod field errors */
export function hasZodFieldErrors(error: unknown): boolean {
  const err = error as TRPCZodErrorShape;
  return !!Object.keys(err?.data?.zodError?.fieldErrors || {}).length;
}

/** Optional helper to merge field errors into an existing error state object */
export function assignFieldErrors<T extends Record<string, any>>(target: T, fieldErrors: ZodFieldErrors): T {
  for (const [key, value] of Object.entries(fieldErrors)) {
    if (key in target) {
      (target as any)[key] = value;
    }
  }
  return target;
}

/** Format field errors into a single string (for generic toast) */
export function formatFieldErrors(fieldErrors: ZodFieldErrors): string {
  return Object.entries(fieldErrors)
    .map(([field, msg]) => `${field}: ${msg}`)
    .join(', ');
}
