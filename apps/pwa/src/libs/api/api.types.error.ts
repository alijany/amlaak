export class ApiError extends Error {
  status?: number;
  info?: {
    message: string;
    [key: string]: unknown;
  };
}
