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

    // Разделяем на статический текст и меняющуюся часть
    const greetingHTML = `
        <div id="welcome-greeting-overlay" class="welcome-overlay">
            <img src="images/geo_logo.png" alt="" class="auth-bg-watermark">
            <div class="welcome-container">
                <h1 class="welcome-title">
                    ЗДРАВСТВУЙТЕ, <span id="welcome-dynamic-name">${emailPrefix}</span>!
                </h1>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', greetingHTML);
    const overlay = document.getElementById('welcome-greeting-overlay');
    const nameNode = document.getElementById('welcome-dynamic-name');
    
    // Появление оверлея
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('visible'));
    });

    // Через 0.8 секунд меняем только имя
    setTimeout(() => {
        // Уходим вниз
        nameNode.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        nameNode.style.transform = 'translateY(15px)';
        nameNode.style.opacity = '0';

        setTimeout(() => {
            // Подменяем текст
            nameNode.textContent = fullName;
            // Возвращаем из положения вверх
            nameNode.style.transform = 'translateY(-15px)';
            
            requestAnimationFrame(() => {
                nameNode.style.transform = 'translateY(0)';
                nameNode.style.opacity = '1';
            });
        }, 400);
    }, 800);

    // Удаление оверлея
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 800);
    }, 3000); 
}
