// reset-password.js

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

let currentResetMode = 'request'; // 'request' или 'update'
let isResetUpdateUnlocked = false; 
let resetOverlayClickTimeout = null;

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showResetModal = function(mode = 'request') {
    injectResetStyles();
    initResetModalUI();
    initResetEvents();
    
    const modal = document.getElementById('reset-modal-overlay');
    hideResetConfirmToast(true);
    setResetMode(mode);

    if (modal) {
        modal.classList.add('active');
    }
};

window.hideResetModal = function() {
    const modal = document.getElementById('reset-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        hideResetConfirmToast(true);
    }
};

// Функция управления состоянием загрузки на кнопке
function setButtonLoading(button, textSpan, isLoading, loadingText, defaultText) {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        if (textSpan) textSpan.textContent = loadingText;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (textSpan) textSpan.textContent = defaultText;
    }
}

function injectResetStyles() {
    if (document.getElementById('reset-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'reset-modal-styles';
    style.textContent = `
        /* Стили модального окна восстановление пароля */
        .reset-modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .reset-modal-overlay.active {
            opacity: 1; pointer-events: auto;
        }
        .reset-modal-box {
            background: rgba(20, 20, 25, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            padding: 30px;
            width: 100%; max-width: 420px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s ease;
            font-family: 'Montserrat', sans-serif;
            color: #fff;
        }
        .reset-modal-overlay.active .reset-modal-box {
            transform: translateY(0);
        }
        .reset-modal-close {
            position: absolute; top: 15px; right: 15px;
            background: none; border: none; color: rgba(255,255,255,0.5);
            font-size: 20px; cursor: pointer; transition: color 0.2s;
        }
        .reset-modal-close:hover { color: #fff; }

        .reset-tabs {
            display: flex; margin-bottom: 25px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .reset-tab-btn {
            flex: 1; padding: 10px; background: none; border: none;
            color: rgba(255,255,255,0.5); font-weight: 700; font-size: 14px;
            cursor: pointer; border-bottom: 2px solid transparent;
            transition: all 0.3s;
        }
        .reset-tab-btn.active {
            color: #fff; border-bottom-color: #3498db;
        }
        .reset-tab-btn.disabled {
            opacity: 0.3; cursor: not-allowed;
        }

        .reset-input-group { margin-bottom: 18px; }
        .reset-input-group label {
            display: block; font-size: 12px; text-transform: uppercase;
            letter-spacing: 1px; color: rgba(255,255,255,0.6); margin-bottom: 6px;
        }
        .reset-input-group input {
            width: 100%; padding: 12px 15px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px; color: #fff; font-size: 14px;
            outline: none; transition: border 0.3s;
            box-sizing: border-box;
        }
        .reset-input-group input:focus {
            border-color: #3498db;
        }

        .reset-submit-btn {
            width: 100%; padding: 14px; margin-top: 10px;
            background: #3498db; border: none; border-radius: 10px;
            color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
            transition: background 0.3s, opacity 0.3s, transform 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .reset-submit-btn:hover:not(:disabled) { background: #2980b9; transform: translateY(-1px); }
        .reset-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Плашка подтверждения разблокировки заменяющего пароля */
        .reset-confirm-toast {
            position: absolute; bottom: -60px; left: 0; right: 0;
            background: rgba(46, 204, 113, 0.9);
            color: #fff; padding: 10px 15px; border-radius: 10px;
            font-size: 13px; text-align: center;
            opacity: 0; transform: translateY(-10px);
            transition: all 0.3s ease; pointer-events: none;
        }
        .reset-confirm-toast.active {
            opacity: 1; transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

function initResetModalUI() {
    if (document.getElementById('reset-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'reset-modal-overlay';
    overlay.className = 'reset-modal-overlay';

    overlay.innerHTML = `
        <div class="reset-modal-box" id="reset-modal-box">
            <button type="button" class="reset-modal-close" id="reset-modal-close-btn">&times;</button>
            
            <div class="reset-tabs">
                <button type="button" class="reset-tab-btn active" id="reset-tab-request">1. Запрос ссылки</button>
                <button type="button" class="reset-tab-btn disabled" id="reset-tab-update" disabled>2. Замена пароля</button>
            </div>

            <form id="reset-form-request">
                <div class="reset-input-group">
                    <label for="reset-email">Ваш Email</label>
                    <input type="email" id="reset-email" placeholder="name@domain.com" required>
                </div>
                <button type="submit" class="reset-submit-btn" id="reset-request-btn">
                    <span id="reset-request-btn-text">Отправить ссылку</span>
                </button>
            </form>

            <form id="reset-form-update" style="display: none;">
                <div class="reset-input-group">
                    <label for="reset-new-password">Новый пароль</label>
                    <input type="password" id="reset-new-password" placeholder="••••••••" required minlength="6">
                </div>
                <button type="submit" class="reset-submit-btn" id="reset-update-btn">
                    <span id="reset-update-btn-text">Сохранить новый пароль</span>
                </button>
            </form>

            <div class="reset-confirm-toast" id="reset-confirm-toast">
                Ссылка отправлена! Откройте письмо.
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
}

function setResetMode(mode) {
    currentResetMode = mode;
    const formReq = document.getElementById('reset-form-request');
    const formUpd = document.getElementById('reset-form-update');
    const tabReq = document.getElementById('reset-tab-request');
    const tabUpd = document.getElementById('reset-tab-update');

    if (mode === 'request') {
        if (formReq) formReq.style.display = 'block';
        if (formUpd) formUpd.style.display = 'none';
        if (tabReq) tabReq.classList.add('active');
        if (tabUpd) tabUpd.classList.remove('active');
    } else if (mode === 'update') {
        if (!isResetUpdateUnlocked) return;
        if (formReq) formReq.style.display = 'none';
        if (formUpd) formUpd.style.display = 'block';
        if (tabReq) tabReq.classList.remove('active');
        if (tabUpd) tabUpd.classList.add('active');
    }
}

function showResetConfirmToast(msg) {
    const toast = document.getElementById('reset-confirm-toast');
    if (!toast) return;
    if (msg) toast.textContent = msg;
    toast.classList.add('active');
}

function hideResetConfirmToast(immediate = false) {
    const toast = document.getElementById('reset-confirm-toast');
    if (!toast) return;
    if (immediate) {
        toast.classList.remove('active');
    } else {
        setTimeout(() => toast.classList.remove('active'), 4000);
    }
}

function initResetEvents() {
    const overlay = document.getElementById('reset-modal-overlay');
    const closeBtn = document.getElementById('reset-modal-close-btn');
    const tabRequest = document.getElementById('reset-tab-request');
    const tabUpdate = document.getElementById('reset-tab-update');
    const formRequest = document.getElementById('reset-form-request');
    const formUpdate = document.getElementById('reset-form-update');

    closeBtn?.addEventListener('click', () => window.hideResetModal());

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            window.hideResetModal();
        }
    });

    tabRequest?.addEventListener('click', () => setResetMode('request'));
    tabUpdate?.addEventListener('click', () => {
        if (isResetUpdateUnlocked) setResetMode('update');
    });

    // Обработка запроса ссылки
    formRequest?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const email = document.getElementById('reset-email').value;
        const btn = document.getElementById('reset-request-btn');
        const btnText = document.getElementById('reset-request-btn-text');

        // Включаем загрузку
        setButtonLoading(btn, btnText, true, 'Отправка...', 'Отправить ссылку');

        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        // Выключаем загрузку
        setButtonLoading(btn, btnText, false, '', 'Отправить ссылку');

        if (error) {
            alert(`Ошибка отправки: ${error.message}`);
        } else {
            showResetConfirmToast('Ссылка отправлена на ваш Email!');
            hideResetConfirmToast();

            isResetUpdateUnlocked = true;
            if (tabUpdate) {
                tabUpdate.classList.remove('disabled');
                tabUpdate.removeAttribute('disabled');
            }
            setResetMode('update');
        }
    });

    // Обработка обновления пароля
    formUpdate?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const newPassword = document.getElementById('reset-new-password').value;
        const btn = document.getElementById('reset-update-btn');
        const btnText = document.getElementById('reset-update-btn-text');

        // Включаем загрузку
        setButtonLoading(btn, btnText, true, 'Сохранение...', 'Сохранить новый пароль');

        const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });

        // Выключаем загрузку
        setButtonLoading(btn, btnText, false, '', 'Сохранить новый пароль');

        if (error) {
            alert(`Ошибка изменения пароля: ${error.message}`);
        } else {
            showResetConfirmToast('Пароль успешно изменён!');
            hideResetConfirmToast();
            setTimeout(() => {
                window.hideResetModal();
            }, 1500);
        }
    });
}
