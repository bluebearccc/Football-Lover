import { Router, type NextFunction, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { createRateLimiter } from '../../middleware/rate-limit';
import { validateBody } from '../../middleware/validate';
import { authController } from './auth.controller';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.dto';

export const authRoutes = Router();

// Wrap async handlers so rejections reach the error middleware.
const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyExtractor: (req) => req.body?.email ?? '',
});

const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyExtractor: (req) => req.body?.email ?? '',
  onLimitReached: (res) => {
    res.status(200).json({ message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.' });
  },
});

// UC01
authRoutes.post('/register', validateBody(registerSchema), wrap(authController.register));
// UC02
authRoutes.post('/login', loginRateLimiter, validateBody(loginSchema), wrap(authController.login));
authRoutes.post('/logout', wrap(authController.logout));
authRoutes.get('/me', authenticate, wrap(authController.me));
// UC15
authRoutes.post('/forgot-password', forgotPasswordRateLimiter, validateBody(forgotPasswordSchema), wrap(authController.forgotPassword));
authRoutes.post('/reset-password', validateBody(resetPasswordSchema), wrap(authController.resetPassword));
