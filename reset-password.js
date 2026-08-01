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

// Функция показа всплывающей плашки с прыжком и радиальной волной
function showResetConfirmToast() {
    const toast = document.getElementById('reset-confirm-toast');
    const wave = document.getElementById('reset-confirm-wave');
    
    if (toast) {
        toast.classList.remove('hiding', 'visible');
        if (wave) wave.classList.remove('active');

        void toast.offsetWidth; // Перезапуск анимации

        toast.classList.add('visible');
        if (wave) wave.classList.add('active');
    }
}

// Функция мягкого скрытия плашки
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
    if (mode === 'update' && !isResetUpdateUnlocked && currentResetMode !== 'update') {
        return; // Запрещаем переключение на замену, если режим еще не разблокирован
    }

    currentResetMode = mode;

    const resetTabs = document.getElementById('reset-tabs');
    const tabRequest = document.getElementById('tab-request-btn');
    const tabUpdate = document.getElementById('tab-update-btn');
    
    const formRequest = document.getElementById('reset-form-request');
    const formUpdate = document.getElementById('reset-form-update');

    if (!resetTabs || !tabRequest || !tabUpdate || !formRequest || !formUpdate) return;

    if (mode === 'request') {
        resetTabs.classList.remove('update-mode');
        tabRequest.classList.add('active');
        tabUpdate.classList.remove('active');

        formUpdate.classList.remove('visible');
        formRequest.classList.add('visible');
    } else {
        resetTabs.classList.add('update-mode');
        tabUpdate.classList.add('active');
        tabRequest.classList.remove('active');

        formRequest.classList.remove('visible');
        formUpdate.classList.add('visible');
    }
}

