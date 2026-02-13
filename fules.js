(function () {
    'use strict';

    /**
     * UASerial.pro — повністю автоматичний парсер
     * Версія: 1.0.0
     * Опис: Автоматично знаходить .m3u8 та відтворює в плеєрі
     * Автор: @UATUT_Plugin
     */

    // ============================================
    // 1. НАЛАШТУВАННЯ ПОШУКУ
    // ============================================
    var parser_settings = {
        'parse_lang': 'lg_df_year'  // Українська + Оригінал + Рік
    };

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story='
    };

    // ============================================
    // 2. ОСНОВНА ФУНКЦІЯ ПОШУКУ .M3U8
    // ============================================
    async function findM3U8onUASerial(movie) {
        if (!movie) return null;

        var title = movie.title || movie.name || movie.original_title || '';
        var year = movie.year || '';
        var imdb = movie.imdb_id || '';

        console.log('🔍 UASerial: Пошук', title, year);

        // Формуємо запити згідно parser_settings
        var queries = [];
        
        if (parser_settings.parse_lang === 'lg_df_year') {
            queries.push(title + ' ' + year + ' українською');
            queries.push(title + ' українською');
            queries.push(title + ' ' + year);
            queries.push(title);
        }

        // Пробуємо кожен запит
        for (var i = 0; i < queries.length; i++) {
            var searchUrl = CONFIG.searchUrl + encodeURIComponent(queries[i]);
            console.log('🌐 Запит:', searchUrl);

            try {
                var html = await fetch(searchUrl).then(r => r.text());
                
                // Шукаємо перше посилання на фільм/серіал
                var movieLink = extractMovieLink(html);
                if (!movieLink) continue;

                console.log('📄 Сторінка фільму:', movieLink);
                
                // Отримуємо HTML сторінки фільму
                var movieHtml = await fetch(movieLink).then(r => r.text());
                
                // Шукаємо .m3u8
                var streamUrl = extractM3U8(movieHtml);
                
                if (streamUrl) {
                    console.log('✅ Знайдено .m3u8:', streamUrl);
                    return {
                        url: streamUrl,
                        title: CONFIG.name,
                        quality: 'HD',
                        method: 'play'
                    };
                }
            } catch (e) {
                console.log('❌ Помилка запиту:', e);
                continue;
            }
        }

        return null;
    }

    // ============================================
    // 3. ЕКСТРАКТОР ПОСИЛАННЯ НА ФІЛЬМ
    // ============================================
    function extractMovieLink(html) {
        // Шукаємо посилання на сторінку фільму
        var patterns = [
            /<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i,
            /<div[^>]*class="th-item"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>/is,
            /<article.*?<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/is,
            /<a[^>]+href="(https?:\/\/uaserials\.pro\/[^"]+\/\d+-[^"]+\.html)"[^>]*>/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var match = html.match(patterns[i]);
            if (match) {
                var link = match[1];
                if (!link.startsWith('http')) {
                    link = 'https://uaserials.pro' + link;
                }
                return link;
            }
        }
        return null;
    }

    // ============================================
    // 4. ЕКСТРАКТОР .M3U8
    // ============================================
    function extractM3U8(html) {
        var patterns = [
            /file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
            /url["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
            /src=["']([^"']+\.m3u8[^"']*)["']/i,
            /"(https?:\/\/[^"]+\.m3u8[^"]*)"/i,
            /'(https?:\/\/[^']+\.m3u8[^']*)'/i,
            /<source[^>]+src=["']([^"']+\.m3u8[^"']*)["']/i
        ];

        for (var i = 0; i < patterns.length; i++) {
            var match = html.match(patterns[i]);
            if (match) return match[1];
        }
        return null;
    }

    // ============================================
    // 5. ДОДАВАННЯ БАЛАНСЕРА
    // ============================================
    function addBalancer() {
        if (!Lampa.Manifest?.stream?.balancer) {
            setTimeout(addBalancer, 1000);
            return;
        }

        if (Lampa.Manifest.stream.balancer.some(b => b.name === CONFIG.name)) {
            console.log('✅ UASerial вже додано');
            return;
        }

        Lampa.Manifest.stream.balancer.push({
            name: CONFIG.name,
            priority: 3,
            filter: function(video, movie) {
                return true; // Працює для всього
            },
            handler: async function(play, data) {
                try {
                    var streamData = await findM3U8onUASerial(data.movie);
                    if (streamData) {
                        play(streamData);
                        return true;
                    }
                } catch (e) {
                    console.error('UASerial помилка:', e);
                }
                return false;
            }
        });

        console.log('✅ UASerial балансер активовано!');
    }

    // ============================================
    // 6. ДОДАВАННЯ КНОПКИ В КАРТКУ
    // ============================================
    function addButton() {
        if (!Lampa.Short) return;

        var originalShort = Lampa.Short;
        
        Lampa.Short = function() {
            var result = originalShort.apply(this, arguments);
            
            setTimeout(function() {
                try {
                    var container = $('.short .short__buttons').first();
                    if (!container.length) return;

                    var activity = Lampa.Activity.active();
                    if (!activity) return;

                    if (container.find('.short__button[data-id="uaserials"]').length) return;

                    var button = $('<div class="short__button selector" data-id="uaserials" style="order: 998">' +
                        '<div class="short__button-icon">' + CONFIG.icon + '</div>' +
                        '<span>' + CONFIG.name + '</span>' +
                        '</div>');

                    button.on('hover:enter', async function() {
                        Lampa.Notify.info('🔍 Шукаю на ' + CONFIG.name + '...');
                        var stream = await findM3U8onUASerial(activity);
                        if (stream) {
                            Lampa.Player.play(stream);
                        } else {
                            Lampa.Notify.warning('❌ Не знайдено на ' + CONFIG.name);
                        }
                    });

                    container.append(button);
                } catch (e) {
                    console.error('Помилка додавання кнопки:', e);
                }
            }, 500);

            return result;
        };

        Lampa.Short.prototype = originalShort.prototype;
    }

    // ============================================
    // 7. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uaserials_ready) return;
        window.plugin_uaserials_ready = true;

        console.log('🚀 Запуск UASerial автоматичного парсера');

        if (window.appready) {
            addBalancer();
            addButton();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    addBalancer();
                    addButton();
                }
            });
        }
    }

    startPlugin();
})();
