// reset-password.js

window.SUPABASE_URL = window.SUPABASE_URL || 'https://cwgkdpmxwgfypbiykafl.supabase.co'; 
window.SUPABASE_KEY = window.SUPABASE_KEY || 'sb_publishable_mjHX0OTE6LSLh2qTVqMIng_mY9cvDcN';

if (!window.supabaseClient && window.supabase) {
    try {
        window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
    } catch (e) {
        console.error('Ошибка инициализации Supabase:', e);
    }
}

let currentResetMode = 'request'; // 'request' или 'update'
let isUpdateUnlocked = false;    // Флаг доступности вкладки «Замена»

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showResetModal = function(mode = 'request') {
    let modal = document.getElementById('reset-modal-overlay');
    if (!modal) {
        injectResetStyles();
        initResetModalUI();
        initResetEvents();
        modal = document.getElementById('reset-modal-overlay');
    }
    
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

function showResetConfirmToast() {
    const toast = document.getElementById('reset-confirm-toast');
    const wave = document.getElementById('reset-confirm-wave');
    
    if (toast) {
        toast.classList.remove('hiding', 'visible');
        if (wave) wave.classList.remove('active');

        void toast.offsetWidth;

        toast.classList.add('visible');
        if (wave) wave.classList.add('active');
    }
}

function hideResetConfirmToast(immediate = false) {
    const toast = document.getElementById('reset-confirm-toast');
    const wave = document.getElementById('reset-confirm-wave');

    if (!toast) return;

    if (wave) wave.classList.remove('active');

    if (immediate) {
        toast.classList.remove('visible', 'hiding');
    } else {
        toast.classList.add('hiding');
        setTimeout(() => {
            toast.classList.remove('visible', 'hiding');
        }, 350);
    }
}

function setResetMode(mode) {
    // Если пытаемся перейти на "Замену", но она ещё не разблокирована
    if (mode === 'update' && !isUpdateUnlocked && currentResetMode !== 'update') {
        return; 
    }

    currentResetMode = mode;

    const tabRequest = document.getElementById('tab-request-btn');
    const tabUpdate = document.getElementById('tab-update-btn');
    
    const formRequest = document.getElementById('reset-form-request');
    const formUpdate = document.getElementById('reset-form-update');

    if (!tabRequest || !tabUpdate || !formRequest || !formUpdate) return;

    if (mode === 'request') {
        tabRequest.classList.add('active');
        tabUpdate.classList.remove('active');

        formUpdate.classList.remove('visible');
        formRequest.classList.add('visible');
    } else {
        tabUpdate.classList.add('active');
        tabRequest.classList.remove('active');

        formRequest.classList.remove('visible');
        formUpdate.classList.add('visible');
    }
}

// --- ЗАГРУЗКА И ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    injectResetStyles();
    initResetModalUI();
    initResetEvents();

    // Слушатель перехода по ссылке восстановления из письма Supabase
    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                isUpdateUnlocked = true;
                const tabUpdate = document.getElementById('tab-update-btn');
                if (tabUpdate) {
                    tabUpdate.classList.remove('disabled');
                    tabUpdate.removeAttribute('disabled');
                }
                window.showResetModal('update');
            }
        });
    }
});