// --- ЗАГРУЗКА ---
document.addEventListener('DOMContentLoaded', () => {
    injectResetStyles();
    initResetModalUI();
    initResetEvents();

    if (window.supabaseClient) {
        window.supabaseClient.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                isResetUpdateUnlocked = true;
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
    if (document.getElementById('reset-system-styles')) return;

    const css = `
        .reset-modal-overlay {
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

        .reset-close-btn {
            position: absolute !important;
            top: 30px !important;
            right: 30px !important;
            background: transparent !important;
            border: none !important;
            color: rgba(255, 255, 255, 0.4) !important;
            font-size: 28px !important;
            line-height: 1 !important;
            cursor: pointer !important;
            z-index: 99999999 !important;
            padding: 0 !important;
            transform-origin: center center !important;
            transition: color 0.25s ease, transform 0.25s ease !important;
        }

        .reset-close-btn::before {
            content: '' !important;
            position: absolute !important;
            top: -12px !important;
            bottom: -12px !important;
            left: -12px !important;
            right: -12px !important;
        }

        .reset-close-btn:hover {
            color: #ffffff !important;
            transform: scale(1.15) rotate(90deg) !important;
        }

        .reset-close-btn:active {
            transform: scale(0.9) rotate(90deg) !important;
        }

        .reset-header-title {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 20px !important;
            margin-top: -70px !important; /* Подняли заголовок и логотип выше */
            margin-bottom: 20px !important;
        }

        .reset-logo-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            will-change: transform !important;
            animation: resetLogoHover 3s ease-in-out infinite alternate !important;
        }

        .reset-header-logo {
            height: 105px !important;
            width: auto !important;
            display: block !important;
            object-fit: contain !important;
        }

        @keyframes resetLogoHover {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(-2deg); }
            100% { transform: translateY(6px) rotate(2deg); }
        }

        .reset-title-ticker {
            height: 55px !important;
            overflow: hidden !important;
            position: relative !important;
        }

        .reset-title-track {
            display: flex !important;
            flex-direction: column !important;
            animation: resetTitleVerticalScroll 8s cubic-bezier(0.77, 0, 0.175, 1) infinite !important;
        }

        .reset-title-track span {
            height: 55px !important;
            line-height: 55px !important;
            font-family: 'Unbounded', sans-serif !important;
            font-size: 32px !important;
            font-weight: 900 !important;
            letter-spacing: -0.5px !important;
            color: #ffffff !important;
            text-transform: uppercase !important;
            white-space: nowrap !important;
            display: flex !important;
            align-items: center !important;
        }

        @keyframes resetTitleVerticalScroll {
            0%, 20% { transform: translateY(0); }
            25%, 45% { transform: translateY(-55px); }
            50%, 70% { transform: translateY(-55px); }
            75%, 100% { transform: translateY(0); }
        }

        .reset-tabs {
            position: relative !important;
            display: flex !important;
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 24px !important;
            padding: 3px !important;
            width: 100% !important;
            margin-bottom: 30px !important;
            box-sizing: border-box !important;
        }

        .reset-tab-pill {
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

        .reset-tabs.update-mode .reset-tab-pill {
            transform: translateX(100%) !important;
        }

        .reset-tab-btn {
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
            transition: color 0.3s ease, opacity 0.3s ease !important;
            text-align: center !important;
        }

        .reset-tab-btn.disabled {
            opacity: 0.3 !important;
            cursor: not-allowed !important;
        }

        .reset-tab-btn.active {
            color: #000000 !important;
            font-weight: 600 !important;
        }

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
            gap: 25px !important;
            
            opacity: 0 !important;
            filter: blur(8px) !important;
            pointer-events: none !important;
            transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), 
                        filter 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .reset-form.visible {
            opacity: 1 !important;
            filter: blur(0px) !important;
            pointer-events: auto !important;
        }

        .reset-input-group {
            position: relative !important;
            width: 100% !important;
        }

        .reset-input {
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

        .reset-input::placeholder {
            color: rgba(255, 255, 255, 0.35) !important;
            text-align: center !important;
        }

        .reset-input:focus {
            border-bottom-color: #ffffff !important;
        }

        .reset-submit-btn {
            background: transparent !important;
            color: #ffffff !important;
            border: 1px solid #ffffff !important;
            border-radius: 24px !important;
            padding: 10px 20px !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            width: 100% !important;
            margin-top: 15px !important;
            transition: all 0.2s ease !important;
            text-align: center !important;
        }

        .reset-submit-btn:hover {
            background: #ffffff !important;
            color: #000000 !important;
        }

        .reset-submit-btn:active {
            transform: scale(0.98) !important;
        }

        .reset-confirm-wave {
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0) 70%) !important;
            transform: translate(-50%, 50%) scale(0) !important;
            pointer-events: none !important;
            z-index: 8 !important;
            opacity: 0 !important;
        }

        .reset-confirm-wave.active {
            animation: resetFullScreenWave 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards !important;
        }

        @keyframes resetFullScreenWave {
            0% {
                transform: translate(-50%, 50%) scale(1);
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
            100% {
                transform: translate(-50%, 50%) scale(280);
                opacity: 0;
            }
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
            transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s ease !important;
        }

        .reset-confirm-toast.visible {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            animation: resetBounceInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
        }

        .reset-confirm-toast.hiding {
            opacity: 0 !important;
            transform: translateX(-50%) translateY(40px) scale(0.9) !important;
            pointer-events: none !important;
            animation: none !important;
        }

        @keyframes resetBounceInUp {
            0% {
                opacity: 0;
                transform: translateX(-50%) translateY(100px) scale(0.7);
            }
            65% {
                opacity: 1;
                transform: translateX(-50%) translateY(-12px) scale(1.03);
            }
            85% {
                transform: translateX(-50%) translateY(4px) scale(0.98);
            }
            100% {
                opacity: 1;
                transform: translateX(-50%) translateY(0) scale(1);
            }
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
            transition: all 0.2s ease !important;
        }

        .reset-confirm-btn:hover {
            background: rgba(255, 255, 255, 0.12) !important;
        }

        .reset-confirm-btn.danger {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #ffffff !important;
            font-weight: 600 !important;
        }

        .reset-confirm-btn.danger:hover {
            background: rgba(255, 255, 255, 0.85) !important;
        }

        .reset-bg-watermark {
            position: absolute !important;
            top: 45% !important;
            right: -15% !important;
            left: auto !important;
            width: 1200px !important;
            height: auto !important;
            max-width: none !important;
            pointer-events: none !important;
            z-index: 1 !important;
            transform-origin: center right !important;
            
            opacity: 0 !important;
            filter: blur(45px) brightness(0.6) !important;
            transition: opacity 1.2s ease-out, filter 1.2s ease-out !important;
            animation: resetIntenseFloat 6s ease-in-out infinite alternate !important;
        }

        .reset-modal-overlay.active .reset-bg-watermark {
            opacity: 0.22 !important;
            filter: blur(12px) brightness(0.9) !important;
        }

        @keyframes resetIntenseFloat {
            0% {
                transform: translateY(-50%) translateX(0px) rotate(0deg) scale(1);
            }
            50% {
                transform: translateY(-58%) translateX(-25px) rotate(-5deg) scale(1.04);
            }
            100% {
                transform: translateY(-42%) translateX(15px) rotate(4deg) scale(0.96);
            }
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
            <button id="reset-close-btn" class="reset-close-btn" type="button">&times;</button>

            <img src="images/geo_logo.png" alt="" class="reset-bg-watermark">

            <div class="reset-modal-container">
                <div class="reset-header-title">
                    <div class="reset-logo-wrapper">
                        <img src="images/geo_logo.png" alt="Geo Logo" class="reset-header-logo">
                    </div>

                    <div class="reset-title-ticker">
                        <div class="reset-title-track">
                            <span>GEOГРАФИЯ</span>
                            <span>СБРОС ПАРОЛЯ</span>
                        </div>
                    </div>
                </div>
                
                <div class="reset-tabs" id="reset-tabs">
                    <div class="reset-tab-pill"></div>
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
                            <input type="password" id="reset-new-password" placeholder="Новый пароль (мин. 6)..." required minlength="6" class="reset-input" autocomplete="new-password">
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

// --- СОБЫТИЯ ---
function initResetEvents() {
    const overlay = document.getElementById('reset-modal-overlay');
    const closeBtn = document.getElementById('reset-close-btn');
    const tabRequest = document.getElementById('tab-request-btn');
    const tabUpdate = document.getElementById('tab-update-btn');
    
    const formRequest = document.getElementById('reset-form-request');
    const formUpdate = document.getElementById('reset-form-update');

    const btnConfirmYes = document.getElementById('reset-confirm-close-btn');
    const btnConfirmNo = document.getElementById('reset-cancel-close-btn');

    // Предотвращение дублирования обработчиков
    if (overlay && overlay.dataset.eventsInitialized) return;
    if (overlay) overlay.dataset.eventsInitialized = "true";

    btnConfirmYes?.addEventListener('click', window.hideResetModal);
    btnConfirmNo?.addEventListener('click', () => hideResetConfirmToast(false));

    closeBtn?.addEventListener('click', window.hideResetModal);

    // Разделение single/double click на оверлее
    overlay?.addEventListener('click', (e) => {
        if (e.target !== overlay) return;

        if (resetOverlayClickTimeout) clearTimeout(resetOverlayClickTimeout);

        resetOverlayClickTimeout = setTimeout(() => {
            const container = document.querySelector('.reset-modal-container');
            if (container) {
                container.classList.remove('shake');
                void container.offsetWidth;
                container.classList.add('shake');
                
                setTimeout(() => {
                    container.classList.remove('shake');
                }, 400);
            }
        }, 250);
    });

    overlay?.addEventListener('dblclick', (e) => {
        if (e.target === overlay) {
            if (resetOverlayClickTimeout) clearTimeout(resetOverlayClickTimeout);
            showResetConfirmToast();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.hideResetModal();
        }
    });

    tabRequest?.addEventListener('click', () => setResetMode('request'));
    tabUpdate?.addEventListener('click', () => {
        if (isResetUpdateUnlocked) {
            setResetMode('update');
        }
    });

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
            alert('Ссылка отправлена на вашу почту! Теперь активирована вкладка «Замена».');
            
            isResetUpdateUnlocked = true;
            if (tabUpdate) {
                tabUpdate.classList.remove('disabled');
                tabUpdate.removeAttribute('disabled');
            }
            setResetMode('update');
        }
    });

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
            alert(`Ошибка изменения пароля: ${error.message}`);
        } else {
            alert('Пароль успешно обновлён!');
            window.hideResetModal();
        }
    });
}
