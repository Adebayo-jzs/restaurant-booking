import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: object, expiresIn: SignOptions['expiresIn'] = '7d') => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

export const verifyToken = (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
