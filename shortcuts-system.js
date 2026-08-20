// shortcuts-system.js

let keySequence = [];
let sequenceTimeout = null;

document.addEventListener('keydown', (e) => {
    // Проверяем, что мы находимся именно на странице pc.html
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'pc.html') return;

    // Не перехватываем горячие клавиши, если пользователь печатает в поле ввода (input/textarea)
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // Приводим нажатую клавишу к верхнему регистру (поддерживаем латиницу и кириллицу)
    const key = e.key.toUpperCase();

    // Сбрасываем таймер последовательности, если прошло больше 1.5 секунд между нажатиями
    clearTimeout(sequenceTimeout);
    sequenceTimeout = setTimeout(() => {
        keySequence = [];
    }, 1500);

    // Добавляем нажатую клавишу в буфер
    keySequence.push(key);

    // Оставляем в памяти только последние 3 символа
    if (keySequence.length > 3) {
        keySequence.shift();
    }

    // Проверяем комбинации из 3 символов: GEO (латиница) или ПУЩ (кириллица)
    const currentCombination = keySequence.join('');
    
    if (currentCombination === 'GEO' || currentCombination === 'ПУЩ') {
        e.preventDefault();
        keySequence = []; // Сбрасываем буфер

        console.log('Секретная комбинация активирована! Выполняется bypass...');

        // То же самое действие, что и у команды bypass из вашей консоли:
        // 1. Устанавливаем статус авторизации в sessionStorage (если нужно для консоли)
        sessionStorage.setItem('dev_console_authenticated', 'true');
        
        // 2. Переходим на страницу beginning.html с небольшой задержкой
        setTimeout(() => { 
            window.location.href = '/beginning.html'; 
        }, 500);
    }
});
