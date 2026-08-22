import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { sendError } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Or check cookie
      token = req.cookies.token;
    }

    if (!token) {
      sendError(res, 'Authentication required', 'UNAUTHENTICATED', 401);
      return;
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch {
      sendError(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User no longer exists', 'USER_NOT_FOUND', 401);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Authentication failed', 'AUTH_ERROR', 500);
  }
};
