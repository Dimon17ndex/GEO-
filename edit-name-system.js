// edit-name-system.js

let editNameOverlayClickTimeout = null;
let editNameToastMoveTimer = null;
let editNameLastMouseX = 0;
let editNameLastMouseY = 0;
let editNameToastActivePos = null;

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showEditNameModal = function() {
    injectEditNameStyles();
    initEditNameModalUI();
    initEditNameEvents();
    
    const modal = document.getElementById('edit-name-modal-overlay');
    hideEditNameConfirmToast(true);
    
    // Предзаполняем поле и настраиваем заголовки тикера
    loadCurrentNameToInput();

    if (modal) {
        modal.classList.add('active');
    }
};

window.hideEditNameModal = function() {
    const modal = document.getElementById('edit-name-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        hideEditNameConfirmToast(true);
    }
};

// Функция загрузки текущего имени из сессии Supabase и адаптации заголовков
async function loadCurrentNameToInput() {
    const inputField = document.getElementById('edit-name-input');
    const tickerSecondSpan = document.getElementById('edit-name-ticker-second');
    if (!inputField) return;

    let hasName = false;

    try {
        const client = window.supabaseClient || window.supabase;
        if (client && client.auth) {
            const { data: { session } } = await client.auth.getSession();
            if (session && session.user) {
                const user = session.user;
                const currentName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.username || '';
                inputField.value = currentName;
                if (currentName.trim() !== '') {
                    hasName = true;
                }
            }
        }
    } catch (err) {
        console.error('Ошибка получения имени пользователя:', err);
    }

    // Динамически меняем второй слайд тикера в зависимости от наличия имени
    if (tickerSecondSpan) {
        tickerSecondSpan.textContent = hasName ? 'СМЕНА ИМЕНИ' : 'СОЗДАНИЕ ИМЕНИ';
    }

    // Проверяем первичное состояние введенного текста (на случай совпадения с "НЕТ ИМЕНИ")
    validateEditNameInputState();
}

// Проверка валидности введенного текста (блокировка для "НЕТ ИМЕНИ")
function validateEditNameInputState() {
    const inputField = document.getElementById('edit-name-input');
    const submitBtn = document.getElementById('btn-submit-edit-name');
    if (!inputField || !submitBtn) return;

    const val = inputField.value.trim().toUpperCase();
    const isForbidden = (val === 'НЕТ ИМЕНИ');

    if (isForbidden) {
        submitBtn.disabled = true;
        submitBtn.classList.add('forbidden');
        submitBtn.innerHTML = 'Такого не может быть';
    } else {
        // Если кнопка не находится в процессе отправки (loading)
        if (!submitBtn.classList.contains('loading')) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('forbidden');
            submitBtn.innerHTML = 'Сохранить';
        }
    }
}