// --- СТИЛИ ---
function injectResetStyles() {
    const existingStyle = document.getElementById('reset-system-styles');
    if (existingStyle) existingStyle.remove();

    const css = `
        .reset-modal-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(8, 9, 11, 0.95) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            z-index: 9999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease, visibility 0.3s ease !important;
        }

        .reset-modal-overlay.active {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }

        .reset-modal-container {
            position: relative !important;
            width: 100% !important;
            max-width: 760px !important;
            padding: 40px 50px 60px 50px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            color: #ffffff !important;
            font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            transform: scale(0.96) !important;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            z-index: 5 !important;
        }

        .reset-modal-overlay.active .reset-modal-container {
            transform: scale(1) !important;
        }

        .reset-modal-container.shake {
            animation: resetShakeAnimation 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) !important;
        }

        @keyframes resetShakeAnimation {
            10%, 90% { transform: scale(1) translateX(-3px); }
            20%, 80% { transform: scale(1) translateX(4px); }
            30%, 50%, 70% { transform: scale(1) translateX(-6px); }
            40%, 60% { transform: scale(1) translateX(6px); }
        }

        /* КРЕСТИК ЗАКРЫТИЯ */
        .reset-close-btn {
            position: absolute !important;
            top: -10px !important;
            right: 0px !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.3) !important;
            font-size: 26px !important;
            line-height: 1 !important;
            cursor: pointer !important;
            z-index: 99999999 !important;
            transition: color 0.25s ease, transform 0.25s ease !important;
        }

        .reset-close-btn:hover {
            color: #ffffff !important;
            transform: scale(1.15) !important;
        }

        /* ВЕРХНИЙ ЛОГОТИП С НАЗВАНИЕМ */
        .reset-header-title {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 16px !important;
            margin-bottom: 50px !important;
        }

        .reset-logo-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            animation: resetLogoHover 4s ease-in-out infinite alternate !important;
        }

        .reset-header-logo {
            height: 48px !important;
            width: auto !important;
            display: block !important;
            object-fit: contain !important;
        }

        @keyframes resetLogoHover {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(-1deg); }
            100% { transform: translateY(4px) rotate(1deg); }
        }

        .reset-brand-text {
            font-family: 'Unbounded', sans-serif !important;
            font-size: 26px !important;
            font-weight: 900 !important;
            letter-spacing: -0.5px !important;
            color: #ffffff !important;
            text-transform: uppercase !important;
        }

        /* ТАБЫ "ЗАПРОС" И "ЗАМЕНА" */
        .reset-tabs {
            position: relative !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            margin-bottom: 70px !important;
        }

        .reset-tab-btn {
            position: relative !important;
            z-index: 2 !important;
            padding: 10px 36px !important;
            background: transparent !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            border-radius: 14px !important;
            color: rgba(255, 255, 255, 0.5) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
        }

        .reset-tab-btn.disabled {
            opacity: 0.25 !important;
            cursor: not-allowed !important;
            border-color: rgba(255, 255, 255, 0.08) !important;
        }

        .reset-tab-btn.active {
            background: #ffffff !important;
            border-color: #ffffff !important;
            color: #000000 !important;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2) !important;
        }

        /* ОБЕРТКА ФОРМ */
        .reset-forms-wrapper {
            position: relative !important;
            width: 100% !important;
            min-height: 180px !important;
        }

        .reset-form {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 50px !important;
            opacity: 0 !important;
            filter: blur(8px) !important;
            pointer-events: none !important;
            transition: opacity 0.35s ease, filter 0.35s ease !important;
        }

        .reset-form.visible {
            opacity: 1 !important;
            filter: blur(0px) !important;
            pointer-events: auto !important;
        }

        /* Форма замены выравнивается вправо согласно макету */
        #reset-form-update {
            align-items: flex-end !important;
        }

        .reset-input-group {
            position: relative !important;
            width: 100% !important;
            max-width: 320px !important;
        }

        .reset-input {
            background: transparent !important;
            border: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.3) !important;
            padding: 8px 0 !important;
            color: #ffffff !important;
            font-size: 13px !important;
            font-weight: 500 !important;
            outline: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
            transition: border-color 0.25s ease !important;
        }

        .reset-input::placeholder {
            color: rgba(255, 255, 255, 0.35) !important;
        }

        .reset-input:focus {
            border-bottom-color: #ffffff !important;
        }

        .reset-submit-btn {
            background: transparent !important;
            color: #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
            border-radius: 14px !important;
            padding: 12px 36px !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            transition: all 0.25s ease !important;
        }

        .reset-submit-btn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.6) !important;
        }

        /* ЛЕВИТИРУЮЩИЙ ЗАДНИЙ ФОНОВЫЙ ЛОГОТИП */
        .reset-bg-watermark {
            position: absolute !important;
            top: 50% !important;
            right: -10% !important;
            width: 900px !important;
            height: auto !important;
            pointer-events: none !important;
            z-index: 1 !important;
            opacity: 0 !important;
            filter: blur(20px) brightness(0.6) !important;
            transition: opacity 1s ease-out, filter 1s ease-out !important;
            animation: resetIntenseFloat 7s ease-in-out infinite alternate !important;
        }

        .reset-modal-overlay.active .reset-bg-watermark {
            opacity: 0.15 !important;
            filter: blur(10px) brightness(0.8) !important;
        }

        @keyframes resetIntenseFloat {
            0% { transform: translateY(-50%) rotate(0deg) scale(1); }
            50% { transform: translateY(-55%) rotate(-4deg) scale(1.03); }
            100% { transform: translateY(-45%) rotate(3deg) scale(0.97); }
        }

        /* ВОЛНА И ТОАСТ ПОДТВЕРЖДЕНИЯ ЗАКРЫТИЯ */
        .reset-confirm-wave {
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%) !important;
            transform: translate(-50%, 50%) scale(0) !important;
            pointer-events: none !important;
            z-index: 8 !important;
            opacity: 0 !important;
        }

        .reset-confirm-wave.active {
            animation: resetFullScreenWave 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards !important;
        }

        @keyframes resetFullScreenWave {
            0% { transform: translate(-50%, 50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, 50%) scale(280); opacity: 0; }
        }

        .reset-confirm-toast {
            position: fixed !important;
            bottom: 30px !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(100px) scale(0.85);
            background: rgba(22, 22, 28, 0.96) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            border-radius: 16px !important;
            padding: 12px 20px !important;
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7) !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            white-space: nowrap !important;
            z-index: 10 !important;
            transition: all 0.35s ease !important;
        }

        .reset-confirm-toast.visible {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            transform: translateX(-50%) translateY(0) scale(1) !important;
        }

        .reset-confirm-text {
            color: rgba(255, 255, 255, 0.95) !important;
            font-size: 13px !important;
            font-weight: 500 !important;
        }

        .reset-confirm-actions {
            display: flex !important;
            gap: 8px !important;
        }

        .reset-confirm-btn {
            background: transparent !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            padding: 5px 12px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            cursor: pointer !important;
        }

        .reset-confirm-btn.danger {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #ffffff !important;
            font-weight: 600 !important;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'reset-system-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- HTML РАЗМЕТКА ---
function initResetModalUI() {
    if (document.getElementById('reset-modal-overlay')) return;

    const modalHTML = `
        <div id="reset-modal-overlay" class="reset-modal-overlay">
            <img src="images/geo_logo.png" alt="" class="reset-bg-watermark">

            <div class="reset-modal-container">
                <button id="reset-close-btn" class="reset-close-btn" type="button">&times;</button>

                <div class="reset-header-title">
                    <div class="reset-logo-wrapper">
                        <img src="images/geo_logo.png" alt="Geo Logo" class="reset-header-logo">
                    </div>
                    <span class="reset-brand-text">GEOГРАФИЯ</span>
                </div>
                
                <div class="reset-tabs" id="reset-tabs">
                    <button type="button" class="reset-tab-btn active" id="tab-request-btn">Запрос</button>
                    <button type="button" class="reset-tab-btn disabled" id="tab-update-btn" disabled>Замена</button>
                </div>

                <div class="reset-forms-wrapper">
                    <form id="reset-form-request" class="reset-form visible">
                        <div class="reset-input-group">
                            <input type="email" id="reset-request-email" placeholder="Ваш Email..." required class="reset-input" autocomplete="email">
                        </div>
                        <button type="submit" class="reset-submit-btn" id="reset-request-btn-text">Отправить ссылку</button>
                    </form>

                    <form id="reset-form-update" class="reset-form">
                        <div class="reset-input-group">
                            <input type="password" id="reset-new-password" placeholder="Новый пароль (мин. 6 )..." required minlength="6" class="reset-input" autocomplete="new-password">
                        </div>
                        <button type="submit" class="reset-submit-btn" id="reset-update-btn-text">Сохранить пароль</button>
                    </form>
                </div>
            </div>

            <div id="reset-confirm-wave" class="reset-confirm-wave"></div>

            <div id="reset-confirm-toast" class="reset-confirm-toast">
                <span class="reset-confirm-text">Закрыть сброс пароля?</span>
                <div class="reset-confirm-actions">
                    <button type="button" class="reset-confirm-btn" id="reset-cancel-close-btn">Отмена</button>
                    <button type="button" class="reset-confirm-btn danger" id="reset-confirm-close-btn">Да</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- СОБЫТИЯ И ЛОГИКА ---
function initResetEvents() {
    const overlay = document.getElementById('reset-modal-overlay');
    const closeBtn = document.getElementById('reset-close-btn');
    const tabRequest = document.getElementById('tab-request-btn');
    const tabUpdate = document.getElementById('tab-update-btn');
    
    const formRequest = document.getElementById('reset-form-request');
    const formUpdate = document.getElementById('reset-form-update');

    const btnConfirmYes = document.getElementById('reset-confirm-close-btn');
    const btnConfirmNo = document.getElementById('reset-cancel-close-btn');

    btnConfirmYes?.addEventListener('click', window.hideResetModal);
    btnConfirmNo?.addEventListener('click', () => hideResetConfirmToast(false));

    closeBtn?.addEventListener('click', window.hideResetModal);

    overlay?.addEventListener('dblclick', (e) => {
        if (e.target === overlay) {
            showResetConfirmToast();
        }
    });

    overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) {
            const container = document.querySelector('.reset-modal-container');
            if (container) {
                container.classList.remove('shake');
                void container.offsetWidth;
                container.classList.add('shake');
                
                setTimeout(() => {
                    container.classList.remove('shake');
                }, 400);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.hideResetModal();
        }
    });

    tabRequest?.addEventListener('click', () => setResetMode('request'));
    tabUpdate?.addEventListener('click', () => {
        if (isUpdateUnlocked) {
            setResetMode('update');
        }
    });

    // Отправка запроса на письмо
    formRequest?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const email = document.getElementById('reset-request-email').value;
        const btn = document.getElementById('reset-request-btn-text');

        btn.textContent = 'Отправка...';
        btn.disabled = true;

        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        btn.disabled = false;
        btn.textContent = 'Отправить ссылку';

        if (error) {
            alert(`Ошибка отправки: ${error.message}`);
        } else {
            alert('Ссылка для сброса пароля отправлена на почту! Теперь активирован режим замены.');
            
            // Разблокируем вкладку "Замена" и сразу переключаем на неё
            isUpdateUnlocked = true;
            if (tabUpdate) {
                tabUpdate.classList.remove('disabled');
                tabUpdate.removeAttribute('disabled');
            }
            setResetMode('update');
        }
    });

    // Сохранение нового пароля
    formUpdate?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!window.supabaseClient) return alert('Supabase CDN не подключен!');

        const newPassword = document.getElementById('reset-new-password').value;
        const btn = document.getElementById('reset-update-btn-text');

        btn.textContent = 'Сохранение...';
        btn.disabled = true;

        const { error } = await window.supabaseClient.auth.updateUser({
            password: newPassword
        });

        btn.disabled = false;
        btn.textContent = 'Сохранить пароль';

        if (error) {
            alert(`Ошибка обновления пароля: ${error.message}`);
        } else {
            alert('Пароль успешно изменён!');
            window.hideResetModal();
        }
    });
}
