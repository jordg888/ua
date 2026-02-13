(function () {
    'use strict';

    /**
     * UAKino.pro — СТАНДАРТНЕ МЕНЮ LAMPA
     * Версія: 3.0.0
     */

    var CONFIG = {
        name: 'UAKino',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        sources: [
            {
                name: 'UAKino',
                url: 'https://uakino.club/index.php?do=search&subaction=search&story=',
                baseUrl: 'https://uakino.club'
            },
            {
                name: 'UASerial',
                url: 'https://uaserials.pro/index.php?do=search&subaction=search&story=',
                baseUrl: 'https://uaserials.pro'
            }
        ]
    };

    // ============================================
    // 1. ДОДАВАННЯ КНОПКИ
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
                _this.showLampaMenu(data.movie);
            });

            console.log('✅ Кнопку UAKino додано!');
        };

        // ============================================
        // 2. ПОКАЗ СТАНДАРТНОГО МЕНЮ LAMPA
        // ============================================
        this.showLampaMenu = function(movie) {
            if (!movie) return;

            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            
            // Створюємо дані для меню
            var menuData = {
                movie: movie,
                sources: []
            };

            // Додаємо джерела
            CONFIG.sources.forEach(function(source) {
                menuData.sources.push({
                    name: source.name,
                    url: source.url + encodeURIComponent(title + ' ' + year),
                    baseUrl: source.baseUrl,
                    type: 'search'
                });
            });

            // Відкриваємо стандартне меню вибору джерел
            Lampa.SourcesMenu.open(menuData, {
                title: 'Виберіть джерело',
                onSelect: function(source) {
                    Lampa.Noty.show('🔍 Пошук на ' + source.name + '...');
                    
                    $.ajax({
                        url: source.url,
                        dataType: 'html',
                        success: function(html) {
                            parseAndShowResults(html, source, movie);
                        },
                        error: function() {
                            Lampa.Noty.show('❌ Помилка з\'єднання');
                        }
                    });
                }
            });
        };
    }

    // ============================================
    // 3. ПАРСІНГ І ПОКАЗ РЕЗУЛЬТАТІВ
    // ============================================
    function parseAndShowResults(html, source, movie) {
        // Шукаємо посилання на фільм
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
                extractAndPlay(movieHtml, source, movie);
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка завантаження');
            }
        });
    }

    function extractAndPlay(movieHtml, source, movie) {
        // Шукаємо iframe плеєра
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
                // Шукаємо .m3u8
                var m3u8Match = playerHtml.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                               playerHtml.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

                if (m3u8Match) {
                    Lampa.Noty.hide();
                    
                    // Створюємо об'єкт для відтворення
                    var playData = {
                        url: m3u8Match[1],
                        title: source.name + ' - ' + (movie.title || movie.name),
                        method: 'play'
                    };

                    // Відкриваємо плеєр
                    Lampa.Player.play(playData);
                    
                } else {
                    Lampa.Noty.show('❌ Потік не знайдено');
                }
            },
            error: function() {
                Lampa.Noty.show('❌ Помилка завантаження плеєра');
            }
        });
    }

    // ============================================
    // 4. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uakino_lampa_menu) return;
        window.uakino_lampa_menu = true;

        console.log('🚀 Запуск UAKino зі стандартним меню Lampa');

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
