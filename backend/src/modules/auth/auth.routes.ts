import { Router, type NextFunction, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/auth';
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

// UC01
authRoutes.post('/register', validateBody(registerSchema), wrap(authController.register));
// UC02
authRoutes.post('/login', validateBody(loginSchema), wrap(authController.login));
authRoutes.post('/logout', wrap(authController.logout));
authRoutes.get('/me', authenticate, wrap(authController.me));
// UC15
authRoutes.post('/forgot-password', validateBody(forgotPasswordSchema), wrap(authController.forgotPassword));
authRoutes.post('/reset-password', validateBody(resetPasswordSchema), wrap(authController.resetPassword));
