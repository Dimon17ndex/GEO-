import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

    // 1. Узнать статус плашки (для всех пользователей)
    if (req.method === 'GET') {
        const isVisible = await kv.get('banner_enabled');
        return res.status(200).json({ enabled: Boolean(isVisible) });
    }

    // 2. Включить / выключить из вашей консоли
    if (req.method === 'POST') {
        const { state } = req.body; // state: true или false
        await kv.set('banner_enabled', state);
        return res.status(200).json({ success: true, enabled: state });
    }

    return res.status(400).end();
}