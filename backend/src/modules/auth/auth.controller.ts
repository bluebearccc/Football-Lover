import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { authService } from './auth.service';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.dto';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput);
    res.status(200).json(result);
  },

  // Stateless JWT: logout is client-side token disposal; endpoint acknowledges it.
  async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'Đã đăng xuất' });
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const user = await authService.me(req.user.id);
    res.status(200).json({ user });
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    await authService.forgotPassword(req.body as ForgotPasswordInput);
    res.status(200).json({ message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết đặt lại mật khẩu.' });
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    await authService.resetPassword(req.body as ResetPasswordInput);
    res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
  },
};
