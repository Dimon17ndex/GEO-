import bcrypt from 'bcrypt';
import users from '../users.json'; // Прямой импорт — Vercel автоматически запечет файл в сборку

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Пароль не указан' });
  }

  const user = (users as Record<string, { passwordHash: string }> )['admin'];
  if (!user) {
    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }

  return res.status(200).json({ success: true });
}
