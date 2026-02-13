(function () {
    'use strict';

    /**
     * UASerial.pro — автоматичний парсер з кнопкою
     * Версія: 1.0.1 (фікс кнопки)
     */

    // ============================================
    // 1. НАЛАШТУВАННЯ
    // ============================================
    var parser_settings = {
        'parse_lang': 'lg_df_year'
    };

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story='
    };

    // ============================================
    // 2. ПОШУК M3U8
    // ============================================
    async function findM3U8onUASerial(movie) {
        if (!movie) return null;

        var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
        var year = movie.year || '';

        console.log('🔍 UASerial: Пошук', title, year);

        var queries = [
            title + ' ' + year + ' українською',
            title + ' українською',
            title + ' ' + year,
            title
        ];

        for (var i = 0; i < queries.length; i++) {
            try {
                var searchUrl = CONFIG.searchUrl + encodeURIComponent(queries[i]);
                var html = await fetch(searchUrl).then(r => r.text());
                
                var movieLink = extractMovieLink(html);
                if (!movieLink) continue;

                var movieHtml = await fetch(movieLink).then(r => r.text());
                var streamUrl = extractM3U8(movieHtml);
                
                if (streamUrl) {
                    console.log('✅ Знайдено:', streamUrl);
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

    function extractMovieLink(html) {
        var patterns = [
            /<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i,
            /<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i,
            /href="(https?:\/\/uaserials\.pro\/[^"]+\.html)"/i
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

    function extractM3U8(html) {
        var patterns = [
            /file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
            /url["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
            /src=["']([^"']+\.m3u8[^"']*)["']/i,
            /"(https?:\/\/[^"]+\.m3u8[^"]*)"/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var match = html.match(patterns[i]);
            if (match) return match[1];
        }
        return null;
    }

    // ============================================
    // 3. ГАРАНТОВАНЕ ДОДАВАННЯ КНОПКИ
    // ============================================
    function waitForShortContainer() {
        var checkExist = setInterval(function() {
            var container = $('.short .short__buttons').first();
            var activity = Lampa.Activity.active();
            
            if (container.length && activity && activity.data) {
                clearInterval(checkExist);
                addButtonToContainer(container, activity.data);
            }
        }, 1000);
    }

    function addButtonToContainer(container, movie) {
        if (!container || !movie) return;
        
        // Перевіряємо чи кнопка вже є
        if (container.find('.short__button[data-id="uaserials-button"]').length) return;

        var button = $('<div class="short__button selector" data-id="uaserials-button">' +
            '<div class="short__button-icon">' + CONFIG.icon + '</div>' +
            '<span>' + CONFIG.name + '</span>' +
            '</div>');

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
        console.log('✅ Кнопку UASerial додано!');
    }

    // ============================================
    // 4. СЛУХАЧ ЗМІН У КАРТЦІ
    // ============================================
    function observeShortChanges() {
        var target = document.querySelector('.short') || document.body;
        
        var observer = new MutationObserver(function(mutations) {
            var container = $('.short .short__buttons').first();
            var activity = Lampa.Activity.active();
            
            if (container.length && activity && activity.data) {
                addButtonToContainer(container, activity.data);
            }
        });

        observer.observe(target, {
            childList: true,
            subtree: true
        });

        console.log('👀 Спостереження за карткою запущено');
    }

    // ============================================
    // 5. ДОДАВАННЯ БАЛАНСЕРА
    // ============================================
    function addBalancer() {
        if (!Lampa.Manifest?.stream?.balancer) {
            setTimeout(addBalancer, 1000);
            return;
        }

        if (Lampa.Manifest.stream.balancer.some(b => b.name === CONFIG.name)) return;

        Lampa.Manifest.stream.balancer.push({
            name: CONFIG.name,
            priority: 3,
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
    // 6. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uaserials_fixed) return;
        window.plugin_uaserials_fixed = true;

        console.log('🚀 Запуск UASerial плагіна');

        if (window.appready) {
            addBalancer();
            waitForShortContainer();
            observeShortChanges();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    addBalancer();
                    waitForShortContainer();
                    observeShortChanges();
                }
            });
        }
    }

    startPlugin();
})();
