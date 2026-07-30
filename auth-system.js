// auth-system.js

window.SUPABASE_URL = window.SUPABASE_URL || 'https://cwgkdpmxwgfypbiykafl.supabase.co'; 
window.SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';

if (!window.supabaseClient && window.supabase) {
    try {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    } catch (e) {
        console.error('Ошибка инициализации Supabase:', e);
    }
}

let currentAuthMode = 'login';
let lastOverlayClickTime = 0;

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showAuthModal = function() {
    let modal = document.getElementById('auth-modal-overlay');
    if (!modal) {
        injectAuthStyles();
        initAuthModalUI();
        initAuthEvents();
        modal = document.getElementById('auth-modal-overlay');
    }
    
    hideConfirmToast();
    setAuthMode('login');

    if (modal) {
        modal.classList.add('active');
    }
};

window.hideAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        hideConfirmToast();
    }
};

window.logoutUser = async function() {
    if (window.supabaseClient) {
        await window.supabaseClient.auth.signOut();
        updateUIForUser(null);
    }
};

// Функция показа/скрытия плашки подтверждения
function showConfirmToast() {
    const toast = document.getElementById('auth-confirm-toast');
    if (toast) toast.classList.add('visible');
}

function hideConfirmToast() {
    const toast = document.getElementById('auth-confirm-toast');
    if (toast) toast.classList.remove('visible');
}

