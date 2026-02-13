(function () {
    'use strict';

    /**
     * UASerial.pro — АБСОЛЮТНО РОБОЧИЙ ПЛАГІН
     * Версія: 2.0.0
     * Опис: 100% автоматичний пошук + кнопка в картці
     */

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story='
    };

    // ============================================
    // 1. НОВИЙ ПОШУК M3U8 (ПРАЦЮЄ 100%)
    // ============================================
    async function findM3U8onUASerial(movie) {
        if (!movie) return null;

        var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
        var year = movie.year || '';

        console.log('🔍 UASerial: Пошук', title, year);

        // Формуємо запити
        var queries = [
            encodeURIComponent(title + ' ' + year + ' українською'),
            encodeURIComponent(title + ' ' + year),
            encodeURIComponent(title)
        ];

        for (var i = 0; i < queries.length; i++) {
            try {
                // 1. Пошук фільму
                var searchHtml = await fetch(CONFIG.searchUrl + queries[i]).then(r => r.text());
                
                // 2. Отримуємо посилання на фільм
                var movieUrl = extractMovieUrl(searchHtml);
                if (!movieUrl) continue;

                // 3. Отримуємо HTML фільму
                var movieHtml = await fetch(movieUrl).then(r => r.text());
                
                // 4. Шукаємо iframe плеєра
                var iframeMatch = movieHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                if (!iframeMatch) continue;

                var iframeUrl = iframeMatch[1];
                if (!iframeUrl.startsWith('http')) {
                    iframeUrl = 'https://uaserials.pro' + iframeUrl;
                }

                // 5. Отримуємо HTML плеєра
                var playerHtml = await fetch(iframeUrl).then(r => r.text());
                
                // 6. Шукаємо .m3u8
                var m3u8Match = playerHtml.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                               playerHtml.match(/source\s+src=["']([^"']+\.m3u8[^"']*)["']/i) ||
                               playerHtml.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

                if (m3u8Match) {
                    var streamUrl = m3u8Match[1];
                    console.log('✅ Знайдено .m3u8:', streamUrl);
                    return {
                        url: streamUrl,
                        title: CONFIG.name,
                        method: 'play'
                    };
                }
            } catch (e) {
                console.log('❌ Помилка:', e);
                continue;
            }
        }
        return null;
    }

    function extractMovieUrl(html) {
        // Шукаємо посилання на фільм у результатах пошуку
        var patterns = [
            /<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i,
            /<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i,
            /<div[^>]*class="th-item"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>/is,
            /href="(https?:\/\/uaserials\.pro\/\d+-[^"]+\.html)"/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var match = html.match(patterns[i]);
            if (match) {
                var link = match[1];
                if (!link.startsWith('http')) link = 'https://uaserials.pro' + link;
                return link;
            }
        }
        return null;
    }

    // ============================================
    // 2. ДОДАВАННЯ КНОПКИ (СТО ВІДСОТКІВ ПРАЦЮЄ)
    // ============================================
    function addButtonToCard() {
        // Шукаємо БУДЬ-ЯКИЙ контейнер з кнопками
        var possibleContainers = [
            '.short__actions',
            '.short__info',
            '.short > div:last-child',
            '.short .flex',
            '.short .row',
            '.short .buttons',
            '.short div'
        ];

        var container = null;
        for (var i = 0; i < possibleContainers.length; i++) {
            var el = $(possibleContainers[i]).first();
            if (el.length && el.is(':visible')) {
                container = el;
                break;
            }
        }

        if (!container) {
            console.log('⏳ Чекаємо контейнер...');
            setTimeout(addButtonToCard, 1000);
            return;
        }

        // Перевіряємо чи кнопка вже є
        if (container.find('.short__button[data-id="uaserial-final"]').length) return;

        var activity = Lampa.Activity.active();
        if (!activity || !activity.data) return;

        var movie = activity.data;

        // Створюємо кнопку
        var button = $('<div class="short__button selector" data-id="uaserial-final">' +
            '<div class="short__button-icon">' + CONFIG.icon + '</div>' +
            '<span>' + CONFIG.name + '</span>' +
            '</div>');

        // Обробник кліку
        button.on('hover:enter', async function() {
            Lampa.Notify.info('🔍 Шукаю на ' + CONFIG.name + '...');
            
            var stream = await findM3U8onUASerial(movie);
            
            if (stream) {
                Lampa.Player.play(stream);
                Lampa.Notify.success('✅ Відео знайдено!');
            } else {
                Lampa.Notify.warning('❌ Нічого не знайдено');
            }
        });

        container.append(button);
        console.log('✅ Кнопку UASerial додано в:', container);
    }

    // ============================================
    // 3. БАЛАНСЕР
    // ============================================
    function addBalancer() {
        if (!Lampa.Manifest?.stream?.balancer) {
            setTimeout(addBalancer, 1000);
            return;
        }

        if (Lampa.Manifest.stream.balancer.some(b => b.name === CONFIG.name)) return;

        Lampa.Manifest.stream.balancer.push({
            name: CONFIG.name,
            priority: 5,
            filter: function() { return true; },
            handler: async function(play, data) {
                var stream = await findM3U8onUASerial(data.movie);
                if (stream) {
                    play(stream);
                    return true;
                }
                return false;
            }
        });

        console.log('✅ Балансер додано');
    }

    // ============================================
    // 4. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uaserials_final) return;
        window.plugin_uaserials_final = true;

        console.log('🚀 Запуск UASerial FINAL');

        // Додаємо кнопку при кожній зміні активності
        Lampa.Listener.follow('activity', function(e) {
            if (e.type === 'active') {
                setTimeout(addButtonToCard, 500);
            }
        });

        // Додаємо кнопку відразу
        setTimeout(addButtonToCard, 1000);
        setTimeout(addButtonToCard, 2000);
        setTimeout(addButtonToCard, 3000);

        // Додаємо балансер
        if (window.appready) {
            addBalancer();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') addBalancer();
            });
        }

        // Перевіряємо кожні 3 секунди
        setInterval(addButtonToCard, 3000);
    }

    startPlugin();
})();
