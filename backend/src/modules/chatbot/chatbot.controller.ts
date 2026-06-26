import type { Request, Response } from 'express';
import { ApiError } from '../../utils/ApiError';
import { chatbotService } from './chatbot.service';
import type { SendMessageInput } from './chatbot.dto';

export const chatbotController = {
  async ask(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const { message, conversationHistory } = req.body as SendMessageInput;
    const result = await chatbotService.answer(req.user.id, message, conversationHistory);
    res.status(200).json({ data: result });
  },

  async getStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    const status = await chatbotService.getStatus(req.user.id);
    res.status(200).json({ data: status });
  },
};
