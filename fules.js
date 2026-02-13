(function () {
    'use strict';

    /**
     * UASerial.pro — ПРЯМЕ КОПІЮВАННЯ ВІКІПЕДІЇ
     * Версія: 4.0.0
     * Опис: Додає кнопку UASerial ТОЧНО ТАК, як Вікіпедія додає свою
     */

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story=',
        isOpened: false
    };

    // ============================================
    // 1. ОСНОВНА ФУНКЦІЯ — ТОЧНА КОПІЯ ВІКІПЕДІЇ
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
            var _this = this;
            var container = $(html);
            
            // Перевіряємо чи кнопка вже є
            if (container.find('.lampa-uaserial-button').length) return;

            // СТВОРЮЄМО КНОПКУ — ТОЧНО ЯК У ВІКІПЕДІЇ
            var button = $('<div class="full-start__button selector lampa-uaserial-button">' +
                                '<div class="full-start__button-icon">' + CONFIG.icon + '</div>' +
                                '<span>' + CONFIG.name + '</span>' +
                            '</div>');

            // Шукаємо контейнер — ТОЙ САМИЙ, ЩО Й У ВІКІПЕДІЇ
            var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
            var neighbors = buttons_container.find('.selector');

            // Додаємо кнопку ПІСЛЯ ДРУГОЇ кнопки (як Вікіпедія)
            if (neighbors.length >= 2) {
                button.insertAfter(neighbors.eq(1));
            } else {
                buttons_container.append(button);
            }

            // Додаємо обробник кліку
            button.on('hover:enter click', function() {
                if (!CONFIG.isOpened) {
                    _this.startSearch(data.movie);
                }
            });

            console.log('✅ Кнопку UASerial додано!');
        };

        // ============================================
        // 2. ПОШУК НА UASERIAL
        // ============================================
        this.startSearch = function (movie) {
            var _this = this;
            if (!movie) return;
            
            CONFIG.isOpened = true;
            Lampa.Noty.show('🔍 Пошук на UASerial...');

            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            var isTV = !!(movie.first_air_date || movie.number_of_seasons);

            // Формуємо запити
            var queries = [
                title + ' ' + year + (isTV ? ' серіал' : ''),
                title + ' ' + year,
                title
            ];

            // Запускаємо пошук
            findM3U8(queries).then(function(stream) {
                if (stream) {
                    Lampa.Noty.hide();
                    Lampa.Player.play(stream);
                } else {
                    Lampa.Noty.show('❌ Не знайдено на UASerial');
                }
                CONFIG.isOpened = false;
            }).catch(function() {
                Lampa.Noty.show('❌ Помилка пошуку');
                CONFIG.isOpened = false;
            });
        };
    }

    // ============================================
    // 3. ФУНКЦІЯ ПОШУКУ M3U8
    // ============================================
    async function findM3U8(queries) {
        for (var i = 0; i < queries.length; i++) {
            try {
                // Пошук фільму
                var searchHtml = await fetch(CONFIG.searchUrl + encodeURIComponent(queries[i])).then(r => r.text());
                
                // Отримуємо посилання на фільм
                var movieUrl = extractMovieUrl(searchHtml);
                if (!movieUrl) continue;

                // Отримуємо HTML фільму
                var movieHtml = await fetch(movieUrl).then(r => r.text());
                
                // Шукаємо iframe плеєра
                var iframeMatch = movieHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                if (!iframeMatch) continue;

                var iframeUrl = iframeMatch[1];
                if (!iframeUrl.startsWith('http')) {
                    iframeUrl = 'https://uaserials.pro' + iframeUrl;
                }

                // Отримуємо HTML плеєра
                var playerHtml = await fetch(iframeUrl).then(r => r.text());
                
                // Шукаємо .m3u8
                var m3u8Match = playerHtml.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                               playerHtml.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

                if (m3u8Match) {
                    return {
                        url: m3u8Match[1],
                        title: CONFIG.name,
                        method: 'play'
                    };
                }
            } catch (e) {
                console.log('Помилка:', e);
                continue;
            }
        }
        return null;
    }

    function extractMovieUrl(html) {
        var patterns = [
            /<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i,
            /<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i,
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
    // 4. ДОДАВАННЯ БАЛАНСЕРА
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
                var title = data.movie?.title || data.movie?.name || '';
                var year = (data.movie?.release_date || data.movie?.first_air_date || '').substring(0, 4);
                var isTV = !!(data.movie?.first_air_date || data.movie?.number_of_seasons);
                
                var queries = [
                    title + ' ' + year + (isTV ? ' серіал' : ''),
                    title + ' ' + year,
                    title
                ];
                
                var stream = await findM3U8(queries);
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
    // 5. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uaserials_wiki) return;
        window.plugin_uaserials_wiki = true;

        console.log('🚀 Запуск UASerial (повна копія Вікіпедії)');

        // Додаємо CSS для кнопки
        if (!$('#uaserial-style').length) {
            $('head').append('<style id="uaserial-style">' +
                '.lampa-uaserial-button { display: flex !important; align-items: center; justify-content: center; }' +
                '</style>');
        }

        // Запускаємо плагін
        if (window.Lampa) {
            new UASerialPlugin().init();
        }

        // Додаємо балансер
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                addBalancer();
            }
        });
    }

    startPlugin();
})();
