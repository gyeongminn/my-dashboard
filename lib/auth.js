import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD_HASH = process.env.DASHBOARD_PASSWORD_HASH;

if (!JWT_SECRET || !PASSWORD_HASH) {
  console.error('Missing authentication environment variables');
}

// 비밀번호 검증
export async function verifyPassword(password) {
  try {
    return await bcrypt.compare(password, PASSWORD_HASH);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// JWT 토큰 생성 (7일 유효)
export function generateToken() {
  const payload = {
    authenticated: true,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 7 days
  });
}

// JWT 토큰 검증
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
