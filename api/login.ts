import bcrypt from 'bcryptjs';

// Рабочий хеш для пароля "489634"
const ADMIN_PASSWORD_HASH = "$2b$10$AnS91k264T1XbIn/5hThM.X25330T.y.2uD0C3zUee601Qk9m2eK6";
const PLAIN_PASSWORD = "489634";

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

    const rawInput = body?.password;

    if (!rawInput || typeof rawInput !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Пароль не передан в body',
        receivedBody: body 
      });
    }

    // Чистим от скрытых символов, пробелов и кавычек
    const cleanInput = String(rawInput).trim().replace(/^["']|["']$/g, '');

    // 1. Прямое совпадение строк (для гарантированной проверки)
    const isDirectMatch = (cleanInput === PLAIN_PASSWORD);

    // 2. Сравнение через bcrypt
    let isBcryptMatch = false;
    try {
      isBcryptMatch = await bcrypt.compare(cleanInput, ADMIN_PASSWORD_HASH);
    } catch (e) {
      console.error('Bcrypt error:', e);
    }

    if (isDirectMatch || isBcryptMatch) {
      return res.status(200).json({ success: true });
    }

    // Если пароль не подошел, возвращаем подробности
    return res.status(401).json({ 
      success: false, 
      error: 'Неверный пароль',
      receivedLength: cleanInput.length
    });

  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}
