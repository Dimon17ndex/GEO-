// shortcuts-system.js

document.addEventListener('keydown', (e) => {
    // Получаем текущий путь страницы (например, '/beginning.html' или просто имя файла)
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Пример 1: Комбинация Ctrl + Shift + L (или Cmd + Shift + L на Mac) для открытия авторизации на любой странице
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyL') {
        e.preventDefault();
        if (typeof window.showAuthModal === 'function') {
            window.showAuthModal();
        }
    }

    // Пример 2: Горячие клавиши для конкретной страницы, например, 'beginning.html'
    if (currentPage === 'beginning.html') {
        // Нажатие клавиши 'Escape' или 'KeyQ' для какого-то действия
        if (e.code === 'KeyQ') {
            console.log('Нажата клавиша Q на странице beginning.html');
            // Здесь можно вызвать вашу кастомную функцию
        }
    }

    // Пример 3: Быстрый выход из аккаунта по комбинации Ctrl + Alt + X
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === 'KeyX') {
        e.preventDefault();
        if (typeof window.logoutUser === 'function') {
            window.logoutUser();
        }
    }
});