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

        /* Контейнер для динамических логотипов (туннель из центра) */
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
            width: 140px !important;
            opacity: 0 !important;
            filter: blur(16px) brightness(0.8) !important;
            transform: translate(-50%, -50%) scale(0.02);
            animation: flyAtUs cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }

        @keyframes flyAtUs {
            0% {
                transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)) scale(0.02);
                opacity: 0;
                filter: blur(20px) brightness(0.5);
            }
            20% {
                opacity: 0.28;
            }
            80% {
                opacity: 0.2;
            }
            100% {
                transform: translate(-50%, -50%) translate(var(--end-x), var(--end-y)) scale(3.2);
                opacity: 0;
                filter: blur(4px) brightness(1.1);
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
    const totalLogos = 14;

    for (let i = 0; i < totalLogos; i++) {
        const img = document.createElement('img');
        img.src = 'images/geo_logo.png';
        img.className = 'tunnel-logo';

        // Случайный угол разлета
        const angle = Math.random() * Math.PI * 2;
        const distance = 700 + Math.random() * 500; 
        
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        const startX = (Math.random() - 0.5) * 30;
        const startY = (Math.random() - 0.5) * 30;

        img.style.setProperty('--start-x', `${startX}px`);
        img.style.setProperty('--start-y', `${startY}px`);
        img.style.setProperty('--end-x', `${endX}px`);
        img.style.setProperty('--end-y', `${endY}px`);

        const duration = 2.0 + Math.random() * 2.2; 
        const delay = Math.random() * 2.5; 

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
