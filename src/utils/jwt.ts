import jwt from 'jsonwebtoken';
import redis from './redis';

const generateToken = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET || 'refreshsecret', {
    expiresIn: '30d',
  });

  return { accessToken, refreshToken };
};

export const storeRefreshToken = async (userId: string, refreshToken: string) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 30 * 24 * 60 * 60); // 30 days
};

export const deleteRefreshToken = async (userId: string) => {
  await redis.del(`refresh_token:${userId}`);
};

export default generateToken;
