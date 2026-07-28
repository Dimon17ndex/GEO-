import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Разрешаем Cross-Origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET: Получение текущего состояния
        if (req.method === 'GET') {
            const isEnabled = await kv.get('banner_enabled');
            return res.status(200).json({ enabled: Boolean(isEnabled) });
        }

        // POST: Изменение состояния
        if (req.method === 'POST') {
            const { state } = req.body || {};
            await kv.set('banner_enabled', Boolean(state));
            return res.status(200).json({ success: true, enabled: Boolean(state) });
        }
    } catch (error) {
        console.error('KV Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
