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

        .auth-logo-tunnel {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            pointer-events: none !important;
            z-index: 1 !important;
        }

        /* Логотипы летят насквозь без растворения по центру и уходят в стороны за экран */
        .tunnel-logo {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: 500px !important; 
            transform: translate(-50%, -50%) scale(0.001);
            opacity: 0;
            filter: blur(25px);
            animation: solidFlyThrough 1.8s linear forwards;
        }

        @keyframes solidFlyThrough {
            0% {
                transform: translate(-50%, -50%) translate(0px, 0px) scale(0.001);
                opacity: 0;
                filter: blur(30px);
            }
            15% {
                /* Быстро проявляются и дальше остаются полностью яркими и видимыми */
                opacity: 1; 
            }
            85% {
                /* До самого конца полета логотип полностью виден */
                opacity: 1;
                filter: blur(0px);
            }
            100% {
                /* Улетают далеко за границы экрана в стороны */
                transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(6.0);
                opacity: 0; /* Растворение происходит только когда логотип уже ушел за экран */
                filter: blur(0px);
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
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'welcome-greeting-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- ОЧЕРЕДЬ ПО ОДНОМУ ---
function createSequentialLogos(tunnelContainer) {
    const flights = [
        { angle: 0.2, dist: 1200 },   // Вправо
        { angle: 3.1, dist: 1200 },   // Влево
        { angle: 1.5, dist: 1200 },   // Вниз
        { angle: 4.7, dist: 1200 },   // Вверх
    ];

    let index = 0;

    function spawnNext() {
        if (index >= flights.length) return;

        const flightData = flights[index];
        const img = document.createElement('img');
        img.src = 'images/geo_logo.png';
        img.className = 'tunnel-logo';

        const dx = Math.cos(flightData.angle) * flightData.dist;
        const dy = Math.sin(flightData.angle) * flightData.dist;

        img.style.setProperty('--dx', `${dx}px`);
        img.style.setProperty('--dy', `${dy}px`);

        tunnelContainer.appendChild(img);

        img.addEventListener('animationend', () => {
            img.remove();
        });

        index++;

        if (index < flights.length) {
            setTimeout(spawnNext, 550); // Интервал между появлением одиночных логотипов
        }
    }

    setTimeout(spawnNext, 200);
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
    
    createSequentialLogos(tunnelContainer);

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
