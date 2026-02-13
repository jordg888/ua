(function () {
    'use strict';

    /**
     * UASerial.pro — СТАБІЛЬНА ВЕРСІЯ
     * Версія: 7.0.0
     * Опис: Використовує надійний метод додавання кнопок
     */

    // ============================================
    // 1. НАЛАШТУВАННЯ
    // ============================================
    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story='
    };

    var state = {
        isOpened: false,
        buttonAdded: false
    };

    // ============================================
    // 2. ДОДАВАННЯ КНОПКИ (НАДІЙНИЙ МЕТОД)
    // ============================================
    function addButton() {
        if (state.buttonAdded) return;

        try {
            // Шукаємо контейнер кнопок
            var container = $('.full-start-new__buttons, .full-start__buttons').first();
            
            if (!container.length) {
                setTimeout(addButton, 500);
                return;
            }

            // Перевіряємо чи кнопка вже є
            if (container.find('.uaserial-button-fixed').length) {
                state.buttonAdded = true;
                return;
            }

            // Отримуємо дані фільму
            var activity = Lampa.Activity.active();
            if (!activity || !activity.data) {
                setTimeout(addButton, 500);
                return;
            }

            var movie = activity.data;

            // Створюємо кнопку
            var button = $('<div class="full-start__button selector uaserial-button-fixed" style="order: 999;">' +
                '<div class="full-start__button-icon">' + CONFIG.icon + '</div>' +
                '<span>' + CONFIG.name + '</span>' +
                '</div>');

            // Додаємо обробник
            button.on('hover:enter', function() {
                if (!state.isOpened) {
                    searchAndPlay(movie);
                }
            });

            // Додаємо кнопку в кінець
            container.append(button);
            
            state.buttonAdded = true;
            console.log('✅ Кнопка UASerial додана назавжди!');
            
        } catch (e) {
            console.log('Помилка:', e);
            setTimeout(addButton, 1000);
        }
    }

    // ============================================
    // 3. ПОШУК І ВІДТВОРЕННЯ
    // ============================================
    function searchAndPlay(movie) {
        if (!movie || state.isOpened) return;
        
        state.isOpened = true;
        Lampa.Noty.show('🔍 Пошук на UASerial...');

        var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        var isTV = !!(movie.first_air_date || movie.number_of_seasons);
        
        var searchQuery = title + ' ' + year + (isTV ? ' серіал' : '');
        
        $.ajax({
            url: CONFIG.searchUrl + encodeURIComponent(searchQuery),
            dataType: 'html',
            success: function(html) {
                parseSearchResults(html);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка з\'єднання');
                state.isOpened = false;
            }
        });
    }

    // ============================================
    // 4. ПАРСІНГ РЕЗУЛЬТАТІВ
    // ============================================
    function parseSearchResults(html) {
        var match = html.match(/href="(https?:\/\/uaserials\.pro\/\d+-[^"]+\.html)"/i) ||
                   html.match(/<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i);
        
        if (!match) {
            Lampa.Noty.show('❌ Фільм не знайдено');
            state.isOpened = false;
            return;
        }

        var movieUrl = match[1];
        if (!movieUrl.startsWith('http')) {
            movieUrl = 'https://uaserials.pro' + movieUrl;
        }

        $.ajax({
            url: movieUrl,
            dataType: 'html',
            success: function(movieHtml) {
                extractIframe(movieHtml);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка завантаження');
                state.isOpened = false;
            }
        });
    }

    // ============================================
    // 5. ПОШУК IFRAME
    // ============================================
    function extractIframe(html) {
        var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        
        if (!iframeMatch) {
            Lampa.Noty.show('❌ Плеєр не знайдено');
            state.isOpened = false;
            return;
        }

        var iframeUrl = iframeMatch[1];
        if (!iframeUrl.startsWith('http')) {
            iframeUrl = 'https://uaserials.pro' + iframeUrl;
        }

        $.ajax({
            url: iframeUrl,
            dataType: 'html',
            success: function(playerHtml) {
                extractM3U8(playerHtml);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка завантаження плеєра');
                state.isOpened = false;
            }
        });
    }

    // ============================================
    // 6. ПОШУК M3U8
    // ============================================
    function extractM3U8(html) {
        var m3u8Match = html.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                       html.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

        if (m3u8Match) {
            Lampa.Noty.hide();
            Lampa.Player.play({
                url: m3u8Match[1],
                title: CONFIG.name,
                method: 'play'
            });
        } else {
            Lampa.Noty.show('❌ Потік не знайдено');
        }
        
        state.isOpened = false;
    }

    // ============================================
    // 7. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uaserial_stable) return;
        window.uaserial_stable = true;

        console.log('🚀 Запуск UASerial (стабільна версія)');

        // Додаємо CSS
        if (!$('#uaserial-stable-css').length) {
            $('head').append('<style id="uaserial-stable-css">' +
                '.uaserial-button-fixed { display: flex !important; }' +
                '.full-start__buttons { display: flex; flex-wrap: wrap; }' +
                '</style>');
        }

        // Додаємо кнопку при кожній зміні
        function tryAddButton() {
            if (!state.buttonAdded) {
                addButton();
            }
        }

        // Слідкуємо за подіями
        Lampa.Listener.follow('full', tryAddButton);
        Lampa.Listener.follow('activity', tryAddButton);

        // Додаємо кнопку кілька разів
        setInterval(tryAddButton, 2000);
        setTimeout(tryAddButton, 500);
        setTimeout(tryAddButton, 1000);
        setTimeout(tryAddButton, 2000);
        setTimeout(tryAddButton, 3000);
    }

    startPlugin();
})();
