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
            opacity: 0 !important; 
            transition: opacity 0.8s ease !important;
            overflow: hidden !important;
        }
        .welcome-overlay.visible { opacity: 1 !important; }
        .welcome-overlay.fade-out { opacity: 0 !important; }

        .welcome-container {
            width: 90% !important; 
            max-width: 900px !important;
            display: flex !important; 
            justify-content: center !important;
            min-height: 80px !important;
            position: relative !important;
            z-index: 10 !important;
        }

        /* Начальное состояние текста: смещен вниз, полупрозрачный и абсолютно четкий */
        .welcome-title {
            font-family: 'Montserrat', sans-serif !important;
            font-size: 28px !important; 
            font-weight: 900 !important;
            color: rgba(255, 255, 255, 0.3) !important; 
            text-transform: uppercase !important;
            letter-spacing: 3px !important; 
            margin: 0 !important;
            text-align: center !important;
            transform: translateY(35px) !important;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), 
                        color 0.6s ease !important;
        }

        /* Конечное (активное) состояние текста после анимации */
        .welcome-title.revealed {
            color: #ffffff !important;
            transform: translateY(0) !important;
        }

        /* Фоновое лого */
        .welcome-bg-watermark {
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
            0% {
                transform: translateY(-50%) translateX(0px) rotate(0deg) scale(1);
            }
            50% {
                transform: translateY(-58%) translateX(-25px) rotate(-5deg) scale(1.04);
            }
            100% {
                transform: translateY(-42%) translateX(15px) rotate(4deg) scale(0.96);
            }
        }

        .welcome-ticker {
            display: inline-block !important;
            height: 1.2em !important;
            overflow: hidden !important;
            vertical-align: bottom !important;
            position: relative !important;
        }

        .welcome-ticker-track {
            display: flex !important;
            flex-direction: column !important;
            transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1) !important;
        }

        .welcome-ticker-item {
            height: 1.2em !important;
            line-height: 1.2em !important;
            white-space: nowrap !important;
        }

        /* Блок статуса "узнаем вас" с бегающей точкой */
        .welcome-loader-status {
            display: inline-flex !important;
            align-items: center !important;
            gap: 12px !important;
            font-size: 18px !important;
            letter-spacing: 2px !important;
            color: rgba(255, 255, 255, 0.5) !important;
            transition: opacity 0.4s ease !important;
        }

        .welcome-loader-status.hidden {
            opacity: 0 !important;
            pointer-events: none !important;
            display: none !important;
        }

        /* Контейнер линии загрузки */
        .dot-loader-track {
            position: relative !important;
            width: 44px !important;
            height: 6px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 3px !important;
            overflow: hidden !important;
        }

        /* Бегающая белая точка */
        .dot-loader-ball {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 6px !important;
            height: 6px !important;
            background: #ffffff !important;
            border-radius: 50% !important;
            animation: moveDotBackAndForth 0.9s ease-in-out infinite alternate !important;
        }

        @keyframes moveDotBackAndForth {
            0% {
                left: 0px;
            }
            100% {
                left: 38px;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'welcome-greeting-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- ОСНОВНАЯ ФУНКЦИЯ ---
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

    const greetingHTML = `
        <div id="welcome-greeting-overlay" class="welcome-overlay">
            <img src="images/geo_logo.png" alt="" class="welcome-bg-watermark">
            <div class="welcome-container">
                <h1 id="welcome-title-element" class="welcome-title">
                    <span id="welcome-status-box" class="welcome-loader-status">
                        УЗНАЕМ ВАС
                        <span class="dot-loader-track">
                            <span class="dot-loader-ball"></span>
                        </span>
                    </span>
                    <span id="welcome-main-greeting" style="display: none;">
                        ЗДРАВСТВУЙТЕ, 
                        <span class="welcome-ticker">
                            <span class="welcome-ticker-track" id="welcome-track">
                                <span class="welcome-ticker-item">${emailPrefix}!</span>
                                <span class="welcome-ticker-item">${fullName}!</span>
                            </span>
                        </span>
                    </span>
                </h1>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', greetingHTML);
    const overlay = document.getElementById('welcome-greeting-overlay');
    const titleElement = document.getElementById('welcome-title-element');
    const statusBox = document.getElementById('welcome-status-box');
    const mainGreeting = document.getElementById('welcome-main-greeting');
    const track = document.getElementById('welcome-track');

    // Показываем оверлей
    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('visible'));
    });

    // Ровно через 2 секунды убираем статус «Узнаем вас» и выдвигаем основной текст
    setTimeout(() => {
        statusBox.classList.add('hidden');
        statusBox.style.display = 'none';
        
        mainGreeting.style.display = 'inline';
        titleElement.classList.add('revealed');
    }, 2000);

    // Смена почты на имя внутри тикера (спустя 3 секунды от начала)
    setTimeout(() => {
        if (track) {
            track.style.transform = 'translateY(-1.2em)';
        }
    }, 3000);

    // Закрытие всего экрана приветствия на отметке 5 секунд
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 800);
    }, 5000); 
}
