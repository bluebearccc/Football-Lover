import type { NextFunction, Request, Response } from 'express';

/** Wrap an async (req,res) handler so rejections reach the error middleware. */
export const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch(next);
  };
