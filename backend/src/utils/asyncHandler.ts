import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: AsyncFunction) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    return await fn(req, res, next);
  } catch (error: any) {
    // Handle MongoDB duplicate key error (code 11000)
    const statusCode = error.code === 11000 ? 409 : error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export { asyncHandler };
