export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const rawInput = body?.password || "";
    const cleanInput = String(rawInput).trim();

    // Проверяем пароль
    if (cleanInput === "489634") {
      return res.status(200).json({ success: true });
    }

    // Если пароль не совпал, возвращаем то, что сервер РЕАЛЬНО получил
    return res.status(401).json({ 
      success: false, 
      error: `Вы ввели: "${cleanInput}" (длина ${cleanInput.length}), а ожидается "489634"` 
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
