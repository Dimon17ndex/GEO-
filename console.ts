document.addEventListener('DOMContentLoaded', () => {
    const devConsole = document.querySelector('.dev-console') as HTMLElement | null;
    const authScreen = document.getElementById('console-auth-screen') as HTMLElement | null;
    const mainScreen = document.getElementById('console-main-screen') as HTMLElement | null;
    const passInput = document.getElementById('console-pass-input') as HTMLInputElement | null;
    const authBtn = document.getElementById('console-auth-btn') as HTMLButtonElement | null;
    const authError = document.getElementById('console-auth-error') as HTMLElement | null;
    const closeBtn = document.getElementById('console-close-btn') as HTMLButtonElement | null;
    const consoleInput = document.getElementById('console-input') as HTMLInputElement | null;
    const consoleOutput = document.getElementById('console-output') as HTMLElement | null;

    if (!devConsole) return;

    // Переключение экрана авторизации и консоли
    function updateConsoleState(): void {
        const isAuth = sessionStorage.getItem('dev_console_authenticated') === 'true';
        if (isAuth) {
            if (authScreen) authScreen.style.display = 'none';
            if (mainScreen) mainScreen.style.display = 'flex';
        } else {
            if (authScreen) authScreen.style.display = 'flex';
            if (mainScreen) mainScreen.style.display = 'none';
        }
    }

    // 1. Горячая клавиша Ё / ~
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.key === 'Ё' || e.key === 'ё') {
            e.preventDefault();
            e.stopImmediatePropagation(); // Запрещаем другим скриптам реагировать

            if (devConsole.classList.contains('show')) {
                devConsole.classList.remove('show');
            } else {
                updateConsoleState();
                devConsole.classList.add('show');

                const isAuth = sessionStorage.getItem('dev_console_authenticated') === 'true';
                if (!isAuth && passInput) {
                    setTimeout(() => passInput.focus(), 50);
                } else if (consoleInput) {
                    setTimeout(() => consoleInput.focus(), 50);
                }
            }
        }
    }, true);

    // 2. Отправка и проверка пароля консоли
    async function handleAuthSubmit(e?: Event): Promise<void> {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
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

            // ОЧИЩАЕМ ПОЛЕ ВВОДА ПАРОЛЯ
            passInput.value = '';

            if (data.success) {
                sessionStorage.setItem('dev_console_authenticated', 'true');
                updateConsoleState();
                if (consoleInput) setTimeout(() => consoleInput.focus(), 50);
            } else {
                if (authError) authError.textContent = 'Неверный пароль доступа!';
            }
        } catch (err) {
            passInput.value = '';
            if (authError) authError.textContent = 'Ошибка соединения';
        }
    }

    // Слушатели событий авторизации
    if (authBtn) {
        authBtn.addEventListener('click', handleAuthSubmit);
    }

    if (passInput) {
        passInput.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
                handleAuthSubmit(e);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            devConsole.classList.remove('show');
        });
    }

    // 3. Вывод и обработка команд консоли
    function logToConsole(text: string, type: 'system' | 'success' | 'error' | 'user' = 'system'): void {
        if (!consoleOutput) return;
        const log = document.createElement('div');
        log.className = `log-item ${type}`;
        log.innerHTML = text;
        consoleOutput.appendChild(log);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    if (consoleInput) {
        consoleInput.addEventListener('keydown', (e: KeyboardEvent) => {
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

    function processCommand(cmd: string): void {
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
                logToConsole('Сервер: ACTIVE | Сессия: Авторизована', 'success');
                break;
            case 'bypass':
                logToConsole('Переход в систему...', 'success');
                setTimeout(() => { window.location.href = '/beginning.html'; }, 800);
                break;
            default:
                logToConsole(`Неизвестная команда "${mainCmd}". Введите "help".`, 'error');
                break;
        }
    }
});