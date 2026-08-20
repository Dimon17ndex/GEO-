// shortcuts-system.js

let keySequence = [];
let sequenceTimeout = null;

document.addEventListener('keydown', (e) => {
    // Не перехватываем горячие клавиши, если пользователь печатает в поле ввода
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const key = e.key.toUpperCase();

    // Сбрасываем буфер, если прошло больше 1.5 секунд между нажатиями
    clearTimeout(sequenceTimeout);
    sequenceTimeout = setTimeout(() => {
        keySequence = [];
    }, 1500);

    keySequence.push(key);

    // Оставляем только последние 3 символа в памяти
    if (keySequence.length > 3) {
        keySequence.shift();
    }

    const currentCombination = keySequence.join('');

    // --- 1. Секретная комбинация для BYPASS на странице pc.html (G+E+O или П+У+Щ) ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage === 'pc.html' && (currentCombination === 'GEO' || currentCombination === 'ПУЩ')) {
        e.preventDefault();
        keySequence = [];
        
        sessionStorage.setItem('dev_console_authenticated', 'true');
        setTimeout(() => { 
            window.location.href = '/beginning.html'; 
        }, 500);
    }

    // --- 2. Комбинация для вызова приветствия (H+E+L или Р+У+Д) на любой странице ---
    if (currentCombination === 'HEL' || currentCombination === 'РУД') {
        e.preventDefault();
        keySequence = [];

        console.log('Активировано шорткатом: запуск приветствия...');

        // Проверяем, существует ли функция initGreetingUI, и вызываем её
        if (typeof window.initGreetingUI === 'function') {
            window.initGreetingUI();
        } else {
            console.error('Функция initGreetingUI не найдена. Убедитесь, что скрипт приветствия подключен.');
        }
    }
});