// Функция показа всплывающей плашки подтверждения с позиционированием и защитой от границ
function showEditNameConfirmToast(type = 'close-btn', clientX = 0, clientY = 0) {
    const toast = document.getElementById('edit-name-confirm-toast');
    const wave = document.getElementById('edit-name-confirm-wave');
    const closeBtn = document.getElementById('edit-name-close-btn');
    
    if (!toast) return;

    // Если плашка уже открыта и запрос идет с крестика — игнорируем повторное дергание
    if (type === 'close-btn' && toast.classList.contains('visible')) {
        return;
    }

    clearTimeout(editNameToastMoveTimer);
    toast.classList.remove('hiding', 'visible');
    if (wave) wave.classList.remove('active');

    // Сбрасываем старые инлайн-стили позиционирования
    toast.style.left = '';
    toast.style.top = '';
    toast.style.bottom = '';
    toast.style.right = '';

    // Даем браузеру обновить размеры перед расчетом
    toast.style.visibility = 'hidden';
    toast.style.display = 'flex';
    const toastWidth = toast.offsetWidth || 260;
    const toastHeight = toast.offsetHeight || 50;

    let targetLeft = 0;
    let targetTop = 0;

    if (type === 'close-btn' && closeBtn) {
        const btnRect = closeBtn.getBoundingClientRect();
        toast.style.position = 'fixed';
        
        let calculatedRight = window.innerWidth - btnRect.left + 12;
        const maxRight = window.innerWidth - toastWidth - 15;
        const finalRight = Math.min(calculatedRight, maxRight);

        targetRight = Math.max(15, finalRight);
        targetTop = Math.max(15, Math.min(btnRect.top + btnRect.height / 2, window.innerHeight - toastHeight - 15));
        
        toast.style.right = targetRight + 'px';
        toast.style.top = targetTop + 'px';
        toast.style.transform = 'translateY(-50%) scale(0.85)';

        requestAnimationFrame(() => {
            const rect = toast.getBoundingClientRect();
            editNameToastActivePos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        });
    } else if (type === 'double-click') {
        toast.style.position = 'fixed';
        
        targetLeft = Math.max(15, Math.min(clientX - toastWidth / 2, window.innerWidth - toastWidth - 15));
        targetTop = Math.max(15, Math.min(clientY + 15, window.innerHeight - toastHeight - 15));

        toast.style.left = targetLeft + 'px';
        toast.style.top = targetTop + 'px';
        toast.style.transform = 'translateY(0) scale(0.85)';

        editNameToastActivePos = { x: targetLeft + toastWidth / 2, y: targetTop + toastHeight / 2 };
    }

    toast.style.visibility = ''; 
    void toast.offsetWidth; 

    toast.classList.add('visible');
    if (wave && type === 'double-click') {
        wave.style.left = clientX + 'px';
        wave.style.bottom = (window.innerHeight - clientY) + 'px';
        wave.classList.add('active');
    }
}

// Функция мягкого скрытия плашки
function hideEditNameConfirmToast(immediate = false) {
    const toast = document.getElementById('edit-name-confirm-toast');
    const wave = document.getElementById('edit-name-confirm-wave');

    clearTimeout(editNameToastMoveTimer);
    editNameToastActivePos = null;

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

// Управление состоянием кнопки (анимация загрузки / блокировка)
function setEditNameButtonLoading(button, isLoading, originalText) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.dataset.originalText = originalText;
        button.innerHTML = '<span class="edit-name-spinner"></span>';
    } else {
        button.classList.remove('loading');
        validateEditNameInputState();
    }
}

// Функция локального обновления имени на странице без перезагрузки
function updateUIAfterNameChange(newName) {
    // Обновляем элемент отображения имени в виджете профиля, если он есть
    const profileNameText = document.getElementById('profile-name-text');
    if (profileNameText) {
        profileNameText.textContent = newName;
    }

    // Если в других частях интерфейса имя хранится в глобальном объекте или атрибутах
    if (window.currentUserData) {
        window.currentUserData.full_name = newName;
    }
}

// --- ЗАГРУЗКА ---
document.addEventListener('DOMContentLoaded', () => {
    injectEditNameStyles();
    initEditNameModalUI();
    initEditNameEvents();
});

