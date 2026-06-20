import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Không tìm thấy tài nguyên' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Dữ liệu không hợp lệ',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
}
