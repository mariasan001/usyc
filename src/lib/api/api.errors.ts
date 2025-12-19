export type ApiErrorPayload = {
  detail?: string;
  message?: string;
  [k: string]: any;
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
