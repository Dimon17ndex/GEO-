(function() {
    // Ждем полной загрузки DOM
    document.addEventListener("DOMContentLoaded", function() {
        // Проверяем, не добавлен ли уже этот блок (на всякий случай)
        if (document.getElementById("region-warning-container")) return;

        // Создаем стили и добавляем их на страницу динамически
        const style = document.createElement("style");
        style.innerHTML = `
            #region-warning-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 99999;
                display: flex;
                align-items: center;
                gap: 14px;
                max-width: 420px;
                padding: 16px 20px;
                background: rgba(20, 20, 25, 0.85);
                border: 1px solid rgba(255, 193, 7, 0.35);
                border-radius: 16px;
                backdrop-filter: blur(15px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 193, 7, 0.1);
                font-family: 'Montserrat', sans-serif;
                color: #ffffff;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                animation: warningIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
                pointer-events: auto;
                box-sizing: border-box;
            }

            @keyframes warningIn {
                0% {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .warning-icon-box {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 36px;
                height: 36px;
                background: rgba(255, 193, 7, 0.15);
                border-radius: 10px;
                color: #ffc107;
            }

            .warning-icon-box svg {
                width: 20px;
                height: 20px;
            }

            .warning-text-content {
                font-size: 13px;
                font-weight: 500;
                line-height: 1.4;
                color: rgba(255, 255, 255, 0.9);
                letter-spacing: 0.2px;
            }

            /* Кнопка закрытия (крестик) */
            .warning-close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.4);
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s ease;
            }

            .warning-close-btn:hover {
                color: #ffffff;
            }

            .warning-close-btn svg {
                width: 14px;
                height: 14px;
            }
        `;
        document.head.appendChild(style);

        // Создаем HTML-разметку контейнера предупреждения
        const warningContainer = document.createElement("div");
        warningContainer.id = "region-warning-container";
        warningContainer.innerHTML = `
            <div class="warning-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>
            <div class="warning-text-content">
                Разработка сайта ограничена в связи со временными техническими ограничениями в регионе происхождения данного проекта!
            </div>
            <button type="button" class="warning-close-btn" title="Закрыть" onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateY(10px) scale(0.95)'; setTimeout(() => this.parentElement.remove(), 400);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Добавляем готовый блок в тело страницы
        document.body.appendChild(warningContainer);
    });
})();