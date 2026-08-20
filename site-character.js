// site-character.js

function initSiteCharacter() {
    if (document.getElementById('site-character-widget')) return;

    const css = `
        #site-character-widget {
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            width: 70px !important;
            height: 70px !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 10px !important;
            z-index: 999998 !important;
            transition: transform 0.3s ease !important;
            pointer-events: none !important;
        }

        /* Контейнер глаз */
        .char-eyes {
            display: flex !important;
            gap: 12px !important;
            align-items: center !important;
            justify-content: center !important;
        }

        /* Глаза персонажа — пустые круги с обводкой 2px */
        .char-eye {
            width: 12px !important;
            height: 12px !important;
            background: transparent !important;
            border: 2px solid #ffffff !important;
            border-radius: 50% !important;
            box-sizing: border-box !important;
            transition: transform 0.1s ease !important; /* Быстрое и плавное смыкание */
        }

        /* Состояние моргания (сплющивание по вертикали) */
        #site-character-widget.blinking .char-eye {
            transform: scaleY(0.1) !important;
        }

        /* Рот персонажа — линия толщиной 2px, как обводка глаз */
        .char-mouth {
            width: 10px !important;
            height: 2px !important;
            background: #ffffff !important;
            border-radius: 0px !important;
            transition: all 0.3s ease !important;
        }

        /* Эмоции и состояния */
        /* 1. Режим загрузки / думает */
        #site-character-widget.state-loading .char-mouth {
            width: 6px !important;
            height: 2px !important;
        }

        /* 2. Режим успеха / радости */
        #site-character-widget.state-happy .char-mouth {
            width: 12px !important;
            height: 2px !important;
        }

        /* Анимация раздумий (покачивание) */
        @keyframes charLookAround {
            0% { transform: translateX(-3px); }
            100% { transform: translateX(3px); }
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'site-character-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    const widgetHTML = `
        <div id="site-character-widget" class="state-happy">
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
            // Сохраняем класс моргания, если он есть, но меняем состояние
            const isBlinking = widget.classList.contains('blinking');
            widget.className = 'state-loading' + (isBlinking ? ' blinking' : '');
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
        if (widget) widget.style.display = 'none';
    },
    show: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) widget.style.display = 'flex';
    }
};

document.addEventListener('DOMContentLoaded', initSiteCharacter);
