//reset-password.js

(function () {
    // 1. Внедрение стилей модального окна в <head>
    const styles = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .reset-card {
            position: relative;
            width: 100%;
            max-width: 400px;
            padding: 32px 28px;
            background: rgba(20, 20, 20, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            font-family: 'Montserrat', sans-serif;
            color: #ffffff;
            box-sizing: border-box;
        }

        .close-modal-btn {
            position: absolute;
            top: 16px;
            right: 18px;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 22px;
            cursor: pointer;
            transition: color 0.2s ease;
        }

        .close-modal-btn:hover {
            color: #ffffff;
        }

        .reset-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 8px;
            text-align: center;
        }

        .reset-subtitle {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 24px;
            text-align: center;
            line-height: 1.4;
        }

        .form-group {
            margin-bottom: 16px;
        }

        .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 6px;
            color: rgba(255, 255, 255, 0.8);
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease, background 0.2s ease;
            box-sizing: border-box;
        }

        .form-input:focus {
            border-color: rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.1);
        }

        .submit-reset-btn {
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            background: #ffffff;
            color: #000000;
            border: none;
            border-radius: 10px;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.1s ease;
        }

        .submit-reset-btn:hover {
            background: rgba(255, 255, 255, 0.9);
        }

        .submit-reset-btn:active {
            transform: scale(0.98);
        }

        .reset-message {
            margin-top: 14px;
            font-size: 13px;
            text-align: center;
            display: none;
        }

        .reset-message.error {
            color: #ff5e5e;
            display: block;
        }

        .reset-message.success {
            color: #2ecc71;
            display: block;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // 2. Внедрение HTML-разметки в <body>
    const modalHTML = `
        <div id="reset-password-modal" class="modal-overlay">
            <div class="reset-card">
                <button type="button" class="close-modal-btn" id="close-reset-modal-btn">&times;</button>

                <div id="request-reset-step">
                    <h2 class="reset-title">Сброс пароля</h2>
                    <p class="reset-subtitle">Введите вашу почту, и мы отправим ссылку для сброса пароля</p>
                    <form id="request-reset-form">
                        <div class="form-group">
                            <label for="reset-email">Email</label>
                            <input type="email" id="reset-email" class="form-input" placeholder="example@mail.com" required>
                        </div>
                        <button type="submit" class="submit-reset-btn" id="request-reset-submit-btn">Отправить ссылку</button>
                    </form>
                </div>

                <div id="update-password-step" style="display: none;">
                    <h2 class="reset-title">Новый пароль</h2>
                    <p class="reset-subtitle">Придумайте и введите новый пароль для аккаунта</p>
                    <form id="update-password-form">
                        <div class="form-group">
                            <label for="new-password">Новый пароль</label>
                            <input type="password" id="new-password" class="form-input" placeholder="Минимум 6 символов" minlength="6" required>
                        </div>
                        <button type="submit" class="submit-reset-btn" id="update-password-submit-btn">Сохранить пароль</button>
                    </form>
                </div>

                <div id="reset-status-message" class="reset-message"></div>
            </div>
        </div>
    `;

    document.addEventListener('DOMContentLoaded', () => {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Навешивание обработчиков событий
        document.getElementById('close-reset-modal-btn').addEventListener('click', closeResetModal);
        document.getElementById('request-reset-form').addEventListener('submit', handleRequestReset);
        document.getElementById('update-password-form').addEventListener('submit', handleUpdatePassword);

        // Закрытие по клику на затемнённый фон
        document.getElementById('reset-password-modal').addEventListener('click', (e) => {
            if (e.target.id === 'reset-password-modal') {
                closeResetModal();
            }
        });

        // Слушатель Supabase на переход по ссылке из письма
        if (typeof supabase !== 'undefined') {
            supabase.auth.onAuthStateChange((event) => {
                if (event === 'PASSWORD_RECOVERY') {
                    openResetModal('update');
                }
            });
        }
    });
})();

// Глобальные функции управления модальным окном
window.openResetModal = function (step = 'request') {
    const modal = document.getElementById('reset-password-modal');
    const requestStep = document.getElementById('request-reset-step');
    const updateStep = document.getElementById('update-password-step');
    const msg = document.getElementById('reset-status-message');

    if (!modal) return;

    msg.className = 'reset-message';
    msg.style.display = 'none';

    if (step === 'update') {
        requestStep.style.display = 'none';
        updateStep.style.display = 'block';
    } else {
        requestStep.style.display = 'block';
        updateStep.style.display = 'none';
    }

    modal.classList.add('active');
};

window.closeResetModal = function () {
    const modal = document.getElementById('reset-password-modal');
    if (modal) modal.classList.remove('active');
};

// Логика работы с Supabase
async function handleRequestReset(e) {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    const btn = document.getElementById('request-reset-submit-btn');
    const msg = document.getElementById('reset-status-message');

    btn.disabled = true;
    btn.textContent = 'Отправка...';

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });

    btn.disabled = false;
    btn.textContent = 'Отправить ссылку';

    if (error) {
        msg.textContent = error.message;
        msg.className = 'reset-message error';
    } else {
        msg.textContent = 'Ссылка для сброса пароля отправлена на ваш Email!';
        msg.className = 'reset-message success';
    }
}

async function handleUpdatePassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const btn = document.getElementById('update-password-submit-btn');
    const msg = document.getElementById('reset-status-message');

    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    btn.disabled = false;
    btn.textContent = 'Сохранить пароль';

    if (error) {
        msg.textContent = error.message;
        msg.className = 'reset-message error';
    } else {
        msg.textContent = 'Пароль успешно изменён!';
        msg.className = 'reset-message success';
        setTimeout(() => {
            closeResetModal();
        }, 2000);
    }
}