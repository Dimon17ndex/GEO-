import bcrypt from 'bcryptjs';

// Данные вашей базы Supabase
const SUPABASE_URL = 'https://ptzsoijqgqekenjjonrl.supabase.co';

// ⚠️ Скопируйте ваш Publishable Key из Supabase (со страницы API Keys)
const SUPABASE_ANON_KEY = 'sb_publishable_ZPrRJS8ZQPQm9yZXTPYn8A_agcDr...';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { password } = body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Пароль не указан' });
    }

    const cleanPassword = password.trim();

    // Запрашиваем хеш юзера 'admin' напрямую из REST API Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.admin&select=password_hash`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Ошибка Supabase REST:', errText);
      return res.status(500).json({ success: false, error: ' Ошибка подключения к базе' });
    }

    const users = await response.json();
    const user = users[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, error: 'Пользователь не найден' });
    }

    // Сверяем введенный пароль с bcrypt-хешем из базы данных
    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Неверный пароль' });
    }

    // Если всё верно — пускаем!
    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}
