import bcrypt from 'bcrypt';
// Импортируем файл напрямую из корня проекта:
import usersData from '../users.json';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Пароль не указан' });
    }

    const users = usersData as Record<string, { passwordHash: string }>;
    const user = users['admin'];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Ошибка на сервере:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}
