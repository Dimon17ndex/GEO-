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
            z-index: 9999999 !important;
            display: flex !important; 
            align-items: center !important; 
            justify-content: center !important;
            opacity: 0 !important; 
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
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

        .welcome-title {
            font-family: 'Montserrat', sans-serif !important;
            font-size: 28px !important; 
            font-weight: 900 !important;
            color: #ffffff !important; 
            text-transform: uppercase !important;
            letter-spacing: 3px !important; 
            margin: 0 !important;
            text-align: center !important;
        }

        /* Контейнер для динамических логотипов */
        .auth-logo-tunnel {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
            z-index: 1 !important;
        }

        .tunnel-logo {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: 120px !important;
            opacity: 0 !important;
            filter: blur(12px) brightness(0.9) !important;
            transform: translate(-50%, -50%) scale(0.01) translate(0, 0);
            animation-name: flyOut;
            animation-timing-function: cubic-bezier(0.1, 0.7, 0.3, 1);
            animation-iteration-count: infinite;
        }

        @keyframes flyOut {
            0% {
                transform: translate(-50%, -50%) scale(0.02) translate(0, 0);
                opacity: 0;
                filter: blur(16px) brightness(0.5);
            }
            15% {
                opacity: 0.3; /* Проявляются близко к центру */
            }
            75% {
                opacity: 0.25;
            }
            100% {
                transform: translate(-50%, -50%) scale(3.5) translate(var(--move-x), var(--move-y));
                opacity: 0; /* Исчезают улетая за края */
                filter: blur(2px) brightness(1.2);
            }
        }

        /* Контейнер-маска для скролла */
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
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'welcome-greeting-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- СОЗДАНИЕ ЛОГОТИПОВ-ЛЕТУНОВ ---
function createTunnelLogos(tunnelContainer) {
    const totalLogos = 15;

    for (let i = 0; i < totalLogos; i++) {
        const img = document.createElement('img');
        img.src = 'images/geo_logo.png';
        img.className = 'tunnel-logo';

        // Случайный угол и расстояние для разлета в разные стороны экрана
        const angle = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 600; // дальность разлета
        
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;

        // Передаем координаты движения через инлайн-стиль
        img.style.setProperty('--move-x', `${moveX}px`);
        img.style.setProperty('--move-y', `${moveY}px`);

        // Разная скорость и задержка, чтобы они летели хаотично
        const duration = 2.2 + Math.random() * 2.0; // от 2.2 до 4.2 секунд
        const delay = Math.random() * 3; // случайный старт

        img.style.animationDuration = `${duration}s`;
        img.style.animationDelay = `${delay}s`;

        tunnelContainer.appendChild(img);
    }
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

    const greetingHTML = `
        <div id="welcome-greeting-overlay" class="welcome-overlay">
            <div class="auth-logo-tunnel" id="logo-tunnel"></div>
            <div class="welcome-container">
                <h1 class="welcome-title">
                    ЗДРАВСТВУЙТЕ, 
                    <span class="welcome-ticker">
                        <span class="welcome-ticker-track" id="welcome-track">
                            <span class="welcome-ticker-item">${emailPrefix}!</span>
                            <span class="welcome-ticker-item">${fullName}!</span>
                        </span>
                    </span>
                </h1>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', greetingHTML);
    const overlay = document.getElementById('welcome-greeting-overlay');
    const track = document.getElementById('welcome-track');
    const tunnelContainer = document.getElementById('logo-tunnel');
    
    createTunnelLogos(tunnelContainer);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => overlay.classList.add('visible'));
    });

    setTimeout(() => {
        track.style.transform = 'translateY(-1.2em)';
    }, 1000);

    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 800);
    }, 3200); 
}
