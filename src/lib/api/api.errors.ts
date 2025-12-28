// src/lib/api/api.errors.ts
// ✅ Tipado de errores del cliente HTTP.
// ✅ Sin `any` (cumple eslint).

export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  [k: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  url: string;
  payload?: ApiErrorPayload;

  constructor(args: { status: number; url: string; message: string; payload?: ApiErrorPayload }) {
    super(args.message);
    this.name = 'ApiError';
    this.status = args.status;
    this.url = args.url;
    this.payload = args.payload;
  }
}
