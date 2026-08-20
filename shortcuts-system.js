// shortcuts-system.js

let keySequence = [];
let sequenceTimeout = null;
let shortcutContainer = null;

const activeKeyBoxes = new Map();

const keyMap = {
    'KeyQ': 'Q', 'KeyW': 'W', 'KeyE': 'E', 'KeyR': 'R', 'KeyT': 'T', 'KeyY': 'Y', 'KeyU': 'U', 'KeyI': 'I', 'KeyO': 'O', 'KeyP': 'P',
    'KeyA': 'A', 'KeyS': 'S', 'KeyD': 'D', 'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L',
    'KeyZ': 'Z', 'KeyX': 'X', 'KeyC': 'C', 'KeyV': 'V', 'KeyB': 'B', 'KeyN': 'N', 'KeyM': 'M'
};

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
            transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.3s ease, box-shadow 0.3s ease, color 0.3s ease !important;
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

        /* Цветовые статусы */
        .shortcut-key-box.status-progress {
            border-color: #ff9800 !important;
            box-shadow: 0 0 15px rgba(255, 152, 0, 0.4) !important;
            color: #ff9800 !important;
        }

        .shortcut-key-box.status-success-global {
            border-color: #4caf50 !important;
            box-shadow: 0 0 15px rgba(76, 175, 80, 0.4) !important;
            color: #4caf50 !important;
        }

        .shortcut-key-box.status-success-page {
            border-color: #00bcd4 !important;
            box-shadow: 0 0 15px rgba(0, 188, 212, 0.4) !important;
            color: #00bcd4 !important;
        }

        .shortcut-key-box.status-error {
            border-color: #f44336 !important;
            box-shadow: 0 0 15px rgba(244, 67, 54, 0.4) !important;
            color: #f44336 !important;
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

function showKeyVisual(code, char) {
    if (!shortcutContainer) initShortcutVisualizer();

    if (activeKeyBoxes.has(code)) return;

    if (activeKeyBoxes.size >= 5) {
        const firstKey = activeKeyBoxes.keys().next().value;
        if (firstKey) hideKeyVisual(firstKey);
    }

    const keyBox = document.createElement('div');
    keyBox.className = 'shortcut-key-box';
    keyBox.textContent = char;
    shortcutContainer.appendChild(keyBox);

    activeKeyBoxes.set(code, keyBox);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            keyBox.classList.add('visible');
        });
    });

    return keyBox;
}

function hideKeyVisual(code) {
    const keyBox = activeKeyBoxes.get(code);
    if (!keyBox) return;

    activeKeyBoxes.delete(code);
    keyBox.classList.add('fade-out');
    setTimeout(() => {
        if (keyBox.parentNode) keyBox.remove();
    }, 300);
}

function updateVisualStatuses(currentSequence, isMatchGlobal, isMatchPageActive, isMatchPageWord, isError) {
    const boxes = Array.from(activeKeyBoxes.values());
    
    boxes.forEach((box) => {
        box.classList.remove('status-progress', 'status-success-global', 'status-success-page', 'status-error');

        if (isError) {
            box.classList.add('status-error');
        } else if (isMatchPageActive || isMatchGlobal) {
            box.classList.add('status-success-global'); // Зеленый, если комбинация активна на этой странице ИЛИ это HEL
        } else if (isMatchPageWord) {
            box.classList.add('status-success-page'); // Голубой, если слово верное, но на другой странице
        } else if (currentSequence.length >= 2) {
            box.classList.add('status-progress'); // Оранжевый в процессе набора
        }
    });
}

document.addEventListener('DOMContentLoaded', initShortcutVisualizer);

document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.repeat) return;
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

    const key = keyMap[e.code];
    if (!key) return;

    clearTimeout(sequenceTimeout);

    if (!window.lastPressTime || Date.now() - window.lastPressTime > 1500) {
        keySequence = [];
    }
    window.lastPressTime = Date.now();

    showKeyVisual(e.code, key);

    sequenceTimeout = setTimeout(() => {
        keySequence = [];
        updateVisualStatuses('', false, false, false, false);
    }, 1500);

    keySequence.push(key);
    if (keySequence.length > 3) {
        keySequence.shift();
    }

    const currentCombination = keySequence.join('');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const isMatchGlobal = (currentCombination === 'HEL');
    const isMatchPageWord = (currentCombination === 'GEO'); // Набрано слово GEO в принципе
    const isMatchPageActive = (currentPage === 'pc.html' && isMatchPageWord); // GEO активно именно на этой странице
    
    const isError = (keySequence.length === 3 && !isMatchGlobal && !isMatchPageWord);

    updateVisualStatuses(currentCombination, isMatchGlobal, isMatchPageActive, isMatchPageWord, isError);

    // Действие перенаправления работает только когда комбинация активна
    if (isMatchPageActive) {
        e.preventDefault();
        keySequence = [];
        sessionStorage.setItem('dev_console_authenticated', 'true');
        setTimeout(() => { 
            window.location.href = '/beginning.html'; 
        }, 300);
    }

    if (isMatchGlobal) {
        e.preventDefault();
        keySequence = [];

        if (typeof window.initGreetingUI === 'function') {
            window.initGreetingUI();
        } else {
            console.error('Функция initGreetingUI не найдена.');
        }
    }
});

document.addEventListener('keyup', (e) => {
    hideKeyVisual(e.code);
});
