// welcome-greeting.js

// --- СТИЛИ ---
function injectGreetingStyles() {
    if (document.getElementById('welcome-greeting-styles')) return;

    const css = `
        .welcome-overlay {
    position: fixed !important; top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important;
    background: rgba(10, 10, 12, 0.94) !important;
    backdrop-filter: blur(12px) !important;
    z-index: 9999999 !important;
    display: flex !important; align-items: center !important; justify-content: center !important;
    opacity: 0 !important; 
    transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important; /* Сделали появление очень мягким */
}
        .welcome-overlay.visible { opacity: 1 !important; }
        .welcome-overlay.fade-out { opacity: 0 !important; }

        .welcome-container {
            width: 90% !important; max-width: 900px !important;
            display: flex !important; justify-content: center !important;
            min-height: 80px !important; /* Фиксируем высоту, чтобы ничего не дергалось */
        }

        .welcome-title {
            font-family: 'Montserrat', sans-serif !important;
            font-size: 28px !important; font-weight: 900 !important;
            color: #ffffff !important; text-transform: uppercase !important;
            letter-spacing: 3px !important; margin: 0 !important;
            text-align: center !important;
            /* Убрали nowrap, чтобы не дергалось при длинных именах */
        }

        #welcome-text-node {
            display: inline-block !important;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease !important;
        }

        .auth-bg-watermark {
            position: absolute !important; top: 45% !important; right: -15% !important;
            width: 1200px !important; opacity: 0.22 !important;
            filter: blur(12px) brightness(0.9) !important;
            animation: intenseFloat 6s ease-in-out infinite alternate !important;
            pointer-events: none !important;
        }

        @keyframes intenseFloat {
            0% { transform: translateY(-50%) translateX(0px); }
            100% { transform: translateY(-50%) translateX(20px); }
        }

        /* Контейнер-маска для скролла */
.welcome-ticker {
    display: inline-block !important;
    height: 1.2em !important;
    overflow: hidden !important;
    vertical-align: bottom !important;
    position: relative !important;
}

/* Трек, который будет двигаться */
.welcome-ticker-track {
    display: flex !important;
    flex-direction: column !important;
    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) !important;
}

/* Каждая строчка (почта и имя) */
.welcome-ticker-item {
    height: 1.2em !important;
    line-height: 1.2em !important;
    white-space: nowrap !important;
}
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'welcome-greeting-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- СОЗДАНИЕ HTML И ПОЛУЧЕНИЕ ИМЕНИ ---
async function initGreetingUI() {
    if (document.getElementById('welcome-greeting-overlay')) return;

    let session = null;
    try {
        const client = window.supabaseClient || window.supabase;
        if (client && client.auth) {
            const { data } = await client.auth.getSession();
            session = data?.session;
        }
    } catch (e) { console.error(e); }

    if (!session || !session.user) return;

    injectGreetingStyles();

    const user = session.user;
    const emailPrefix = (user.email ? user.email.split('@')[0] : 'USER').toUpperCase();
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.username || 'ПОЛЬЗОВАТЕЛЬ').toUpperCase();

    // Создаем разметку с треком для вертикального скролла
    const greetingHTML = `
        <div id="welcome-greeting-overlay" class="welcome-overlay">
            <img src="images/geo_logo.png" alt="" class="auth-bg-watermark">
            <div class="welcome-container">
                <h1 class="welcome-title">
                    ЗДРАВСТВУЙТЕ, 
                    <span class="welcome-ticker">
                        <span class="welcome-ticker-track" id="welcome-track">
                            <span class="welcome-ticker-item">${emailPrefix}</span>
                            <span class="welcome-ticker-item">${fullName}</span>
                        </span>
                    </span>!
                </h1>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', greetingHTML);
    const overlay = document.getElementById('welcome-greeting-overlay');
    const track = document.getElementById('welcome-track');
    
    // Плавное появление оверлея
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('visible'));
    });

    // Через 1 секунду запускаем скролл сверху вниз (сдвигаем трек на одну строку вверх)
    setTimeout(() => {
        track.style.transform = 'translateY(-1.2em)';
    }, 1000);

    // Удаление оверлея в конце
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 800);
    }, 3200); 
}
