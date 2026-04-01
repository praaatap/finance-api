import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: any; // the user object from DB
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'secret'
        ) as { id: string; role: string };

        req.user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true, status: true },
        });

        if (req.user.status === 'INACTIVE') {
          res.status(401);
          throw new Error('User is inactive.');
        }

        next();
      } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
  }
);

// Role authorization
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role ${req.user?.role} is not authorized to access this route`
      );
    }
    next();
  };
};
