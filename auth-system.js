// auth-system.js

// Используем window, чтобы не было ошибки "already been declared"
window.SUPABASE_URL = window.SUPABASE_URL || 'https://cwgkdpmxwgfypbiykafl.supabase.co'; 
window.SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';

if (!window.supabaseClient && window.supabase) {
    try {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    } catch (e) {
        console.error('Ошибка инициализации Supabase:', e);
    }
}

// Текущий активный режим: 'login' или 'register'
let currentAuthMode = 'login';

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showAuthModal = function() {
    let modal = document.getElementById('auth-modal-overlay');
    if (!modal) {
        injectAuthStyles();
        initAuthModalUI();
        initAuthEvents();
        modal = document.getElementById('auth-modal-overlay');
    }
    
    // Всегда сбрасываем на 'login' при открытии
    setAuthMode('login', false);

    if (modal) {
        modal.classList.add('active');
    }
};

window.hideAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
    }
};

window.logoutUser = async function() {
    if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
        updateUIForUser(null);
    }
};

// Функция переключения режимов с эффектом размытия
function setAuthMode(mode, animate = true) {
    if (currentAuthMode === mode && animate) return;
    currentAuthMode = mode;

    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const formContainer = document.getElementById('auth-dynamic-form');

    if (!tabLogin || !tabRegister || !formContainer) return;

    // Подсветка переключателя
    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
    }

    const renderFields = () => {
        if (mode === 'login') {
            formContainer.innerHTML = `
                <div class="auth-input-group">
                    <input type="email" id="auth-email" placeholder="Email..." required class="auth-input" autocomplete="email">
                </div>
                <div class="auth-input-group">
                    <input type="password" id="auth-password" placeholder="Пароль..." required class="auth-input" autocomplete="current-password">
                </div>
                <button type="submit" class="auth-submit-btn">Войти</button>
            `;
        } else {
            formContainer.innerHTML = `
                <div class="auth-input-group">
                    <input type="email" id="auth-email" placeholder="Ваш Email..." required class="auth-input" autocomplete="email">
                </div>
                <div class="auth-input-group">
                    <input type="password" id="auth-password" placeholder="Пароль (мин. 6 символов)..." required class="auth-input" autocomplete="new-password">
                </div>
                <button type="submit" class="auth-submit-btn">Зарегистрироваться</button>
            `;
        }
    };

    if (!animate) {
        renderFields();
        formContainer.classList.remove('fade-out-blur', 'fade-in-blur');
        return;
    }

    // Запускаем анимированный уход старых полей (blur + fade)
    formContainer.classList.remove('fade-in-blur');
    formContainer.classList.add('fade-out-blur');

    setTimeout(() => {
        // Подменяем поля в момент полного размытия
        renderFields();
        
        formContainer.classList.remove('fade-out-blur');
        formContainer.classList.add('fade-in-blur');

        setTimeout(() => {
            formContainer.classList.remove('fade-in-blur');
        }, 250);
    }, 200);
}

// --- ЗАГРУЗКА ---
document.addEventListener('DOMContentLoaded', () => {
    injectAuthStyles();
    initAuthModalUI();
    initAuthEvents();
    
    if (window.supabaseClient) {
        checkUserSession();
    }
});

