// auth-system.js

// 1. Инициализация Supabase (укажите свои URL и ANON KEY)
const SUPABASE_URL = 'https://cwgkdpmxwgfypbiykafl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Встраиваем модальное окно в DOM
    initAuthModalUI();
    // Настраиваем обработчики событий
    initAuthEvents();
    // Проверяем текущую сессию
    checkUserSession();
});

// Функция создания разметки окна входа/регистрации
function initAuthModalUI() {
    if (document.getElementById('auth-modal-overlay')) return;

    const modalHTML = `
        <div id="auth-modal-overlay" class="auth-modal-overlay" style="display: none;">
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

// Настройка переключения вкладок и отправки форм в Supabase
function initAuthEvents() {
    const closeBtn = document.getElementById('auth-close-btn');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabRegister = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    // Закрытие окна
    closeBtn?.addEventListener('click', window.hideAuthModal);

    // Переключение Вход / Регистрация
    tabLogin?.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
    });

    tabRegister?.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.style.display = 'block';
        formLogin.style.display = 'none';
    });

    // --- АВТОРИЗАЦИЯ (SUPABASE) ---
    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Ошибка входа:', error.message);
            alert(`Ошибка входа: ${error.message}`);
        } else {
            window.hideAuthModal();
            updateUIForUser(data.user);
        }
    });

    // --- РЕГИСТРАЦИЯ (SUPABASE) ---
    formRegister?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            console.error('Ошибка регистрации:', error.message);
            alert(`Ошибка регистрации: ${error.message}`);
        } else {
            window.hideAuthModal();
            alert('Регистрация успешна! Если включено подтверждение, проверьте почту.');
        }
    });
}

// Глобальные методы управления окном
window.showAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.style.display = 'flex';
};

window.hideAuthModal = function() {
    const modal = document.getElementById('auth-modal-overlay');
    if (modal) modal.style.display = 'none';
};

// Глобальный метод выхода
window.logoutUser = async function() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        updateUIForUser(null);
    }
};

// Проверка активности пользователя при загрузке
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
