// auth-system.js

// Используем window, чтобы не было ошибки "already been declared"
window.SUPABASE_URL = window.SUPABASE_URL || 'https://cwgkdpmxwgfypbiykafl.supabase.co'; 
window.SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';

// Инициализация Supabase
if (!window.supabaseClient && window.supabase) {
    try {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    } catch (e) {
        console.error('Ошибка инициализации Supabase:', e);
    }
}

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showAuthModal = function() {
    let modal = document.getElementById('auth-modal-overlay');
    if (!modal) {
        injectAuthStyles();
        initAuthModalUI();
        initAuthEvents();
        modal = document.getElementById('auth-modal-overlay');
    }
    
    // Сбрасываем на вкладку "Вход" без анимации при открытии
    switchTab('login', false);

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

// Функция переключения вкладок с эффектом размытия
function switchTab(targetMode, animate = true) {
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    const currentForm = targetMode === 'login' ? formRegister : formLogin;
    const nextForm = targetMode === 'login' ? formLogin : formRegister;

    if (targetMode === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
    }

    if (!animate) {
        currentForm.style.display = 'none';
        currentForm.classList.remove('fade-out-blur', 'fade-in-blur');
        nextForm.style.display = 'flex';
        nextForm.classList.remove('fade-out-blur', 'fade-in-blur');
        return;
    }

    // Запускаем анимированное исчезновение текущей формы через размытие
    currentForm.classList.remove('fade-in-blur');
    currentForm.classList.add('fade-out-blur');

    setTimeout(() => {
        currentForm.style.display = 'none';
        currentForm.classList.remove('fade-out-blur');

        // Показываем новую форму
        nextForm.style.display = 'flex';
        nextForm.classList.add('fade-in-blur');

        setTimeout(() => {
            nextForm.classList.remove('fade-in-blur');
        }, 300);
    }, 250);
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

// --- СТИЛИ (Без рамки + Анимация размытия) ---
function injectAuthStyles() {
    if (document.getElementById('auth-system-styles')) return;

    const css = `
        /* Затемняющий оверлей */
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

        /* Бескаркасный контейнер без обводки и фонового блока */
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

        /* Заголовок с логотипом GEOГРАФИЯ */
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

        /* Переключатель Вход / Регистрация */
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

        /* Формы и элементы */
        .auth-form {
            display: flex !important;
            flex-direction: column !important;
            gap: 28px !important;
            width: 100% !important;
            transition: filter 0.25s ease, opacity 0.25s ease !important;
        }

        /* Анимации плавного сменяемого размытия */
        .fade-out-blur {
            filter: blur(8px) !important;
            opacity: 0 !important;
        }

        .fade-in-blur {
            animation: blurIn 0.3s ease forwards !important;
        }

        @keyframes blurIn {
            from {
                filter: blur(8px);
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

        /* Кнопка действия */
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

                <form id="form-login" class="auth-form">
                    <div class="auth-input-group">
                        <input type="email" id="login-email" placeholder="Email..." required class="auth-input" autocomplete="email">
                    </div>
                    <div class="auth-input-group">
                        <input type="password" id="login-password" placeholder="Пароль..." required class="auth-input" autocomplete="current-password">
                    </div>
                    <button type="submit" class="auth-submit-btn">Войти</button>
                </form>

                <form id="form-register" class="auth-form" style="display: none;">
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
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- СОБЫТИЯ И ЛОГИКА ---
function initAuthEvents() {
    const overlay = document.getElementById('auth-modal-overlay');
    const closeBtn = document.getElementById('auth-close-btn');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

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

    // Обработчики клика по переключателю режимов
    tabLogin?.addEventListener('click', () => switchTab('login', true));
    tabRegister?.addEventListener('click', () => switchTab('register', true));

    // Авторизация Supabase
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

    // Регистрация Supabase
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

// Проверка сессии
async function checkUserSession() {
    if (!window.supabaseClient) return;
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    updateUIForUser(session ? session.user : null);
}

// Обновление состояния UI
function updateUIForUser(user) {
    if (user) {
        document.body.classList.add('user-logged-in');
    } else {
        document.body.classList.remove('user-logged-in');
    }
}
