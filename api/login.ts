import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://ptzsoijqgqekenjjonrl.supabase.co';

// ⚠️ УБЕДИТЕСЬ, ЧТО ЗДЕСЬ СТОИТ ВАШ КЛЮЧ
const SUPABASE_ANON_KEY = 'sb_publishable_ZPrRJS8ZQPQm9yZXTPYn8A_agcDr...'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Запрос к Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('username', 'admin')
      .single();

    if (error || !user) {
      console.error('Ошибка базы данных:', error);
      return res.status(401).json({ success: false, error: 'Пользователь не найден' });
    }

    // Проверка bcrypt
    const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Неверный пароль' });
    }

    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}
