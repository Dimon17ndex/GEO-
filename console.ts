document.addEventListener('DOMContentLoaded', () => {
    const devConsole = document.querySelector('.dev-console');
    const authScreen = document.getElementById('console-auth-screen');
    const mainScreen = document.getElementById('console-main-screen');
    const passInput = document.getElementById('console-pass-input');
    const authBtn = document.getElementById('console-auth-btn');
    const authError = document.getElementById('console-auth-error');
    const closeBtn = document.getElementById('console-close-btn');
    const consoleInput = document.getElementById('console-input');
    const consoleOutput = document.getElementById('console-output');

    if (!devConsole) return;

    // Переключение состояния UI
    function checkAuthUI() {
        const isAuth = sessionStorage.getItem('dev_console_authenticated') === 'true';
        if (isAuth) {
            if (authScreen) authScreen.style.display = 'none';
            if (mainScreen) mainScreen.style.display = 'flex';
        } else {
            if (authScreen) authScreen.style.display = 'flex';
            if (mainScreen) mainScreen.style.display = 'none';
        }
    }

    // 1. Вызов консоли по нажатию ~ / Ё (без срабатывания внешних форм)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (devConsole.classList.contains('show')) {
                devConsole.classList.remove('show');
            } else {
                checkAuthUI();
                devConsole.classList.add('show');

                const isAuth = sessionStorage.getItem('dev_console_authenticated') === 'true';
                if (!isAuth && passInput) {
                    setTimeout(() => passInput.focus(), 100);
                } else if (consoleInput) {
                    setTimeout(() => consoleInput.focus(), 100);
                }
            }
        }
    }, true);

    // 2. Закрытие консоли
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            devConsole.classList.remove('show');
        });
    }

    // 3. Отправка пароля на проверку
    async function submitConsolePassword(e) {
        if (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }

        if (!passInput) return;
        const password = passInput.value.trim();
        if (!password) return;

        if (authError) authError.textContent = '';

        try {
            const response = await fetch('/api/verify-console-pass', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            // Очищаем инпут
            passInput.value = '';

            if (data.success) {
                sessionStorage.setItem('dev_console_authenticated', 'true');
                checkAuthUI();
                if (consoleInput) setTimeout(() => consoleInput.focus(), 100);
            } else {
                if (authError) authError.textContent = 'Неверный пароль доступа!';
            }
        } catch (err) {
            passInput.value = '';
            if (authError) authError.textContent = 'Ошибка соединения';
        }
    }

    if (authBtn) authBtn.addEventListener('click', submitConsolePassword);
    if (passInput) {
        passInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                submitConsolePassword(e);
            }
        });
    }

    // 4. Логика вывода и обработки команд
    function logToConsole(text, type = 'system') {
        if (!consoleOutput) return;
        const log = document.createElement('div');
        log.className = `log-item ${type}`;
        log.innerHTML = text;
        consoleOutput.appendChild(log);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    if (consoleInput) {
        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                const command = consoleInput.value.trim();
                if (!command) return;

                logToConsole(`&gt; ${command}`, 'user');
                consoleInput.value = '';
                processCommand(command);
            }
        });
    }

    function processCommand(cmd) {
        const parts = cmd.split(' ');
        const mainCmd = parts[0].toLowerCase();

        switch (mainCmd) {
            case 'help':
                logToConsole('Доступные команды:', 'system');
                logToConsole('<span class="cmd-highlight">help</span> — показать список команд', 'system');
                logToConsole('<span class="cmd-highlight">clear</span> — очистить консоль', 'system');
                logToConsole('<span class="cmd-highlight">status</span> — проверить статус подключения', 'system');
                logToConsole('<span class="cmd-highlight">bypass</span> — зайти без пароля', 'system');
                break;
            case 'clear':
                if (consoleOutput) consoleOutput.innerHTML = '';
                break;
            case 'status':
                logToConsole('Сервер: ACTIVE | Платформа: Desktop', 'success');
                break;
            case 'bypass':
                logToConsole('Обход авторизации активирован...', 'success');
                setTimeout(() => { window.location.href = '/beginning.html'; }, 1000);
                break;
            default:
                logToConsole(`Неизвестная команда "${mainCmd}". Введите "help".`, 'error');
                break;
        }
    }
});
