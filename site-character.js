// site-character.js

function initSiteCharacter() {
    if (document.getElementById('site-character-widget')) return;

    const css = `
        #site-character-widget {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 260px !important;
            height: 260px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 36px !important;
            z-index: 999998 !important;
            transition: opacity 0.3s ease !important;
            pointer-events: none !important;
        }

        /* Контейнер глаз */
        .char-eyes {
            display: flex !important;
            gap: 48px !important;
            align-items: center !important;
            justify-content: center !important;
        }

        /* Большие глаза персонажа — пустые круги с обводкой 6px */
        .char-eye {
            width: 50px !important;
            height: 50px !important;
            background: transparent !important;
            border: 6px solid #ffffff !important;
            border-radius: 50% !important;
            box-sizing: border-box !important;
            transition: transform 0.1s ease !important; /* Быстрое и плавное смыкание */
        }

        /* Состояние моргания (сплющивание по вертикали) */
        #site-character-widget.blinking .char-eye {
            transform: scaleY(0.1) !important;
        }

        /* Действие подмигивания: закрываем только правый глаз */
        #site-character-widget.action-wink .char-eye:nth-child(2) {
            transform: scaleY(0.1) !important;
        }

        /* Большой рот персонажа — линия толщиной 6px */
        .char-mouth {
            width: 44px !important;
            height: 6px !important;
            background: #ffffff !important;
            border-radius: 3px !important;
            transition: all 0.3s ease !important;
        }

        /* Эмоции и состояния */
        /* 1. Режим загрузки / думает */
        #site-character-widget.state-loading .char-mouth {
            width: 24px !important;
            height: 6px !important;
        }

        /* 2. Режим нейтральный */
        #site-character-widget.state-neutral .char-mouth {
           width: 56px !important;
            height: 6px !important;
        }

        /* 3. Режим успеха / радости */
        #site-character-widget.state-happy .char-mouth {
            width: 52px !important;
            height: 18px !important;
            background: #ffffff !important;
            border-radius: 0 0 50px 50px !important;
        }

        /* 4. Действие: овальный рот по горизонтали для первой фазы подмигивания */
        #site-character-widget.action-wink-oval .char-mouth {
            width: 48px !important;
            height: 12px !important;
            background: #ffffff !important;
            border-radius: 50px !important;
        }

        /* Лоадер из точек над персонажем (по умолчанию скрыт) */
        .char-loader {
            display: none !important;
            gap: 6px !important;
            align-items: center !important;
            justify-content: center !important;
            height: 20px !important;
            margin-bottom: -10px !important;
        }

        .loader-dot {
            width: 6px !important;
            height: 6px !important;
            background: #ffffff !important;
            border-radius: 50% !important;
            opacity: 0.4 !important;
            animation: pulse-dot 1.4s infinite ease-in-out both !important;
        }

        .loader-dot:nth-child(1) { animation-delay: -0.32s !important; }
        .loader-dot:nth-child(2) { animation-delay: -0.16s !important; }

        @keyframes pulse-dot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1.2); opacity: 1; }
        }

        /* Зрачки внутри глаз — по умолчанию видны и находятся по центру */
        .char-pupil {
            width: 12px !important;
            height: 12px !important;
            background: #ffffff !important;
            border-radius: 50% !important;
            position: relative !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            opacity: 1 !important; /* Всегда видны в базовых эмоциях */
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Поведение в режиме «Думает» (поднимаются наверх к точкам) */
        #site-character-widget.state-loading .char-pupil {
            top: 18% !important; 
            transform: translate(-50%, 0) !important;
        }

        /* Лоадер над глазами */
        .char-loader {
            display: flex !important; /* Всегда в DOM */
            gap: 6px !important;
            align-items: center !important;
            justify-content: center !important;
            height: 20px !important; /* Фиксированная высота */
            margin-bottom: -10px !important;
            opacity: 0 !important; /* Невидимый по умолчанию */
            visibility: hidden !important;
            transition: opacity 0.3s ease !important; /* Плавность */
        }

        /* Появляется только в режиме загрузки */
        #site-character-widget.state-loading .char-loader {
            opacity: 1 !important;
            visibility: visible !important;
        }

        /* Режим слежения за курсором */
        #site-character-widget.action-track .char-pupil {
            transition: transform 0.05s linear !important; /* Быстрое слежение за мышкой */
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'site-character-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    const widgetHTML = `
        <div id="site-character-widget" class="state-neutral">
            <div class="char-loader">
                <div class="loader-dot"></div>
                <div class="loader-dot"></div>
                <div class="loader-dot"></div>
            </div>
            <div class="char-eyes">
                <div class="char-eye"><div class="char-pupil"></div></div>
                <div class="char-eye"><div class="char-pupil"></div></div>
            </div>
            <div class="char-mouth"></div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // Флаг для блокировки рандомного моргания во время действия
    window._isCharacterActionRunning = false;

    // --- РАНДОМНОЕ МОРГАНИЕ ЧЕРЕЗ JS ---
    const widget = document.getElementById('site-character-widget');

    function triggerBlink() {
        if (!widget) return;

        // Если выполняется действие, пропускаем обычное моргание
        if (window._isCharacterActionRunning) {
            const nextBlinkDelay = Math.random() * 3500 + 1500;
            setTimeout(triggerBlink, nextBlinkDelay);
            return;
        }

        // Добавляем класс моргания
        widget.classList.add('blinking');

        // Через 120мс открываем глаза обратно
        setTimeout(() => {
            if (!widget || window._isCharacterActionRunning) return;
            widget.classList.remove('blinking');

            // Случайная вероятность (35%) сделать двойное моргание
            if (Math.random() < 0.35) {
                setTimeout(() => {
                    if (!widget || window._isCharacterActionRunning) return;
                    widget.classList.add('blinking');
                    setTimeout(() => {
                        if (widget) widget.classList.remove('blinking');
                    }, 120);
                }, 180);
            }
        }, 120);

        // Планируем следующее моргание в случайном диапазоне от 1.5 до 5 секунд
        const nextBlinkDelay = Math.random() * 3500 + 1500;
        setTimeout(triggerBlink, nextBlinkDelay);
    }

    // Запускаем первый цикл моргания
    setTimeout(triggerBlink, 2000);
}

