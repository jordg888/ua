(function () {
    'use strict';

    /**
     * UASerial.pro — РОБОЧА ВЕРСІЯ (тільки кнопка)
     * Версія: 5.0.0 (стабільна)
     */

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        isOpened: false
    };

    // ============================================
    // 1. ДОДАВАННЯ КНОПКИ (ТОЙ САМИЙ РОБОЧИЙ КОД)
    // ============================================
    function UASerialPlugin() {
        this.init = function () {
            var _this = this;
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite') {
                    setTimeout(function() {
                        try {
                            _this.render(e.data, e.object.activity.render());
                        } catch (err) {}
                    }, 200);
                }
            });
        };

        this.render = function (data, html) {
            var container = $(html);
            
            if (container.find('.lampa-uaserial-button').length) return;

            var button = $('<div class="full-start__button selector lampa-uaserial-button">' +
                                '<div class="full-start__button-icon">' + CONFIG.icon + '</div>' +
                                '<span>' + CONFIG.name + '</span>' +
                            '</div>');

            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            var neighbors = buttons_container.find('.selector');

            if (neighbors.length >= 2) {
                button.insertAfter(neighbors.eq(1));
            } else {
                buttons_container.append(button);
            }

            button.on('hover:enter click', function() {
                if (!CONFIG.isOpened) {
                    Lampa.Noty.show('🔍 Пошук поки що в розробці...');
                }
            });

            console.log('✅ Кнопку UASerial додано!');
        };
    }

    // ============================================
    // 2. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uaserial_final) return;
        window.uaserial_final = true;

        console.log('🚀 Запуск UASerial (стабільна версія)');

        if (!$('#uaserial-style').length) {
            $('head').append('<style id="uaserial-style">' +
                '.lampa-uaserial-button { display: flex !important; }' +
                '</style>');
        }

        if (window.Lampa) {
            new UASerialPlugin().init();
        }
    }

    startPlugin();
})();
