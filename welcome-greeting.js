// welcome-greeting.js

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
            opacity: 0 !important;
            transition: opacity 0.8s ease !important;
        }

        .welcome-overlay.visible {
            opacity: 1 !important;
        }

        .welcome-overlay.fade-out {
            opacity: 0 !important;
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
            animation: accountGlowPulse 1.6s ease-out forwards !important;
        }

        .welcome-char {
            display: inline-block !important;
            opacity: 0 !important;
            filter: blur(10px) !important;
            transform: translateY(20px) scale(0.8) !important;
            animation: charBlurSlideUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards !important;
        }

        @keyframes charBlurSlideUp {
            0% {
                opacity: 0;
                filter: blur(10px);
                transform: translateY(20px) scale(0.8);
            }
            100% {
                opacity: 1;
                filter: blur(0px);
                transform: translateY(0) scale(1);
            }
        }

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
            animation: lightFlashFullWidth 1.1s cubic-bezier(0.25, 1, 0.5, 1) 0.6s 1 forwards !important;
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

    injectGreetingStyles();

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

    const fullText = `ЗДРАВСТВУЙТЕ, ${displayName.toUpperCase()}!`;
    const charsHTML = fullText.split('').map((char, index) => {
        const safeChar = char === ' ' ? '&nbsp;' : char;
        const delay = (index * 0.03).toFixed(3);
        return `<span class="welcome-char" style="animation-delay: ${delay}s">${safeChar}</span>`;
    }).join('');

    const greetingHTML = `
        <div id="welcome-greeting-overlay" class="welcome-overlay">
            <img src="images/geo_logo.png" alt="" class="auth-bg-watermark">
            <div class="welcome-container">
                <h1 class="welcome-title">${charsHTML}</h1>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', greetingHTML);

    const overlay = document.getElementById('welcome-greeting-overlay');
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            overlay.classList.add('visible');
        }, 50);
    });

    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
        }, 800);
    }, 2000); 
}
