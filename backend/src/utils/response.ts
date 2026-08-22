import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  error?: {
    code: string;
    details?: unknown;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(responseBody);
};

export const sendError = (
  res: Response,
  message: string,
  errorCode = 'INTERNAL_ERROR',
  statusCode = 500,
  details?: unknown
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    data: null,
    message,
    error: {
      code: errorCode,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(responseBody);
};