// --- СТИЛИ ---
function injectEditNameStyles() {
    if (document.getElementById('edit-name-system-styles')) return;

    const css = `
        .edit-name-modal-overlay {
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

        .edit-name-modal-overlay.active {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }

        .edit-name-modal-container {
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

        .edit-name-modal-overlay.active .edit-name-modal-container {
            transform: scale(1) !important;
        }

        .edit-name-modal-container.shake {
            animation: editNameShakeAnimation 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) !important;
        }

        @keyframes editNameShakeAnimation {
            10%, 90% { transform: scale(1) translateX(-3px); }
            20%, 80% { transform: scale(1) translateX(4px); }
            30%, 50%, 70% { transform: scale(1) translateX(-6px); }
            40%, 60% { transform: scale(1) translateX(6px); }
        }

        .edit-name-close-btn {
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

        .edit-name-close-btn::before {
            content: '' !important;
            position: absolute !important;
            top: -12px !important;
            bottom: -12px !important;
            left: -12px !important;
            right: -12px !important;
        }

        .edit-name-close-btn:hover {
            color: #ffffff !important;
            transform: scale(1.15) rotate(90deg) !important;
        }

        .edit-name-close-btn:active {
            transform: scale(0.9) rotate(90deg) !important;
        }

        .edit-name-header-title {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 20px !important;
            margin-top: -30px !important;
            margin-bottom: 30px !important;
        }

        .edit-name-logo-wrapper {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            will-change: transform !important;
            animation: editNameLogoHover 3s ease-in-out infinite alternate !important;
        }

        .edit-name-header-logo {
            height: 105px !important;
            width: auto !important;
            display: block !important;
            object-fit: contain !important;
        }

        @keyframes editNameLogoHover {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(-2deg); }
            100% { transform: translateY(6px) rotate(2deg); }
        }

        .edit-name-title-ticker {
            height: 55px !important;
            overflow: hidden !important;
            position: relative !important;
        }

        .edit-name-title-track {
            display: flex !important;
            flex-direction: column !important;
            animation: editNameTitleVerticalScroll 6s cubic-bezier(0.77, 0, 0.175, 1) infinite !important;
        }

        .edit-name-title-track span {
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

        @keyframes editNameTitleVerticalScroll {
            0%, 40% { transform: translateY(0); }
            50%, 90% { transform: translateY(-55px); }
            100% { transform: translateY(0); }
        }

        .edit-name-form {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 25px !important;
        }

        .edit-name-input-group {
            position: relative !important;
            width: 100% !important;
        }

        .edit-name-input {
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

        .edit-name-input::placeholder {
            color: rgba(255, 255, 255, 0.35) !important;
            text-align: center !important;
        }

        .edit-name-input:focus {
            border-bottom-color: #ffffff !important;
        }

        .edit-name-submit-btn {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
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
            transition: all 0.25s ease !important;
            text-align: center !important;
            min-height: 42px !important;
            box-sizing: border-box !important;
        }

        .edit-name-submit-btn:hover:not(:disabled) {
            background: #ffffff !important;
            color: #000000 !important;
        }

        .edit-name-submit-btn:active:not(:disabled) {
            transform: scale(0.98) !important;
        }

        .edit-name-submit-btn.loading,
        .edit-name-submit-btn:disabled:not(.forbidden) {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
            color: rgba(255, 255, 255, 0.4) !important;
            cursor: not-allowed !important;
            transform: none !important;
        }

        .edit-name-submit-btn.forbidden {
            background: transparent !important;
            border-color: #ff3b30 !important;
            color: #ff3b30 !important;
            cursor: not-allowed !important;
            transform: none !important;
        }

        .edit-name-spinner {
            display: inline-block !important;
            width: 18px !important;
            height: 18px !important;
            border: 2px solid rgba(255, 255, 255, 0.25) !important;
            border-radius: 50% !important;
            border-top-color: #ffffff !important;
            animation: editNameSpinnerRotate 0.75s linear infinite !important;
        }

        @keyframes editNameSpinnerRotate {
            to { transform: rotate(360deg); }
        }

        .edit-name-confirm-wave {
            position: fixed !important;
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.25) 30%, rgba(255, 255, 255, 0) 70%) !important;
            transform: translate(-50%, -50%) scale(0) !important;
            pointer-events: none !important;
            z-index: 8 !important;
            opacity: 0 !important;
        }

        .edit-name-confirm-wave.active {
            animation: editNameFullScreenWave 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards !important;
        }

        @keyframes editNameFullScreenWave {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { opacity: 0.7; }
            100% { transform: translate(-50%, -50%) scale(280); opacity: 0; }
        }

        .edit-name-confirm-toast {
            position: fixed !important;
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
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease, left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1), right 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .edit-name-confirm-toast.visible {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }

        .edit-name-confirm-toast.hiding {
            opacity: 0 !important;
            transform: scale(0.9) !important;
            pointer-events: none !important;
        }

        .edit-name-confirm-text {
            color: rgba(255, 255, 255, 0.95) !important;
            font-size: 13px !important;
            font-weight: 500 !important;
        }

        .edit-name-confirm-actions {
            display: flex !important;
            gap: 8px !important;
        }

        .edit-name-confirm-btn {
            background: transparent !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #ffffff !important;
            padding: 5px 12px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
        }

        .edit-name-confirm-btn:hover {
            background: rgba(255, 255, 255, 0.12) !important;
        }

        .edit-name-confirm-btn.danger {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #ffffff !important;
            font-weight: 600 !important;
        }

        .edit-name-confirm-btn.danger:hover {
            background: rgba(255, 255, 255, 0.85) !important;
        }

        .edit-name-bg-watermark {
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
            animation: editNameIntenseFloat 6s ease-in-out infinite alternate !important;
        }

        .edit-name-modal-overlay.active .edit-name-bg-watermark {
            opacity: 0.22 !important;
            filter: blur(12px) brightness(0.9) !important;
        }

        @keyframes editNameIntenseFloat {
            0% { transform: translateY(-50%) translateX(0px) rotate(0deg) scale(1); }
            50% { transform: translateY(-58%) translateX(-25px) rotate(-5deg) scale(1.04); }
            100% { transform: translateY(-42%) translateX(15px) rotate(4deg) scale(0.96); }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'edit-name-system-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- HTML РАЗМЕТКА ---
function initEditNameModalUI() {
    if (document.getElementById('edit-name-modal-overlay')) return;

    const modalHTML = `
        <div id="edit-name-modal-overlay" class="edit-name-modal-overlay">
            <button id="edit-name-close-btn" class="edit-name-close-btn" type="button">&times;</button>

            <img src="images/geo_logo.png" alt="" class="edit-name-bg-watermark">

            <div class="edit-name-modal-container">
                <div class="edit-name-header-title">
                    <div class="edit-name-logo-wrapper">
                        <img src="images/geo_logo.png" alt="Geo Logo" class="edit-name-header-logo">
                    </div>

                    <div class="edit-name-title-ticker">
                        <div class="edit-name-title-track">
                            <span>GEOГРАФИЯ</span>
                            <span id="edit-name-ticker-second">СМЕНА ИМЕНИ</span>
                        </div>
                    </div>
                </div>
                
                <form id="edit-name-form" class="edit-name-form">
                    <div class="edit-name-input-group">
                        <input type="text" id="edit-name-input" placeholder="Новое имя / Никнейм..." required class="edit-name-input" autocomplete="nickname">
                    </div>
                    <button type="submit" id="btn-submit-edit-name" class="edit-name-submit-btn">Сохранить</button>
                </form>
            </div>

            <div id="edit-name-confirm-wave" class="edit-name-confirm-wave"></div>

            <div id="edit-name-confirm-toast" class="edit-name-confirm-toast">
                <span class="edit-name-confirm-text">Закрыть без сохранения?</span>
                <div class="edit-name-confirm-actions">
                    <button type="button" class="edit-name-confirm-btn" id="edit-name-cancel-close-btn">Отмена</button>
                    <button type="button" class="edit-name-confirm-btn danger" id="edit-name-confirm-close-btn">Да</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// --- СОБЫТИЯ ---
function initEditNameEvents() {
    const overlay = document.getElementById('edit-name-modal-overlay');
    const closeBtn = document.getElementById('edit-name-close-btn');
    const form = document.getElementById('edit-name-form');
    const inputField = document.getElementById('edit-name-input');

    const btnConfirmYes = document.getElementById('edit-name-confirm-close-btn');
    const btnConfirmNo = document.getElementById('edit-name-cancel-close-btn');

    if (overlay && overlay.dataset.eventsInitialized) return;
    if (overlay) overlay.dataset.eventsInitialized = "true";

    btnConfirmYes?.addEventListener('click', window.hideEditNameModal);
    btnConfirmNo?.addEventListener('click', () => hideEditNameConfirmToast(false));

    // Отслеживание движения мыши для магнитной плашки
    document.addEventListener('mousemove', (e) => {
        editNameLastMouseX = e.clientX;
        editNameLastMouseY = e.clientY;

        const toast = document.getElementById('edit-name-confirm-toast');
        if (!toast || !toast.classList.contains('visible') || !editNameToastActivePos) return;

        const distance = Math.hypot(e.clientX - editNameToastActivePos.x, e.clientY - editNameToastActivePos.y);
        const thresholdDistance = 150; // Около 5 см

        if (distance > thresholdDistance) {
            if (!editNameToastMoveTimer) {
                editNameToastMoveTimer = setTimeout(() => {
                    const currentToast = document.getElementById('edit-name-confirm-toast');
                    if (!currentToast || !currentToast.classList.contains('visible')) return;

                    const tWidth = currentToast.offsetWidth || 260;
                    const tHeight = currentToast.offsetHeight || 50;

                    let newLeft = Math.max(15, Math.min(editNameLastMouseX - tWidth / 2, window.innerWidth - tWidth - 15));
                    let newTop = Math.max(15, Math.min(editNameLastMouseY + 15, window.innerHeight - tHeight - 15));

                    currentToast.style.right = '';
                    currentToast.style.left = newLeft + 'px';
                    currentToast.style.top = newTop + 'px';
                    currentToast.style.transform = 'translateY(0) scale(0.85)';

                    editNameToastActivePos = { x: newLeft + tWidth / 2, y: newTop + tHeight / 2 };
                    editNameToastMoveTimer = null;
                }, 500);
            }
        } else {
            if (editNameToastMoveTimer) {
                clearTimeout(editNameToastMoveTimer);
                editNameToastMoveTimer = null;
            }
        }
    });

    closeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        showEditNameConfirmToast('close-btn');
    });

    inputField?.addEventListener('input', () => {
        validateEditNameInputState();
    });

    overlay?.addEventListener('click', (e) => {
        if (e.target !== overlay) return;

        if (editNameOverlayClickTimeout) clearTimeout(editNameOverlayClickTimeout);

        editNameOverlayClickTimeout = setTimeout(() => {
            const container = document.querySelector('.edit-name-modal-container');
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
            if (editNameOverlayClickTimeout) clearTimeout(editNameOverlayClickTimeout);
            showEditNameConfirmToast('double-click', e.clientX, e.clientY);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('edit-name-modal-overlay')?.classList.contains('active')) {
            showEditNameConfirmToast('close-btn');
        }
    });

    // Отправка формы (Сохранение нового имени в Supabase без перезагрузки страницы)
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const client = window.supabaseClient || window.supabase;
        if (!client) return alert('Supabase клиент не найден!');

        const submitBtn = document.getElementById('btn-submit-edit-name');
        const newName = inputField ? inputField.value.trim() : '';

        if (!newName || newName.toUpperCase() === 'НЕТ ИМЕНИ') {
            return;
        }

        setEditNameButtonLoading(submitBtn, true, 'Сохранить');

        try {
            const { data, error } = await client.auth.updateUser({
                data: {
                    full_name: newName,
                    username: newName
                }
            });

            if (error) {
                alert(`Ошибка при сохранении имени: ${error.message}`);
                setEditNameButtonLoading(submitBtn, false, 'Сохранить');
            } else {
                setEditNameButtonLoading(submitBtn, false, 'Сохранить');
                
                // Обновляем имя локально на странице без перезагрузки
                updateUIAfterNameChange(newName);
                
                // Просто закрываем модальное окно
                window.hideEditNameModal();
            }
        } catch (err) {
            console.error('Ошибка:', err);
            setEditNameButtonLoading(submitBtn, false, 'Сохранить');
        }
    });
}
