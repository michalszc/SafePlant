import jwt from 'jsonwebtoken';
import { SECRET_ACCESS_KEY, SECRET_REFRESH_KEY } from '../constants/variables';
import { Maybe, User } from '../__generated__/resolvers-types';
import logger from './logger';

export function generateAccessToken(user: User): string {
  const token = jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name
  }, SECRET_ACCESS_KEY, { expiresIn: '1h' });

  return token;
}

export function generateRefreshToken(user: User): string {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name
    }, SECRET_REFRESH_KEY, { expiresIn: '7d' });

    return token;
}

export function refreshAccessToken(refreshToken: string): Maybe<string> {
    const decoded = verifyToken(refreshToken, SECRET_REFRESH_KEY);

    if (decoded) {
        const user = decoded as User;

        return generateAccessToken(user);
    }

    return null;
}

export function verifyToken(token: string, secret: string = SECRET_ACCESS_KEY): Maybe<string | jwt.JwtPayload> {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    logger.error(err);

    return null;
  }
}

export function getUser(token: string): Maybe<User> {
    const decoded = verifyToken(token);

    if (decoded) {
        return decoded as User;
    }

    return null;
}
