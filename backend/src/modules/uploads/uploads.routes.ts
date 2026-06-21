import { Router, type NextFunction, type Request, type Response } from 'express';
import { MulterError } from 'multer';
import { imageUpload } from '../../lib/upload';
import { ApiError } from '../../utils/ApiError';
import { uploadsController } from './uploads.controller';

// Mounted under /api/v1/admin/uploads (guarded).
export const uploadsRoutes = Router();

// Translate multer errors into ApiError (AC-12-03).
function handleUpload(req: Request, res: Response, next: NextFunction): void {
  imageUpload.single('file')(req, res, (err: unknown) => {
    if (err instanceof MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(ApiError.badRequest('Tệp vượt quá 5MB'));
        return;
      }
      next(ApiError.badRequest('Tải tệp thất bại'));
      return;
    }
    if (err instanceof Error && err.message === 'INVALID_FILE_TYPE') {
      next(ApiError.badRequest('Định dạng tệp không hợp lệ (chỉ JPG, PNG, WebP)'));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

uploadsRoutes.post('/', handleUpload, uploadsController.upload);
