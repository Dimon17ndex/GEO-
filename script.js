// === СИНХРОНИЗАЦИЯ ПЛАШКИ ЧЕРЕЗ SUPABASE ===
async function syncBannerVisibility() {
    // Укажите ваш Project URL и Publishable Key из Supabase
    const SUPABASE_URL = 'https://swigwhclmjnhcdrbjnes.supabase.co'; 
    const SUPABASE_KEY = 'sb_publishable_6m2jizjeOQd1rqWdoyVUdQ_JKNfoUYw'; 

    if (!window.supabase) return;

    try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data, error } = await client
            .from('settings')
            .select('value')
            .eq('key', 'banner_enabled')
            .single();

        if (error) return;

        const bannerContainer = document.querySelector('.app-banners-container');
        if (bannerContainer) {
            bannerContainer.style.display = data?.value ? 'flex' : 'none';
        }
    } catch (e) {
        console.warn('Не удалось загрузить статус плашки:', e);
    }
}

// Запускаем автоматическую проверку при загрузке любой страницы
document.addEventListener('DOMContentLoaded', syncBannerVisibility);