// Переключение режимов (Crossfade)
function setAuthMode(mode) {
    if (currentAuthMode === mode) return;
    currentAuthMode = mode;

    const authTabs = document.getElementById('auth-tabs');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    
    const formLogin = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');

    if (!authTabs || !tabLogin || !tabRegister || !formLogin || !formRegister) return;

    if (mode === 'login') {
        authTabs.classList.remove('register-mode');
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');

        formRegister.classList.remove('visible');
        formLogin.classList.add('visible');
    } else {
        authTabs.classList.add('register-mode');
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');

        formLogin.classList.remove('visible');
        formRegister.classList.add('visible');
    }
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
            background: rgba(10, 10, 12, 0.94) !important;
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

        .auth-modal-container {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 300px !important;
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

        .auth-modal-container.shake {
            animation: shakeAnimation 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) !important;
        }

        @keyframes shakeAnimation {
            10%, 90% { transform: scale(1) translateX(-3px); }
            20%, 80% { transform: scale(1) translateX(4px); }
            30%, 50%, 70% { transform: scale(1) translateX(-6px); }
            40%, 60% { transform: scale(1) translateX(6px); }
        }

        .auth-close-btn {
            position: absolute !important;
            top: 4px !important;
            right: -55px !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.35) !important;
            font-size: 20px !important;
            line-height: 1 !important;
            cursor: pointer !important;
            transition: color 0.2s !important;
        }
        .auth-close-btn:hover { color: #ffffff !important; }

        .auth-header-title {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            font-size: 20px !important;
            font-weight: 700 !important;
            letter-spacing: 1px !important;
            color: #ffffff !important;
            margin-bottom: 20px !important;
            text-transform: uppercase !important;
        }

        .auth-header-title svg {
            width: 28px !important;
            height: 28px !important;
            stroke: #ffffff !important;
        }

        .auth-tabs {
            position: relative !important;
            display: flex !important;
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 24px !important;
            padding: 3px !important;
            width: 100% !important;
            margin-bottom: 110px !important;
            box-sizing: border-box !important;
        }

        .auth-tab-pill {
            position: absolute !important;
            top: 3px !important;
            left: 3px !important;
            width: calc(50% - 3px) !important;
            height: calc(100% - 6px) !important;
            background: #ffffff !important;
            border-radius: 20px !important;
            z-index: 1 !important;
            transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1) !important;
            pointer-events: none !important;
        }

        .auth-tabs.register-mode .auth-tab-pill {
            transform: translateX(100%) !important;
        }

        .auth-tab-btn {
            position: relative !important;
            z-index: 2 !important;
            flex: 1 !important;
            padding: 7px 14px !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: color 0.3s ease !important;
            text-align: center !important;
        }

        .auth-tab-btn.active {
            color: #000000 !important;
            font-weight: 600 !important;
        }

        .auth-forms-wrapper {
            position: relative !important;
            width: 100% !important;
            min-height: 220px !important;
        }

        .auth-form {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 45px !important;
            
            opacity: 0 !important;
            filter: blur(8px) !important;
            pointer-events: none !important;
            transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                        filter 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .auth-form.visible {
            opacity: 1 !important;
            filter: blur(0px) !important;
            pointer-events: auto !important;
        }

        .auth-input-group {
            position: relative !important;
            width: 100% !important;
        }

        .auth-input {
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.4) !important;
            padding: 4px 0 8px 0 !important;
            color: #ffffff !important;
            font-size: 13px !important;
            text-align: center !important;
            outline: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
            transition: border-color 0.25s !important;
        }

        .auth-input::placeholder {
            color: rgba(255, 255, 255, 0.35) !important;
            text-align: center !important;
        }

        .auth-input:focus {
            border-bottom-color: #ffffff !important;
        }

        .auth-submit-btn {
            background: transparent !important;
            color: #ffffff !important;
            border: 1px solid #ffffff !important;
            border-radius: 24px !important;
            padding: 10px 20px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            width: 100% !important;
            margin-top: 45px !important;
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

        /* --- ПАНЕЛЬ ПОДТВЕРЖДЕНИЯ ВНИЗУ ПО ЦЕНТРУ --- */
        .auth-confirm-toast {
            position: absolute !important;
            bottom: 30px !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(20px) !important;
            background: rgba(20, 20, 25, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 16px !important;
            padding: 12px 20px !important;
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            white-space: nowrap !important;
            z-index: 10000000 !important;
        }

        .auth-confirm-toast.visible {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            transform: translateX(-50%) translateY(0) !important;
        }

        .auth-confirm-text {
            color: rgba(255, 255, 255, 0.9) !important;
            font-size: 13px !important;
            font-weight: 500 !important;
        }

        .auth-confirm-actions {
            display: flex !important;
            gap: 8px !important;
        }

        .auth-confirm-btn {
            background: transparent !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            padding: 5px 12px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }

        .auth-confirm-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
        }

        .auth-confirm-btn.danger {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #ffffff !important;
            font-weight: 600 !important;
        }

        .auth-confirm-btn.danger:hover {
            background: rgba(255, 255, 255, 0.85) !important;
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
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>
                    </svg>
                    <span>GEOГРАФИЯ</span>
                </div>
                
                <div class="auth-tabs" id="auth-tabs">
                    <div class="auth-tab-pill"></div>
                    <button type="button" class="auth-tab-btn active" id="tab-login-btn">Вход</button>
                    <button type="button" class="auth-tab-btn" id="tab-register-btn">Регистрация</button>
                </div>

                <div class="auth-forms-wrapper">
                    <form id="auth-form-login" class="auth-form visible">
                        <div class="auth-input-group">
                            <input type="email" id="login-email" placeholder="Email..." required class="auth-input" autocomplete="email">
                        </div>
                        <div class="auth-input-group">
                            <input type="password" id="login-password" placeholder="Пароль..." required class="auth-input" autocomplete="current-password">
                        </div>
                        <button type="submit" class="auth-submit-btn">Войти</button>
                    </form>

                    <form id="auth-form-register" class="auth-form">
                        <div class="auth-input-group">
                            <input type="email" id="reg-email" placeholder="Ваш Email..." required class="auth-input" autocomplete="email">
                        </div>
                        <div class="auth-input-group">
                            <input type="password" id="reg-password" placeholder="Пароль (мин. 6 символов)..." required class="auth-input" autocomplete="new-password">
                        </div>
                        <button type="submit" class="auth-submit-btn">Зарегистрироваться</button>
                    </form>
                </div>
            </div>

            <div id="auth-confirm-toast" class="auth-confirm-toast">
                <span class="auth-confirm-text">Вы точно хотите покинуть авторизацию?</span>
                <div class="auth-confirm-actions">
                    <button type="button" class="auth-confirm-btn" id="auth-cancel-close-btn">Отмена</button>
                    <button type="button" class="auth-confirm-btn danger" id="auth-confirm-close-btn">Да</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- СОБЫТИЯ ---
function initAuthEvents() {
    const overlay = document.getElementById('auth-modal-overlay');
    const closeBtn = document.getElementById('auth-close-btn');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    
    const formLogin = document.getElementById('auth-form-login');
    const formRegister = document.getElementById('auth-form-register');

    const btnConfirmYes = document.getElementById('auth-confirm-close-btn');
    const btnConfirmNo = document.getElementById('auth-cancel-close-btn');

    // Кнопки панели подтверждения
    btnConfirmYes?.addEventListener('click', window.hideAuthModal);
    btnConfirmNo?.addEventListener('click', hideConfirmToast);

    // Крестик закрывает сразу
    closeBtn?.addEventListener('click', window.hideAuthModal);

    // Клик по фону
    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastOverlayClickTime;

            // При ДВОЙНОМ КЛИКЕ показываем нижнюю панель
            if (timeDiff < 350 && timeDiff > 0) {
                showConfirmToast();
            } else {
                // При 1 клике — легкое покачивание
                const container = document.querySelector('.auth-modal-container');
                if (container) {
                    container.classList.remove('shake');
                    void container.offsetWidth;
                    container.classList.add('shake');
                    
                    setTimeout(() => {
                        container.classList.remove('shake');
                    }, 400);
                }
            }
            lastOverlayClickTime = currentTime;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.hideAuthModal();
        }
    });

    tabLogin?.addEventListener('click', () => setAuthMode('login'));
    tabRegister?.addEventListener('click', () => setAuthMode('register'));

    // Форма входа
    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            alert(`Ошибка входа: ${error.message}`);
        } else {
            window.hideAuthModal();
            updateUIForUser(data.user);
        }
    });

    // Форма регистрации
    formRegister?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const { data, error } = await window.supabaseClient.auth.signUp({ email, password });
        if (error) {
            alert(`Ошибка регистрации: ${error.message}`);
        } else {
            window.hideAuthModal();
            alert('Регистрация прошла успешно! Проверьте вашу почту для подтверждения.');
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
