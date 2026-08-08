// edit-name-system.js

let editNameClickTimeout = null;

// --- ГЛОБАЛЬНЫЕ ФУНКЦИИ ---
window.showEditNameModal = function() {
    injectEditNameStyles();
    initEditNameModalUI();
    initEditNameEvents();
    
    const modal = document.getElementById('edit-name-modal-overlay');
    hideEditNameConfirmToast(true);
    
    // Предзаполняем поле текущим именем
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

// Функция загрузки текущего имени из сессии Supabase в инпут
async function loadCurrentNameToInput() {
    const inputField = document.getElementById('edit-name-input');
    if (!inputField) return;

    try {
        const client = window.supabaseClient || window.supabase;
        if (client && client.auth) {
            const { data: { session } } = await client.auth.getSession();
            if (session && session.user) {
                const user = session.user;
                const currentName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.username || '';
                inputField.value = currentName;
            }
        }
    } catch (err) {
        console.error('Ошибка получения имени пользователя:', err);
    }
}

// Функция показа всплывающей плашки подтверждения закрытия
function showEditNameConfirmToast() {
    const toast = document.getElementById('edit-name-confirm-toast');
    const wave = document.getElementById('edit-name-confirm-wave');
    
    if (toast) {
        toast.classList.remove('hiding', 'visible');
        if (wave) wave.classList.remove('active');

        void toast.offsetWidth;

        toast.classList.add('visible');
        if (wave) wave.classList.add('active');
    }
}

function hideEditNameConfirmToast(immediate = false) {
    const toast = document.getElementById('edit-name-confirm-toast');
    const wave = document.getElementById('edit-name-confirm-wave');

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

// Управление состоянием кнопки (анимация загрузки)
function setEditNameButtonLoading(button, isLoading, originalText) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
        button.dataset.originalText = originalText;
        button.innerHTML = '<span class="edit-name-spinner"></span>';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = button.dataset.originalText || originalText;
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

        /* Большой качающийся логотип на фоне */
        .edit-name-bg-logo-wrap {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 450px !important;
            height: 450px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: none !important;
            z-index: 1 !important;
            opacity: 0.04 !important;
            animation: editNameLogoSway 8s ease-in-out infinite alternate !important;
        }

        .edit-name-bg-logo-wrap img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            filter: grayscale(100%) brightness(200%) !important;
        }

        @keyframes editNameLogoSway {
            0% { transform: translate(-50%, -50%) scale(0.95) rotate(-3deg); }
            100% { transform: translate(-50%, -50%) scale(1.05) rotate(3deg); }
        }

        .edit-name-modal-container {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 340px !important;
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

        /* Верхний брендовый блок с иконкой и меняющимся текстом */
        .edit-name-brand-block {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 15px !important;
            margin-bottom: 35px !important;
            text-align: center !important;
        }

        .edit-name-logo-icon {
            width: 38px !important;
            height: 38px !important;
            object-fit: contain !important;
            flex-shrink: 0 !important;
        }

        .edit-name-title-container {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
        }

        .edit-name-main-title {
            font-family: 'Unbounded', sans-serif !important;
            font-size: 16px !important;
            font-weight: 900 !important;
            letter-spacing: -0.5px !important;
            color: #ffffff !important;
            line-height: 1.1 !important;
        }

        .edit-name-alt-title {
            font-family: 'Montserrat', sans-serif !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            color: rgba(255, 255, 255, 0.45) !important;
            letter-spacing: 0.5px !important;
            margin-top: 3px !important;
            text-transform: uppercase !important;
            animation: editNameSubFade 3s ease-in-out infinite alternate !important;
        }

        @keyframes editNameSubFade {
            0% { opacity: 0.3; }
            100% { opacity: 0.8; }
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
            padding: 6px 0 10px 0 !important;
            color: #ffffff !important;
            font-size: 15px !important;
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 600 !important;
            text-align: center !important;
            outline: none !important;
            width: 100% !important;
            box-sizing: border-box !important;
            transition: border-color 0.25s !important;
        }

        .edit-name-input::placeholder {
            color: rgba(255, 255, 255, 0.35) !important;
            font-weight: 400 !important;
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
            padding: 12px 20px !important;
            font-size: 14px !important;
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 700 !important;
            cursor: pointer !important;
            width: 100% !important;
            margin-top: 10px !important;
            transition: all 0.25s ease !important;
            text-align: center !important;
            min-height: 44px !important;
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
        .edit-name-submit-btn:disabled {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
            color: rgba(255, 255, 255, 0.4) !important;
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

        .edit-name-confirm-wave.active {
            animation: editNameFullScreenWave 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards !important;
        }

        @keyframes editNameFullScreenWave {
            0% { transform: translate(-50%, 50%) scale(1); opacity: 1; }
            50% { opacity: 0.7; }
            100% { transform: translate(-50%, 50%) scale(280); opacity: 0; }
        }

        .edit-name-confirm-toast {
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

        .edit-name-confirm-toast.visible {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
            animation: editNameBounceInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
        }

        .edit-name-confirm-toast.hiding {
            opacity: 0 !important;
            transform: translateX(-50%) translateY(40px) scale(0.9) !important;
            pointer-events: none !important;
            animation: none !important;
        }

        @keyframes editNameBounceInUp {
            0% { opacity: 0; transform: translateX(-50%) translateY(100px) scale(0.7); }
            65% { opacity: 1; transform: translateX(-50%) translateY(-12px) scale(1.03); }
            85% { transform: translateX(-50%) translateY(4px) scale(0.98); }
            100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
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
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'edit-name-system-styles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
}

// --- HTML РАЗМЕТКА МОДАЛЬНОГО ОКНА ---
let editNameTitleInterval = null;

function initEditNameModalUI() {
    if (document.getElementById('edit-name-modal-overlay')) return;

    const modalHTML = `
        <div id="edit-name-modal-overlay" class="edit-name-modal-overlay">
            <div class="edit-name-bg-logo-wrap">
                <img src="images/geo_logo.png" alt="Background Logo">
            </div>

            <button id="edit-name-close-btn" class="edit-name-close-btn" type="button">&times;</button>

            <div class="edit-name-modal-container">
                <div class="edit-name-brand-block">
                    <img src="images/geo_logo.png" alt="Geo Logo" class="edit-name-logo-icon">
                    <div class="edit-name-title-container">
                        <span class="edit-name-main-title">GEOГРАФИЯ</span>
                        <span id="edit-name-alt-text" class="edit-name-alt-title">ИЗМЕНЕНИЕ ИМЕНИ</span>
                    </div>
                </div>
                
                <form id="edit-name-form" class="edit-name-form">
                    <div class="edit-name-input-group">
                        <input type="text" id="edit-name-input" placeholder="Введите новое имя..." required class="edit-name-input" autocomplete="nickname">
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

    // Запуск динамической смены подзаголовка, как в других модальных окнах
    startEditNameTitleSwitching();
}

// Функция сменяющегося текста подзаголовка
function startEditNameTitleSwitching() {
    if (editNameTitleInterval) clearInterval(editNameTitleInterval);
    
    const altTitles = [
        "ИЗМЕНЕНИЕ ИМЕНИ",
        "ПЕРСОНАЛИЗАЦИЯ",
        "ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ"
    ];
    let titleIndex = 0;
    
    const altTextEl = document.getElementById('edit-name-alt-text');
    if (!altTextEl) return;

    editNameTitleInterval = setInterval(() => {
        const modal = document.getElementById('edit-name-modal-overlay');
        if (!modal || !modal.classList.contains('active')) return;

        titleIndex = (titleIndex + 1) % altTitles.length;
        
        altTextEl.style.opacity = '0';
        setTimeout(() => {
            altTextEl.textContent = altTitles[titleIndex];
            altTextEl.style.opacity = '0.8';
        }, 200);
    }, 4000);
}

// --- СОБЫТИЯ ---
function initEditNameEvents() {
    const overlay = document.getElementById('edit-name-modal-overlay');
    const closeBtn = document.getElementById('edit-name-close-btn');
    const form = document.getElementById('edit-name-form');

    const btnConfirmYes = document.getElementById('edit-name-confirm-close-btn');
    const btnConfirmNo = document.getElementById('edit-name-cancel-close-btn');

    if (overlay && overlay.dataset.eventsInitialized) return;
    if (overlay) overlay.dataset.eventsInitialized = "true";

    btnConfirmYes?.addEventListener('click', window.hideEditNameModal);
    btnConfirmNo?.addEventListener('click', () => hideEditNameConfirmToast(false));

    closeBtn?.addEventListener('click', () => {
        showEditNameConfirmToast();
    });

    // Клик по фону оверлея
    overlay?.addEventListener('click', (e) => {
        if (e.target !== overlay) return;

        if (editNameClickTimeout) clearTimeout(editNameClickTimeout);

        editNameClickTimeout = setTimeout(() => {
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
            if (editNameClickTimeout) clearTimeout(editNameClickTimeout);
            showEditNameConfirmToast();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('edit-name-modal-overlay')?.classList.contains('active')) {
            showEditNameConfirmToast();
        }
    });

    // Сохранение имени в Supabase
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const client = window.supabaseClient || window.supabase;
        if (!client) return alert('Supabase клиент не найден!');

        const submitBtn = document.getElementById('btn-submit-edit-name');
        const newNameInput = document.getElementById('edit-name-input');
        const newName = newNameInput ? newNameInput.value.trim() : '';

        if (!newName) {
            alert('Имя не может быть пустым!');
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
                window.hideEditNameModal();
                window.location.reload();
            }
        } catch (err) {
            console.error('Ошибка:', err);
            setEditNameButtonLoading(submitBtn, false, 'Сохранить');
        }
    });
}