// --- СТИЛИ ---
function injectAuthStyles() {
    if (document.getElementById('auth-system-styles')) return;

    const css = `
        .auth-modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(10, 10, 12, 0.88) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            z-index: 9999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease, visibility 0.3s ease !important;
        }

        .auth-modal-overlay.active {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }

        /* Полное отсутствие рамки и фонового блока */
        .auth-modal-container {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 360px !important;
            position: relative !important;
            color: #ffffff !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            
            transform: scale(0.96) !important;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .auth-modal-overlay.active .auth-modal-container {
            transform: scale(1) !important;
        }

        /* Кнопка закрытия */
        .auth-close-btn {
            position: absolute !important;
            top: -40px !important;
            right: 0 !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.4) !important;
            font-size: 24px !important;
            line-height: 1 !important;
            cursor: pointer !important;
            transition: color 0.2s !important;
        }
        .auth-close-btn:hover { color: #ffffff !important; }

        /* Заголовок GEOГРАФИЯ */
        .auth-header-title {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            letter-spacing: 1.5px !important;
            color: #ffffff !important;
            margin-bottom: 28px !important;
            text-transform: uppercase !important;
        }

        .auth-header-title svg {
            width: 28px !important;
            height: 28px !important;
            stroke: #ffffff !important;
        }

        /* Переключатель режимов */
        .auth-tabs {
            display: flex !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            border-radius: 30px !important;
            padding: 3px !important;
            width: 100% !important;
            margin-bottom: 36px !important;
            box-sizing: border-box !important;
        }

        .auth-tab-btn {
            flex: 1 !important;
            padding: 8px 16px !important;
            background: transparent !important;
            border: none !important;
            border-radius: 25px !important;
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.25s ease !important;
            text-align: center !important;
        }

        .auth-tab-btn.active {
            background: #ffffff !important;
            color: #000000 !important;
            font-weight: 600 !important;
        }

        /* Единая динамическая форма */
        .auth-form {
            display: flex !important;
            flex-direction: column !important;
            gap: 28px !important;
            width: 100% !important;
            transition: filter 0.2s ease, opacity 0.2s ease !important;
        }

        /* Анимация размытия */
        .fade-out-blur {
            filter: blur(10px) !important;
            opacity: 0 !important;
        }

        .fade-in-blur {
            animation: blurIn 0.25s ease forwards !important;
        }

        @keyframes blurIn {
            from {
                filter: blur(10px);
                opacity: 0;
            }
            to {
                filter: blur(0px);
                opacity: 1;
            }
        }

        .auth-input-group {
            position: relative !important;
            width: 100% !important;
        }

        .auth-input {
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.4) !important;
            padding: 10px 0 !important;
            color: #ffffff !important;
            font-size: 14px !important;
            text-align: center !important;
            outline: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
            transition: border-color 0.25s !important;
        }

        .auth-input::placeholder {
            color: rgba(255, 255, 255, 0.4) !important;
            text-align: center !important;
        }

        .auth-input:focus {
            border-bottom-color: #ffffff !important;
        }

        .auth-submit-btn {
            background: transparent !important;
            color: #ffffff !important;
            border: 1px solid #ffffff !important;
            border-radius: 30px !important;
            padding: 12px 24px !important;
            font-size: 15px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            width: 100% !important;
            margin-top: 10px !important;
            transition: all 0.2s ease !important;
            text-align: center !important;
        }

        .auth-submit-btn:hover {
            background: #ffffff !important;
            color: #000000 !important;
        }

        .auth-submit-btn:active {
            transform: scale(0.98) !important;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'auth-system-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- HTML РАЗМЕТКА ---
function initAuthModalUI() {
    if (document.getElementById('auth-modal-overlay')) return;

    const modalHTML = `
        <div id="auth-modal-overlay" class="auth-modal-overlay">
            <div class="auth-modal-container">
                <button id="auth-close-btn" class="auth-close-btn" type="button">&times;</button>
                
                <div class="auth-header-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M2 12h20"></path>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>GEOГРАФИЯ</span>
                </div>
                
                <div class="auth-tabs">
                    <button type="button" class="auth-tab-btn active" id="tab-login-btn">Вход</button>
                    <button type="button" class="auth-tab-btn" id="tab-register-btn">Регистрация</button>
                </div>

                <form id="auth-dynamic-form" class="auth-form"></form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- СОБЫТИЯ И ЛОГИКА ---
function initAuthEvents() {
    const overlay = document.getElementById('auth-modal-overlay');
    const closeBtn = document.getElementById('auth-close-btn');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const form = document.getElementById('auth-dynamic-form');

    closeBtn?.addEventListener('click', window.hideAuthModal);

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            window.hideAuthModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.hideAuthModal();
        }
    });

    tabLogin?.addEventListener('click', () => setAuthMode('login', true));
    tabRegister?.addEventListener('click', () => setAuthMode('register', true));

    // Отправка единой формы
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        if (currentAuthMode === 'login') {
            // Режим ВХОД
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                alert(`Ошибка входа: ${error.message}`);
            } else {
                window.hideAuthModal();
                updateUIForUser(data.user);
            }
        } else {
            // Режим РЕГИСТРАЦИЯ
            const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
            if (error) {
                alert(`Ошибка регистрации: ${error.message}`);
            } else {
                window.hideAuthModal();
                alert('Регистрация прошла успешно! Проверьте вашу почту для подтверждения.');
            }
        }
    });
}

async function checkUserSession() {
    if (!window.supabaseClient) return;
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    updateUIForUser(session ? session.user : null);
}

function updateUIForUser(user) {
    if (user) {
        document.body.classList.add('user-logged-in');
    } else {
        document.body.classList.remove('user-logged-in');
    }
}
