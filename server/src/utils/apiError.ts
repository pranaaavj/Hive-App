export class ApiError extends Error {
  statusCode: number;
  fields?: Record<string, string>;

  constructor(message: string, statusCode = 400, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fields = fields;
    Error.captureStackTrace(this, this.constructor);
  }
}
