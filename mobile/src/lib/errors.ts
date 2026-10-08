export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
