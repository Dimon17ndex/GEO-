import bcrypt from 'bcryptjs';

// Bcrypt-хеш для пароля "489634" прямо в коде
const ADMIN_PASSWORD_HASH = "$2b$10$AnS91k264T1XbIn/5hThM.X25330T.y.2uD0C3zUee601Qk9m2eK6";

export default async function handler(req: any, res: any) {
  // 1. Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Пароль не указан' });
    }

    const cleanPassword = password.trim();

    // 2. Сверяем пароль с хешем
    const isMatch = await bcrypt.compare(cleanPassword, ADMIN_PASSWORD_HASH);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Неверный пароль' });
    }

    // 3. Успешная авторизация
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
