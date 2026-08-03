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

function injectResetStyles() {
    if (document.getElementById('reset-modal-styles')) return;

    const style = document.createElement('style');
    style.id = 'reset-modal-styles';
    style.textContent = `
        /* Стили модального окна восстановление пароля */
        .auth-modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(10px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .auth-modal-overlay.active {
            opacity: 1; pointer-events: auto;
        }
        .auth-modal-box {
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
        .auth-modal-overlay.active .auth-modal-box {
            transform: translateY(0);
        }
        .auth-modal-close {
            position: absolute; top: 15px; right: 15px;
            background: none; border: none; color: rgba(255,255,255,0.5);
            font-size: 20px; cursor: pointer; transition: color 0.2s;
        }
        .auth-modal-close:hover { color: #fff; }

        .auth-tabs {
            display: flex; margin-bottom: 25px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .auth-tab-btn {
            flex: 1; padding: 10px; background: none; border: none;
            color: rgba(255,255,255,0.5); font-weight: 700; font-size: 14px;
            cursor: pointer; border-bottom: 2px solid transparent;
            transition: all 0.3s;
        }
        .auth-tab-btn.active {
            color: #fff; border-bottom-color: #3498db;
        }
        .auth-tab-btn.disabled {
            opacity: 0.3; cursor: not-allowed;
        }

        .auth-input-group { margin-bottom: 18px; }
        .auth-input-group label {
            display: block; font-size: 12px; text-transform: uppercase;
            letter-spacing: 1px; color: rgba(255,255,255,0.6); margin-bottom: 6px;
        }
        .auth-input-group input {
            width: 100%; padding: 12px 15px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px; color: #fff; font-size: 14px;
            outline: none; transition: border 0.3s;
            box-sizing: border-box;
        }
        .auth-input-group input:focus {
            border-color: #3498db;
        }

        .auth-btn {
            width: 100%; padding: 14px; margin-top: 10px;
            background: #3498db; border: none; border-radius: 10px;
            color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
            transition: background 0.3s, opacity 0.3s;
        }
        .auth-btn:hover { background: #2980b9; }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-confirm-toast {
            position: absolute; bottom: -60px; left: 0; right: 0;
            background: rgba(46, 204, 113, 0.9);
            color: #fff; padding: 10px 15px; border-radius: 10px;
            font-size: 13px; text-align: center;
            opacity: 0; transform: translateY(-10px);
            transition: all 0.3s ease; pointer-events: none;
        }
        .auth-confirm-toast.active {
            opacity: 1; transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

function initResetModalUI() {
    if (document.getElementById('reset-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'reset-modal-overlay';
    overlay.className = 'auth-modal-overlay';

    overlay.innerHTML = `
        <div class="auth-modal-box" id="reset-modal-box">
            <button type="button" class="auth-modal-close" id="reset-modal-close-btn">&times;</button>
            
            <div class="auth-tabs">
                <button type="button" class="auth-tab-btn active" id="reset-tab-request">1. Запрос ссылки</button>
                <button type="button" class="auth-tab-btn disabled" id="reset-tab-update" disabled>2. Замена</button>
            </div>

            <form id="reset-form-request">
                <div class="auth-input-group">
                    <label for="reset-email">Ваш Email</label>
                    <input type="email" id="reset-email" placeholder="name@domain.com" required>
                </div>
                <button type="submit" class="auth-btn auth-btn-primary" id="reset-request-btn-text">Отправить ссылку</button>
            </form>

            <form id="reset-form-update" style="display: none;">
                <div class="auth-input-group">
                    <label for="reset-new-password">Новый пароль</label>
                    <input type="password" id="reset-new-password" placeholder="••••••••" required minlength="6">
                </div>
                <button type="submit" class="auth-btn auth-btn-primary" id="reset-update-btn-text">Сохранить пароль</button>
            </form>

            <div class="auth-confirm-toast" id="reset-confirm-toast">
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

    // Обработчик отправки ссылки
    formRequest?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const email = document.getElementById('reset-email').value;
        const btn = document.getElementById('reset-request-btn-text');

        btn.disabled = true;
        btn.textContent = 'Отправка...';

        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        btn.disabled = false;
        btn.textContent = 'Отправить ссылку';

        if (error) {
            alert(`Ошибка отправки: ${error.message}`);
        } else {
            alert('Ссылка отправлена на вашу почту! Теперь активирована вкладка «Замена».');
            
            isResetUpdateUnlocked = true;
            if (tabUpdate) {
                tabUpdate.classList.remove('disabled');
                tabUpdate.removeAttribute('disabled');
            }
            setResetMode('update');
        }
    });

    // Обработчик сохранения пароля
    formUpdate?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const newPassword = document.getElementById('reset-new-password').value;
        const btn = document.getElementById('reset-update-btn-text');

        btn.disabled = true;
        btn.textContent = 'Сохранение...';

        const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });

        btn.disabled = false;
        btn.textContent = 'Сохранить пароль';

        if (error) {
            alert(`Ошибка изменения пароля: ${error.message}`);
        } else {
            alert('Пароль успешно обновлён!');
            window.hideResetModal();
        }
    });
}
