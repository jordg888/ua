(function () {
    'use strict';

    /**
     * UAKino.pro — ПЛАГІН З МЕНЮ ВИБОРУ
     * Версія: 2.0.0
     */

    var CONFIG = {
        name: 'UAKino',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm2 2h8v4H8v-4z"/></svg>',
        sources: [
            {
                name: 'UAKino',
                url: 'https://uakino.club/index.php?do=search&subaction=search&story=',
                type: 'movie'
            },
            {
                name: 'UASerial',
                url: 'https://uaserials.pro/index.php?do=search&subaction=search&story=',
                type: 'tv'
            },
            {
                name: 'Kinogo',
                url: 'https://kinogo.zone/index.php?do=search&subaction=search&story=',
                type: 'movie'
            }
        ],
        isOpened: false
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
                if (!CONFIG.isOpened) {
                    _this.showSourceMenu(data.movie);
                }
            });

            console.log('✅ Кнопку UAKino додано!');
        };

        // ============================================
        // 2. ПОКАЗ МЕНЮ З ВИБОРОМ ДЖЕРЕЛ
        // ============================================
        this.showSourceMenu = function(movie) {
            if (!movie) return;
            
            CONFIG.isOpened = true;
            
            var menuHtml = '<div class="source-select-container">' +
                '<div class="source-select-header">Виберіть джерело</div>' +
                '<div class="source-select-list">';
            
            CONFIG.sources.forEach(function(source) {
                menuHtml += '<div class="source-select-item selector" data-source="' + source.name + '" data-url="' + source.url + '">' +
                    '<div class="source-select-item-icon">' + CONFIG.icon + '</div>' +
                    '<div class="source-select-item-name">' + source.name + '</div>' +
                '</div>';
            });
            
            menuHtml += '</div></div>';
            
            var menu = $(menuHtml);
            $('body').append(menu);
            
            // Додаємо стилі для меню
            if (!$('#source-menu-style').length) {
                $('head').append('<style id="source-menu-style">' +
                    '.source-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 1000; display: flex; flex-direction: column; align-items: center; justify-content: center; }' +
                    '.source-select-header { color: #fff; font-size: 1.5em; margin-bottom: 30px; }' +
                    '.source-select-list { width: 80%; max-width: 500px; background: #1a1a1a; border-radius: 10px; padding: 20px; }' +
                    '.source-select-item { display: flex; align-items: center; padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.05); border-radius: 5px; cursor: pointer; border: 2px solid transparent; }' +
                    '.source-select-item.focus { border-color: #fff; background: rgba(255,255,255,0.1); }' +
                    '.source-select-item-icon { width: 30px; height: 30px; margin-right: 15px; }' +
                    '.source-select-item-name { color: #fff; font-size: 1.1em; }' +
                    '</style>');
            }
            
            var _this = this;
            
            // Обробка вибору
            menu.find('.source-select-item').on('hover:enter click', function() {
                var sourceName = $(this).data('source');
                var sourceUrl = $(this).data('url');
                menu.remove();
                CONFIG.isOpened = false;
                
                Lampa.Noty.show('🔍 Пошук на ' + sourceName + '...');
                _this.searchOnSource(movie, sourceName, sourceUrl);
            });
            
            // Обробка кнопки назад
            Lampa.Controller.add('source_menu', {
                toggle: function() {
                    Lampa.Controller.collectionSet(menu);
                    Lampa.Controller.collectionFocus(menu.find('.source-select-item')[0], menu);
                },
                back: function() {
                    menu.remove();
                    CONFIG.isOpened = false;
                    Lampa.Controller.toggle('full_start');
                },
                up: function() {
                    var items = menu.find('.source-select-item');
                    var focus = menu.find('.source-select-item.focus');
                    var index = items.index(focus);
                    if (index > 0) {
                        Lampa.Controller.collectionFocus(items[index - 1], menu);
                    }
                },
                down: function() {
                    var items = menu.find('.source-select-item');
                    var focus = menu.find('.source-select-item.focus');
                    var index = items.index(focus);
                    if (index < items.length - 1) {
                        Lampa.Controller.collectionFocus(items[index + 1], menu);
                    }
                }
            });
            
            Lampa.Controller.toggle('source_menu');
        };

        // ============================================
        // 3. ПОШУК НА ВИБРАНОМУ ДЖЕРЕЛІ
        // ============================================
        this.searchOnSource = function(movie, sourceName, sourceUrl) {
            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            var year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
            
            var searchQuery = title + ' ' + year;
            
            var _this = this;
            
            $.ajax({
                url: sourceUrl + encodeURIComponent(searchQuery),
                dataType: 'html',
                success: function(html) {
                    _this.parseSearchResults(html, sourceName);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка з\'єднання з ' + sourceName);
                }
            });
        };

        // ============================================
        // 4. ПАРСІНГ РЕЗУЛЬТАТІВ
        // ============================================
        this.parseSearchResults = function(html, sourceName) {
            // Шукаємо посилання на фільм
            var match = html.match(/<a[^>]+href="([^"]+)"[^>]*class="short-title"[^>]*>/i) ||
                       html.match(/<a[^>]+href="([^"]+)"[^>]*class="poster"[^>]*>/i) ||
                       html.match(/href="(https?:\/\/[^"]+\.html)"/i);
            
            if (!match) {
                Lampa.Noty.show('❌ Фільм не знайдено на ' + sourceName);
                return;
            }

            var movieUrl = match[1];
            if (!movieUrl.startsWith('http')) {
                if (sourceName === 'UAKino') movieUrl = 'https://uakino.club' + movieUrl;
                else if (sourceName === 'UASerial') movieUrl = 'https://uaserials.pro' + movieUrl;
                else if (sourceName === 'Kinogo') movieUrl = 'https://kinogo.zone' + movieUrl;
            }

            var _this = this;
            
            $.ajax({
                url: movieUrl,
                dataType: 'html',
                success: function(movieHtml) {
                    _this.extractIframe(movieHtml, sourceName);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка завантаження сторінки');
                }
            });
        };

        this.extractIframe = function(html, sourceName) {
            var iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
            
            if (!iframeMatch) {
                Lampa.Noty.show('❌ Плеєр не знайдено');
                return;
            }

            var iframeUrl = iframeMatch[1];
            if (!iframeUrl.startsWith('http')) {
                if (sourceName === 'UAKino') iframeUrl = 'https://uakino.club' + iframeUrl;
                else if (sourceName === 'UASerial') iframeUrl = 'https://uaserials.pro' + iframeUrl;
                else if (sourceName === 'Kinogo') iframeUrl = 'https://kinogo.zone' + iframeUrl;
            }

            var _this = this;
            
            $.ajax({
                url: iframeUrl,
                dataType: 'html',
                success: function(playerHtml) {
                    _this.extractM3U8(playerHtml, sourceName);
                },
                error: function() {
                    Lampa.Noty.show('❌ Помилка завантаження плеєра');
                }
            });
        };

        this.extractM3U8 = function(html, sourceName) {
            var m3u8Match = html.match(/file["']?\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                           html.match(/"(https?:\/\/[^"]+\.m3u8[^"]*)"/i);

            if (m3u8Match) {
                Lampa.Noty.hide();
                Lampa.Player.play({
                    url: m3u8Match[1],
                    title: sourceName,
                    method: 'play'
                });
                Lampa.Noty.show('✅ Відео знайдено на ' + sourceName, 2000);
            } else {
                Lampa.Noty.show('❌ Потік не знайдено на ' + sourceName);
            }
        };
    }

    // ============================================
    // 5. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.uakino_menu_plugin) return;
        window.uakino_menu_plugin = true;

        console.log('🚀 Запуск UAKino з меню вибору');

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
