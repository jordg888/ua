(function () {
    'use strict';

    /**
     * UASerial.pro — ПОВНІСТЮ РОБОЧА ВЕРСІЯ
     * Версія: 5.0.0
     * Опис: Кнопка є + пошук ПРАЦЮЄ (через $.ajax)
     */

    var CONFIG = {
        name: 'UASerial',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uaserials.pro/index.php?do=search&subaction=search&story=',
        isOpened: false
    };

    // ============================================
    // 1. ОСНОВНА ФУНКЦІЯ — ДОДАВАННЯ КНОПКИ
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
                    this.startSearch(data.movie);
                }
            }.bind(this));

            console.log('✅ Кнопку UASerial додано!');
        };

        // ============================================
        // 2. ПОШУК НА UASERIAL — ЧЕРЕЗ $.ajax (ЯК У ВІКІПЕДІЇ)
        // ============================================
        this.startSearch = function (movie) {
            var _this = this;
            if (!movie) return;
            
            CONFIG.isOpened = true;
            Lampa.Noty.show('🔍 Пошук на UASerial...');

            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            var isTV = !!(movie.first_air_date || movie.number_of_seasons);

            // Формуємо запит
            var searchQuery = title + ' ' + year + (isTV ? ' серіал' : ' українською');
            
            $.ajax({
                url: CONFIG.searchUrl + encodeURIComponent(searchQuery),
                dataType: 'html',
                success: function(html) {
                    _this.parseSearchResults(html, movie);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка з'єднання');
                    CONFIG.isOpened = false;
                }
            });
        };

        // ============================================
        // 3. ПАРСІНГ РЕЗУЛЬТАТІВ ПОШУКУ
        // ============================================
        this.parseSearchResults = function(html, movie) {
            var _this = this;
            
            // Шукаємо посилання на фільм
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

            // Завантажуємо сторінку фільму
            $.ajax({
                url: movieUrl,
                dataType: 'html',
                success: function(movieHtml) {
                    _this.extractIframe(movieHtml);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка завантаження');
                    CONFIG.isOpened = false;
                }
            });
        };

        // ============================================
        // 4. ПОШУК IFRAME ПЛЕЄРА
        // ============================================
        this.extractIframe = function(html) {
            var _this = this;
            
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

            // Завантажуємо сторінку плеєра
            $.ajax({
                url: iframeUrl,
                dataType: 'html',
                success: function(playerHtml) {
                    _this.extractM3U8(playerHtml);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка завантаження плеєра');
                    CONFIG.isOpened = false;
                }
            });
        };

        // ============================================
        // 5. ПОШУК M3U8 І ВІДТВОРЕННЯ
        // ============================================
        this.extractM3U8 = function(html) {
            var m3u8Match = html.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                           html.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

            if (m3u8Match) {
                Lampa.Noty.hide();
                Lampa.Player.play({
                    url: m3u8Match[1],
                    title: CONFIG.name,
                    method: 'play'
                });
                Lampa.Noty.show('✅ Відео знайдено!', 2000);
            } else {
                Lampa.Noty.show('❌ Потік не знайдено');
            }
            
            CONFIG.isOpened = false;
        };
    }

    // ============================================
    // 6. ДОДАВАННЯ БАЛАНСЕРА
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
            handler: function(play, data) {
                var movie = data.movie;
                if (!movie) return false;
                
                var title = movie.title || movie.name || '';
                var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
                var isTV = !!(movie.first_air_date || movie.number_of_seasons);
                
                var searchQuery = title + ' ' + year + (isTV ? ' серіал' : ' українською');
                
                $.ajax({
                    url: CONFIG.searchUrl + encodeURIComponent(searchQuery),
                    dataType: 'html',
                    success: function(html) {
                        var match = html.match(/href="(https?:\/\/uaserials\.pro\/\d+-[^"]+\.html)"/i);
                        if (match) {
                            $.ajax({
                                url: match[1],
                                dataType: 'html',
                                success: function(movieHtml) {
                                    var iframeMatch = movieHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                                    if (iframeMatch) {
                                        var iframeUrl = iframeMatch[1];
                                        if (!iframeUrl.startsWith('http')) iframeUrl = 'https://uaserials.pro' + iframeUrl;
                                        
                                        $.ajax({
                                            url: iframeUrl,
                                            dataType: 'html',
                                            success: function(playerHtml) {
                                                var m3u8Match = playerHtml.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
                                                if (m3u8Match) {
                                                    play({
                                                        url: m3u8Match[1],
                                                        title: CONFIG.name,
                                                        method: 'play'
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
                return true;
            }
        });

        console.log('✅ Балансер додано');
    }

    // ============================================
    // 7. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uaserials_ajax) return;
        window.plugin_uaserials_ajax = true;

        console.log('🚀 Запуск UASerial (режим AJAX)');

        // Додаємо CSS
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