// Глобальные методы управления персонажем
window.siteCharacter = {
    setLoading: function() {
        if (window._isCharacterActionRunning) return;
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-loading' + (isBlinking ? ' blinking' : '');
        }
    },
    setNeutral: function() {
        if (window._isCharacterActionRunning) return;
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-neutral' + (isBlinking ? ' blinking' : '');
        }
    },
    setHappy: function() {
        if (window._isCharacterActionRunning) return;
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-happy' + (isBlinking ? ' blinking' : '');
        }
    },
    wink: function() {
        const widget = document.getElementById('site-character-widget');
        if (!widget || window._isCharacterActionRunning) return;

        // Блокируем другие действия и рандомное моргание на время анимации
        window._isCharacterActionRunning = true;
        widget.classList.remove('blinking');

        // 1. Запоминаем текущие классы состояния
        let currentState = 'state-neutral';
        if (widget.classList.contains('state-happy')) currentState = 'state-happy';
        if (widget.classList.contains('state-loading')) currentState = 'state-loading';

        // 2. Шаг 1: Оставляем текущую эмоцию, подмигиваем и делаем рот овальным
        widget.className = currentState + ' action-wink action-wink-oval';

        // 3. Шаг 2: Быстро (через 200мс) возвращаем рот в исходную форму эмоции, оставляя подмигивание еще на чуть-чуть
        setTimeout(() => {
            if (!widget) return;
            widget.className = currentState + ' action-wink';
        }, 200);

        // 4. Шаг 3: Полностью завершаем подмигивание (всего за 450мс) и снимаем блокировку
        setTimeout(() => {
            if (!widget) return;
            widget.className = currentState;
            window._isCharacterActionRunning = false;
        }, 450);
    },
    hide: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            widget.style.opacity = '0';
            widget.style.pointerEvents = 'none';
        }
    },
    show: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            widget.style.opacity = '1';
        }
    }
    toggleTracking: function() {
        const widget = document.getElementById('site-character-widget');
        if (!widget || window._isCharacterActionRunning) return;

        isTrackingActive = !isTrackingActive;

        if (isTrackingActive) {
            widget.classList.add('action-track');
            // Временно блокируем рандомное моргание, чтобы зрачки не сбивались
            window._isCharacterActionRunning = true;
            widget.classList.remove('blinking');
        } else {
            widget.classList.remove('action-track');
            window._isCharacterActionRunning = false;
            
            // Возвращаем зрачки в исходное строго центральное положение
            const pupils = widget.querySelectorAll('.char-pupil');
            pupils.forEach(pupil => {
                pupil.style.transform = 'translate(-50%, -50%)';
            });
        }
    },
};

// Переменные для отслеживания мыши
let isTrackingActive = false;

function handleMouseMove(e) {
    if (!isTrackingActive) return;
    const widget = document.getElementById('site-character-widget');
    if (!widget) return;

    // Находим оба зрачка
    const pupils = widget.querySelectorAll('.char-pupil');
    if (pupils.length === 0) return;

    // Проходим по каждому глазу и двигаем зрачок за курсором
    pupils.forEach(pupil => {
        const eye = pupil.parentElement;
        const rect = eye.getBoundingClientRect();
        
        // Центр конкретного глаза
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        // Угол между центром глаза и курсором
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        
        // Максимальное расстояние, на которое зрачок может отойти от центра (ограничиваем радиусом глаза)
        const maxDistance = 10; 
        const distance = Math.min(maxDistance, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) * 0.2);

        // Вычисляем смещение
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        // Применяем смещение для обоих зрачков одинаково
        pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
}

// Регистрируем движение мыши глобально
document.addEventListener('mousemove', handleMouseMove);

document.addEventListener('DOMContentLoaded', initSiteCharacter);
