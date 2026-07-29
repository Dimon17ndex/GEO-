// auth-system.js

// 1. Инициализация Supabase (укажите свои URL и ANON KEY)
const SUPABASE_URL = 'https://cwgkdpmxwgfypbiykafl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Внедряем стили и модальное окно
    injectAuthStyles();
    initAuthModalUI();
    initAuthEvents();
    checkUserSession();
});

// --- 1. СТИЛИ (CSS) ---
function injectAuthStyles() {
    if (document.getElementById('auth-system-styles')) return;

    const css = `
        /* Затемнение фона */
        .auth-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 999999;
            display: none; /* По умолчанию скрыто */
            align-items: center;
            justify-content: center;
            padding: 16px;
            box-sizing: border-box;
        }

        /* Когда добавляем класс .active, окно становится видимым */
        .auth-modal-overlay.active {
            display: flex !important;
        }

        /* Карточка модального окна */
        .auth-modal-card {
            background: #121814;
            border: 1px solid rgba(0, 255, 110, 0.3);
            border-radius: 16px;
            padding: 28px 24px 24px;
            width: 100%;
            max-width: 360px;
            position: relative;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.9);
            color: #ffffff;
            font-family: 'Montserrat', sans-serif;
            box-sizing: border-box;
        }

        /* Крестик закрытия */
        .auth-close-btn {
            position: absolute;
            top: 12px;
            right: 16px;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 26px;
            line-height: 1;
            cursor: pointer;
            transition: color 0.2s;
        }
        .auth-close-btn:hover {
            color: #ffffff;
        }

        /* Вкладки */
        .auth-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-tab-btn {
            flex: 1;
            padding: 10px 0;
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            color: rgba(255, 255, 255, 0.5);
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }

        .auth-tab-btn.active {
            color: #00ff6e;
            border-bottom-color: #00ff6e;
        }

        /* Поля и формы */
        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .auth-input {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            padding: 12px 14px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
            box-sizing: border-box;
            width: 100%;
        }

        .auth-input:focus {
            border-color: #00ff6e;
        }

        .auth-submit-btn {
            background: #00ff6e;
            color: #000000;
            border: none;
            border-radius: 8px;
            padding: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 6px;
            transition: opacity 0.2s, transform 0.1s;
        }

        .auth-submit-btn:active {
            transform: scale(0.98);
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'auth-system-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- 2. ВНЕДРЕНИЕ HTML ---
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

// --- 3. ЛОГИКА СОБЫТИЙ ---
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

// --- 4. ГЛОБАЛЬНЫЕ МЕТОДЫ ПОКАЗА / СКРЫТИЯ ---
window.showAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
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
    const { error } = await supabase.auth.signOut();
    if (!error) {
        updateUIForUser(null);
    }
};

async function checkUserSession() {
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
