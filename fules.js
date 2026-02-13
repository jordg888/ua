(function () {
    'use strict';

    /**
     * UATUT.FUN — універсальний парсер з кнопкою в картці
     * Версія: 2.0.0
     * Опис: Додає кнопку "UATUT" у картку фільму + автоматичний пошук
     * Автор: @TurksPlugin
     */

    // ============================================
    // 1. НАЛАШТУВАННЯ ПОШУКУ (ТВОЇ НАЛАШТУВАННЯ)
    // ============================================
    var parser_settings = {
        'parse_lang': 'lg_df_year'  // Українська + Оригінал + Рік
    };

    // ============================================
    // 2. КОНФІГУРАЦІЯ
    // ============================================
    var CONFIG = {
        name: 'UATUT',
        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>',
        searchUrl: 'https://tv.uatut.fun/index.php?do=search&subaction=search&story='
    };

    // ============================================
    // 3. ДОДАВАННЯ КНОПКИ В КАРТКУ ФІЛЬМУ
    // ============================================
    function addUatutButton() {
        if (!Lampa.Components) return;

        // Зберігаємо оригінальний компонент
        var originalShort = Lampa.Short;

        if (!originalShort) return;

        // Замінюємо компонент Short
        Lampa.Short = function() {
            var result = originalShort.apply(this, arguments);
            
            setTimeout(function() {
                try {
                    var container = $('.short .short__buttons').first();
                    if (!container.length) return;

                    // Отримуємо дані фільму
                    var activity = Lampa.Activity.active();
                    var movie = activity ? (activity.data || activity) : null;
                    
                    if (!movie) return;

                    // Перевіряємо чи кнопка вже існує
                    if (container.find('.short__button[data-id="uatut-search"]').length) return;

                    // Створюємо кнопку
                    var button = $('<div class="short__button selector" data-id="uatut-search" style="order: 999">' +
                        '<div class="short__button-icon">' + CONFIG.icon + '</div>' +
                        '<span>' + CONFIG.name + '</span>' +
                        '</div>');

                    // Додаємо обробник кліку
                    button.on('hover:enter', function() {
                        searchOnUatut(movie);
                    });

                    container.append(button);
                    
                } catch (e) {
                    console.error('UATUT: Помилка додавання кнопки', e);
                }
            }, 500);

            return result;
        };

        // Копіюємо прототип
        Lampa.Short.prototype = originalShort.prototype;
        Lampa.Short.prototype.constructor = Lampa.Short;
        
        console.log('✅ UATUT: Кнопку додано в картку фільму');
    }

    // ============================================
    // 4. ПОШУК НА UATUT (З ТВОЇМИ НАЛАШТУВАННЯМИ)
    // ============================================
    function searchOnUatut(movie) {
        if (!movie) return;

        // Отримуємо дані фільму
        var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
        var year = movie.year || '';
        var originalTitle = movie.original_title || movie.original_name || '';

        console.log('🔍 UATUT: Шукаю', title, year);

        // ============================================
        // 5. ФОРМУВАННЯ ЗАПИТІВ ЗГІДНО parse_lang
        // ============================================
        var searchQueries = [];

        if (parser_settings.parse_lang === 'lg_df_year') {
            // 1. Українська + рік
            searchQueries.push(encodeURIComponent(title + ' ' + year + ' українською'));
            searchQueries.push(encodeURIComponent(title + ' українською'));
            // 2. Оригінал + рік
            if (originalTitle && originalTitle !== title) {
                searchQueries.push(encodeURIComponent(originalTitle + ' ' + year));
                searchQueries.push(encodeURIComponent(originalTitle));
            }
            // 3. Тільки назва + рік
            searchQueries.push(encodeURIComponent(title + ' ' + year));
            searchQueries.push(encodeURIComponent(title));
        }

        // Відкриваємо WebView з пошуком
        var searchUrl = CONFIG.searchUrl + searchQueries[0];
        
        Lampa.WebView.open({
            url: searchUrl,
            title: CONFIG.name + ' - ' + title,
            fullscreen: true,
            target: '_blank'
        });
    }

    // ============================================
    // 6. ДОДАВАННЯ БАЛАНСЕРІВ (УКРАЇНСЬКІ)
    // ============================================
    function addBalancers() {
        if (!Lampa.Manifest?.stream?.balancer) {
            setTimeout(addBalancers, 1000);
            return;
        }

        var balancers = [
            {
                name: 'UATUT',
                priority: 5,
                filter: function() { return true; },
                handler: function(play, data) {
                    if (data.movie) searchOnUatut(data.movie);
                    return true;
                }
            }
        ];

        balancers.forEach(function(b) {
            if (!Lampa.Manifest.stream.balancer.some(function(ex) { return ex.name === b.name; })) {
                Lampa.Manifest.stream.balancer.push(b);
                console.log('✅ Додано балансер:', b.name);
            }
        });
    }

    // ============================================
    // 7. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uatut_card) return;
        window.plugin_uatut_card = true;

        console.log('🚀 Запуск UATUT плагіна з кнопкою в картці');

        // Додаємо кнопку після завантаження додатку
        if (window.appready) {
            addUatutButton();
            addBalancers();
        } else {
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    addUatutButton();
                    addBalancers();
                }
            });
        }

        // Додаємо кнопку в меню (опціонально)
        function addMenuButton() {
            var menu = $('.menu .menu__list').eq(0);
            if (!menu.length) return;
            if (menu.find('.menu__item[data-sid="uatut"]').length) return;

            var btn = $('<li class="menu__item selector" data-sid="uatut">' +
                '<div class="menu__ico">' + CONFIG.icon + '</div>' +
                '<div class="menu__text">' + CONFIG.name + '</div>' +
                '</li>');

            btn.on('hover:enter', function() {
                Lampa.Activity.push({
                    url: 'https://tv.uatut.fun/',
                    title: CONFIG.name,
                    component: 'webview',
                    fullscreen: true
                });
            });

            menu.append(btn);
        }

        setTimeout(addMenuButton, 2000);
    }

    startPlugin();
})();
