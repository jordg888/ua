(function () {
    'use strict';

    /**
     * UAKINO.club — АЛЬТЕРНАТИВНИЙ ПЛАГІН
     * Версія: 1.0.0
     */

    var CONFIG = {
        name: 'UAKino',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        searchUrl: 'https://uakino.club/index.php?do=search&subaction=search&story=',
        isOpened: false
    };

    // ============================================
    // 1. ДОДАВАННЯ КНОПКИ (ТВІЙ РОБОЧИЙ КОД)
    // ============================================
    function UAKinoPlugin() {
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
            
            if (container.find('.lampa-uakino-button').length) return;

            var button = $('<div class="full-start__button selector lampa-uakino-button">' +
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
                    _this.startSearch(data.movie);
                }
            });

            console.log('✅ Кнопку UAKino додано!');
        };

        // ============================================
        // 2. ПОШУК НА UAKINO.CLUB
        // ============================================
        this.startSearch = function (movie) {
            if (!movie) return;
            
            CONFIG.isOpened = true;
            Lampa.Noty.show('🔍 Пошук на UAKino...');

            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            
            var searchQuery = title + ' ' + year;
            
            var _this = this;
            
            $.ajax({
                url: CONFIG.searchUrl + encodeURIComponent(searchQuery),
                dataType: 'html',
                success: function(html) {
                    _this.parseSearch(html);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка з\'єднання');
                    CONFIG.isOpened = false;
                }
            });
        };

        this.parseSearch = function(html) {
            // Шукаємо посилання на фільм
            var match = html.match(/<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i) ||
                       html.match(/href="(https?:\/\/uakino\.club\/\d+-[^"]+\.html)"/i);
            
            if (!match) {
                Lampa.Noty.show('❌ Фільм не знайдено');
                CONFIG.isOpened = false;
                return;
            }

            var movieUrl = match[1];
            if (!movieUrl.startsWith('http')) {
                movieUrl = 'https://uakino.club' + movieUrl;
            }

            var _this = this;
            
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

        this.extractIframe = function(html) {
            // Шукаємо iframe плеєра
            var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            
            if (!iframeMatch) {
                Lampa.Noty.show('❌ Плеєр не знайдено');
                CONFIG.isOpened = false;
                return;
            }

            var iframeUrl = iframeMatch[1];
            if (!iframeUrl.startsWith('http')) {
                iframeUrl = 'https://uakino.club' + iframeUrl;
            }

            var _this = this;
            
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

        this.extractM3U8 = function(html) {
            // Шукаємо .m3u8 потік
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
    // 3. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uakino_plugin) return;
        window.uakino_plugin = true;

        console.log('🚀 Запуск UAKino плагіна');

        if (!$('#uakino-style').length) {
            $('head').append('<style id="uakino-style">' +
                '.lampa-uakino-button { display: flex !important; }' +
                '</style>');
        }

        if (window.Lampa) {
            new UAKinoPlugin().init();
        }
    }

    startPlugin();
})();
