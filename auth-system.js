// auth-system.js

// 1. Инициализация Supabase (укажите свои URL и ANON KEY)
const SUPABASE_URL = 'https://cwgkdpmxwgfypbiykafl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';

let supabase = null;

try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.error('Supabase init error:', e);
}

// --- ОБЪЯВЛЯЕМ ГЛОБАЛЬНЫЕ ФУНКЦИИ В САМОМ НАЧАЛЕ ---
window.showAuthModal = function() {
    let modal = document.getElementById('auth-modal-overlay');
    if (!modal) {
        initAuthStyles();
        initAuthModalUI();
        initAuthEvents();
        modal = document.getElementById('auth-modal-overlay');
    }
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex'; // Принудительно показываем
    }
};

window.hideAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

window.logoutUser = async function() {
    if (supabase) {
        await supabase.auth.signOut();
        updateUIForUser(null);
    }
};

// При загрузке страницы создаем стили и окно заранее
document.addEventListener('DOMContentLoaded', () => {
    injectAuthStyles();
    initAuthModalUI();
    initAuthEvents();
    if (supabase) {
        checkUserSession();
    }
});

// --- СТИЛИ (CSS) ---
function injectAuthStyles() {
    if (document.getElementById('auth-system-styles')) return;

    const css = `
        .auth-modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.85) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            z-index: 9999999 !important;
            display: none;
            align-items: center !important;
            justify-content: center !important;
            padding: 16px !important;
            box-sizing: border-box !important;
        }

        .auth-modal-overlay.active {
            display: flex !important;
        }

        .auth-modal-card {
            background: #121814 !important;
            border: 1px solid rgba(0, 255, 110, 0.3) !important;
            border-radius: 16px !important;
            padding: 28px 24px 24px !important;
            width: 100% !important;
            max-width: 360px !important;
            position: relative !important;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.9) !important;
            color: #ffffff !important;
            font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important;
        }

        .auth-close-btn {
            position: absolute !important;
            top: 12px !important;
            right: 16px !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 26px !important;
            line-height: 1 !important;
            cursor: pointer !important;
        }
        .auth-close-btn:hover { color: #ffffff !important; }

        .auth-tabs {
            display: flex !important;
            gap: 12px !important;
            margin-bottom: 20px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .auth-tab-btn {
            flex: 1 !important;
            padding: 10px 0 !important;
            background: transparent !important;
            border: none !important;
            border-bottom: 2px solid transparent !important;
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
        }

        .auth-tab-btn.active {
            color: #00ff6e !important;
            border-bottom-color: #00ff6e !important;
        }

        .auth-form {
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
        }

        .auth-input {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 8px !important;
            padding: 12px 14px !important;
            color: #ffffff !important;
            font-size: 14px !important;
            outline: none !important;
            box-sizing: border-box !important;
            width: 100% !important;
        }

        .auth-input:focus { border-color: #00ff6e !important; }

        .auth-submit-btn {
            background: #00ff6e !important;
            color: #000000 !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 12px !important;
            font-size: 15px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            margin-top: 6px !important;
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
        if (!supabase) return alert('Supabase не инициализирован');
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert(`Ошибка входа: ${error.message}`);
        } else {
            window.hideAuthModal();
            updateUIForUser(data.user);
        }
    });

    formRegister?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabase) return alert('Supabase не инициализирован');
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            alert(`Ошибка регистрации: ${error.message}`);
        } else {
            window.hideAuthModal();
            alert('Регистрация прошла успешно!');
        }
    });
}

async function checkUserSession() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    updateUIForUser(session ? session.user : null);
}

function updateUIForUser(user) {
    if (user) {
        document.body.classList.add('user-logged-in');
    } else {
        document.body.classList.remove('user-logged-in');
    }
}
