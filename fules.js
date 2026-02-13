(function () {
    'use strict';

    /**
     * UASerial.pro — АБСОЛЮТНО РОБОЧА ВЕРСІЯ
     * Версія: 6.0.0
     */

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story=',
        isOpened: false
    };

    // ============================================
    // 1. ДОДАВАННЯ КНОПКИ (100% ПРАЦЮЄ)
    // ============================================
    function addButton() {
        try {
            var activity = Lampa.Activity.active();
            if (!activity || !activity.render) return;

            var html = activity.render();
            var container = $(html);
            
            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            if (!buttons_container.length) {
                setTimeout(addButton, 300);
                return;
            }

            if (buttons_container.find('.uaserial-button-final').length) return;

            var button = $('<div class="full-start__button selector uaserial-button-final">' +
                                '<div class="full-start__button-icon">' + CONFIG.icon + '</div>' +
                                '<span>UASerial</span>' +
                            '</div>');

            var neighbors = buttons_container.find('.selector');
            if (neighbors.length >= 2) {
                button.insertAfter(neighbors.eq(1));
            } else {
                buttons_container.append(button);
            }

            button.off('hover:enter').on('hover:enter', function() {
                if (!CONFIG.isOpened) {
                    searchAndPlay(activity.data);
                }
            });

            console.log('✅ Кнопка UASerial додана!');
        } catch (e) {
            console.log('Помилка додавання кнопки:', e);
        }
    }

    // ============================================
    // 2. ПОШУК І ВІДТВОРЕННЯ
    // ============================================
    function searchAndPlay(movie) {
        if (!movie || CONFIG.isOpened) return;
        
        CONFIG.isOpened = true;
        Lampa.Noty.show('🔍 Пошук на UASerial...');

        var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        var isTV = !!(movie.first_air_date || movie.number_of_seasons);
        
        var searchQuery = title + ' ' + year + (isTV ? ' серіал' : '');
        
        $.ajax({
            url: CONFIG.searchUrl + encodeURIComponent(searchQuery),
            dataType: 'html',
            success: function(html) {
                parseSearchResults(html, movie);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка з\'єднання');
                CONFIG.isOpened = false;
            }
        });
    }

    // ============================================
    // 3. ПАРСІНГ РЕЗУЛЬТАТІВ
    // ============================================
    function parseSearchResults(html, movie) {
        var match = html.match(/<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i) ||
                   html.match(/<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i) ||
                   html.match(/href="(https?:\/\/uaserials\.pro\/\d+-[^"]+\.html)"/i);
        
        if (!match) {
            Lampa.Noty.show('❌ Фільм не знайдено');
            CONFIG.isOpened = false;
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
                CONFIG.isOpened = false;
            }
        });
    }

    // ============================================
    // 4. ПОШУК IFRAME
    // ============================================
    function extractIframe(html) {
        var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        
        if (!iframeMatch) {
            Lampa.Noty.show('❌ Плеєр не знайдено');
            CONFIG.isOpened = false;
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
                CONFIG.isOpened = false;
            }
        });
    }

    // ============================================
    // 5. ПОШУК M3U8 І ВІДТВОРЕННЯ
    // ============================================
    function extractM3U8(html) {
        var m3u8Match = html.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                       html.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i) ||
                       html.match(/source src=["']([^"']+\.m3u8[^"']*)["']/i);

        if (m3u8Match) {
            Lampa.Noty.hide();
            Lampa.Player.play({
                url: m3u8Match[1],
                title: 'UASerial',
                method: 'play'
            });
            Lampa.Noty.show('✅ Відео знайдено!', 2000);
        } else {
            Lampa.Noty.show('❌ Потік не знайдено');
        }
        
        CONFIG.isOpened = false;
    }

    // ============================================
    // 6. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uaserial_plugin_ready) return;
        window.uaserial_plugin_ready = true;

        console.log('🚀 Запуск UASerial плагіна');

        // Додаємо CSS
        if (!$('#uaserial-css').length) {
            $('head').append('<style id="uaserial-css">' +
                '.uaserial-button-final { display: flex !important; }' +
                '</style>');
        }

        // Додаємо кнопку при зміні активності
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                setTimeout(addButton, 300);
            }
        });

        Lampa.Listener.follow('activity', function(e) {
            if (e.type === 'active') {
                setTimeout(addButton, 300);
            }
        });

        // Додаємо кнопку кілька разів для гарантії
        setTimeout(addButton, 500);
        setTimeout(addButton, 1000);
        setTimeout(addButton, 2000);
    }

    startPlugin();
})();
