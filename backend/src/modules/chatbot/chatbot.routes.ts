import { Router, type NextFunction, type Request, type Response } from 'express';
import { authenticate } from '../../middleware/auth';
import { trackLastActive } from '../../middleware/lastActive';
import { validateBody } from '../../middleware/validate';
import { chatbotController } from './chatbot.controller';
import { sendMessageSchema } from './chatbot.dto';

export const chatbotRoutes = Router();

const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };

chatbotRoutes.post(
  '/messages',
  authenticate,
  trackLastActive,
  validateBody(sendMessageSchema),
  wrap(chatbotController.ask),
);

chatbotRoutes.get(
  '/status',
  authenticate,
  trackLastActive,
  wrap(chatbotController.getStatus),
);
