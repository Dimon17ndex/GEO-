import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Пароль не указан' });
  }

  const usersPath = path.join(process.cwd(), 'users.json');
  let users: Record<string, { passwordHash: string }> = {};

  try {
    const data = await fs.readFile(usersPath, 'utf-8');
    users = JSON.parse(data);
  } catch (e) {
    console.error('Ошибка чтения users.json:', e);
    return res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }

  const user = users['admin'];
  if (!user) {
    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
  }

  res.status(200).json({ success: true });
}
