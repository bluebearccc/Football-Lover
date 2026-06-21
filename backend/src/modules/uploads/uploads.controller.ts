import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';

export const uploadsController = {
  /** AC-12-01: store file, return its public URL/path. */
  upload(req: Request, res: Response): void {
    if (!req.file) {
      throw ApiError.badRequest('Không có tệp được tải lên');
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  },
};
