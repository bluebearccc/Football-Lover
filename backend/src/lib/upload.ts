import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Request } from 'express';
import multer, { type FileFilterCallback } from 'multer';

// FR-12: JPG/JPEG/PNG/WebP, ≤ 5MB, MIME validated, safe-renamed, executables blocked.
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME[file.mimetype] ?? '.bin';
    const safe = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, safe);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (!ALLOWED_MIME[file.mimetype]) {
    cb(new Error('INVALID_FILE_TYPE'));
    return;
  }
  cb(null, true);
}

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_BYTES },
});
