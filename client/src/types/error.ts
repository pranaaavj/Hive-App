export interface ApiError {
  data?: {
    error?: string;
    fields?: object
  };
}