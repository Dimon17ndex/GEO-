// auth-system.js

// Используем window, чтобы не было ошибки "already been declared"
window.SUPABASE_URL = window.SUPABASE_URL || 'https://cwgkdpmxwgfypbiykafl.supabase.co'; 
window.SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';

// Инициализируем клиент
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

// --- ЗАГРУЗКА ИНТЕРФЕЙСА ---
document.addEventListener('DOMContentLoaded', () => {
    injectAuthStyles();
    initAuthModalUI();
    initAuthEvents();
    
    if (window.supabaseClient) {
        checkUserSession();
    }
});

// --- СТИЛИ (CSS) ---
function injectAuthStyles() {
    if (document.getElementById('auth-system-styles')) return;

    const css = `
        /* Затемнение фона */
        .auth-modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(5, 5, 5, 0.88) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            z-index: 9999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 16px !important;
            box-sizing: border-box !important;
            
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: opacity 0.35s ease, visibility 0.35s !important;
        }

        .auth-modal-overlay.active {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }

        /* Минималистичная карточка с тонкой glowing-рамкой */
        .auth-modal-card {
            background: #0d0d0d !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 12px !important;
            padding: 32px 28px 28px !important;
            width: 100% !important;
            max-width: 360px !important;
            position: relative !important;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.08), 0 20px 40px rgba(0, 0, 0, 0.9) !important;
            color: #ffffff !important;
            font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important;
            
            transform: translateY(15px) scale(0.98) !important;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .auth-modal-overlay.active .auth-modal-card {
            transform: translateY(0) scale(1) !important;
        }

        /* Тонкая glowing-линия над карточкой как на скриншоте */
        .auth-modal-card::before {
            content: '' !important;
            position: absolute !important;
            top: -1px !important;
            left: 15% !important;
            right: 15% !important;
            height: 1px !important;
            background: #ffffff !important;
            box-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff !important;
        }

        /* Кнопка закрытия */
        .auth-close-btn {
            position: absolute !important;
            top: 14px !important;
            right: 16px !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.4) !important;
            font-size: 24px !important;
            line-height: 1 !important;
            cursor: pointer !important;
            transition: color 0.2s !important;
        }
        .auth-close-btn:hover { 
            color: #ffffff !important;
        }

        /* Вкладки с тонкой подчеркивающей линией */
        .auth-tabs {
            display: flex !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            position: relative !important;
        }

        .auth-tab-btn {
            flex: 1 !important;
            padding: 10px 0 !important;
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid transparent !important;
            color: rgba(255, 255, 255, 0.4) !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            letter-spacing: 0.5px !important;
            cursor: pointer !important;
            transition: all 0.25s ease !important;
            margin-bottom: -1px !important;
        }

        .auth-tab-btn.active {
            color: #ffffff !important;
            border-bottom: 1px solid #ffffff !important;
            box-shadow: 0 2px 10px rgba(255, 255, 255, 0.5) !important;
        }

        /* Формы и поля */
        .auth-form {
            display: flex !important;
            flex-direction: column !important;
            gap: 18px !important;
        }

        .auth-input {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            border-radius: 6px !important;
            padding: 12px 14px !important;
            color: #ffffff !important;
            font-size: 13px !important;
            outline: none !important;
            box-sizing: border-box !important;
            width: 100% !important;
            transition: border-color 0.25s, box-shadow 0.25s !important;
        }

        .auth-input::placeholder {
            color: rgba(255, 255, 255, 0.3) !important;
        }

        .auth-input:focus { 
            border-color: rgba(255, 255, 255, 0.8) !important;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2) !important;
        }

        /* Белая контрастная кнопка с мягким свечением */
        .auth-submit-btn {
            background: #ffffff !important;
            color: #0d0d0d !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 12px !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            letter-spacing: 0.5px !important;
            cursor: pointer !important;
            margin-top: 6px !important;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.2) !important;
            transition: transform 0.15s, box-shadow 0.25s, background-color 0.2s !important;
        }

        .auth-submit-btn:hover {
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.5) !important;
            background: #f0f0f0 !important;
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
            <div class="auth-modal-card">
                <button id="auth-close-btn" class="auth-close-btn" type="button">&times;</button>
                
                <div class="auth-tabs">
                    <button type="button" class="auth-tab-btn active" id="tab-login-btn">Вход</button>
                    <button type="button" class="auth-tab-btn" id="tab-register-btn">Регистрация</button>
                </div>

                <form id="form-login" class="auth-form">
                    <input type="email" id="login-email" placeholder="Email" required class="auth-input">
                    <input type="password" id="login-password" placeholder="Пароль" required class="auth-input">
                    <button type="submit" class="auth-submit-btn">Войти</button>
                </form>

                <form id="form-register" class="auth-form" style="display: none;">
                    <input type="email" id="reg-email" placeholder="Ваш Email" required class="auth-input">
                    <input type="password" id="reg-password" placeholder="Пароль (мин. 6 символов)" required class="auth-input">
                    <button type="submit" class="auth-submit-btn">Зарегистрироваться</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- СОБЫТИЯ ---
function initAuthEvents() {
    const closeBtn = document.getElementById('auth-close-btn');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    closeBtn?.addEventListener('click', window.hideAuthModal);

    tabLogin?.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'flex';
        formRegister.style.display = 'none';
    });

    tabRegister?.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'flex';
        formLogin.style.display = 'none';
    });

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
            alert('Регистрация прошла успешно!');
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
