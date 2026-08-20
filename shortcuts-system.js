// shortcuts-system.js

let keySequence = [];
let sequenceTimeout = null;
let shortcutContainer = null;

// Хранилище активных визуальных блоков по кодам клавиш (например, 'KeyH', 'KeyE')
const activeKeyBoxes = new Map();

// --- СОЗДАНИЕ ВИЗУАЛЬНОГО КОНТЕЙНЕРА ---
function initShortcutVisualizer() {
    if (document.getElementById('shortcut-visualizer')) return;

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
            transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }

        .shortcut-key-box.visible {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
        }

        .shortcut-key-box.fade-out {
            opacity: 0 !important;
            transform: translateY(-10px) scale(0.9) !important;
            transition: opacity 0.3s ease, transform 0.3s ease !important;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'shortcut-visualizer-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    shortcutContainer = document.createElement('div');
    shortcutContainer.id = 'shortcut-visualizer';
    document.body.appendChild(shortcutContainer);
}

// Показываем блок при нажатии клавиши
function showKeyVisual(code, char) {
    if (!shortcutContainer) initShortcutVisualizer();

    // Если блок для этой клавиши уже отображается, просто обновляем его (не дублируем)
    if (activeKeyBoxes.has(code)) {
        return;
    }

    // Ограничиваем максимальное количество одновременно отображаемых блоков (например, до 5)
    // чтобы они не уходили за границы экрана, но и не сбрасывали активные клавиши раньше времени
    if (activeKeyBoxes.size >= 5) {
        // Находим и удаляем самый первый созданный блок, который уже есть в памяти
        const firstKey = activeKeyBoxes.keys().next().value;
        if (firstKey) {
            hideKeyVisual(firstKey);
        }
    }

    const keyBox = document.createElement('div');
    keyBox.className = 'shortcut-key-box';
    keyBox.textContent = char;
    shortcutContainer.appendChild(keyBox);

    // Сохраняем ссылку в Map вместе со временем создания
    activeKeyBoxes.set(code, keyBox);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            keyBox.classList.add('visible');
        });
    });
}

// Скрываем блок при отпускании клавиши
function hideKeyVisual(code) {
    const keyBox = activeKeyBoxes.get(code);
    if (!keyBox) return;

    activeKeyBoxes.delete(code);
    keyBox.classList.add('fade-out');
    setTimeout(() => {
        if (keyBox.parentNode) keyBox.remove();
    }, 300);
}

// --- СОБЫТИЯ КЛАВИАТУРЫ ---
document.addEventListener('DOMContentLoaded', initShortcutVisualizer);

// 1. Нажатие клавиши
document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.repeat) return; // Игнорируем автоповтор при зажатии
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

    const key = e.key.toUpperCase();
    showKeyVisual(e.code, key);

    // Логика шорткатов
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

    // Bypass на pc.html (GEO или ПУЩ)
    if (currentPage === 'pc.html' && (currentCombination === 'GEO' || currentCombination === 'ПУЩ')) {
        e.preventDefault();
        keySequence = [];
        sessionStorage.setItem('dev_console_authenticated', 'true');
        setTimeout(() => { 
            window.location.href = '/beginning.html'; 
        }, 500);
    }

    // Приветствие (HEL или РУД)
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

// 2. Отпускание клавиши — теперь визуал растворяется именно здесь
document.addEventListener('keyup', (e) => {
    hideKeyVisual(e.code);
});
