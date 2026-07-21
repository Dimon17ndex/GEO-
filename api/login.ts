import bcrypt from 'bcryptjs';

// Хеш для пароля "489634"
const HARDCODED_HASH = '$2b$10$AnS91k264T1XbIn/5hThM.X25330T.y.2uD0C3zUee601Qk9m2eK6';

export default async function handler(req: any, res: any) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    
    // Если body пришел строкой, парсим его
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

    // Приводим к строке и убираем случайные пробелы по краям
    const cleanPassword = String(password).trim();

    // Сравниваем введенный пароль с хешем
    const isMatch = await bcrypt.compare(cleanPassword, HARDCODED_HASH);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Неверный пароль' });
    }

    // Если всё совпало
    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
