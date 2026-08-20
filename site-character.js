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

        /* Глаза персонажа */
        .char-eye {
            width: 8px !important;
            height: 12px !important;
            background: #ffffff !important;
            border-radius: 4px !important;
            transition: transform 0.2s ease, height 0.2s ease !important;
            animation: charBlink 4s infinite ease-in-out !important;
        }

        /* Рот персонажа — тонкая белая линия */
        .char-mouth {
            width: 18px !important;
            height: 1.5px !important;
            background: #ffffff !important;
            border-radius: 1px !important;
            transition: all 0.3s ease !important;
        }

        /* Эмоции и состояния */
        /* 1. Режим загрузки / думает */
        #site-character-widget.state-loading .char-eye {
            animation: charLookAround 1s infinite alternate ease-in-out !important;
            height: 8px !important;
            border-radius: 50% !important;
        }
        #site-character-widget.state-loading .char-mouth {
            width: 8px !important;
            height: 1.5px !important;
        }

        /* 2. Режим успеха / радости */
        #site-character-widget.state-happy .char-eye {
            transform: scaleY(0.4) !important;
        }
        #site-character-widget.state-happy .char-mouth {
            width: 22px !important;
            height: 2px !important;
        }

        /* Анимация моргания */
        @keyframes charBlink {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.1); }
        }

        /* Анимация раздумий */
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
}

// Глобальные методы управления персонажем
window.siteCharacter = {
    setLoading: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) widget.className = 'state-loading';
    },
    setHappy: function() {
        const widget = document.getElementById('site-character-widget');
        if (widget) widget.className = 'state-happy';
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
