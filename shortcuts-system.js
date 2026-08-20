// shortcuts-system.js

let keySequence = [];
let sequenceTimeout = null;
let shortcutContainer = null;

// --- СОЗДАНИЕ ВИЗУАЛЬНОГО КОНТЕЙНЕРА В НИЖНЕМ ЛЕВОМ УГЛУ ---
function initShortcutVisualizer() {
    if (document.getElementById('shortcut-visualizer')) return;

    // Внедряем стили для плавающих «клавиш»
    const css = `
        #shortcut-visualizer {
            position: fixed !important;
            bottom: 25px !important;
            left: 25px !important;
            display: flex !important;
            gap: 8px !important;
            z-index: 99999999 !important;
            pointer-events: none !important;
        }

        .shortcut-key-box {
            min-width: 36px !important;
            height: 36px !important;
            padding: 0 8px !important;
            background: rgba(15, 15, 20, 0.75) !important;
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
            border-radius: 8px !important;
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.15) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: #ffffff !important;
            font-family: 'Montserrat', sans-serif !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            
            opacity: 0 !important;
            transform: translateY(15px) scale(0.8) !important;
            transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .shortcut-key-box.visible {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
        }

        .shortcut-key-box.fade-out {
            opacity: 0 !important;
            transform: translateY(-10px) scale(0.9) !important;
            transition: opacity 0.4s ease, transform 0.4s ease !important;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'shortcut-visualizer-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Создаем сам контейнер
    shortcutContainer = document.createElement('div');
    shortcutContainer.id = 'shortcut-visualizer';
    document.body.appendChild(shortcutContainer);
}

// Функция отображения буквы в левом нижнем углу
function renderKeyVisual(char) {
    if (!shortcutContainer) initShortcutVisualizer();

    // Создаем элемент квадратной «клавиши»
    const keyBox = document.createElement('div');
    keyBox.className = 'shortcut-key-box';
    keyBox.textContent = char;
    shortcutContainer.appendChild(keyBox);

    // Даем браузеру отрисовать элемент перед запуском анимации появления
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            keyBox.classList.add('visible');
        });
    });

    // Ограничиваем количество отображаемых клавиш на экране (максимум 3)
    if (shortcutContainer.children.length > 3) {
        const oldestBox = shortcutContainer.children[0];
        oldestBox.classList.add('fade-out');
        setTimeout(() => oldestBox.remove(), 400);
    }

    // Автоматическое растворение и удаление клавиши через 1.5 секунды бездействия
    setTimeout(() => {
        if (keyBox.parentNode) {
            keyBox.classList.add('fade-out');
            setTimeout(() => keyBox.remove(), 400);
        }
    }, 1500);
}

// --- ОБРАБОТЧИК НАЖАТИЙ КЛАВИШ ---
document.addEventListener('DOMContentLoaded', initShortcutVisualizer);

document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // Игнорируем зажатие клавиши (автоповтор при удерживании)
    if (e.repeat) return;

    // Игнорируем чисто системные клавиши-модификаторы
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

    const key = e.key.toUpperCase();

    // Отрисовываем ровно ОДИН визуальный блок (без спама)
    renderKeyVisual(key);

    // Сброс буфера последовательности шорткатов
    clearTimeout(sequenceTimeout);
    sequenceTimeout = setTimeout(() => {
        keySequence = [];
    }, 1500);

    keySequence.push(key);
    if (keySequence.length > 3) {
        keySequence.shift();
    }

    const currentCombination = keySequence.join('');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // 1. Комбинация для bypass на pc.html (GEO или ПУЩ)
    if (currentPage === 'pc.html' && (currentCombination === 'GEO' || currentCombination === 'ПУЩ')) {
        e.preventDefault();
        keySequence = [];
        sessionStorage.setItem('dev_console_authenticated', 'true');
        setTimeout(() => { 
            window.location.href = '/beginning.html'; 
        }, 500);
    }

    // 2. Комбинация для вызова приветствия (HEL или РУД) на любой странице
    if (currentCombination === 'HEL' || currentCombination === 'РУД') {
        e.preventDefault();
        keySequence = [];

        if (typeof window.initGreetingUI === 'function') {
            window.initGreetingUI();
        } else {
            console.error('Функция initGreetingUI не найдена.');
        }
    }
});
