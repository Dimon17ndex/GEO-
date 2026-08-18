// welcome-greeting.js

document.addEventListener('DOMContentLoaded', () => {
    injectGreetingStyles();
    initGreetingUI();
});

// --- СТИЛИ ---
function injectGreetingStyles() {
    if (document.getElementById('welcome-greeting-styles')) return;

    const css = `
        .welcome-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(10, 10, 12, 0.94) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            z-index: 9999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
        }

        .welcome-container {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 900px !important;
            position: relative !important;
            color: #ffffff !important;
            font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            z-index: 5 !important;
        }

        .welcome-title {
            font-family: 'Montserrat', sans-serif !important;
            font-size: 28px !important;
            font-weight: 900 !important;
            color: #ffffff !important;
            text-transform: uppercase !important;
            letter-spacing: 3px !important;
            margin: 0 !important;
            padding: 4px 12px !important;
            position: relative !important;
            white-space: nowrap !important;
            display: flex !important;
            gap: 12px !important;
            justify-content: center !important;
            align-items: center !important;
            
            animation: accountGlowPulse 1.6s ease-out forwards !important;
        }

        /* Пословное появление через блюр снизу вверх */
        .welcome-word {
            display: inline-block !important;
            opacity: 0 !important;
            filter: blur(15px) !important;
            transform: translateY(25px) !important;
            animation: wordBlurUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
            will-change: transform, filter, opacity;
        }

        @keyframes wordBlurUp {
            0% {
                opacity: 0 !important;
                filter: blur(15px) !important;
                transform: translateY(25px) !important;
            }
            100% {
                opacity: 1 !important;
                filter: blur(0px) !important;
                transform: translateY(0px) !important;
            }
        }

        /* Эффект белого светового блика */
        .welcome-title::after {
            content: '' !important;
            position: absolute !important;
            top: 0 !important;
            bottom: 0 !important;
            left: -100vw !important;
            width: 35vw !important;
            background: linear-gradient(
                90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.85) 50%, 
                transparent 100%
            ) !important;
            transform: skewX(-25deg) !important;
            pointer-events: none !important;
            z-index: 2 !important;
            animation: lightFlashFullWidth 1.1s cubic-bezier(0.25, 1, 0.5, 1) 0.8s 1 forwards !important;
        }

        @keyframes accountGlowPulse {
            0% { text-shadow: 0 0 0px rgba(255, 255, 255, 0); }
            50% { text-shadow: 0 0 45px rgba(255, 255, 255, 1), 0 0 20px rgba(52, 152, 219, 0.9); }
            100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
        }

        @keyframes lightFlashFullWidth {
            0% { left: -100vw; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { left: 100vw; opacity: 0; }
        }

        .auth-bg-watermark {
            position: absolute !important;
            top: 45% !important;
            right: -15% !important;
            left: auto !important;
            width: 1200px !important;
            height: auto !important;
            max-width: none !important;
            pointer-events: none !important;
            z-index: 1 !important;
            transform-origin: center right !important;
            opacity: 0.22 !important;
            filter: blur(12px) brightness(0.9) !important;
            animation: intenseFloat 6s ease-in-out infinite alternate !important;
        }

        @keyframes intenseFloat {
            0% { transform: translateY(-50%) translateX(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-58%) translateX(-25px) rotate(-5deg) scale(1.04); }
            100% { transform: translateY(-42%) translateX(15px) rotate(4deg) scale(0.96); }
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

    let displayName = 'ПОЛЬЗОВАТЕЛЬ';
    
    try {
        const client = window.supabaseClient || window.supabase;
        if (client && client.auth) {
            const { data: { session } } = await client.auth.getSession();
            if (session && session.user) {
                const user = session.user;
                const metaName = user.user_metadata?.full_name || user.user_metadata?.username || user.user_metadata?.name;
                const email = user.email || '';
                displayName = metaName || (email ? email.split('@')[0] : 'ПОЛЬЗОВАТЕЛЬ');
            }
        }
    } catch (e) {
        console.error('Ошибка получения данных пользователя:', e);
    }

    // Формируем чистый текст без знака в конце, чтобы разбить по пробелам
    const cleanText = `ЗДРАВСТВУЙТЕ, ${displayName.toUpperCase()}`;
    let words = cleanText.split(/\s+/).filter(w => w.length > 0);
    
    // Добавляем восклицательный знак отдельным элементом в массив
    words.push('!');

    const wordsHTML = words.map((token, index) => {
        const delay = (index * 0.2).toFixed(2);
        return `<span class="welcome-word" style="animation-delay: ${delay}s;">${token}</span>`;
    }).join('');

    const greetingHTML = `
        <div id="welcome-greeting-overlay" class="welcome-overlay">
            <img src="images/geo_logo.png" alt="" class="auth-bg-watermark">
            <div class="welcome-container">
                <h1 class="welcome-title">${wordsHTML}</h1>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', greetingHTML);
}
