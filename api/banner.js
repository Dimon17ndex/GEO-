import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET: Получение текущего состояния плашки
        if (req.method === 'GET') {
            const isEnabled = await kv.get('banner_enabled');
            return res.status(200).json({ enabled: Boolean(isEnabled) });
        }

        // POST: Изменение состояния плашки из консоли
        if (req.method === 'POST') {
            let body = req.body;
            // Если body пришел строкой, парсим его
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }

            const state = Boolean(body?.state);
            await kv.set('banner_enabled', state);

            return res.status(200).json({ success: true, enabled: state });
        }
    } catch (error) {
        console.error('KV Error:', error);
        // Возвращаем аккуратную ошибку в JSON вместо краша 500
        return res.status(200).json({ 
            success: false, 
            error: 'Ошибка подключения к KV. Проверьте связи Storage в Vercel.' 
        });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
