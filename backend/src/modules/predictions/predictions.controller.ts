import type { Request, Response } from 'express';
import { predictionsService } from './predictions.service';
import type { SubmitPredictionInput } from './predictions.dto';

export const predictionsController = {
  async submit(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const input = req.body as SubmitPredictionInput;
    const prediction = await predictionsService.submitPrediction(userId, input);
    res.status(200).json(prediction);
  },

  async getMyPredictions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { matchId } = req.params;
    const predictions = await predictionsService.getUserPredictions(userId, matchId);
    res.status(200).json(predictions);
  },
};
