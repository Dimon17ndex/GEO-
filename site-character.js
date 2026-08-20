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
            height: 14px !important;
            background: transparent !important;
            border-bottom: 6px solid #ffffff !important;
            border-radius: 0 0 28px 28px !important;
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'site-character-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    const widgetHTML = `
        <div id="site-character-widget" class="state-neutral">
            <div class="char-eyes">
                <div class="char-eye"></div>
                <div class="char-eye"></div>
            </div>
            <div class="char-mouth"></div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);

    // --- РАНДОМНОЕ МОРГАНИЕ ЧЕРЕЗ JS ---
    const widget = document.getElementById('site-character-widget');

    function triggerBlink() {
        if (!widget) return;

        // Добавляем класс моргания
        widget.classList.add('blinking');

        // Через 120мс открываем глаза обратно
        setTimeout(() => {
            if (!widget) return;
            widget.classList.remove('blinking');

            // Случайная вероятность (35%) сделать двойное моргание
            if (Math.random() < 0.35) {
                setTimeout(() => {
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
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-loading' + (isBlinking ? ' blinking' : '');
        }
    },
    setNeutral: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-neutral' + (isBlinking ? ' blinking' : '');
        }
    },
    setHappy: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) {
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-happy' + (isBlinking ? ' blinking' : '');
        }
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
};

document.addEventListener('DOMContentLoaded', initSiteCharacter);
