import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: RegisterInput = req.body;
      const result = await AuthService.register(input);

      res.cookie('token', result.token, COOKIE_OPTIONS);

      sendSuccess(
        res,
        {
          user: result.user,
          token: result.token,
        },
        'Registration successful',
        201
      );
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Registration failed', 'REGISTRATION_ERROR', 500);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await AuthService.login(input);

      res.cookie('token', result.token, COOKIE_OPTIONS);

      sendSuccess(
        res,
        {
          user: result.user,
          token: result.token,
        },
        'Login successful',
        200
      );
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Login failed', 'LOGIN_ERROR', 500);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('token', COOKIE_OPTIONS);
    sendSuccess(res, null, 'Logged out successfully', 200);
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
      return;
    }
    sendSuccess(res, { user: req.user }, 'Current user retrieved', 200);
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }
      const user = await AuthService.getUserProfile(req.user.id);
      sendSuccess(res, { user }, 'User profile retrieved', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to retrieve profile', 'PROFILE_ERROR', 500);
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'Unauthenticated', 'UNAUTHENTICATED', 401);
        return;
      }
      const input: UpdateProfileInput = req.body;
      const updatedUser = await AuthService.updateProfile(req.user.id, input);
      sendSuccess(res, { user: updatedUser }, 'Profile updated successfully', 200);
    } catch (error: any) {
      if (error.statusCode) {
        sendError(res, error.message, error.code, error.statusCode);
        return;
      }
      sendError(res, 'Failed to update profile', 'PROFILE_UPDATE_ERROR', 500);
    }
  }
}
