import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import generateToken, { storeRefreshToken, deleteRefreshToken } from '../utils/jwt';
import redis from '../utils/redis';
import { IRegisterPayload, ILoginPayload, IAuthTokens, ILoginResponse, IUserWithoutPassword } from '../types';

export class AuthService {
  /**
   * Register a new user
   */
  async register(payload: IRegisterPayload): Promise<ILoginResponse> {
    const { email, password } = payload;

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = generateToken(user.id, user.role);
    await storeRefreshToken(user.id, refreshToken);

    return {
      _id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(payload: ILoginPayload): Promise<ILoginResponse> {
    const { email, password } = payload;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'INACTIVE') {
      throw new Error('User is inactive, contact admin.');
    }

    const { accessToken, refreshToken } = generateToken(user.id, user.role);
    await storeRefreshToken(user.id, refreshToken);

    return {
      _id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh tokens using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<IAuthTokens> {
    if (!refreshToken) {
      throw new Error('No refresh token provided');
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refreshsecret') as { id: string };
    const redisToken = await redis.get(`refresh_token:${decoded.id}`);

    if (redisToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.status === 'INACTIVE') {
      throw new Error('User invalid or inactive');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(user.id, user.role);
    await storeRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user - invalidate refresh token
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'refreshsecret') as { id: string };
        await deleteRefreshToken(decoded.id);
      } catch (e) {
        // Silent fail if token is invalid
      }
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}

export default new AuthService();
