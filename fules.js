(function () {
    'use strict';

    /**
     * UAKino.pro — СТАНДАРТНЕ МЕНЮ LAMPA
     * Версія: 3.0.1
     */

    // ============================================
    // 1. НАЛАШТУВАННЯ
    // ============================================
    var CONFIG = {
        name: 'UAKino',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>'
    };

    var sources = [
        {
            name: 'UAKino',
            searchUrl: 'https://uakino.club/index.php?do=search&subaction=search&story=',
            baseUrl: 'https://uakino.club'
        },
        {
            name: 'UASerial',
            searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story=',
            baseUrl: 'https://uaserials.pro'
        }
    ];

    // ============================================
    // 2. ДОДАВАННЯ КНОПКИ
    // ============================================
    function addButton() {
        try {
            var container = $('.full-start-new__buttons, .full-start__buttons').first();
            
            if (!container.length) {
                setTimeout(addButton, 500);
                return;
            }

            if (container.find('.custom-source-button').length) return;

            var activity = Lampa.Activity.active();
            if (!activity || !activity.data) {
                setTimeout(addButton, 500);
                return;
            }

            var button = $('<div class="full-start__button selector custom-source-button">' +
                '<div class="full-start__button-icon">' + CONFIG.icon + '</div>' +
                '<span>' + CONFIG.name + '</span>' +
                '</div>');

            button.on('hover:enter', function() {
                showSourceMenu(activity.data);
            });

            container.append(button);
            console.log('✅ Кнопку додано');
            
        } catch (e) {
            console.log('Помилка:', e);
        }
    }

    // ============================================
    // 3. ПОКАЗ МЕНЮ
    // ============================================
    function showSourceMenu(movie) {
        if (!movie) return;

        var menuItems = [];
        
        for (var i = 0; i < sources.length; i++) {
            menuItems.push({
                title: sources[i].name,
                source: sources[i]
            });
        }

        Lampa.Menu.open({
            title: 'Виберіть джерело',
            items: menuItems,
            onSelect: function(item) {
                searchOnSource(movie, item.source);
            }
        });
    }

    // ============================================
    // 4. ПОШУК НА ДЖЕРЕЛІ
    // ============================================
    function searchOnSource(movie, source) {
        var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
        var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
        
        var searchQuery = title + ' ' + year;
        var searchUrl = source.searchUrl + encodeURIComponent(searchQuery);

        Lampa.Noty.show('🔍 Пошук на ' + source.name + '...');

        $.ajax({
            url: searchUrl,
            dataType: 'html',
            success: function(html) {
                parseResults(html, source, movie);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка з\'єднання');
            }
        });
    }

    // ============================================
    // 5. ПАРСІНГ РЕЗУЛЬТАТІВ
    // ============================================
    function parseResults(html, source, movie) {
        var match = html.match(/<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i) ||
                   html.match(/<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i) ||
                   html.match(/href="(https?:\/\/[^"]+\.html)"/i);

        if (!match) {
            Lampa.Noty.show('❌ Фільм не знайдено');
            return;
        }

        var movieUrl = match[1];
        if (!movieUrl.startsWith('http')) {
            movieUrl = source.baseUrl + movieUrl;
        }

        $.ajax({
            url: movieUrl,
            dataType: 'html',
            success: function(movieHtml) {
                extractIframe(movieHtml, source, movie);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка завантаження');
            }
        });
    }

    function extractIframe(movieHtml, source, movie) {
        var iframeMatch = movieHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);

        if (!iframeMatch) {
            Lampa.Noty.show('❌ Плеєр не знайдено');
            return;
        }

        var iframeUrl = iframeMatch[1];
        if (!iframeUrl.startsWith('http')) {
            iframeUrl = source.baseUrl + iframeUrl;
        }

        $.ajax({
            url: iframeUrl,
            dataType: 'html',
            success: function(playerHtml) {
                extractVideo(playerHtml, source, movie);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка завантаження плеєра');
            }
        });
    }

    function extractVideo(playerHtml, source, movie) {
        var m3u8Match = playerHtml.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                       playerHtml.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

        if (m3u8Match) {
            Lampa.Noty.hide();
            
            Lampa.Player.play({
                url: m3u8Match[1],
                title: source.name + ' - ' + (movie.title || movie.name),
                method: 'play'
            });
        } else {
            Lampa.Noty.show('❌ Відео не знайдено');
        }
    }

    // ============================================
    // 6. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uakino_plugin_ready) return;
        window.uakino_plugin_ready = true;

        console.log('🚀 Запуск плагіна');

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

        setTimeout(addButton, 500);
        setTimeout(addButton, 1000);
        setTimeout(addButton, 2000);
    }

    startPlugin();
})();
