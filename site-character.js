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

        .char-eyes {
            display: flex !important;
            gap: 48px !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .char-eye {
            width: 50px !important;
            height: 50px !important;
            background: transparent !important;
            border: 6px solid #ffffff !important;
            border-radius: 50% !important;
            box-sizing: border-box !important;
            position: relative !important;
            overflow: hidden !important;
            transition: transform 0.1s ease !important;
        }

        #site-character-widget.blinking .char-eye {
            transform: scaleY(0.1) !important;
        }

        #site-character-widget.action-wink .char-eye:nth-child(2) {
            transform: scaleY(0.1) !important;
        }

        .char-mouth {
            width: 44px !important;
            height: 6px !important;
            background: #ffffff !important;
            border-radius: 3px !important;
            transition: all 0.3s ease !important;
        }

        #site-character-widget.state-loading .char-mouth {
            width: 24px !important;
            height: 6px !important;
        }

        #site-character-widget.state-neutral .char-mouth {
            width: 56px !important;
            height: 6px !important;
        }

        #site-character-widget.state-happy .char-mouth {
            width: 52px !important;
            height: 18px !important;
            background: #ffffff !important;
            border-radius: 0 0 50px 50px !important;
        }

        #site-character-widget.action-wink-oval .char-mouth {
            width: 48px !important;
            height: 12px !important;
            background: #ffffff !important;
            border-radius: 50px !important;
        }

        .char-loader {
            display: flex !important;
            gap: 6px !important;
            align-items: center !important;
            justify-content: center !important;
            height: 20px !important;
            margin-bottom: -10px !important;
            opacity: 0 !important;
            visibility: hidden !important;
            transition: opacity 0.3s ease !important;
        }

        #site-character-widget.state-loading .char-loader {
            opacity: 1 !important;
            visibility: visible !important;
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

        .char-pupil {
            width: 12px !important;
            height: 12px !important;
            background: #ffffff !important;
            border-radius: 50% !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
        }

        #site-character-widget.state-loading .char-pupil {
            top: 20% !important; 
            transform: translate(-50%, 0) !important;
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

    window._isCharacterActionRunning = false;
    let isTrackingActive = true;
    const widget = document.getElementById('site-character-widget');

    // Движение глаз за мышкой
    window.addEventListener('mousemove', (e) => {
        if (!isTrackingActive || !widget) return;
        if (widget.classList.contains('state-loading')) return; // Если думает — не двигаем зрачки

        const pupils = widget.querySelectorAll('.char-pupil');
        pupils.forEach(pupil => {
            const eye = pupil.parentElement;
            const rect = eye.getBoundingClientRect();
            
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const radian = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const maxDistance = 10; // Ограничение радиуса движения зрачка внутри глаза
            const distance = Math.min(maxDistance, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) * 0.1);

            const x = Math.cos(radian) * distance;
            const y = Math.sin(radian) * distance;

            pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    });

    // Рандомное моргание
    function triggerBlink() {
        if (!widget) return;
        if (window._isCharacterActionRunning) {
            setTimeout(triggerBlink, 2000);
            return;
        }

        widget.classList.add('blinking');
        setTimeout(() => {
            if (!widget) return;
            widget.classList.remove('blinking');
        }, 120);

        setTimeout(triggerBlink, Math.random() * 3500 + 1500);
    }

    setTimeout(triggerBlink, 2000);

    // Экспортируем глобальные методы управления
    window.siteCharacter = {
        setLoading: function() {
            if (window._isCharacterActionRunning) return;
            if (widget) widget.className = 'state-loading';
        },
        setNeutral: function() {
            if (window._isCharacterActionRunning) return;
            if (widget) widget.className = 'state-neutral';
        },
        setHappy: function() {
            if (window._isCharacterActionRunning) return;
            if (widget) widget.className = 'state-happy';
        },
        wink: function() {
            if (!widget || window._isCharacterActionRunning) return;

            window._isCharacterActionRunning = true;
            let currentState = 'state-neutral';
            if (widget.classList.contains('state-happy')) currentState = 'state-happy';
            if (widget.classList.contains('state-loading')) currentState = 'state-loading';

            widget.className = currentState + ' action-wink action-wink-oval';
            setTimeout(() => {
                if (widget) widget.className = currentState + ' action-wink';
            }, 200);
            setTimeout(() => {
                if (widget) widget.className = currentState;
                window._isCharacterActionRunning = false;
            }, 450);
        },
        toggleTracking: function() {
            isTrackingActive = !isTrackingActive;
        },
        hide: function() {
            if (widget) widget.style.opacity = '0';
        },
        show: function() {
            if (widget) widget.style.opacity = '1';
        }
    };
}

document.addEventListener('DOMContentLoaded', initSiteCharacter);
