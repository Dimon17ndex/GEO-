export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { password } = body || {};

    if (!password) {
      return res.status(400).json({ success: false, error: 'Пароль не указан' });
    }

    // Читаем переменную из Vercel (используем (globalThis as any).process для обхода жесткой проверки типов)
    const env = (globalThis as any).process?.env || {};
    const correctPassword = env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error('ADMIN_PASSWORD не задан в Vercel!');
      return res.status(500).json({ success: false, error: 'Ошибка конфигурации сервера' });
    }

    if (String(password).trim() === String(correctPassword).trim()) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Неверный пароль' });
    }

  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
